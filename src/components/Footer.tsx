import Link from 'next/link';
import { site } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink text-steel">
      <div className="wrap grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-xl text-white">{site.name}</p>
          <p className="mt-3 max-w-sm">{site.tagline}. Run by {site.owner}.</p>
          <p className="mt-3">{site.address}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Shop</p>
          <ul className="mt-3 grid gap-2">
            <li><Link href="/shop" className="hover:text-white">All products</Link></li>
            <li><Link href="/track" className="hover:text-white">Track your order</Link></li>
            <li><Link href="/account" className="hover:text-white">My account</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Help</p>
          <ul className="mt-3 grid gap-2">
            <li><Link href="/policies/returns" className="hover:text-white">Returns ({site.returnDays} days)</Link></li>
            <li><Link href="/policies/shipping" className="hover:text-white">Shipping</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
            <li><a href={`tel:${site.phone}`} className="hover:text-white">{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm">
        &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
