import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { discountPct, inr } from '@/lib/format';
import Placeholder from './Placeholder';

export default function ProductCard({ p }: { p: Product }) {
  const off = discountPct(p.price, p.mrp);
  const img = p.images?.[0];
  const soldOut = p.stock !== null && p.stock <= 0;
  return (
    <article className="card group flex flex-col overflow-hidden">
      <Link href={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden" aria-label={p.name}>
        {img
          ? <Image src={img} alt="" fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          : <Placeholder label={p.brand} />}
        {off > 0 && <span className="absolute left-3 top-3 rounded bg-gold px-2 py-0.5 text-sm font-bold text-gold-ink">{off}% off</span>}
        {soldOut && <span className="absolute right-3 top-3 rounded bg-ink px-2 py-0.5 text-sm font-semibold text-white">Sold out</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {p.brand && <p className="text-sm font-semibold text-gold-deep">{p.brand}</p>}
        <h3 className="!font-sans text-base font-semibold leading-snug">
          <Link href={`/product/${p.slug}`} className="hover:underline underline-offset-4">{p.name}</Link>
        </h3>
        {(p.size_info || p.options.length > 0) && (
          <p className="text-sm text-muted">
            {p.options.length > 0 ? `${p.options.length} ${p.options_label.toLowerCase()}s` : `Sizes ${p.size_info}`}
          </p>
        )}
        <p className="mt-auto pt-2">
          {p.price != null
            ? <><strong className="text-lg">{inr(p.price)}</strong>{p.mrp != null && p.mrp > p.price && <s className="ml-2 text-muted">{inr(p.mrp)}</s>}</>
            : <span className="font-semibold text-muted">Price on request</span>}
        </p>
      </div>
    </article>
  );
}
