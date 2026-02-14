/**
 * US phone: normalize to digits only, format as (XXX) XXX-XXXX.
 * Accepts digits, spaces, dashes, dots, parentheses.
 */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.slice(0, 10);
}

export function formatPhoneDisplay(value: string): string {
  const digits = normalizePhone(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Returns true if empty or 10 digits. */
export function isValidPhone(value: string): boolean {
  const digits = normalizePhone(value);
  return digits.length === 0 || digits.length === 10;
}
