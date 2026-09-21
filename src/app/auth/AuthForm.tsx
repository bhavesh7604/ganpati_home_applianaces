'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { login, signup, type AuthState } from './actions';

export default function AuthForm({ mode, next, notice }: { mode: 'login' | 'signup'; next?: string; notice?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === 'login' ? login : signup, {});
  return (
    <form action={action} className="card mx-auto mt-8 grid max-w-md gap-4 p-6">
      {notice && <p role="alert" className="rounded bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
      {mode === 'signup' && <label className="label">Full name<input className="field" name="name" autoComplete="name" /></label>}
      <label className="label">Email<input className="field" name="email" type="email" required autoComplete="email" /></label>
      <label className="label">Password<input className="field" name="password" type="password" required minLength={mode === 'signup' ? 8 : undefined} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && <p role="alert" className="font-medium text-red-700">{state.error}</p>}
      {state.message && <p role="status" className="font-medium text-emerald-700">{state.message}</p>}
      <button className="btn btn-dark" disabled={pending}>{pending ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
      <p className="text-sm text-muted">
        {mode === 'login' ? <>New here? <Link href="/signup" className="underline">Create an account</Link></> : <>Already registered? <Link href="/login" className="underline">Log in</Link></>}
      </p>
    </form>
  );
}
