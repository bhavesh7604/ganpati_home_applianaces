import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, getRelated } from '@/lib/data';
import { discountPct, inr } from '@/lib/format';
import { site, waLink } from '@/lib/config';
import Gallery from '@/components/Gallery';
import AddToCart from '@/components/AddToCart';
import ProductCard from '@/components/ProductCard';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: 'Product not found' };
  return { title: p.name, description: p.description?.slice(0, 155), openGraph: { images: p.images?.[0] ? [p.images[0]] : [] } };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const related = await getRelated(p);
  const off = discountPct(p.price, p.mrp);
  const specs = Object.entries(p.specs ?? {});
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku ?? undefined,
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined, description: p.description ?? undefined,
    image: p.images?.length ? p.images : undefined,
    offers: p.price != null ? { '@type': 'Offer', priceCurrency: 'INR', price: p.price,
      availability: p.stock !== null && p.stock <= 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' } : undefined,
  };

  return (
    <div className="wrap py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:underline">Shop</Link>
        {p.category && <> / <Link href={`/shop?category=${p.category.slug}`} className="hover:underline">{p.category.name}</Link></>}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <Gallery images={p.images ?? []} name={p.name} brand={p.brand} />
        <div>
          {p.brand && <p className="font-semibold text-gold-deep">{p.brand}</p>}
          <h1 className="mt-1 text-3xl md:text-4xl">{p.name}</h1>
          {p.sku && <p className="mt-2 text-sm text-muted">Code: {p.sku}</p>}

          <p className="mt-5 flex flex-wrap items-baseline gap-3">
            {p.price != null
              ? <><strong className="text-3xl">{inr(p.price)}</strong>
                  {p.mrp != null && p.mrp > p.price && <><s className="text-muted">{inr(p.mrp)}</s><span className="rounded bg-gold px-2 py-0.5 text-sm font-bold text-gold-ink">{off}% off</span></>}</>
              : <span className="text-xl font-semibold text-muted">Price on request</span>}
          </p>
          {p.price != null && <p className="mt-1 text-sm text-muted">Delivery charges, if any, are confirmed before dispatch.</p>}

          {p.size_info && <p className="mt-5"><span className="font-semibold">Available sizes:</span> {p.size_info}</p>}

          <div className="mt-6"><AddToCart p={p} /></div>

          {p.features.length > 0 && (
            <ul className="mt-8 grid gap-2">
              {p.features.map((f) => (
                <li key={f} className="relative pl-6"><span className="absolute left-0 top-[.6em] size-2.5 rounded-full bg-gold" aria-hidden />{f}</li>
              ))}
            </ul>
          )}

          <div className="mt-8 rounded-lg bg-mist p-4 text-sm">
            <p><strong>{site.returnDays}-day returns.</strong> <Link href="/policies/returns" className="underline">Read the return policy</Link></p>
            <p className="mt-1">Questions? <a className="underline" href={waLink(`Hello, I have a question about ${p.name}${p.sku ? ` (${p.sku})` : ''}.`)} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a></p>
          </div>
        </div>
      </div>

      {(p.description || specs.length > 0) && (
        <div className="mt-14 grid gap-10 md:grid-cols-2">
          {p.description && <section><h2 className="text-2xl">About this product</h2><p className="mt-3 text-muted">{p.description}</p></section>}
          {specs.length > 0 && (
            <section>
              <h2 className="text-2xl">Specifications</h2>
              <dl className="card mt-3 divide-y divide-line">
                {specs.map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-3 px-4 py-2.5"><dt className="font-semibold">{k}</dt><dd className="text-muted">{v}</dd></div>)}
              </dl>
            </section>
          )}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
