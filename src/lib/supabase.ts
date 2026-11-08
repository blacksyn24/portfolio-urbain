import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client côté serveur, sans session (lecture publique et insertions anonymes). */
export function serverClient(accessToken?: string): SupabaseClient {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

let browser: SupabaseClient | null = null;
/** Client navigateur (session admin conservée). */
export function browserClient(): SupabaseClient {
  if (!browser) browser = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  return browser;
}
