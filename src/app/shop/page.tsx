import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategories, getProducts, PAGE_SIZE } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = { title: 'Shop all products' };
type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const SORTS: [string, string][] = [['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['newest', 'Newest']];

export default async function Shop({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const category = one(sp.category), q = one(sp.q), brand = one(sp.brand), sort = one(sp.sort) ?? 'featured';
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const [categories, { products, total }] = await Promise.all([getCategories(), getProducts({ category, q, brand, sort, page })]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const cur: Record<string, string | undefined> = { category, q, brand, sort: sort === 'featured' ? undefined : sort, ...over };
    Object.entries(cur).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return `/shop${s ? `?${s}` : ''}`;
  };
  const active = categories.find((c) => c.slug === category);

  return (
    <div className="wrap py-10">
      <h1 className="text-3xl md:text-4xl">{q ? `Results for “${q}”` : active?.name ?? 'All products'}</h1>
      {active?.description && <p className="mt-2 text-muted">{active.description}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside aria-label="Categories">
          <p className="mb-3 font-semibold">Categories</p>
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0 [&_.chip]:shrink-0 [&_.chip]:whitespace-nowrap">
            <li><Link href={href({ category: undefined, page: undefined })} className={`chip ${!category ? '!bg-ink !text-white' : ''} lg:block lg:!rounded-md lg:!bg-transparent lg:!px-2 ${!category ? 'lg:!bg-ink lg:!text-white' : ''}`}>All</Link></li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={href({ category: c.slug, page: undefined })}
                  className={`chip ${category === c.slug ? '!bg-ink !text-white' : ''} lg:flex lg:justify-between lg:!rounded-md lg:!bg-transparent lg:!px-2 ${category === c.slug ? 'lg:!bg-ink lg:!text-white' : 'lg:hover:!bg-mist'}`}>
                  <span>{c.name}</span><span className="hidden opacity-60 lg:inline">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mb-2 mt-6 font-semibold">Brand</p>
          <ul className="flex flex-wrap gap-2">
            {['Pride', 'Rajat'].map((b) => (
              <li key={b}><Link href={href({ brand: brand === b ? undefined : b, page: undefined })} className={`chip ${brand === b ? '!bg-ink !text-white' : ''}`}>{b}</Link></li>
            ))}
          </ul>
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <form action="/shop" role="search" className="flex w-full max-w-sm gap-2">
              {category && <input type="hidden" name="category" value={category} />}
              <label htmlFor="sq" className="sr-only">Search products</label>
              <input id="sq" name="q" defaultValue={q} placeholder="Search products or code" className="field" />
              <button className="btn btn-dark">Search</button>
            </form>
            <p className="text-sm text-muted" aria-live="polite">{total} product{total === 1 ? '' : 's'}</p>
          </div>
          <div className="mb-6 flex flex-wrap gap-2 text-sm" aria-label="Sort">
            {SORTS.map(([k, l]) => (
              <Link key={k} href={href({ sort: k === 'featured' ? undefined : k, page: undefined })} className={`chip ${sort === k ? '!bg-ink !text-white' : ''}`}>{l}</Link>
            ))}
          </div>

          {products.length === 0
            ? <div className="card p-10 text-center text-muted"><p>No products found. Try a different search or category.</p><Link href="/shop" className="btn btn-dark mt-4">Clear filters</Link></div>
            : <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>}

          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pages">
              {page > 1 && <Link className="btn btn-outline" href={href({ page: String(page - 1) })}>Previous</Link>}
              <span className="text-sm text-muted">Page {page} of {pages}</span>
              {page < pages && <Link className="btn btn-outline" href={href({ page: String(page + 1) })}>Next</Link>}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
