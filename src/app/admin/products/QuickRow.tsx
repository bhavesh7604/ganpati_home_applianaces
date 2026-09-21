'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { quickUpdate, type FormState } from '../actions';
import type { Product } from '@/lib/types';

export default function QuickRow({ p, category }: { p: Product; category: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(quickUpdate, {});
  return (
    <tr className="border-t border-line align-middle">
      <td className="p-2 min-w-56">
        <Link href={`/admin/products/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
        <p className="text-xs text-muted">{[p.sku, p.brand, category].filter(Boolean).join(' · ')}</p>
      </td>
      <td className="p-2" colSpan={5}>
        <form action={action} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={p.id} />
          <input className="field !w-28" name="price" inputMode="decimal" defaultValue={p.price ?? ''} placeholder="Price" aria-label={`Price for ${p.name}`} />
          <input className="field !w-28" name="mrp" inputMode="decimal" defaultValue={p.mrp ?? ''} placeholder="MRP" aria-label={`MRP for ${p.name}`} />
          <input className="field !w-24" name="stock" inputMode="numeric" defaultValue={p.stock ?? ''} placeholder="Stock" aria-label={`Stock for ${p.name}`} />
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="is_active" defaultChecked={p.is_active} /> Visible</label>
          <button className="btn btn-dark !px-3 !py-1.5 text-sm" disabled={pending}>{pending ? '…' : 'Save'}</button>
          {state.ok && <span role="status" className="text-sm text-emerald-700">{state.ok}</span>}
          {state.error && <span role="alert" className="text-sm text-red-700">{state.error}</span>}
        </form>
      </td>
    </tr>
  );
}
