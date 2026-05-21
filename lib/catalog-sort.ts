import { CATEGORY_ORDER } from "@/lib/takeoff-catalog-spec";
import { parseFractionalToDecimal } from "@/lib/parse-fraction";
import type { MaterialCatalogCategory } from "@/lib/db-types";

export type CatalogSortRow = {
  category: string;
  size_label: string | null;
  weight_per_ft: number | null;
  dimensions: Record<string, unknown> | null;
  shorthand_code?: string;
};

function dimDecimal(dimensions: Record<string, unknown> | null, key: string): number {
  if (!dimensions) return Infinity;
  const v = dimensions[key];
  if (v == null || v === "") return Infinity;
  const parsed = parseFractionalToDecimal(String(v));
  return parsed ?? Infinity;
}

function categoryIndex(cat: string): number {
  const idx = CATEGORY_ORDER.indexOf(cat as MaterialCatalogCategory);
  return idx >= 0 ? idx : CATEGORY_ORDER.length;
}

export function sortCatalogRows<T extends CatalogSortRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ca = categoryIndex(a.category);
    const cb = categoryIndex(b.category);
    if (ca !== cb) return ca - cb;

    const keys = ["size_a", "size_b", "size_c", "width", "height", "section_depth_a", "pipe_size", "gauge"];
    for (const key of keys) {
      const da = dimDecimal(a.dimensions, key);
      const db = dimDecimal(b.dimensions, key);
      if (da !== db) return da - db;
    }

    const wa = a.weight_per_ft ?? Infinity;
    const wb = b.weight_per_ft ?? Infinity;
    if (wa !== wb) return wa - wb;

    const la = (a.size_label ?? a.shorthand_code ?? "").toLowerCase();
    const lb = (b.size_label ?? b.shorthand_code ?? "").toLowerCase();
    return la.localeCompare(lb);
  });
}
