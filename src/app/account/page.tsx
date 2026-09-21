import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logout } from '../auth/actions';
import { fmtDate, inr, STATUS_LABEL } from '@/lib/format';
import type { Order } from '@/lib/types';

export const metadata: Metadata = { title: 'My account' };

export default async function Account() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/account');
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
  const orders = (data ?? []) as Order[];
  return (
    <div className="wrap max-w-3xl py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl md:text-4xl">My orders</h1><p className="mt-1 text-muted">{user.email}</p></div>
        <form action={logout}><button className="btn btn-outline">Log out</button></form>
      </div>
      {orders.length === 0
        ? <div className="card mt-8 p-10 text-center text-muted"><p>You have not placed any orders while logged in yet.</p><Link href="/shop" className="btn btn-dark mt-4">Start shopping</Link></div>
        : <ul className="mt-8 grid gap-4">
            {orders.map((o) => (
              <li key={o.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{o.order_no}</strong><span className="chip !bg-gold !text-gold-ink">{STATUS_LABEL[o.status] ?? o.status}</span>
                </div>
                <p className="text-sm text-muted">{fmtDate(o.created_at)}</p>
                <ul className="mt-3 text-sm">
                  {o.order_items?.map((i) => <li key={i.id} className="flex justify-between gap-3 py-1"><span>{i.name}{i.option ? ` (${i.option})` : ''} × {i.quantity}</span><span>{inr(i.unit_price * i.quantity)}</span></li>)}
                </ul>
                <p className="mt-2 flex justify-between border-t border-line pt-2 font-bold"><span>Total</span><span>{inr(o.total)}</span></p>
              </li>
            ))}
          </ul>}
    </div>
  );
}
