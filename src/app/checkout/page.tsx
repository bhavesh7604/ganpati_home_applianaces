import type { Metadata } from 'next';
import CheckoutForm from './CheckoutForm';

export const metadata: Metadata = { title: 'Checkout' };
export default function CheckoutPage() {
  return (
    <div className="wrap py-10">
      <h1 className="mb-8 text-3xl md:text-4xl">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
