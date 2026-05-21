/** Canonical app origin for invite redirects and absolute links. */
export function getAppBaseUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** Where Clerk invitation emails send users to accept and set a password. */
export function getInviteAcceptUrl(): string {
  return `${getAppBaseUrl()}/sign-up`;
}

/** Post-auth routing based on Clerk publicMetadata.role. */
export function getAfterSignInUrl(): string {
  return `${getAppBaseUrl()}/after-sign-in`;
}
