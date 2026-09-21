import Link from 'next/link';
import type { Metadata } from 'next';
import { site, waLink } from '@/lib/config';
import ClearCart from './ClearCart';

export const metadata: Metadata = { title: 'Order placed' };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Success({ searchParams }: { searchParams: SP }) {
  const raw = (await searchParams).no;
  const no = String(Array.isArray(raw) ? raw[0] : raw ?? '').replace(/[^A-Za-z0-9-]/g, '');
  return (
    <div className="wrap max-w-2xl py-20 text-center">
      <ClearCart />
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700" aria-hidden>✓</div>
      <h1 className="mt-6 text-3xl md:text-4xl">Thank you, your order is placed</h1>
      {no && <p className="mt-4 text-lg">Order number: <strong>{no}</strong></p>}
      <p className="mt-3 text-muted">Our team will call you on the mobile number you gave to confirm the order and delivery charges. Payment is cash on delivery.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {no && <a className="btn btn-gold" target="_blank" rel="noopener noreferrer" href={waLink(`Hello, I just placed order ${no} on ${site.name}.`)}>Message us on WhatsApp</a>}
        <Link href="/track" className="btn btn-outline">Track order</Link>
        <Link href="/shop" className="btn btn-outline">Keep shopping</Link>
      </div>
    </div>
  );
}
