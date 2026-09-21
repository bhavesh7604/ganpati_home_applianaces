import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import type { Product } from '@/lib/types';
import QuickRow from './QuickRow';

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const SIZE = 50;

export default async function AdminProducts({ searchParams }: { searchParams: SP }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q)?.replace(/[%,()*\\]/g, ' ').trim(), filter = one(sp.filter), cat = one(sp.category);
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const { data: cats } = await supabase.from('categories').select('id,name').order('sort_order');
  let req = supabase.from('products').select('*, category:categories(id,slug,name)', { count: 'exact' });
  if (q) req = req.or(`name.ilike.%${q}%,sku.ilike.%${q}%,brand.ilike.%${q}%`);
  if (cat) req = req.eq('category_id', cat);
  if (filter === 'noprice') req = req.is('price', null);
  if (filter === 'inactive') req = req.eq('is_active', false);
  const { data, count } = await req.order('brand').order('name').range((page - 1) * SIZE, page * SIZE - 1);
  const products = (data ?? []) as unknown as Product[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / SIZE));
  const href = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams(); Object.entries({ q, filter, category: cat, ...o }).forEach(([k, v]) => v && p.set(k, v));
    return `/admin/products?${p}`;
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Products <span className="text-lg text-muted">({count ?? 0})</span></h1>
        <Link href="/admin/products/new" className="btn btn-gold">Add product</Link>
      </div>
      {sp.saved && <p role="status" className="mt-4 rounded bg-emerald-50 p-3 text-emerald-800">Product saved.</p>}
      {sp.deleted && <p role="status" className="mt-4 rounded bg-emerald-50 p-3 text-emerald-800">Product deleted.</p>}

      <form className="mt-6 flex flex-wrap gap-2" role="search">
        <input className="field !w-64" name="q" defaultValue={q} placeholder="Search name, code, brand" aria-label="Search products" />
        <select className="field !w-52" name="category" defaultValue={cat ?? ''} aria-label="Category">
          <option value="">All categories</option>
          {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="field !w-44" name="filter" defaultValue={filter ?? ''} aria-label="Filter">
          <option value="">All products</option><option value="noprice">No price set</option><option value="inactive">Hidden</option>
        </select>
        <button className="btn btn-dark">Filter</button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-mist text-sm"><tr><th className="p-2">Product</th><th className="p-2">Price (₹) · MRP (₹) · Stock (blank = not tracked)</th><th /><th /><th /><th /></tr></thead>
          <tbody>
            {products.map((p) => <QuickRow key={p.id} p={p} category={p.category?.name ?? ''} />)}
            {products.length === 0 && <tr><td className="p-6 text-center text-muted" colSpan={6}>No products match.</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Pages">
          {page > 1 && <Link className="btn btn-outline" href={href({ page: String(page - 1) })}>Previous</Link>}
          <span className="text-sm text-muted">Page {page} of {pages}</span>
          {page < pages && <Link className="btn btn-outline" href={href({ page: String(page + 1) })}>Next</Link>}
        </nav>
      )}
    </>
  );
}
