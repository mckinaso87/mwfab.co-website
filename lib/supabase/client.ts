import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createClient() {
  const url = env.nextPublic.supabaseUrl;
  const anonKey = env.nextPublic.supabaseAnonKey;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(url, anonKey);
}
