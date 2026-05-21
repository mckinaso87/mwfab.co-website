"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sortCatalogRows } from "@/lib/catalog-sort";
import type { MaterialCatalogRow, MaterialFieldConfig, MaterialCatalogCategory } from "@/lib/db-types";

const CATALOG_SELECT =
  "id, category, item_code, shorthand_code, size_label, finish, dimensions, weight_per_ft, cost_per_lb, cost_per_foot, pricing_unit, is_active, source_file, created_at";

export type MaterialCatalogUpdate = {
  category?: MaterialCatalogCategory;
  item_code?: string | null;
  shorthand_code?: string | null;
  size_label?: string | null;
  finish?: "HR" | "CF" | null;
  dimensions?: Record<string, unknown> | null;
  weight_per_ft?: number | null;
  cost_per_lb?: number | null;
  cost_per_foot?: number | null;
  pricing_unit?: "per_lb" | "per_foot";
  is_active?: boolean;
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
  if (payload.shorthand_code !== undefined) update.shorthand_code = payload.shorthand_code ?? "";
  if (payload.size_label !== undefined) update.size_label = payload.size_label;
  if (payload.finish !== undefined) update.finish = payload.finish;
  if (payload.dimensions !== undefined) update.dimensions = payload.dimensions;
  if (payload.weight_per_ft !== undefined) update.weight_per_ft = payload.weight_per_ft;
  if (payload.cost_per_lb !== undefined) update.cost_per_lb = payload.cost_per_lb;
  if (payload.cost_per_foot !== undefined) update.cost_per_foot = payload.cost_per_foot;
  if (payload.pricing_unit !== undefined) update.pricing_unit = payload.pricing_unit;
  if (payload.is_active !== undefined) update.is_active = payload.is_active;
  if (payload.source_file !== undefined) update.source_file = payload.source_file;

  const { error } = await supabase.from("material_catalog").update(update).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/materials");
  revalidatePath("/admin/jobs");
  return {};
}

export async function insertMaterialCatalogRow(
  payload: MaterialCatalogUpdate & {
    category: MaterialCatalogCategory;
    item_code: string;
    shorthand_code: string;
    pricing_unit: "per_lb" | "per_foot";
  }
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("material_catalog").insert({
    category: payload.category,
    item_code: payload.item_code,
    shorthand_code: payload.shorthand_code,
    size_label: payload.size_label ?? null,
    finish: payload.finish ?? null,
    dimensions: payload.dimensions ?? null,
    weight_per_ft: payload.weight_per_ft ?? null,
    cost_per_lb: payload.cost_per_lb ?? null,
    cost_per_foot: payload.cost_per_foot ?? null,
    pricing_unit: payload.pricing_unit,
    is_active: payload.is_active ?? true,
    source_file: payload.source_file ?? "manual",
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/materials");
  return {};
}

export async function listMaterialCatalog(category: string | null): Promise<{
  rows: MaterialCatalogRow[];
  error?: string;
}> {
  const supabase = createAdminClient();
  let q = supabase
    .from("material_catalog")
    .select(CATALOG_SELECT)
    .order("category", { ascending: true })
    .order("shorthand_code", { ascending: true });
  if (category && category !== "all") {
    q = q.eq("category", category);
  }
  const { data, error } = await q;
  if (error) return { rows: [], error: error.message };
  return { rows: sortCatalogRows((data ?? []) as MaterialCatalogRow[]) };
}

export async function listAllMaterialFieldConfig(): Promise<{
  rows: MaterialFieldConfig[];
  error?: string;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("material_field_config")
    .select("category, field_key, label, show_in_takeoff, sort_order")
    .order("category")
    .order("sort_order");
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as MaterialFieldConfig[] };
}

export async function listMaterialFieldConfigForCategory(
  category: string
): Promise<{ rows: MaterialFieldConfig[]; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("material_field_config")
    .select("category, field_key, label, show_in_takeoff, sort_order")
    .eq("category", category)
    .order("sort_order");
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as MaterialFieldConfig[] };
}

export async function updateFieldConfig(
  rows: Pick<MaterialFieldConfig, "category" | "field_key" | "show_in_takeoff" | "sort_order">[]
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  for (const row of rows) {
    const { error } = await supabase
      .from("material_field_config")
      .update({
        show_in_takeoff: row.show_in_takeoff,
        sort_order: row.sort_order,
      })
      .eq("category", row.category)
      .eq("field_key", row.field_key);
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/materials/field-config");
  revalidatePath("/admin/materials");
  revalidatePath("/admin/jobs");
  return {};
}
