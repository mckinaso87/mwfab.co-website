/** Normalize email for storage and deduplication (lowercase, trimmed). */
export function normalizeEmail(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  return value.trim().toLowerCase();
}
