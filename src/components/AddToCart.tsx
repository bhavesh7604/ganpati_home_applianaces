'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { useCart } from './CartProvider';
import { waLink } from '@/lib/config';

export default function AddToCart({ p }: { p: Product }) {
  const cart = useCart();
  const [option, setOption] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const needsOption = p.options.length > 0;
  const soldOut = p.stock !== null && p.stock <= 0;

  if (p.price == null) {
    const msg = `Hello, I'd like the price and availability of ${p.name}${p.sku ? ` (${p.sku})` : ''}.`;
    return (
      <div className="grid gap-3">
        <p className="text-muted">This product is available on enquiry. Message us for the latest price.</p>
        <a className="btn btn-gold" href={waLink(msg)} target="_blank" rel="noopener noreferrer">Ask for price on WhatsApp</a>
      </div>
    );
  }
  if (soldOut) return <button className="btn btn-dark" disabled>Sold out</button>;

  function add() {
    if (needsOption && !option) { setError(`Please choose a ${p.options_label.toLowerCase()}.`); return; }
    setError('');
    cart.add({
      productId: p.id, slug: p.slug, name: p.name, price: Number(p.price), mrp: p.mrp != null ? Number(p.mrp) : null,
      image: p.images?.[0] ?? null, option: needsOption ? option : null, optionLabel: p.options_label, sku: p.sku, qty,
    });
    setAdded(true); setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="grid gap-4">
      {needsOption && (
        <label className="label">
          {p.options_label}
          <select className="field" value={option} onChange={(e) => { setOption(e.target.value); setError(''); }}>
            <option value="">Select {p.options_label.toLowerCase()}</option>
            {p.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-md border-[1.5px] border-line bg-white" role="group" aria-label="Quantity">
          <button type="button" className="size-10 text-xl hover:bg-mist" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">&minus;</button>
          <output className="min-w-8 text-center font-semibold">{qty}</output>
          <button type="button" className="size-10 text-xl hover:bg-mist" onClick={() => setQty(Math.min(99, qty + 1))} aria-label="Increase quantity">+</button>
        </div>
        <button type="button" className="btn btn-dark flex-1" onClick={add}>Add to cart</button>
      </div>
      {error && <p role="alert" className="font-medium text-red-700">{error}</p>}
      {added && <p role="status" className="font-medium text-emerald-700">Added to cart. <Link href="/cart" className="underline">View cart</Link></p>}
    </div>
  );
}
