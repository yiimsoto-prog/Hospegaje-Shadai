import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function publicUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
}

function publicAnon() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
}

/**
 * Browser Supabase client (optional). Server APIs prefer the service role client.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = publicUrl();
  const anon = publicAnon();
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function isSupabaseConfigured() {
  return Boolean(publicUrl() && publicAnon());
}
