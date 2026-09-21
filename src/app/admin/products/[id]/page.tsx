import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import type { Category, Product } from '@/lib/types';
import ProductForm from '../ProductForm';

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
  let product: Product | null = null;
  if (id !== 'new') {
    const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    product = data as Product;
  }
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl">{product ? 'Edit product' : 'Add product'}</h1>
      <ProductForm product={product} categories={(cats ?? []) as Category[]} />
    </div>
  );
}
