import type { Metadata } from 'next';
import { site, waLink } from '@/lib/config';

export const metadata: Metadata = { title: 'Contact us' };

export default function Contact() {
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name}, ${site.address}`)}`;
  return (
    <div className="wrap max-w-3xl py-12">
      <h1 className="text-3xl md:text-4xl">Contact us</h1>
      <p className="mt-3 text-muted">Visit the shop, call, or message us on WhatsApp. {site.owner} and the team will help you choose.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a className="card p-5 hover:border-ink" href={`tel:${site.phone}`}><h2 className="text-lg">Call</h2><p className="mt-1 text-muted">{site.phone}</p></a>
        <a className="card p-5 hover:border-ink" href={waLink('Hello, I have a question.')} target="_blank" rel="noopener noreferrer"><h2 className="text-lg">WhatsApp</h2><p className="mt-1 text-muted">{site.phone}</p></a>
        <a className="card p-5 hover:border-ink" href={`mailto:${site.email}`}><h2 className="text-lg">Email</h2><p className="mt-1 break-all text-muted">{site.email}</p></a>
        <a className="card p-5 hover:border-ink" href={map} target="_blank" rel="noopener noreferrer"><h2 className="text-lg">Visit</h2><p className="mt-1 text-muted">{site.address}</p></a>
      </div>
    </div>
  );
}
