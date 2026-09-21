import type { Metadata } from 'next';
import AuthForm from '../auth/AuthForm';

export const metadata: Metadata = { title: 'Log in' };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Login({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = typeof sp.next === 'string' ? sp.next : '/account';
  const notice = sp.error === 'not-admin' ? 'This account does not have admin access.' : undefined;
  return (
    <div className="wrap py-12">
      <h1 className="text-center text-3xl md:text-4xl">Log in</h1>
      <p className="mt-2 text-center text-muted">You do not need an account to order. Log in to see your past orders.</p>
      <AuthForm mode="login" next={next} notice={notice} />
    </div>
  );
}
