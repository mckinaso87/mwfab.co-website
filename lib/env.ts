/**
 * Centralized env validation. Use these in app code instead of process.env directly.
 * Add runtime checks here when deploying (e.g. throw if required keys missing in production).
 */

const required = (key: string): string => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
};

const optional = (key: string): string | undefined => process.env[key];

export const env = {
  /** Public; safe for client */
  nextPublic: {
    clerkPublishableKey: optional("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    supabaseUrl: optional("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: optional("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },

  /** Server-only; do not expose */
  clerk: {
    secretKey: optional("CLERK_SECRET_KEY"),
  },

  supabase: {
    url: optional("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: optional("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },

  resend: {
    apiKey: optional("RESEND_API_KEY"),
    fromEmail: optional("RESEND_FROM_EMAIL"),
  },
} as const;

/** Call in API routes that need Clerk auth (e.g. admin). Throws if keys missing. */
export function requireClerkEnv(): { publishableKey: string; secretKey: string } {
  return {
    publishableKey: required("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    secretKey: required("CLERK_SECRET_KEY"),
  };
}

/** Call in API routes that send email via Resend. */
export function getResendEnv(): { apiKey: string; fromEmail: string } | null {
  const apiKey = optional("RESEND_API_KEY");
  const fromEmail = optional("RESEND_FROM_EMAIL");
  if (apiKey && fromEmail) return { apiKey, fromEmail };
  return null;
}
