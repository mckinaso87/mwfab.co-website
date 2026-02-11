import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const url = env.supabase.url;
  const anonKey = env.supabase.anonKey;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore in Server Component context
        }
      },
    },
  });
}
