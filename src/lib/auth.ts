import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getUser() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch { return null; }
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) redirect('/login?next=/admin&error=not-admin');
  return { supabase, user };
}
