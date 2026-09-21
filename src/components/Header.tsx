import Link from 'next/link';
import { site } from '@/lib/config';
import { getUser } from '@/lib/auth';
import CartButton from './CartButton';

export default async function Header() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-40 bg-ink/95 text-white backdrop-blur">
      <div className="wrap flex h-[68px] items-center gap-4">
        <Link href="/" className="flex items-center gap-3 font-display text-lg" aria-label={`${site.name}, home`}>
          <span className="grid size-9 place-items-center rounded-full bg-gold text-gold-ink" aria-hidden>G</span>
          <span className="hidden sm:inline">{site.name}</span>
        </Link>
        <form action="/shop" className="ml-auto hidden flex-1 max-w-md md:block" role="search">
          <label htmlFor="hq" className="sr-only">Search products</label>
          <input id="hq" name="q" type="search" placeholder="Search mixer grinder, kadai, gas stove"
            className="w-full rounded-full border-0 bg-white/10 px-4 py-2 text-white placeholder:text-white/60 focus:bg-white/15" />
        </form>
        <nav className="ml-auto flex items-center gap-5 md:ml-0" aria-label="Main">
          <Link href="/shop" className="hidden font-medium opacity-90 hover:opacity-100 sm:inline">Shop</Link>
          <Link href="/track" className="hidden font-medium opacity-90 hover:opacity-100 lg:inline">Track order</Link>
          <Link href="/contact" className="hidden font-medium opacity-90 hover:opacity-100 lg:inline">Contact</Link>
          <Link href={user ? '/account' : '/login'} className="font-medium opacity-90 hover:opacity-100">{user ? 'Account' : 'Log in'}</Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
