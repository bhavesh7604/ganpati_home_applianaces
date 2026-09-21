'use client';
import { useActionState } from 'react';
import { saveCategory, deleteCategory, type FormState } from '../actions';
import type { Category } from '@/lib/types';

export default function CategoryRow({ c }: { c?: Category }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategory, {});
  return (
    <li className="card p-4">
      <form action={action} className="grid gap-3 md:grid-cols-[1fr_1fr_90px_auto]">
        <input type="hidden" name="id" value={c?.id ?? ''} />
        <input className="field" name="name" defaultValue={c?.name} placeholder="Category name" aria-label="Name" required />
        <input className="field" name="description" defaultValue={c?.description ?? ''} placeholder="Short description" aria-label="Description" />
        <input className="field" name="sort_order" type="number" defaultValue={c?.sort_order ?? 0} aria-label="Order" />
        <input type="hidden" name="slug" defaultValue={c?.slug ?? ''} />
        <button className="btn btn-dark" disabled={pending}>{c ? 'Save' : 'Add'}</button>
      </form>
      {state.ok && <p role="status" className="mt-2 text-sm text-emerald-700">{state.ok}</p>}
      {state.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}
      {c && (
        <form action={deleteCategory} className="mt-2" onSubmit={(e) => { if (!confirm('Delete this category? Its products stay but lose their category.')) e.preventDefault(); }}>
          <input type="hidden" name="id" value={c.id} /><button className="text-sm text-red-700 underline">Delete</button>
        </form>
      )}
    </li>
  );
}
