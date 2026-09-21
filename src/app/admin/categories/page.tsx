import { requireAdmin } from '@/lib/auth';
import type { Category } from '@/lib/types';
import CategoryRow from './CategoryRow';

export default async function AdminCategories() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('categories').select('*').order('sort_order');
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl">Categories</h1>
      <p className="mt-2 text-muted">Categories with no visible products are hidden from the store.</p>
      <h2 className="mt-8 text-xl">Add a category</h2>
      <ul className="mt-3"><CategoryRow /></ul>
      <h2 className="mt-8 text-xl">Existing categories</h2>
      <ul className="mt-3 grid gap-3">{((data ?? []) as Category[]).map((c) => <CategoryRow key={c.id} c={c} />)}</ul>
    </div>
  );
}
