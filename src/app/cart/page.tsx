'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import Placeholder from '@/components/Placeholder';
import { inr } from '@/lib/format';

export default function CartPage() {
  const { lines, subtotal, ready, setQty, remove } = useCart();
  const saved = lines.reduce((n, l) => n + Math.max(0, (l.mrp ?? l.price) - l.price) * l.qty, 0);

  if (!ready) return <div className="wrap py-16 text-muted">Loading your cart…</div>;
  if (lines.length === 0) {
    return (
      <div className="wrap py-20 text-center">
        <h1 className="text-3xl">Your cart is empty</h1>
        <p className="mt-3 text-muted">Browse our range and add what you need.</p>
        <Link href="/shop" className="btn btn-dark mt-6">Continue shopping</Link>
      </div>
    );
  }
  return (
    <div className="wrap py-10">
      <h1 className="text-3xl md:text-4xl">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="card divide-y divide-line">
          {lines.map((l) => (
            <li key={l.key} className="grid grid-cols-[84px_1fr] gap-4 p-4">
              <Link href={`/product/${l.slug}`} className="relative block size-[84px] overflow-hidden rounded">
                {l.image ? <Image src={l.image} alt="" fill sizes="84px" className="object-cover" /> : <Placeholder />}
              </Link>
              <div>
                <Link href={`/product/${l.slug}`} className="font-semibold hover:underline">{l.name}</Link>
                {l.option && <p className="text-sm text-muted">{l.optionLabel}: {l.option}</p>}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-md border-[1.5px] border-line bg-white" role="group" aria-label={`Quantity of ${l.name}`}>
                      <button className="size-9 hover:bg-mist" onClick={() => setQty(l.key, l.qty - 1)} aria-label="Decrease quantity">&minus;</button>
                      <output className="min-w-7 text-center font-semibold">{l.qty}</output>
                      <button className="size-9 hover:bg-mist" onClick={() => setQty(l.key, l.qty + 1)} aria-label="Increase quantity">+</button>
                    </div>
                    <button className="text-sm text-muted underline" onClick={() => remove(l.key)}>Remove</button>
                  </div>
                  <strong>{inr(l.price * l.qty)}</strong>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="card h-fit p-5">
          <h2 className="text-xl">Order summary</h2>
          <dl className="mt-4 grid gap-2">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            {saved > 0 && <div className="flex justify-between text-emerald-700"><dt>You save</dt><dd>{inr(saved)}</dd></div>}
            <div className="flex justify-between text-muted"><dt>Delivery</dt><dd>Confirmed by our team</dd></div>
            <div className="mt-2 flex justify-between border-t border-line pt-3 text-lg font-bold"><dt>Total</dt><dd>{inr(subtotal)}</dd></div>
          </dl>
          <Link href="/checkout" className="btn btn-gold mt-5 w-full">Checkout</Link>
          <p className="mt-3 text-sm text-muted">Pay on delivery. Returns accepted within 7 days.</p>
        </aside>
      </div>
    </div>
  );
}
