'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { saveProduct, deleteProduct, type FormState } from '../actions';
import ImageManager from '../ImageManager';
import type { Category, Product } from '@/lib/types';

export default function ProductForm({ product, categories }: { product: Product | null; categories: Category[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  const p = product;
  return (
    <div>
      <form action={action} className="grid gap-5">
        <input type="hidden" name="id" value={p?.id ?? ''} />
        <div className="card grid gap-4 p-5">
          <label className="label">Name<input className="field" name="name" required defaultValue={p?.name} /></label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="label">Brand<input className="field" name="brand" defaultValue={p?.brand ?? ''} /></label>
            <label className="label">Code / SKU<input className="field" name="sku" defaultValue={p?.sku ?? ''} /></label>
            <label className="label">URL slug (optional)<input className="field" name="slug" defaultValue={p?.slug ?? ''} /></label>
          </div>
          <label className="label">Category
            <select className="field" name="category_id" defaultValue={p?.category_id ?? ''}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="label">Description<textarea className="field min-h-28" name="description" defaultValue={p?.description ?? ''} /></label>
          <label className="label">Key features (one per line)<textarea className="field min-h-28" name="features" defaultValue={p?.features.join('\n')} /></label>
          <label className="label">Specifications (one per line, as Name: Value)<textarea className="field min-h-28" name="specs" defaultValue={Object.entries(p?.specs ?? {}).map(([k, v]) => `${k}: ${v}`).join('\n')} /></label>
        </div>

        <div className="card grid gap-4 p-5">
          <h2 className="text-lg">Price and stock</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="label">Selling price (₹)<input className="field" name="price" inputMode="decimal" defaultValue={p?.price ?? ''} /></label>
            <label className="label">MRP (₹, optional)<input className="field" name="mrp" inputMode="decimal" defaultValue={p?.mrp ?? ''} /></label>
            <label className="label">Stock (blank = not tracked)<input className="field" name="stock" inputMode="numeric" defaultValue={p?.stock ?? ''} /></label>
          </div>
          <p className="text-sm text-muted">Leave the price empty to show &ldquo;Price on request&rdquo; and a WhatsApp enquiry button.</p>
        </div>

        <div className="card grid gap-4 p-5">
          <h2 className="text-lg">Choices customers pick (optional)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="label">Label<input className="field" name="options_label" defaultValue={p?.options_label ?? 'Size'} /></label>
            <label className="label">Choices (comma or one per line)<textarea className="field" name="options" defaultValue={p?.options.join(', ')} /></label>
          </div>
          <label className="label">Size note (shown as text, not selectable)<input className="field" name="size_info" defaultValue={p?.size_info ?? ''} /></label>
        </div>

        <div className="card grid gap-3 p-5">
          <h2 className="text-lg">Photos</h2>
          <ImageManager initial={p?.images ?? []} />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={p?.is_active ?? true} /> Visible in store</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" defaultChecked={p?.is_featured ?? false} /> Show on home page</label>
        </div>
        {state.error && <p role="alert" className="font-medium text-red-700">{state.error}</p>}
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-gold" disabled={pending}>{pending ? 'Saving…' : 'Save product'}</button>
          <Link href="/admin/products" className="btn btn-outline">Cancel</Link>
        </div>
      </form>
      {p && (
        <form action={deleteProduct} className="mt-10 border-t border-line pt-6"
          onSubmit={(e) => { if (!confirm('Delete this product permanently? Past orders keep their details.')) e.preventDefault(); }}>
          <input type="hidden" name="id" value={p.id} />
          <button className="text-red-700 underline">Delete this product</button>
        </form>
      )}
    </div>
  );
}
