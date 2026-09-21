import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap py-24 text-center">
      <h1 className="text-4xl">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for does not exist or has moved.</p>
      <Link href="/shop" className="btn btn-dark mt-6">Browse products</Link>
    </div>
  );
}
