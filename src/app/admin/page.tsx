import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { inr } from '@/lib/format';

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const count = async (build: (q: ReturnType<typeof supabase.from>) => unknown) => {
    const { count } = (await build(supabase.from('products'))) as { count: number | null };
    return count ?? 0;
  };
  const [total, noPrice, inactive, newOrders, allOrders, rev] = await Promise.all([
    count((q) => q.select('id', { count: 'exact', head: true })),
    count((q) => q.select('id', { count: 'exact', head: true }).is('price', null)),
    count((q) => q.select('id', { count: 'exact', head: true }).eq('is_active', false)),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'placed').then((r) => r.count ?? 0),
    supabase.from('orders').select('id', { count: 'exact', head: true }).then((r) => r.count ?? 0),
    supabase.from('orders').select('total').not('status', 'in', '(cancelled,returned)').then((r) => (r.data ?? []).reduce((n, o) => n + Number(o.total), 0)),
  ]);
  const stats: [string, string | number, string?][] = [
    ['New orders to confirm', newOrders, '/admin/orders?status=placed'],
    ['All orders', allOrders, '/admin/orders'],
    ['Order value (excl. cancelled)', inr(rev)],
    ['Products', total, '/admin/products'],
    ['Products without a price', noPrice, '/admin/products?filter=noprice'],
    ['Hidden products', inactive, '/admin/products?filter=inactive'],
  ];
  return (
    <>
      <h1 className="text-3xl">Dashboard</h1>
      {noPrice > 0 && (
        <p className="mt-4 rounded-md bg-amber-50 p-4 text-amber-900">
          {noPrice} product{noPrice > 1 ? 's have' : ' has'} no price yet. Customers see &ldquo;Price on request&rdquo; and cannot add them to the cart.{' '}
          <Link className="font-semibold underline" href="/admin/products?filter=noprice">Set prices</Link>
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([label, value, href]) => {
          const inner = <><p className="text-sm text-muted">{label}</p><p className="mt-1 text-3xl font-display">{value}</p></>;
          return href ? <Link key={label} href={href} className="card p-5 hover:border-ink">{inner}</Link> : <div key={label} className="card p-5">{inner}</div>;
        })}
      </div>
    </>
  );
}
