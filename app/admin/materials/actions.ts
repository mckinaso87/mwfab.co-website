"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MaterialCatalogRow } from "@/lib/db-types";

const CATEGORIES = [
  "angles",
  "wide_flange",
  "bars_hr_rounds",
  "bars_cf_rounds",
  "bars_flat",
  "channels",
  "mc_channels",
  "pipe",
  "tube",
] as const;

export type MaterialCatalogUpdate = {
  category?: (typeof CATEGORIES)[number];
  item_code?: string | null;
  display_name?: string | null;
  dimensions?: Record<string, unknown> | null;
  weight_per_ft?: number | null;
  cost_per_lb?: number | null;
  cost_per_foot?: number | null;
  pricing_unit?: "per_lb" | "per_foot";
  source_file?: string | null;
};

export async function updateMaterialCatalogRow(
  id: string,
  payload: MaterialCatalogUpdate
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (payload.category !== undefined) update.category = payload.category;
  if (payload.item_code !== undefined) update.item_code = payload.item_code ?? "";
  if (payload.display_name !== undefined) update.display_name = payload.display_name;
  if (payload.dimensions !== undefined) update.dimensions = payload.dimensions;
  if (payload.weight_per_ft !== undefined) update.weight_per_ft = payload.weight_per_ft;
  if (payload.cost_per_lb !== undefined) update.cost_per_lb = payload.cost_per_lb;
  if (payload.cost_per_foot !== undefined) update.cost_per_foot = payload.cost_per_foot;
  if (payload.pricing_unit !== undefined) update.pricing_unit = payload.pricing_unit;
  if (payload.source_file !== undefined) update.source_file = payload.source_file;

  const { error } = await supabase
    .from("material_catalog")
    .update(update)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/materials");
  revalidatePath("/admin/jobs");
  return {};
}

export async function listMaterialCatalog(category: string | null): Promise<{
  rows: MaterialCatalogRow[];
  error?: string;
}> {
  const supabase = createAdminClient();
  let q = supabase
    .from("material_catalog")
    .select("id, category, item_code, display_name, dimensions, weight_per_ft, cost_per_lb, cost_per_foot, pricing_unit, source_file, created_at")
    .order("category", { ascending: true })
    .order("item_code", { ascending: true });
  if (category && category !== "all") {
    q = q.eq("category", category);
  }
  const { data, error } = await q;
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as MaterialCatalogRow[] };
}
