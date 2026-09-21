import Link from 'next/link';
import { getCategories, getFeatured } from '@/lib/data';
import { site, waLink } from '@/lib/config';
import Hero3D from '@/components/Hero3D';
import ProductCard from '@/components/ProductCard';

export default async function Home() {
  const [categories, featured] = await Promise.all([getCategories(), getFeatured(8)]);
  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(58%_85%_at_70%_48%,#24505c_0%,#132e36_45%,#0c1d22_80%)] text-white">
        <div className="wrap relative flex min-h-[520px] flex-col md:min-h-[600px] md:justify-center">
          <div className="relative z-10 max-w-lg py-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl">Steel, brass and appliances for your kitchen.</h1>
            <p className="mt-5 max-w-md text-lg text-steel">
              Stainless steel and brass utensils, mixer grinders, gas stoves, coolers, irons and kettles from {site.name}, Takhatgarh.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-gold">Shop all products</Link>
              <a href={waLink('Hello, I have a question about a product.')} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Chat on WhatsApp</a>
            </div>
          </div>
          <div className="relative h-[320px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[62%]"><Hero3D /></div>
        </div>
      </section>

      <section className="bg-ink text-white border-t border-white/10">
        <ul className="wrap grid gap-6 py-8 md:grid-cols-3">
          {[
            [`${site.returnDays}-day returns`, 'Something wrong with your order? Tell us within 7 days of delivery.'],
            ['Cash on delivery', 'Place your order online and pay when it reaches you.'],
            ['Local shop you can call', `Call or WhatsApp ${site.phone} for help choosing the right product.`],
          ].map(([t, d]) => (
            <li key={t} className="border-l-[3px] border-gold pl-4">
              <h2 className="text-lg">{t}</h2><p className="mt-1 text-sm text-steel">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {categories.length > 0 && (
        <section className="wrap py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-3xl">Shop by category</h2>
            <Link href="/shop" className="font-semibold underline underline-offset-4">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`}
                className="card p-5 transition-colors hover:border-ink">
                <h3 className="!font-sans text-base font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted">{c.count} product{c.count > 1 ? 's' : ''}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="wrap pb-4">
          <h2 className="mb-8 text-3xl">Popular products</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {categories.length === 0 && featured.length === 0 && (
        <section className="wrap py-20 text-center text-muted">
          <p>Products will appear here once the database is connected. See the README for setup.</p>
        </section>
      )}

      <section className="wrap mt-16">
        <div className="rounded-lg bg-mist p-8 md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h2 className="text-2xl">Looking for something specific?</h2>
            <p className="mt-2 text-muted">We stock more than what is listed. Message us with the item you need and we will confirm price and availability.</p>
          </div>
          <a href={waLink('Hello, I am looking for a product.')} target="_blank" rel="noopener noreferrer" className="btn btn-dark mt-5 md:mt-0 shrink-0">WhatsApp {site.phone}</a>
        </div>
      </section>
    </>
  );
}
