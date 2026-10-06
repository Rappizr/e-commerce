import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client untuk Server Components / generateMetadata.
 * Pakai anon key — aman untuk data publik (produk, testimoni).
 * JANGAN dipakai untuk operasi admin / data sensitif.
 */
export function createPublicServerClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://elbizeymyoertwutkrei.supabase.co";

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_2yS1oj_0-7pnVfwxZ9Fx_g_tJh9fAbr";

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
