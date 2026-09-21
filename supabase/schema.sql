-- Ganpati Home Appliances: database schema
-- Run this whole file once in Supabase: Dashboard > SQL Editor > New query.
-- Then run seed.sql.


-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- -------------------------------------------------------------- categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- products
-- price/mrp are NULL until you set them: the storefront shows "Price on request"
-- and customers can enquire on WhatsApp. stock NULL = stock is not tracked.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text,
  name text not null,
  brand text,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  features text[] not null default '{}',
  specs jsonb not null default '{}'::jsonb,
  options_label text not null default 'Size',
  options text[] not null default '{}',
  size_info text,
  price numeric(10,2) check (price is null or price >= 0),
  mrp numeric(10,2) check (mrp is null or mrp >= 0),
  stock integer check (stock is null or stock >= 0),
  images text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(is_active, is_featured);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------------ orders
create sequence if not exists public.order_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique default ('GHA-' || nextval('public.order_seq')),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  address_line text not null,
  city text not null,
  state text not null,
  pincode text not null,
  notes text,
  payment_method text not null default 'cod',
  status text not null default 'placed'
    check (status in ('placed','confirmed','shipped','delivered','cancelled','returned')),
  subtotal numeric(12,2) not null,
  shipping_fee numeric(10,2) not null default 0,
  total numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_created_idx on public.orders(created_at desc);
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
for each row execute function public.touch_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  sku text,
  option text,
  unit_price numeric(10,2) not null,
  quantity integer not null check (quantity > 0)
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------------------------------------------------- row level security
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles admin write" on public.profiles;
create policy "profiles admin write" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (is_active or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Orders are created ONLY through create_order() below, never by direct insert.
drop policy if exists "orders read own or admin" on public.orders;
create policy "orders read own or admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders admin write" on public.orders;
create policy "orders admin write" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order items read own or admin" on public.order_items;
create policy "order items read own or admin" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
drop policy if exists "order items admin write" on public.order_items;
create policy "order items admin write" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------ create_order
-- Prices and stock are read from the products table here, so a customer can never
-- change a price from the browser.
create or replace function public.create_order(p_customer jsonb, p_items jsonb)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_name text := btrim(coalesce(p_customer->>'name',''));
  v_phone text := regexp_replace(coalesce(p_customer->>'phone',''), '\D', '', 'g');
  v_email text := nullif(btrim(coalesce(p_customer->>'email','')), '');
  v_addr text := btrim(coalesce(p_customer->>'address',''));
  v_city text := btrim(coalesce(p_customer->>'city',''));
  v_state text := btrim(coalesce(p_customer->>'state',''));
  v_pin text := regexp_replace(coalesce(p_customer->>'pincode',''), '\D', '', 'g');
  v_notes text := nullif(btrim(coalesce(p_customer->>'notes','')), '');
  v_order_id uuid;
  v_order_no text;
  v_subtotal numeric(12,2) := 0;
  it jsonb;
  prod public.products%rowtype;
  v_qty int;
  v_opt text;
begin
  if length(v_phone) = 12 and left(v_phone,2) = '91' then v_phone := right(v_phone,10); end if;
  if length(v_name) < 2 then raise exception 'GHA: Please enter your name.'; end if;
  if length(v_phone) <> 10 then raise exception 'GHA: Please enter a valid 10-digit mobile number.'; end if;
  if length(v_addr) < 5 then raise exception 'GHA: Please enter your full delivery address.'; end if;
  if length(v_city) < 2 or length(v_state) < 2 then raise exception 'GHA: Please enter your city and state.'; end if;
  if length(v_pin) <> 6 then raise exception 'GHA: Please enter a valid 6-digit pincode.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'GHA: Your cart is empty.';
  end if;
  if jsonb_array_length(p_items) > 50 then raise exception 'GHA: Too many items in one order.'; end if;

  insert into public.orders (user_id, customer_name, phone, email, address_line, city, state, pincode, notes,
                             subtotal, total)
  values (auth.uid(), v_name, v_phone, v_email, v_addr, v_city, v_state, v_pin, v_notes, 0, 0)
  returning id, order_no into v_order_id, v_order_no;

  for it in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((it->>'quantity')::int, 0);
    v_opt := nullif(btrim(coalesce(it->>'option','')), '');
    if v_qty < 1 or v_qty > 99 then raise exception 'GHA: Invalid quantity.'; end if;

    select * into prod from public.products
      where id = (it->>'product_id')::uuid and is_active for update;
    if not found then raise exception 'GHA: A product in your cart is no longer available.'; end if;
    if prod.price is null then
      raise exception 'GHA: % is available on enquiry only. Please remove it or enquire on WhatsApp.', prod.name;
    end if;
    if v_opt is not null and not (v_opt = any(prod.options)) then
      raise exception 'GHA: Invalid % selected for %.', lower(prod.options_label), prod.name;
    end if;
    if cardinality(prod.options) > 0 and v_opt is null then
      raise exception 'GHA: Please choose a % for %.', lower(prod.options_label), prod.name;
    end if;
    if prod.stock is not null then
      if prod.stock < v_qty then
        raise exception 'GHA: Only % of % left in stock.', prod.stock, prod.name;
      end if;
      update public.products set stock = stock - v_qty where id = prod.id;
    end if;

    insert into public.order_items (order_id, product_id, name, sku, option, unit_price, quantity)
    values (v_order_id, prod.id, prod.name, prod.sku, v_opt, prod.price, v_qty);
    v_subtotal := v_subtotal + prod.price * v_qty;
  end loop;

  update public.orders set subtotal = v_subtotal, total = v_subtotal where id = v_order_id;
  return v_order_no;
end $$;

-- ------------------------------------------------------------- track_order
create or replace function public.track_order(p_order_no text, p_phone text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_phone text := right(regexp_replace(coalesce(p_phone,''), '\D', '', 'g'), 10);
  o public.orders%rowtype;
begin
  select * into o from public.orders
   where upper(order_no) = upper(btrim(p_order_no)) and right(phone, 10) = v_phone;
  if not found then return null; end if;
  return jsonb_build_object(
    'order_no', o.order_no, 'status', o.status, 'created_at', o.created_at,
    'subtotal', o.subtotal, 'shipping_fee', o.shipping_fee, 'total', o.total,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
        'name', i.name, 'option', i.option, 'quantity', i.quantity, 'unit_price', i.unit_price))
        from public.order_items i where i.order_id = o.id), '[]'::jsonb));
end $$;

-- ---------------------------------------------------- admin_set_order_status
-- Restores tracked stock when an order is cancelled or returned.
create or replace function public.admin_set_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype;
begin
  if not public.is_admin() then raise exception 'GHA: Not allowed.'; end if;
  if p_status not in ('placed','confirmed','shipped','delivered','cancelled','returned') then
    raise exception 'GHA: Unknown status.';
  end if;
  select * into o from public.orders where id = p_order_id for update;
  if not found then raise exception 'GHA: Order not found.'; end if;

  if p_status in ('cancelled','returned') and o.status not in ('cancelled','returned') then
    update public.products p set stock = p.stock + i.quantity
      from public.order_items i
     where i.order_id = o.id and i.product_id = p.id and p.stock is not null;
  elsif o.status in ('cancelled','returned') and p_status not in ('cancelled','returned') then
    update public.products p set stock = greatest(p.stock - i.quantity, 0)
      from public.order_items i
     where i.order_id = o.id and i.product_id = p.id and p.stock is not null;
  end if;
  update public.orders set status = p_status where id = o.id;
end $$;

grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;
grant execute on function public.admin_set_order_status(uuid, text) to authenticated;

-- ----------------------------------------------------------------- storage
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
