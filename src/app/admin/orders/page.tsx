import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';
import { fmtDate, inr, STATUS_LABEL } from '@/lib/format';
import { setOrderStatus } from '../actions';
import type { Order } from '@/lib/types';

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminOrders({ searchParams }: { searchParams: SP }) {
  const { supabase } = await requireAdmin();
  const s = (await searchParams).status;
  const status = typeof s === 'string' ? s : '';
  let req = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(100);
  if (status) req = req.eq('status', status);
  const orders = ((await req).data ?? []) as Order[];

  return (
    <>
      <h1 className="text-3xl">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={`chip ${!status ? '!bg-ink !text-white' : ''}`}>All</Link>
        {Object.entries(STATUS_LABEL).map(([k, l]) => <Link key={k} href={`/admin/orders?status=${k}`} className={`chip ${status === k ? '!bg-ink !text-white' : ''}`}>{l}</Link>)}
      </div>
      {orders.length === 0 && <p className="card mt-6 p-8 text-center text-muted">No orders here yet.</p>}
      <ul className="mt-6 grid gap-4">
        {orders.map((o) => (
          <li key={o.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold">{o.order_no} <span className="chip ml-2 !bg-gold !text-gold-ink">{STATUS_LABEL[o.status]}</span></p>
                <p className="text-sm text-muted">{fmtDate(o.created_at)} · {o.payment_method === 'cod' ? 'Cash on delivery' : o.payment_method}</p>
              </div>
              <form action={setOrderStatus} className="flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="field !w-40" aria-label={`Status of ${o.order_no}`}>
                  {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <button className="btn btn-dark !py-2">Update</button>
              </form>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="text-sm">
                <p className="font-semibold">{o.customer_name}</p>
                <p><a className="underline" href={`tel:${o.phone}`}>{o.phone}</a> · <a className="underline" target="_blank" rel="noopener noreferrer" href={`https://wa.me/91${o.phone.slice(-10)}`}>WhatsApp</a></p>
                {o.email && <p>{o.email}</p>}
                <p className="mt-1 text-muted">{o.address_line}, {o.city}, {o.state} {o.pincode}</p>
                {o.notes && <p className="mt-1"><strong>Note:</strong> {o.notes}</p>}
              </div>
              <div className="text-sm">
                <ul className="divide-y divide-line">
                  {o.order_items?.map((i) => <li key={i.id} className="flex justify-between gap-3 py-1"><span>{i.name}{i.option ? ` (${i.option})` : ''}{i.sku ? ` [${i.sku}]` : ''} × {i.quantity}</span><span>{inr(i.unit_price * i.quantity)}</span></li>)}
                </ul>
                <p className="mt-2 flex justify-between font-bold"><span>Total</span><span>{inr(o.total)}</span></p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
