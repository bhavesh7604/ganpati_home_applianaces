import { createClient } from '@/lib/supabase/server';
import type { Category, Product } from '@/lib/types';

export const PAGE_SIZE = 24;
const SELECT = '*, category:categories(id,slug,name)';

// Every read fails soft: if the database is unreachable the site still renders.
export async function getCategories(): Promise<(Category & { count: number })[]> {
  try {
    const supabase = await createClient();
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('category_id').eq('is_active', true).limit(5000),
    ]);
    const counts = new Map<string, number>();
    (prods ?? []).forEach((p) => p.category_id && counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1));
    return (cats ?? []).map((c) => ({ ...(c as Category), count: counts.get(c.id) ?? 0 })).filter((c) => c.count > 0);
  } catch { return []; }
}

export type ShopQuery = { category?: string; q?: string; sort?: string; brand?: string; page?: number };

export async function getProducts(query: ShopQuery): Promise<{ products: Product[]; total: number }> {
  try {
    const supabase = await createClient();
    let categoryId: string | null = null;
    if (query.category) {
      const { data } = await supabase.from('categories').select('id').eq('slug', query.category).maybeSingle();
      if (!data) return { products: [], total: 0 };
      categoryId = data.id;
    }
    let req = supabase.from('products').select(SELECT, { count: 'exact' }).eq('is_active', true);
    if (categoryId) req = req.eq('category_id', categoryId);
    if (query.brand) req = req.eq('brand', query.brand);
    const term = query.q?.replace(/[%,()*\\]/g, ' ').trim();
    if (term) req = req.or(`name.ilike.%${term}%,sku.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%`);
    switch (query.sort) {
      case 'price-asc': req = req.order('price', { ascending: true, nullsFirst: false }); break;
      case 'price-desc': req = req.order('price', { ascending: false, nullsFirst: false }); break;
      case 'newest': req = req.order('created_at', { ascending: false }); break;
      default: req = req.order('is_featured', { ascending: false }).order('name');
    }
    const page = Math.max(1, query.page ?? 1);
    const { data, count } = await req.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    return { products: (data ?? []) as unknown as Product[], total: count ?? 0 };
  } catch { return { products: [], total: 0 }; }
}

export async function getFeatured(limit = 8): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('products').select(SELECT).eq('is_active', true).eq('is_featured', true).limit(limit);
    return (data ?? []) as unknown as Product[];
  } catch { return []; }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('products').select(SELECT).eq('slug', slug).eq('is_active', true).maybeSingle();
    return (data as unknown as Product) ?? null;
  } catch { return null; }
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  if (!product.category_id) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('products').select(SELECT).eq('is_active', true)
      .eq('category_id', product.category_id).neq('id', product.id).limit(limit);
    return (data ?? []) as unknown as Product[];
  } catch { return []; }
}
