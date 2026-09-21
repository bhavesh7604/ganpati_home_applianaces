import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtDate, inr, STATUS_LABEL } from '@/lib/format';

export const metadata: Metadata = { title: 'Track your order' };
type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

type Tracked = { order_no: string; status: string; created_at: string; total: number; items: { name: string; option: string | null; quantity: number; unit_price: number }[] };

export default async function Track({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const no = one(sp.no).trim(), phone = one(sp.phone).trim();
  let order: Tracked | null = null, error = '';
  if (no && phone) {
    try {
      const supabase = await createClient();
      const { data, error: e } = await supabase.rpc('track_order', { p_order_no: no, p_phone: phone });
      if (e) error = 'We could not look up your order right now. Please try again.';
      else if (!data) error = 'No order found with that number and mobile. Please check both and try again.';
      else order = data as Tracked;
    } catch { error = 'We could not look up your order right now. Please try again.'; }
  }
  return (
    <div className="wrap max-w-2xl py-12">
      <h1 className="text-3xl md:text-4xl">Track your order</h1>
      <form className="card mt-8 grid gap-4 p-6 sm:grid-cols-2" method="get">
        <label className="label">Order number<input className="field" name="no" defaultValue={no} placeholder="GHA-1001" required /></label>
        <label className="label">Mobile number<input className="field" name="phone" defaultValue={phone} inputMode="numeric" required /></label>
        <button className="btn btn-dark sm:col-span-2">Check status</button>
      </form>
      {error && <p role="alert" className="mt-6 font-medium text-red-700">{error}</p>}
      {order && (
        <section className="card mt-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl">{order.order_no}</h2>
            <span className="chip !bg-gold !text-gold-ink">{STATUS_LABEL[order.status] ?? order.status}</span>
          </div>
          <p className="mt-1 text-sm text-muted">Placed on {fmtDate(order.created_at)}</p>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((i, n) => (
              <li key={n} className="flex justify-between gap-3 py-2"><span>{i.name}{i.option ? ` (${i.option})` : ''} × {i.quantity}</span><span>{inr(i.unit_price * i.quantity)}</span></li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between text-lg font-bold"><span>Total</span><span>{inr(order.total)}</span></p>
        </section>
      )}
    </div>
  );
}
