/**
 * Category labels, shorthand prefixes, and parse helper for takeoff metal entry.
 */

import type { TakeoffMetalCategory } from "@/lib/db-types";

export const CATEGORY_ORDER: TakeoffMetalCategory[] = [
  "angle",
  "wide_flange",
  "round_bar",
  "flat_bar",
  "plate",
  "channel",
  "mc_channel",
  "pipe",
  "tube",
  "other",
];

export const CATEGORY_SHORT: Record<TakeoffMetalCategory, string> = {
  angle: "L",
  wide_flange: "W",
  round_bar: "RB",
  flat_bar: "FB",
  plate: "PL",
  channel: "C",
  mc_channel: "MC",
  pipe: "PIPE",
  tube: "TS",
  other: "—",
};

export const CATEGORY_LABEL: Record<TakeoffMetalCategory, string> = {
  angle: "Angle",
  wide_flange: "Wide Flange",
  round_bar: "Round Bar",
  flat_bar: "Flat Bar",
  plate: "Plate",
  channel: "Channel",
  mc_channel: "MC Channel",
  pipe: "Pipe",
  tube: "Tube (TS)",
  other: "Other",
};

/** Longest-prefix wins when parsing operator shorthand (MC before M, HSS/TS before T). */
export const SHORTHAND_PREFIX: Record<string, TakeoffMetalCategory> = {
  PIPE: "pipe",
  HSS: "tube",
  TS: "tube",
  MC: "mc_channel",
  RB: "round_bar",
  FB: "flat_bar",
  FL: "flat_bar",
  PL: "plate",
  W: "wide_flange",
  C: "channel",
  L: "angle",
};

export const STEEL_DENSITY_LB_PER_IN3 = 0.2836;

const PREFIXES_SORTED = Object.keys(SHORTHAND_PREFIX).sort((a, b) => b.length - a.length);

export function parseShorthand(input: string): { category: string; tokens: string[] } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  for (const prefix of PREFIXES_SORTED) {
    if (upper.startsWith(prefix)) {
      const rest = trimmed.slice(prefix.length).trim();
      const tokens = rest
        ? rest.split(/[x×\-]/i).map((t) => t.trim()).filter(Boolean)
        : [];
      return { category: SHORTHAND_PREFIX[prefix]!, tokens };
    }
  }
  return null;
}

/** Normalize HSS industry alias to canonical TS prefix for display/storage. */
export function normalizeShorthandCode(code: string): string {
  const t = code.trim();
  if (/^hss/i.test(t)) return "TS" + t.slice(3);
  return t;
}

export const CATALOG_CATEGORIES = CATEGORY_ORDER.filter(
  (c): c is Exclude<TakeoffMetalCategory, "plate" | "other"> => c !== "plate" && c !== "other"
);
