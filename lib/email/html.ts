/** Escape text for HTML email bodies. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** MWFAB email theme colors (aligned with site / proposal emails). */
export const EMAIL_THEME = {
  pageBg: "#f6f7f9",
  cardBg: "#ffffff",
  cardBorder: "#e5e7eb",
  text: "#0f172a",
  muted: "#64748b",
  label: "#64748b",
  accent: "#2f4a6b",
  fieldBg: "#eef2f7",
  link: "#2f4a6b",
} as const;
