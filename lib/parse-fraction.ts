/** Common steel gauge → decimal inches (wall thickness). */
const GAUGE_TO_INCH: Record<number, number> = {
  7: 0.1793,
  10: 0.1345,
  11: 0.1196,
  14: 0.0747,
  16: 0.0598,
  18: 0.0478,
};

function parseBareFraction(s: string): number | null {
  const m = s.trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!m) return null;
  const num = parseInt(m[1]!, 10);
  const den = parseInt(m[2]!, 10);
  if (!den) return null;
  return num / den;
}

function parseMixedNumber(s: string): number | null {
  const trimmed = s.trim();
  const mixed = trimmed.match(/^(\d+)\s+(\d+\s*\/\s*\d+)$/);
  if (mixed) {
    const whole = parseInt(mixed[1]!, 10);
    const frac = parseBareFraction(mixed[2]!);
    if (frac == null) return null;
    return whole + frac;
  }
  const fracOnly = parseBareFraction(trimmed);
  if (fracOnly != null) return fracOnly;
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse fractional sizes for catalog sort: decimals, mixed fractions, gauge labels.
 */
export function parseFractionalToDecimal(s: string | null | undefined): number | null {
  if (s == null || s === "") return null;
  let t = String(s).trim().toLowerCase();
  if (!t) return null;

  t = t.replace(/\s*in\.?\s*$/i, "").trim();

  const gaugeMatch = t.match(/^(\d+)\s*(?:ga(?:uge)?|g)\b/i);
  if (gaugeMatch) {
    const g = parseInt(gaugeMatch[1]!, 10);
    if (GAUGE_TO_INCH[g] != null) return GAUGE_TO_INCH[g]!;
  }

  const gaSuffix = t.match(/^(\d+)ga$/i);
  if (gaSuffix) {
    const g = parseInt(gaSuffix[1]!, 10);
    if (GAUGE_TO_INCH[g] != null) return GAUGE_TO_INCH[g]!;
  }

  return parseMixedNumber(t);
}
