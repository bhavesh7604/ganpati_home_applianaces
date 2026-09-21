'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type CheckoutState = { error?: string; fields?: Record<string, string> };

type CartItem = { productId: string; qty: number; option: string | null };

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const get = (k: string) => String(formData.get(k) ?? '').trim();
  const fields = {
    name: get('name'), phone: get('phone'), email: get('email'), address: get('address'),
    city: get('city'), state: get('state'), pincode: get('pincode'), notes: get('notes'),
  };

  let items: CartItem[];
  try {
    const parsed = JSON.parse(get('items'));
    if (!Array.isArray(parsed)) throw new Error('bad');
    items = parsed.map((i) => ({ productId: String(i.productId), qty: Number(i.qty), option: i.option ? String(i.option) : null }));
  } catch {
    return { error: 'We could not read your cart. Please go back to the cart and try again.', fields };
  }
  if (items.length === 0) return { error: 'Your cart is empty.', fields };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('create_order', {
      p_customer: fields,
      p_items: items.map((i) => ({ product_id: i.productId, quantity: i.qty, option: i.option })),
    });
    if (error) {
      const msg = error.message.startsWith('GHA: ') ? error.message.slice(5) : 'We could not place your order right now. Please try again or call us.';
      return { error: msg, fields };
    }
    redirect(`/order/success?no=${encodeURIComponent(String(data))}`);
  } catch (e) {
    // redirect() works by throwing: let it through.
    if (e && typeof e === 'object' && 'digest' in e && String((e as { digest: unknown }).digest).startsWith('NEXT_REDIRECT')) throw e;
    return { error: 'We could not place your order right now. Please try again or call us.', fields };
  }
}
