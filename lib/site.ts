export const SITE_URL = "https://mwfab.co";

export const SITE_NAME = "McKinados Welding & Fabrication";

export const PUBLIC_CONTACT_EMAIL = "contact@mwfab.co";

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
