'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/format';

export type FormState = { error?: string; ok?: string };

const num = (v: FormDataEntryValue | null) => {
  const s = String(v ?? '').trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
};
const lines = (v: FormDataEntryValue | null) => String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
const bump = () => { ['/admin', '/admin/products', '/shop', '/'].forEach((p) => revalidatePath(p)); };

/** Inline price / MRP / stock edit from the products table. */
export async function quickUpdate(_p: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = String(fd.get('id'));
  const price = num(fd.get('price')), mrp = num(fd.get('mrp')), stock = num(fd.get('stock'));
  if ([price, mrp, stock].some((n) => Number.isNaN(n))) return { error: 'Use numbers only.' };
  if (price != null && mrp != null && mrp < price) return { error: 'MRP is lower than price.' };
  if (stock != null && !Number.isInteger(stock)) return { error: 'Stock must be a whole number.' };
  const { error } = await supabase.from('products').update({ price, mrp, stock, is_active: fd.get('is_active') === 'on' }).eq('id', id);
  if (error) return { error: error.message };
  bump();
  return { ok: 'Saved' };
}

export async function saveProduct(_p: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = String(fd.get('id') ?? '');
  const name = String(fd.get('name') ?? '').trim();
  if (!name) return { error: 'Product name is required.' };
  const slug = slugify(String(fd.get('slug') ?? '').trim() || name);
  const price = num(fd.get('price')), mrp = num(fd.get('mrp')), stock = num(fd.get('stock'));
  if ([price, mrp, stock].some((n) => Number.isNaN(n))) return { error: 'Price, MRP and stock must be numbers.' };
  if (price != null && mrp != null && mrp < price) return { error: 'MRP cannot be lower than the price.' };
  if (stock != null && !Number.isInteger(stock)) return { error: 'Stock must be a whole number.' };

  const specs: Record<string, string> = {};
  lines(fd.get('specs')).forEach((l) => { const i = l.indexOf(':'); if (i > 0) specs[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  let images: string[] = [];
  try { images = JSON.parse(String(fd.get('images') ?? '[]')); } catch { /* keep empty */ }

  const row = {
    name, slug,
    sku: String(fd.get('sku') ?? '').trim() || null,
    brand: String(fd.get('brand') ?? '').trim() || null,
    category_id: String(fd.get('category_id') ?? '') || null,
    description: String(fd.get('description') ?? '').trim() || null,
    features: lines(fd.get('features')),
    specs,
    options_label: String(fd.get('options_label') ?? '').trim() || 'Size',
    options: String(fd.get('options') ?? '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
    size_info: String(fd.get('size_info') ?? '').trim() || null,
    price, mrp, stock, images,
    is_active: fd.get('is_active') === 'on',
    is_featured: fd.get('is_featured') === 'on',
  };
  const q = id ? supabase.from('products').update(row).eq('id', id) : supabase.from('products').insert(row);
  const { error } = await q;
  if (error) return { error: error.code === '23505' ? 'Another product already uses this slug. Change the slug and try again.' : error.message };
  bump();
  redirect('/admin/products?saved=1');
}

export async function deleteProduct(fd: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from('products').delete().eq('id', String(fd.get('id')));
  bump();
  redirect('/admin/products?deleted=1');
}

export async function setOrderStatus(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc('admin_set_order_status', { p_order_id: String(fd.get('id')), p_status: String(fd.get('status')) });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/orders'); revalidatePath('/admin');
}

export async function saveCategory(_p: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = String(fd.get('id') ?? '');
  const name = String(fd.get('name') ?? '').trim();
  if (!name) return { error: 'Name is required.' };
  const row = {
    name, slug: slugify(String(fd.get('slug') ?? '').trim() || name),
    description: String(fd.get('description') ?? '').trim() || null,
    sort_order: Number(fd.get('sort_order') ?? 0) || 0,
  };
  const { error } = id ? await supabase.from('categories').update(row).eq('id', id) : await supabase.from('categories').insert(row);
  if (error) return { error: error.code === '23505' ? 'That slug is already used.' : error.message };
  revalidatePath('/admin/categories'); bump();
  return { ok: id ? 'Saved' : 'Category added' };
}

export async function deleteCategory(fd: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from('categories').delete().eq('id', String(fd.get('id')));
  revalidatePath('/admin/categories'); bump();
}
