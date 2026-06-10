import type { LineScope } from "@/lib/db-types";

export const SCOPE_ORDER: LineScope[] = ["furnish", "furnish_install"];

export const SCOPE_SUBGROUP_TITLE: Record<LineScope, string> = {
  furnish: "FURNISH",
  furnish_install: "FURNISH & INSTALL",
};

function normalizeScope(scope: string | null | undefined): LineScope {
  return scope === "furnish" ? "furnish" : "furnish_install";
}

function lineAmount<L extends { total_price?: number | null; total?: number | null }>(
  line: L,
  amountKey: "total_price" | "total"
): number {
  const v = amountKey === "total" ? line.total : line.total_price;
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function subgroupSubtotal<
  L extends { total_price?: number | null; total?: number | null },
>(lines: L[], amountKey: "total_price" | "total" = "total_price"): number {
  return lines.reduce((s, l) => s + lineAmount(l, amountKey), 0);
}

/** Sum line amounts for rows included on the customer proposal. */
export function proposalSectionSubtotal<
  L extends {
    total_price?: number | null;
    total?: number | null;
    include_in_proposal?: boolean;
  },
>(lines: L[], amountKey: "total_price" | "total" = "total_price"): number {
  return lines
    .filter((l) => l.include_in_proposal !== false)
    .reduce((s, l) => s + lineAmount(l, amountKey), 0);
}

export type ScopeGroups<T> = { scope: LineScope; lines: T[] }[];

/** Furnish first, then F&I; only non-empty groups. */
export function groupLinesByScope<T extends { scope?: string | null }>(
  lines: T[]
): ScopeGroups<T> {
  const furnish: T[] = [];
  const furnishInstall: T[] = [];
  for (const line of lines) {
    if (normalizeScope(line.scope) === "furnish") furnish.push(line);
    else furnishInstall.push(line);
  }
  const groups: ScopeGroups<T> = [];
  if (furnish.length > 0) groups.push({ scope: "furnish", lines: furnish });
  if (furnishInstall.length > 0) groups.push({ scope: "furnish_install", lines: furnishInstall });
  return groups;
}
