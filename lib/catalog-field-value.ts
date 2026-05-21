import type { MaterialCatalogRow } from "@/lib/db-types";

const TOP_LEVEL_KEYS = new Set(["weight_per_ft", "finish"]);

export function getCatalogFieldValue(
  row: MaterialCatalogRow,
  fieldKey: string
): string | null {
  if (fieldKey === "finish" && row.finish) return row.finish;
  if (fieldKey === "weight_per_ft" && row.weight_per_ft != null) {
    return String(row.weight_per_ft);
  }
  if (fieldKey === "weight_per_ft" && row.weight_per_ft != null) {
    return String(row.weight_per_ft);
  }
  if (row.dimensions && typeof row.dimensions === "object") {
    const v = (row.dimensions as Record<string, unknown>)[fieldKey];
    return v != null ? String(v) : null;
  }
  return null;
}
