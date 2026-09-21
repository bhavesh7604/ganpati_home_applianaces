import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s | Admin' }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="wrap py-8">
      <nav className="mb-8 flex flex-wrap items-center gap-2 border-b border-line pb-4" aria-label="Admin">
        {[['/admin', 'Dashboard'], ['/admin/orders', 'Orders'], ['/admin/products', 'Products'], ['/admin/categories', 'Categories']].map(([h, l]) => (
          <Link key={h} href={h} className="chip hover:!bg-steel">{l}</Link>
        ))}
        <Link href="/" className="ml-auto text-sm underline">View store</Link>
      </nav>
      {children}
    </div>
  );
}
