"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  computeTakeoffTotals,
  type TakeoffTotalsInput,
} from "@/lib/takeoff-calculations";
import type {
  Takeoff,
  TakeoffMetalLine,
  TakeoffComponentLine,
  TakeoffMiscLine,
  TakeoffFieldMisc,
  MaterialCatalogRow,
} from "@/lib/db-types";

const TOP_LEVEL_KEYS = new Set(["weight_per_ft", "cost_per_lb", "cost_per_foot", "pricing_unit", "item_code", "display_name"]);

/** True if a and b are the same dimension value. Use string match first; only use numeric for plain numbers (e.g. "1.5") so "1/2 in" never equals "1 in". */
function valuesEqual(a: string | null, b: string): boolean {
  if (a == null || a === "") return false;
  const ta = a.trim();
  const tb = b.trim();
  if (ta === tb) return true;
  // Only compare as numbers when both look like a single number (no fractions like 1/2, no units like "in")
  const plainNumber = /^-?\d+(\.\d+)?\s*$/;
  if (plainNumber.test(ta) && plainNumber.test(tb)) {
    const na = parseFloat(ta);
    const nb = parseFloat(tb);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na === nb;
  }
  return false;
}

function catalogRowMatchesFilters(
  row: { dimensions: Record<string, unknown> | null; [k: string]: unknown },
  filters: Record<string, string>
): boolean {
  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;
    const val = TOP_LEVEL_KEYS.has(key)
      ? (row[key] != null ? String(row[key]) : null)
      : (row.dimensions && typeof row.dimensions === "object" ? (row.dimensions as Record<string, unknown>)[key] : undefined);
    const strVal = val != null ? String(val) : null;
    if (!valuesEqual(strVal, value)) return false;
  }
  return true;
}

function getValueForStepKey(
  row: { dimensions: Record<string, unknown> | null; [k: string]: unknown },
  stepKey: string
): string | null {
  if (TOP_LEVEL_KEYS.has(stepKey)) {
    const v = row[stepKey];
    return v != null ? String(v) : null;
  }
  if (row.dimensions && typeof row.dimensions === "object") {
    const v = (row.dimensions as Record<string, unknown>)[stepKey];
    return v != null ? String(v) : null;
  }
  return null;
}

/** Returns distinct option values for a cascading dropdown step. */
export async function getCatalogDimensionOptions(
  category: string,
  stepKey: string,
  filters: Record<string, string>
): Promise<{ options: string[]; error?: string }> {
  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("material_catalog")
    .select("id, dimensions, weight_per_ft, item_code, display_name")
    .eq("category", category);
  if (error) return { options: [], error: error.message };
  const filtered = (rows ?? []).filter((row) => catalogRowMatchesFilters(row, filters));
  const values = new Set<string>();
  for (const row of filtered) {
    const v = getValueForStepKey(row, stepKey);
    if (v != null && v.trim() !== "") values.add(v.trim());
  }
  return { options: Array.from(values).sort() };
}

/** Returns the first catalog row matching the full selection (for pricing/weight). */
export async function getCatalogRow(
  category: string,
  selections: Record<string, string>
): Promise<{ row: MaterialCatalogRow | null; error?: string }> {
  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("material_catalog")
    .select("id, category, item_code, display_name, dimensions, weight_per_ft, cost_per_lb, cost_per_foot, pricing_unit, source_file, created_at")
    .eq("category", category);
  if (error) return { row: null, error: error.message };
  const match = (rows ?? []).find((row) => catalogRowMatchesFilters(row, selections));
  return { row: match ? (match as MaterialCatalogRow) : null };
}

export async function getOrCreateTakeoff(
  jobId: string
): Promise<{ takeoff: Takeoff | null; error?: string }> {
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("takeoffs")
    .select("*")
    .eq("job_id", jobId)
    .maybeSingle();
  if (existing) return { takeoff: existing as Takeoff };
  const { data: inserted, error } = await supabase
    .from("takeoffs")
    .insert({ job_id: jobId })
    .select("*")
    .single();
  if (error) return { takeoff: null, error: error.message };
  // Do not call revalidatePath here: getOrCreateTakeoff can run during page render.
  // Mutations (updateTakeoffHeader, upsert*, delete*, recomputeAndSaveTotals) revalidate.
  return { takeoff: inserted as Takeoff };
}

export async function updateTakeoffHeader(
  takeoffId: string,
  jobId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const quoteDate = (formData.get("quote_date") as string)?.trim() || null;
  const quotedBy = (formData.get("quoted_by") as string)?.trim() || null;
  const taxRate = parseFloat((formData.get("tax_rate") as string) ?? "0.07") || 0.07;
  const marginRate = parseFloat((formData.get("margin_rate") as string) ?? "0.2") || 0.2;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const shopLaborHours = parseFloat((formData.get("shop_labor_hours") as string) ?? "");
  const shopLaborRate = parseFloat((formData.get("shop_labor_rate") as string) ?? "");
  const shopDaysOrNights = parseFloat((formData.get("shop_days_or_nights") as string) ?? "");
  const shopDrawingsAmount = parseFloat((formData.get("shop_drawings_amount") as string) ?? "0") || 0;
  const fieldLaborAmount = parseFloat((formData.get("field_labor_amount") as string) ?? "");
  const fieldLaborRate = parseFloat((formData.get("field_labor_rate") as string) ?? "");
  const fieldDaysOrNights = parseFloat((formData.get("field_days_or_nights") as string) ?? "");
  const shopLaborAmount =
    (Number.isFinite(shopLaborHours) ? shopLaborHours : 0) *
    (Number.isFinite(shopLaborRate) ? shopLaborRate : 0) *
    (Number.isFinite(shopDaysOrNights) && shopDaysOrNights > 0 ? shopDaysOrNights : 1);
  const fieldLaborTotal =
    (Number.isFinite(fieldLaborAmount) ? fieldLaborAmount : 0) *
    (Number.isFinite(fieldLaborRate) ? fieldLaborRate : 0) *
    (Number.isFinite(fieldDaysOrNights) && fieldDaysOrNights > 0 ? fieldDaysOrNights : 1);
  const { error } = await supabase
    .from("takeoffs")
    .update({
      quote_date: quoteDate || null,
      quoted_by: quotedBy,
      tax_rate: taxRate,
      margin_rate: marginRate,
      notes,
      shop_labor_hours: Number.isFinite(shopLaborHours) ? shopLaborHours : null,
      shop_labor_rate: Number.isFinite(shopLaborRate) ? shopLaborRate : null,
      shop_days_or_nights: Number.isFinite(shopDaysOrNights) ? shopDaysOrNights : null,
      shop_labor_amount: shopLaborAmount,
      shop_drawings_amount: shopDrawingsAmount,
      field_labor_amount: Number.isFinite(fieldLaborAmount) ? fieldLaborAmount : null,
      field_labor_rate: Number.isFinite(fieldLaborRate) ? fieldLaborRate : null,
      field_days_or_nights: Number.isFinite(fieldDaysOrNights) ? fieldDaysOrNights : null,
      field_labor_total: fieldLaborTotal,
    })
    .eq("id", takeoffId);
  if (error) return { error: error.message };
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function recomputeAndSaveTotals(
  takeoffId: string,
  jobId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { data: takeoff } = await supabase
    .from("takeoffs")
    .select("*")
    .eq("id", takeoffId)
    .single();
  if (!takeoff) return { error: "Takeoff not found" };
  const [
    { data: metalRows },
    { data: componentRows },
    { data: miscRows },
    { data: fieldMiscRows },
  ] = await Promise.all([
    supabase.from("takeoff_metal_lines").select("*").eq("takeoff_id", takeoffId).order("sort_order"),
    supabase.from("takeoff_component_lines").select("*").eq("takeoff_id", takeoffId).order("sort_order"),
    supabase.from("takeoff_misc_lines").select("*").eq("takeoff_id", takeoffId).order("sort_order"),
    supabase.from("takeoff_field_misc").select("*").eq("takeoff_id", takeoffId).order("sort_order"),
  ]);
  const metalLines = (metalRows ?? []) as TakeoffMetalLine[];
  const componentLines = (componentRows ?? []) as TakeoffComponentLine[];
  const miscLines = (miscRows ?? []) as TakeoffMiscLine[];
  const fieldMisc = (fieldMiscRows ?? []) as TakeoffFieldMisc[];
  const input: TakeoffTotalsInput & { marginRate: number } = {
    metalLines: metalLines.map((l) => ({ category: l.category, total_price: l.total_price ?? 0 })),
    componentLines: componentLines.map((l) => ({ total_price: l.total_price ?? 0 })),
    miscLines: miscLines.map((l) => ({
      label: l.label,
      amount: l.amount,
      weight_of_galv: l.weight_of_galv,
      price_per: l.price_per,
      total_price: l.total_price ?? 0,
    })),
    fieldMisc: fieldMisc.map((f) => ({ total: f.total ?? 0 })),
    taxRate: takeoff.tax_rate ?? 0.07,
    marginRate: takeoff.margin_rate ?? 0.2,
    shopLaborHours: takeoff.shop_labor_hours,
    shopLaborRate: takeoff.shop_labor_rate,
    shopDaysOrNights: takeoff.shop_days_or_nights,
    shopLaborAmount: takeoff.shop_labor_amount ?? 0,
    shopDrawingsAmount: takeoff.shop_drawings_amount ?? 0,
    fieldLaborAmount: takeoff.field_labor_amount,
    fieldLaborRate: takeoff.field_labor_rate,
    fieldDaysOrNights: takeoff.field_days_or_nights,
    fieldLaborTotal: takeoff.field_labor_total ?? 0,
  };
  const totals = computeTakeoffTotals(input);
  const { error } = await supabase
    .from("takeoffs")
    .update({
      metal_subtotal: totals.metal_subtotal,
      other_material_subtotal: totals.other_material_subtotal,
      all_material_subtotal: totals.all_material_subtotal,
      tax_total: totals.tax_total,
      material_total_with_tax: totals.material_total_with_tax,
      shop_total: totals.shop_total,
      field_total: totals.field_total,
      project_total: totals.project_total,
      with_pct_total: totals.with_pct_total,
      grand_total: totals.grand_total,
    })
    .eq("id", takeoffId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}`);
  return {};
}

export async function upsertMetalLine(
  takeoffId: string,
  jobId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const id = (formData.get("id") as string)?.trim();
  const displayName = (formData.get("display_name") as string)?.trim();
  const category = ((formData.get("category") as string)?.trim() || "other") as TakeoffMetalLine["category"];
  const count = parseFloat((formData.get("count") as string) ?? "1") || 1;
  const totalLengthFt = parseFloat((formData.get("total_length_ft") as string) ?? "");
  const totalPoundsPerPiece = parseFloat((formData.get("total_pounds_per_piece") as string) ?? "");
  const totalPounds = parseFloat((formData.get("total_pounds") as string) ?? "");
  const costPerUnit = parseFloat((formData.get("cost_per_unit") as string) ?? "");
  const totalPrice = parseFloat((formData.get("total_price") as string) ?? "");
  const sortOrder = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;
  const materialCatalogId = (formData.get("material_catalog_id") as string)?.trim() || null;
  let resolvedDisplayName = displayName;
  let resolvedTotalPounds = totalPounds;
  let resolvedCostPerUnit = costPerUnit;
  let resolvedTotalPrice = totalPrice;
  const countNum = Math.max(1, Math.floor(count));
  if (materialCatalogId) {
    const { data: catalogRow } = await supabase
      .from("material_catalog")
      .select("display_name, cost_per_lb, cost_per_foot, weight_per_ft, pricing_unit")
      .eq("id", materialCatalogId)
      .single();
    if (catalogRow) {
      if (!resolvedDisplayName && catalogRow.display_name) resolvedDisplayName = catalogRow.display_name;
      if (!Number.isFinite(resolvedCostPerUnit))
        resolvedCostPerUnit = (catalogRow.cost_per_lb ?? catalogRow.cost_per_foot) ?? 0;
      const wpf = catalogRow.weight_per_ft;
      if (Number.isFinite(totalLengthFt) && wpf != null && Number.isFinite(wpf)) {
        const effectiveLength = totalLengthFt * countNum;
        resolvedTotalPounds = effectiveLength * wpf;
        if (catalogRow.pricing_unit === "per_lb" && Number.isFinite(resolvedCostPerUnit))
          resolvedTotalPrice = resolvedTotalPounds * resolvedCostPerUnit;
        else if (catalogRow.pricing_unit === "per_foot" && catalogRow.cost_per_foot != null)
          resolvedTotalPrice = effectiveLength * catalogRow.cost_per_foot;
      }
    }
  }
  // If no catalog or catalog didn't set price, use form total_price (client already applied count)
  if (!Number.isFinite(resolvedTotalPrice) || resolvedTotalPrice === 0)
    resolvedTotalPrice = totalPrice;
  const payload = {
    takeoff_id: takeoffId,
    material_catalog_id: materialCatalogId || null,
    category,
    display_name: resolvedDisplayName || "—",
    count,
    total_length_ft: Number.isFinite(totalLengthFt) ? totalLengthFt : null,
    total_pounds_per_piece: Number.isFinite(totalPoundsPerPiece) ? totalPoundsPerPiece : null,
    total_pounds: Number.isFinite(resolvedTotalPounds) ? resolvedTotalPounds : null,
    cost_per_unit: Number.isFinite(resolvedCostPerUnit) ? resolvedCostPerUnit : null,
    total_price: Number.isFinite(resolvedTotalPrice) ? resolvedTotalPrice : 0,
    sort_order: sortOrder,
  };
  if (id) {
    const { error } = await supabase.from("takeoff_metal_lines").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("takeoff_metal_lines").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function deleteMetalLine(
  takeoffId: string,
  lineId: string,
  jobId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("takeoff_metal_lines").delete().eq("id", lineId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

/** Form action wrapper for delete metal line (form submits with FormData). */
export async function deleteMetalLineForm(
  takeoffId: string,
  lineId: string,
  jobId: string,
  _formData?: FormData
): Promise<{ error?: string }> {
  return deleteMetalLine(takeoffId, lineId, jobId);
}

export async function upsertComponentLine(
  takeoffId: string,
  jobId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const id = (formData.get("id") as string)?.trim();
  const displayName = (formData.get("display_name") as string)?.trim();
  const count = parseFloat((formData.get("count") as string) ?? "1") || 1;
  const totalPoundsPerPiece = parseFloat((formData.get("total_pounds_per_piece") as string) ?? "");
  const totalPounds = parseFloat((formData.get("total_pounds") as string) ?? "");
  const costPerMeasure = parseFloat((formData.get("cost_per_measure") as string) ?? "");
  const totalPrice = parseFloat((formData.get("total_price") as string) ?? "");
  const sortOrder = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;
  const payload = {
    takeoff_id: takeoffId,
    display_name: displayName || "—",
    count,
    total_pounds_per_piece: Number.isFinite(totalPoundsPerPiece) ? totalPoundsPerPiece : null,
    total_pounds: Number.isFinite(totalPounds) ? totalPounds : null,
    cost_per_measure: Number.isFinite(costPerMeasure) ? costPerMeasure : null,
    total_price: Number.isFinite(totalPrice) ? totalPrice : 0,
    sort_order: sortOrder,
  };
  if (id) {
    const { error } = await supabase.from("takeoff_component_lines").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("takeoff_component_lines").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function deleteComponentLine(
  takeoffId: string,
  lineId: string,
  jobId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("takeoff_component_lines").delete().eq("id", lineId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function deleteComponentLineForm(
  takeoffId: string,
  lineId: string,
  jobId: string,
  _formData?: FormData
): Promise<{ error?: string }> {
  return deleteComponentLine(takeoffId, lineId, jobId);
}

export async function upsertMiscLine(
  takeoffId: string,
  jobId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const id = (formData.get("id") as string)?.trim();
  const label = (formData.get("label") as string)?.trim();
  const amount = parseFloat((formData.get("amount") as string) ?? "");
  const weightOfGalv = parseFloat((formData.get("weight_of_galv") as string) ?? "");
  const pricePer = parseFloat((formData.get("price_per") as string) ?? "");
  const totalPrice = parseFloat((formData.get("total_price") as string) ?? "");
  const sortOrder = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;
  const payload = {
    takeoff_id: takeoffId,
    label: label || "Other",
    amount: Number.isFinite(amount) ? amount : null,
    weight_of_galv: Number.isFinite(weightOfGalv) ? weightOfGalv : null,
    price_per: Number.isFinite(pricePer) ? pricePer : null,
    total_price: Number.isFinite(totalPrice) ? totalPrice : 0,
    sort_order: sortOrder,
  };
  if (id) {
    const { error } = await supabase.from("takeoff_misc_lines").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("takeoff_misc_lines").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function deleteMiscLine(
  takeoffId: string,
  lineId: string,
  jobId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("takeoff_misc_lines").delete().eq("id", lineId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function deleteMiscLineForm(
  takeoffId: string,
  lineId: string,
  jobId: string,
  _formData?: FormData
): Promise<{ error?: string }> {
  return deleteMiscLine(takeoffId, lineId, jobId);
}

export async function upsertFieldMiscLine(
  takeoffId: string,
  jobId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const id = (formData.get("id") as string)?.trim();
  const label = (formData.get("label") as string)?.trim();
  const amount = parseFloat((formData.get("amount") as string) ?? "");
  const pricePer = parseFloat((formData.get("price_per") as string) ?? "");
  const hrsDaysNights = (formData.get("hrs_days_nights") as string)?.trim() || null;
  const total = parseFloat((formData.get("total") as string) ?? "");
  const sortOrder = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;
  const payload = {
    takeoff_id: takeoffId,
    label: label || "—",
    amount: Number.isFinite(amount) ? amount : null,
    price_per: Number.isFinite(pricePer) ? pricePer : null,
    hrs_days_nights: hrsDaysNights,
    total: Number.isFinite(total) ? total : 0,
    sort_order: sortOrder,
  };
  if (id) {
    const { error } = await supabase.from("takeoff_field_misc").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("takeoff_field_misc").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function deleteFieldMiscLine(
  takeoffId: string,
  lineId: string,
  jobId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("takeoff_field_misc").delete().eq("id", lineId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function deleteFieldMiscLineForm(
  takeoffId: string,
  lineId: string,
  jobId: string,
  _formData?: FormData
): Promise<{ error?: string }> {
  return deleteFieldMiscLine(takeoffId, lineId, jobId);
}
