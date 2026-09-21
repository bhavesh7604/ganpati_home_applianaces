import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { site, waLink } from '@/lib/config';

type Props = { params: Promise<{ slug: string }> };

function Returns() {
  return (
    <>
      <p>We accept returns within <strong>{site.returnDays} days</strong> of delivery.</p>
      <h2>What can be returned</h2>
      <ul>
        <li>Products that arrive damaged, defective or different from what you ordered.</li>
        <li>Other products, if they are unused and in their original packaging with all accessories.</li>
      </ul>
      <h2>How to return</h2>
      <ul>
        <li>Contact us within {site.returnDays} days of delivery on WhatsApp or phone with your order number. For damaged or wrong items, please send photos.</li>
        <li>We will tell you how to send the product back or arrange a pickup.</li>
        <li>Once we receive and check the product, we will process your refund or replacement.</li>
      </ul>
      <h2>Appliance warranty</h2>
      <p>Electrical appliances carry the manufacturer&apos;s warranty shown on each product page. For faults after the return period, contact us and we will help you with the brand&apos;s service process.</p>
      <p>Questions? <a className="underline" href={waLink('Hello, I have a question about returns.')} target="_blank" rel="noopener noreferrer">WhatsApp us</a> or call <a className="underline" href={`tel:${site.phone}`}>{site.phone}</a>.</p>
    </>
  );
}
function Shipping() {
  return (
    <>
      <p>We deliver from {site.address}.</p>
      <h2>Order confirmation</h2>
      <p>After you place an order, our team calls you on the mobile number you provided to confirm the order, your address and the delivery charges (if any).</p>
      <h2>Delivery time and charges</h2>
      <p>Delivery time and charges depend on your pincode and the size and weight of the order. Large items such as coolers, gas stoves and big cookware may cost more to ship. We will confirm both before your order is dispatched.</p>
      <h2>Payment</h2>
      <p>Orders are paid on delivery (cash on delivery).</p>
      <h2>Tracking</h2>
      <p>You can check your order status any time on the Track order page using your order number and mobile number.</p>
      <h2>Damaged in transit?</h2>
      <p>Please check the parcel on delivery and contact us within {site.returnDays} days if anything is damaged or missing. See our return policy for details.</p>
    </>
  );
}
const PAGES: Record<string, { title: string; body: () => React.ReactElement }> = {
  returns: { title: `Return policy (${site.returnDays} days)`, body: Returns },
  shipping: { title: 'Shipping and delivery', body: Shipping },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = PAGES[(await params).slug];
  return { title: p?.title ?? 'Policy' };
}
export default async function Policy({ params }: Props) {
  const p = PAGES[(await params).slug];
  if (!p) notFound();
  const Body = p.body;
  return (
    <div className="wrap max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl">{p.title}</h1>
      <div className="prose-plain mt-4 text-muted [&_strong]:text-[#122328] [&_h2]:font-display [&_h2]:text-[#122328]"><Body /></div>
    </div>
  );
}
