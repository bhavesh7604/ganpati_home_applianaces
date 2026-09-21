'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20">
      Cart
      <span className="grid min-w-6 h-6 place-items-center rounded-full bg-gold px-1.5 text-sm text-gold-ink" aria-label={`${ready ? count : 0} items in cart`}>
        {ready ? count : 0}
      </span>
    </Link>
  );
}
