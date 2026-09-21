'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { inr } from '@/lib/format';
import { placeOrder, type CheckoutState } from './actions';

const initial: CheckoutState = {};

export default function CheckoutForm() {
  const { lines, subtotal, ready } = useCart();
  const [state, action, pending] = useActionState(placeOrder, initial);
  const f = state.fields ?? {};

  if (!ready) return <p className="text-muted">Loading…</p>;
  if (lines.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-lg">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-dark mt-5">Continue shopping</Link>
      </div>
    );
  }
  const payload = JSON.stringify(lines.map((l) => ({ productId: l.productId, qty: l.qty, option: l.option })));

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="items" value={payload} />
      <div className="card grid gap-4 p-6">
        <h2 className="text-xl">Delivery details</h2>
        <label className="label">Full name<input className="field" name="name" required autoComplete="name" defaultValue={f.name} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label">Mobile number<input className="field" name="phone" type="tel" inputMode="numeric" required autoComplete="tel" defaultValue={f.phone} /></label>
          <label className="label">Email (optional)<input className="field" name="email" type="email" autoComplete="email" defaultValue={f.email} /></label>
        </div>
        <label className="label">Full address<textarea className="field min-h-24" name="address" required autoComplete="street-address" defaultValue={f.address} /></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="label">City<input className="field" name="city" required autoComplete="address-level2" defaultValue={f.city} /></label>
          <label className="label">State<input className="field" name="state" required autoComplete="address-level1" defaultValue={f.state} /></label>
          <label className="label">Pincode<input className="field" name="pincode" required inputMode="numeric" maxLength={6} autoComplete="postal-code" defaultValue={f.pincode} /></label>
        </div>
        <label className="label">Order notes (optional)<textarea className="field" name="notes" defaultValue={f.notes} /></label>
      </div>

      <aside className="card h-fit p-5">
        <h2 className="text-xl">Your order</h2>
        <ul className="mt-4 grid gap-3 text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-3">
              <span>{l.name}{l.option ? ` (${l.option})` : ''} × {l.qty}</span><span className="shrink-0">{inr(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-3 text-lg font-bold"><span>Total</span><span>{inr(subtotal)}</span></div>
        <p className="mt-1 text-sm text-muted">Delivery charges, if any, are confirmed by our team before dispatch.</p>
        <div className="mt-4 rounded-md bg-mist p-3 text-sm"><strong>Payment:</strong> cash on delivery. We will call you to confirm the order.</div>
        {state.error && <p role="alert" className="mt-4 font-medium text-red-700">{state.error}</p>}
        <button className="btn btn-gold mt-5 w-full" disabled={pending}>{pending ? 'Placing order…' : 'Place order'}</button>
        <p className="mt-3 text-xs text-muted">Prices are checked again when you place the order.</p>
      </aside>
    </form>
  );
}
