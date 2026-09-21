'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error?: string; message?: string };
const safeNext = (n: string) => (n.startsWith('/') && !n.startsWith('//') ? n : '/account');

export async function login(_p: AuthState, fd: FormData): Promise<AuthState> {
  const email = String(fd.get('email') ?? '').trim(), password = String(fd.get('password') ?? '');
  const next = safeNext(String(fd.get('next') ?? '/account'));
  if (!email || !password) return { error: 'Enter your email and password.' };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Incorrect email or password.' };
  } catch { return { error: 'Login is not available right now. Please try again later.' }; }
  redirect(next);
}

export async function signup(_p: AuthState, fd: FormData): Promise<AuthState> {
  const email = String(fd.get('email') ?? '').trim(), password = String(fd.get('password') ?? '');
  const full_name = String(fd.get('name') ?? '').trim();
  if (!email || password.length < 8) return { error: 'Enter your email and a password of at least 8 characters.' };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });
    if (error) return { error: error.message };
    if (!data.session) return { message: 'Account created. Check your email to confirm it, then log in.' };
  } catch { return { error: 'Sign up is not available right now. Please try again later.' }; }
  redirect('/account');
}

export async function logout() {
  try { const supabase = await createClient(); await supabase.auth.signOut(); } catch { /* ignore */ }
  redirect('/');
}
