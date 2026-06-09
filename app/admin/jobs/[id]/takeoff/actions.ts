"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCatalogFieldValue } from "@/lib/catalog-field-value";
import { sortCatalogRows } from "@/lib/catalog-sort";
import {
  computeTakeoffTotals,
  computeMiscLineTotal,
  computeFieldMiscTotal,
  computeGalvanizerWeightCost,
  computeGalvanizerShortfall,
  isGalvanizerLine,
  isGalvanizerShortfallLine,
  normalizeRate,
  type GalvMode,
  type TakeoffTotalsInput,
} from "@/lib/takeoff-calculations";
import { STEEL_DENSITY_LB_PER_IN3 } from "@/lib/takeoff-catalog-spec";
import type {
  Takeoff,
  TakeoffMetalLine,
  TakeoffComponentLine,
  TakeoffMiscLine,
  TakeoffFieldMisc,
  MaterialCatalogRow,
  MaterialFieldConfig,
  LineScope,
  TakeoffSectionKey,
  SettingsExclusion,
} from "@/lib/db-types";

function parseScope(formData: FormData): LineScope {
  const s = (formData.get("scope") as string)?.trim();
  return s === "furnish" ? "furnish" : "furnish_install";
}

function parseFormCheckbox(formData: FormData, name: string): boolean {
  const v = (formData.get(name) as string)?.trim().toLowerCase();
  return v !== "false" && v !== "0" && v !== "off";
}

function parseIncludeInProposal(formData: FormData): boolean {
  return parseFormCheckbox(formData, "include_in_proposal");
}

function parseCustomerNoteFields(formData: FormData): {
  customer_note: string | null;
  customer_note_in_proposal: boolean;
} {
  const raw = (formData.get("customer_note") as string)?.trim() ?? "";
  return {
    customer_note: raw.length > 0 ? raw : null,
    customer_note_in_proposal: parseFormCheckbox(formData, "customer_note_in_proposal"),
  };
}

const CATALOG_SELECT =
  "id, category, item_code, shorthand_code, size_label, finish, dimensions, weight_per_ft, cost_per_lb, cost_per_foot, pricing_unit, is_active, source_file, created_at";

/** Persist takeoff unit cost back to the linked catalog row (materials admin). */
async function syncMaterialCatalogCostFromTakeoff(
  supabase: ReturnType<typeof createAdminClient>,
  catalogId: string,
  catalogRow: Pick<MaterialCatalogRow, "pricing_unit" | "cost_per_lb" | "cost_per_foot">,
  costPerUnit: number
): Promise<{ error?: string }> {
  const update: { cost_per_lb?: number; cost_per_foot?: number } = {};
  if (catalogRow.pricing_unit === "per_lb") {
    if (catalogRow.cost_per_lb === costPerUnit) return {};
    update.cost_per_lb = costPerUnit;
  } else if (catalogRow.pricing_unit === "per_foot") {
    if (catalogRow.cost_per_foot === costPerUnit) return {};
    update.cost_per_foot = costPerUnit;
  } else {
    return {};
  }
  const { error } = await supabase.from("material_catalog").update(update).eq("id", catalogId);
  if (error) return { error: error.message };
  return {};
}

export async function getCatalogRowById(
  id: string
): Promise<{ row: MaterialCatalogRow | null; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("material_catalog")
    .select(CATALOG_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) return { row: null, error: error.message };
  return { row: (data as MaterialCatalogRow | null) ?? null };
}

const LINE_TABLE_MAP = {
  metal: "takeoff_metal_lines",
  component: "takeoff_component_lines",
  misc: "takeoff_misc_lines",
  field_misc: "takeoff_field_misc",
} as const;

export type TakeoffLineTable = keyof typeof LINE_TABLE_MAP;

export async function setLineScope(
  table: TakeoffLineTable,
  lineId: string,
  jobId: string,
  scope: "furnish" | "furnish_install"
): Promise<{ error?: string }> {
  if (scope !== "furnish" && scope !== "furnish_install") {
    return { error: "Invalid scope." };
  }
  const supabase = createAdminClient();
  const tableName = LINE_TABLE_MAP[table];
  const { data: row, error: fetchErr } = await supabase
    .from(tableName)
    .select("takeoff_id")
    .eq("id", lineId)
    .single();
  if (fetchErr || !row) return { error: fetchErr?.message ?? "Line not found." };

  const { error } = await supabase.from(tableName).update({ scope }).eq("id", lineId);
  if (error) return { error: error.message };

  const takeoffId = row.takeoff_id as string;
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function searchCatalogByShorthand(
  query: string,
  limit = 25
): Promise<{ rows: MaterialCatalogRow[]; error?: string }> {
  const q = query.trim();
  if (!q) return { rows: [] };
  const supabase = createAdminClient();
  const escaped = q.replace(/[%_]/g, "\\$&").replace(/"/g, '\\"');
  const pattern = `"%${escaped}%"`;
  const { data, error } = await supabase
    .from("material_catalog")
    .select(CATALOG_SELECT)
    .eq("is_active", true)
    .or(`shorthand_code.ilike.${pattern},size_label.ilike.${pattern}`)
    .order("category")
    .order("shorthand_code")
    .limit(limit);
  if (error) return { rows: [], error: error.message };
  const rows = sortCatalogRows((data ?? []) as MaterialCatalogRow[]);
  return { rows: rows.slice(0, limit) };
}

export async function getMaterialFieldConfig(
  category: string
): Promise<{ fields: MaterialFieldConfig[]; error?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("material_field_config")
    .select("category, field_key, label, show_in_takeoff, sort_order")
    .eq("category", category)
    .eq("show_in_takeoff", true)
    .order("sort_order");
  if (error) return { fields: [], error: error.message };
  return { fields: (data ?? []) as MaterialFieldConfig[] };
}

export async function getSumGalvPounds(takeoffId: string): Promise<number> {
  const supabase = createAdminClient();
  const [{ data: metal }, { data: components }] = await Promise.all([
    supabase.from("takeoff_metal_lines").select("galv_pounds").eq("takeoff_id", takeoffId),
    supabase.from("takeoff_component_lines").select("galv_pounds").eq("takeoff_id", takeoffId),
  ]);
  const metalSum = (metal ?? []).reduce((s, r) => s + (Number(r.galv_pounds) || 0), 0);
  const compSum = (components ?? []).reduce((s, r) => s + (Number(r.galv_pounds) || 0), 0);
  return metalSum + compSum;
}

export async function setGalvTotalOverride(
  takeoffId: string,
  jobId: string,
  override: number | null
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("takeoffs")
    .update({ galv_total_override: override })
    .eq("id", takeoffId);
  if (error) return { error: error.message };
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function setGalvanizerIncludeInProposal(
  takeoffId: string,
  jobId: string,
  includeInProposal: boolean
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { data: miscRows } = await supabase
    .from("takeoff_misc_lines")
    .select("id, label")
    .eq("takeoff_id", takeoffId);

  let galvLine = (miscRows ?? []).find((l) => isGalvanizerLine(l.label));
  if (!galvLine) {
    const recompute = await recomputeAndSaveTotals(takeoffId, jobId);
    if (recompute.error) return recompute;

    const { data: afterRows } = await supabase
      .from("takeoff_misc_lines")
      .select("id, label")
      .eq("takeoff_id", takeoffId);
    galvLine = (afterRows ?? []).find((l) => isGalvanizerLine(l.label));
  }

  if (!galvLine) {
    return {
      error:
        "Galvanizer line not found. Set galvanizing mode above baked-in or optional, then save the takeoff.",
    };
  }

  const { error } = await supabase
    .from("takeoff_misc_lines")
    .update({ include_in_proposal: includeInProposal })
    .eq("id", galvLine.id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
  return {};
}

export async function setLineCustomerNote(
  lineId: string,
  jobId: string,
  note: string,
  includeInProposal: boolean
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const trimmed = note.trim();
  const { error } = await supabase
    .from("takeoff_misc_lines")
    .update({
      customer_note: trimmed.length > 0 ? trimmed : null,
      customer_note_in_proposal: includeInProposal,
    })
    .eq("id", lineId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
  return {};
}

async function seedTakeoffExclusionsWithAllActive(
  supabase: ReturnType<typeof createAdminClient>,
  takeoffId: string
): Promise<{ error?: string }> {
  const { data: activeExclusions, error: listError } = await supabase
    .from("settings_exclusions")
    .select("id")
    .eq("is_active", true);
  if (listError) return { error: listError.message };
  if (!activeExclusions?.length) return {};

  const { error } = await supabase.from("takeoff_exclusions").insert(
    activeExclusions.map((row) => ({
      takeoff_id: takeoffId,
      exclusion_id: row.id as string,
    }))
  );
  if (error) return { error: error.message };
  return {};
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

  const seedResult = await seedTakeoffExclusionsWithAllActive(supabase, inserted.id);
  if (seedResult.error) return { takeoff: null, error: seedResult.error };

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
  const taxRateRaw = parseFloat((formData.get("tax_rate") as string) ?? "7");
  const marginRateRaw = parseFloat((formData.get("margin_rate") as string) ?? "20");
  const taxRate = normalizeRate(Number.isFinite(taxRateRaw) ? taxRateRaw : 7, 0.07);
  const marginRate = normalizeRate(Number.isFinite(marginRateRaw) ? marginRateRaw : 20, 0.2);
  const notes = (formData.get("notes") as string)?.trim() || null;
  const galvModeRaw = (formData.get("galv_mode") as string)?.trim();
  const galvMode: GalvMode =
    galvModeRaw === "baked_in" || galvModeRaw === "optional_addon"
      ? galvModeRaw
      : "not_galvanized";
  const plateDefault = parseFloat((formData.get("plate_default_cost_per_lb") as string) ?? "1.1");
  const galvPctRaw = parseFloat((formData.get("galv_pct") as string) ?? "15");
  const galvRateRaw = parseFloat((formData.get("galv_rate_per_lb") as string) ?? "0.5");
  const galvPctStored = normalizeRate(
    Number.isFinite(galvPctRaw) && galvPctRaw >= 0 && galvPctRaw <= 100 ? galvPctRaw : 15,
    0.15
  );
  const galvRatePerLb =
    Number.isFinite(galvRateRaw) && galvRateRaw >= 0 ? galvRateRaw : 0.5;
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
      galv_mode: galvMode,
      galv_pct: galvPctStored,
      galv_rate_per_lb: galvRatePerLb,
      plate_default_cost_per_lb: Number.isFinite(plateDefault) ? plateDefault : 1.1,
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

async function syncGalvanizerMiscLine(
  takeoffId: string,
  galvMode: GalvMode,
  effectiveGalvPounds: number,
  miscLines: TakeoffMiscLine[],
  galvPct: number,
  galvRatePerLb: number
): Promise<TakeoffMiscLine[]> {
  if (galvMode === "not_galvanized") return miscLines;

  const supabase = createAdminClient();
  const weight = effectiveGalvPounds;
  const totalPrice = computeMiscLineTotal(
    {
      label: "Galvanizer",
      amount: null,
      weight_of_galv: weight,
      price_per: null,
      total_price: 0,
    },
    { galvPct, galvRatePerLb }
  );

  let galvLine = miscLines.find((l) => isGalvanizerLine(l.label));
  if (!galvLine) {
    const maxSort = miscLines.reduce((m, l) => Math.max(m, l.sort_order), -1);
    const { data: inserted, error } = await supabase
      .from("takeoff_misc_lines")
      .insert({
        takeoff_id: takeoffId,
        label: "Galvanizer",
        amount: null,
        weight_of_galv: weight,
        price_per: null,
        total_price: totalPrice,
        sort_order: maxSort + 1,
      })
      .select("*")
      .single();
    if (error || !inserted) return miscLines;
    return [...miscLines, inserted as TakeoffMiscLine];
  }

  await supabase
    .from("takeoff_misc_lines")
    .update({ weight_of_galv: weight, total_price: totalPrice })
    .eq("id", galvLine.id);

  return miscLines.map((l) =>
    l.id === galvLine!.id
      ? { ...l, weight_of_galv: weight, total_price: totalPrice }
      : l
  );
}

const GALVANIZER_SHORTFALL_LABEL = "Galvanizer shortfall";

async function syncGalvanizerShortfallLine(
  takeoffId: string,
  galvMode: GalvMode,
  calculatedCost: number,
  miscLines: TakeoffMiscLine[]
): Promise<TakeoffMiscLine[]> {
  const supabase = createAdminClient();
  const shortfallLine = miscLines.find((l) => isGalvanizerShortfallLine(l.label));
  const shortfall =
    galvMode === "not_galvanized" || calculatedCost <= 0
      ? 0
      : computeGalvanizerShortfall(calculatedCost);

  if (shortfall <= 0) {
    if (!shortfallLine) return miscLines;
    await supabase
      .from("takeoff_misc_lines")
      .update({
        amount: null,
        price_per: null,
        total_price: 0,
        include_in_proposal: false,
      })
      .eq("id", shortfallLine.id);
    return miscLines.map((l) =>
      l.id === shortfallLine.id
        ? { ...l, amount: null, price_per: null, total_price: 0, include_in_proposal: false }
        : l
    );
  }

  if (!shortfallLine) {
    const maxSort = miscLines.reduce((m, l) => Math.max(m, l.sort_order), -1);
    const { data: inserted, error } = await supabase
      .from("takeoff_misc_lines")
      .insert({
        takeoff_id: takeoffId,
        label: GALVANIZER_SHORTFALL_LABEL,
        amount: 1,
        price_per: shortfall,
        total_price: shortfall,
        include_in_proposal: false,
        sort_order: maxSort + 1,
      })
      .select("*")
      .single();
    if (error || !inserted) return miscLines;
    return [...miscLines, inserted as TakeoffMiscLine];
  }

  await supabase
    .from("takeoff_misc_lines")
    .update({
      amount: 1,
      price_per: shortfall,
      total_price: shortfall,
      include_in_proposal: false,
    })
    .eq("id", shortfallLine.id);

  return miscLines.map((l) =>
    l.id === shortfallLine.id
      ? {
          ...l,
          amount: 1,
          price_per: shortfall,
          total_price: shortfall,
          include_in_proposal: false,
        }
      : l
  );
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
  let miscLines = (miscRows ?? []) as TakeoffMiscLine[];
  const componentLines = (componentRows ?? []) as TakeoffComponentLine[];
  const fieldMisc = (fieldMiscRows ?? []) as TakeoffFieldMisc[];

  const sumGalvPounds =
    metalLines.reduce((s, l) => s + (Number(l.galv_pounds) || 0), 0) +
    componentLines.reduce((s, l) => s + (Number(l.galv_pounds) || 0), 0);
  const override = takeoff.galv_total_override;
  const effectiveGalvPounds =
    override != null && Number.isFinite(Number(override)) ? Number(override) : sumGalvPounds;

  const galvMode = (takeoff.galv_mode ?? "not_galvanized") as GalvMode;
  const galvPct = normalizeRate(takeoff.galv_pct, 0.15);
  const galvRatePerLb =
    takeoff.galv_rate_per_lb != null &&
    Number.isFinite(Number(takeoff.galv_rate_per_lb)) &&
    Number(takeoff.galv_rate_per_lb) >= 0
      ? Number(takeoff.galv_rate_per_lb)
      : 0.5;
  miscLines = await syncGalvanizerMiscLine(
    takeoffId,
    galvMode,
    effectiveGalvPounds,
    miscLines,
    galvPct,
    galvRatePerLb
  );

  const calculatedGalvCost = computeGalvanizerWeightCost(
    effectiveGalvPounds,
    galvPct,
    galvRatePerLb
  );
  miscLines = await syncGalvanizerShortfallLine(
    takeoffId,
    galvMode,
    calculatedGalvCost,
    miscLines
  );

  const input: TakeoffTotalsInput & { marginRate: number } = {
    metalLines: metalLines.map((l) => ({
      category: l.category,
      total_price: l.total_price ?? 0,
      other_unit: l.other_unit,
      total_pounds: l.total_pounds,
      total_length_ft: l.total_length_ft,
      cost_per_unit: l.cost_per_unit,
    })),
    componentLines: componentLines.map((l) => ({ total_price: l.total_price ?? 0 })),
    miscLines: miscLines.map((l) => ({
      label: l.label,
      amount: l.amount,
      hours: l.hours,
      days: l.days,
      rate_per_hour: l.rate_per_hour,
      rate_per_day: l.rate_per_day,
      weight_of_galv: l.weight_of_galv,
      price_per: l.price_per,
      total_price: l.total_price ?? 0,
    })),
    fieldMisc: fieldMisc.map((f) => ({
      label: f.label,
      amount: f.amount,
      hours: f.hours,
      days: f.days,
      rate_per_hour: f.rate_per_hour,
      rate_per_day: f.rate_per_day,
      price_per: f.price_per,
      total: f.total ?? 0,
    })),
    taxRate: normalizeRate(takeoff.tax_rate, 0.07),
    galvMode,
    marginRate: normalizeRate(takeoff.margin_rate, 0.2),
    shopLaborHours: takeoff.shop_labor_hours,
    shopLaborRate: takeoff.shop_labor_rate,
    shopDaysOrNights: takeoff.shop_days_or_nights,
    shopLaborAmount: takeoff.shop_labor_amount ?? 0,
    shopDrawingsAmount: takeoff.shop_drawings_amount ?? 0,
    fieldLaborAmount: takeoff.field_labor_amount,
    fieldLaborRate: takeoff.field_labor_rate,
    fieldDaysOrNights: takeoff.field_days_or_nights,
    fieldLaborTotal: takeoff.field_labor_total ?? 0,
    galvPct,
    galvRatePerLb,
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
      drawings_total: totals.drawings_total,
      shop_total: totals.shop_total,
      install_total: totals.install_total,
      misc_total: totals.misc_total,
      field_total: totals.field_total,
      project_total: totals.project_total,
      with_pct_total: totals.with_pct_total,
      grand_total: totals.grand_total,
      galv_addon_amount: totals.galv_addon_amount,
    })
    .eq("id", takeoffId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
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
  const totalPoundsForm = parseFloat((formData.get("total_pounds") as string) ?? "");
  const costPerUnit = parseFloat((formData.get("cost_per_unit") as string) ?? "");
  const totalPriceForm = parseFloat((formData.get("total_price") as string) ?? "");
  const sortOrder = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;
  const materialCatalogId = (formData.get("material_catalog_id") as string)?.trim() || null;
  const isGalvanized = formData.get("is_galvanized") === "on" || formData.get("is_galvanized") === "true";
  const galvLengthFt = parseFloat((formData.get("galv_length_ft") as string) ?? "");
  const plateThickness = parseFloat((formData.get("plate_thickness_in") as string) ?? "");
  const plateWidth = parseFloat((formData.get("plate_width_in") as string) ?? "");
  const plateHeight = parseFloat((formData.get("plate_height_in") as string) ?? "");
  const scope = parseScope(formData);
  const otherUnitRaw = (formData.get("other_unit") as string)?.trim();
  const otherUnit: "lbs" | "ft" | null =
    category === "other" ? (otherUnitRaw === "ft" ? "ft" : "lbs") : null;

  const countNum = Math.max(1, Math.floor(count));
  let resolvedDisplayName = displayName;
  let resolvedTotalPounds = totalPoundsForm;
  let resolvedCostPerUnit = costPerUnit;
  let resolvedTotalPrice = totalPriceForm;
  let galvPounds: number | null = null;
  let materialCatalogIdResolved: string | null = materialCatalogId;
  let catalogRowForSync: MaterialCatalogRow | null = null;

  let resolvedTotalPoundsPerPiece = totalPoundsPerPiece;

  if (category === "plate") {
    materialCatalogIdResolved = null;
    let lbsPerPiece = totalPoundsPerPiece;
    if (
      !Number.isFinite(lbsPerPiece) &&
      Number.isFinite(plateThickness) &&
      Number.isFinite(plateWidth) &&
      Number.isFinite(plateHeight)
    ) {
      lbsPerPiece = plateThickness * plateWidth * plateHeight * STEEL_DENSITY_LB_PER_IN3;
    }
    if (!resolvedDisplayName && Number.isFinite(plateThickness)) {
      resolvedDisplayName = `PL ${plateThickness} × ${plateWidth} × ${plateHeight}`;
    }
    if (Number.isFinite(lbsPerPiece) && lbsPerPiece > 0) {
      resolvedTotalPoundsPerPiece = lbsPerPiece;
      resolvedTotalPounds = lbsPerPiece * countNum;
      if (Number.isFinite(resolvedCostPerUnit)) {
        resolvedTotalPrice = resolvedTotalPounds * resolvedCostPerUnit;
      }
    }
    if (isGalvanized && Number.isFinite(resolvedTotalPounds)) {
      galvPounds = resolvedTotalPounds;
    }
  } else if (category === "other") {
    materialCatalogIdResolved = null;
    if (otherUnit === "ft" && Number.isFinite(totalLengthFt) && Number.isFinite(resolvedCostPerUnit)) {
      resolvedTotalPrice = totalLengthFt * resolvedCostPerUnit;
    } else if (Number.isFinite(resolvedTotalPounds) && Number.isFinite(resolvedCostPerUnit)) {
      resolvedTotalPrice = resolvedTotalPounds * resolvedCostPerUnit;
    }
  } else if (materialCatalogIdResolved) {
    const { data: catalogRow } = await supabase
      .from("material_catalog")
      .select(CATALOG_SELECT)
      .eq("id", materialCatalogIdResolved)
      .single();
    if (catalogRow) {
      catalogRowForSync = catalogRow as MaterialCatalogRow;
      if (!resolvedDisplayName) {
        resolvedDisplayName =
          catalogRow.size_label?.trim() || catalogRow.shorthand_code || catalogRow.item_code;
      }
      if (!Number.isFinite(resolvedCostPerUnit)) {
        resolvedCostPerUnit = (catalogRow.cost_per_lb ?? catalogRow.cost_per_foot) ?? 0;
      }
      const wpf = catalogRow.weight_per_ft;
      if (Number.isFinite(totalLengthFt) && wpf != null && Number.isFinite(wpf)) {
        const effectiveLength = totalLengthFt * countNum;
        resolvedTotalPounds = effectiveLength * wpf;
        if (catalogRow.pricing_unit === "per_lb" && Number.isFinite(resolvedCostPerUnit)) {
          resolvedTotalPrice = resolvedTotalPounds * resolvedCostPerUnit;
        } else if (catalogRow.pricing_unit === "per_foot" && Number.isFinite(resolvedCostPerUnit)) {
          resolvedTotalPrice = effectiveLength * resolvedCostPerUnit;
        } else if (catalogRow.pricing_unit === "per_foot" && catalogRow.cost_per_foot != null) {
          resolvedTotalPrice = effectiveLength * catalogRow.cost_per_foot;
        }
      }
      if (isGalvanized && wpf != null && Number.isFinite(wpf)) {
        const galvLen = Number.isFinite(galvLengthFt) ? galvLengthFt : totalLengthFt;
        if (Number.isFinite(galvLen)) {
          galvPounds = galvLen * countNum * wpf;
        }
      }
    }
  }

  if (!Number.isFinite(resolvedTotalPrice) || resolvedTotalPrice === 0) {
    resolvedTotalPrice = totalPriceForm;
  }

  const payload = {
    takeoff_id: takeoffId,
    material_catalog_id: materialCatalogIdResolved,
    category,
    scope,
    display_name: resolvedDisplayName || "—",
    count,
    total_length_ft: Number.isFinite(totalLengthFt) ? totalLengthFt : null,
    total_pounds_per_piece:
      category === "plate" && Number.isFinite(resolvedTotalPoundsPerPiece)
        ? resolvedTotalPoundsPerPiece
        : Number.isFinite(totalPoundsPerPiece)
          ? totalPoundsPerPiece
          : null,
    total_pounds: Number.isFinite(resolvedTotalPounds) ? resolvedTotalPounds : null,
    cost_per_unit: Number.isFinite(resolvedCostPerUnit) ? resolvedCostPerUnit : null,
    total_price: Number.isFinite(resolvedTotalPrice) ? resolvedTotalPrice : 0,
    is_galvanized: isGalvanized,
    galv_length_ft:
      isGalvanized && category !== "plate" && Number.isFinite(galvLengthFt)
        ? galvLengthFt
        : isGalvanized && category !== "plate" && Number.isFinite(totalLengthFt)
          ? totalLengthFt
          : null,
    galv_pounds: galvPounds,
    plate_thickness_in: category === "plate" && Number.isFinite(plateThickness) ? plateThickness : null,
    plate_width_in: category === "plate" && Number.isFinite(plateWidth) ? plateWidth : null,
    plate_height_in: category === "plate" && Number.isFinite(plateHeight) ? plateHeight : null,
    other_unit: otherUnit,
    sort_order: sortOrder,
    include_in_proposal: parseIncludeInProposal(formData),
    ...parseCustomerNoteFields(formData),
  };

  if (id) {
    const { error } = await supabase.from("takeoff_metal_lines").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("takeoff_metal_lines").insert(payload);
    if (error) return { error: error.message };
  }

  if (
    materialCatalogIdResolved &&
    catalogRowForSync &&
    Number.isFinite(resolvedCostPerUnit)
  ) {
    const syncResult = await syncMaterialCatalogCostFromTakeoff(
      supabase,
      materialCatalogIdResolved,
      catalogRowForSync,
      resolvedCostPerUnit
    );
    if (syncResult.error) return { error: syncResult.error };
    revalidatePath("/admin/materials");
  }

  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
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
  const countNum = Math.max(1, Math.floor(count));
  const totalPoundsPerPiece = parseFloat((formData.get("total_pounds_per_piece") as string) ?? "");
  const totalPounds = parseFloat((formData.get("total_pounds") as string) ?? "");
  const costPerMeasure = parseFloat((formData.get("cost_per_measure") as string) ?? "");
  const totalPrice = parseFloat((formData.get("total_price") as string) ?? "");
  const sortOrder = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;
  const scope = parseScope(formData);
  const isGalvanized =
    formData.get("is_galvanized") === "on" || formData.get("is_galvanized") === "true";
  const effectivePounds =
    Number.isFinite(totalPounds) && totalPounds > 0
      ? totalPounds
      : Number.isFinite(totalPoundsPerPiece) && totalPoundsPerPiece > 0 && countNum > 0
        ? countNum * totalPoundsPerPiece
        : null;
  const galvPounds = isGalvanized && effectivePounds != null ? effectivePounds : null;
  const payload = {
    takeoff_id: takeoffId,
    scope,
    display_name: displayName || "—",
    count,
    total_pounds_per_piece: Number.isFinite(totalPoundsPerPiece) ? totalPoundsPerPiece : null,
    total_pounds: effectivePounds,
    cost_per_measure: Number.isFinite(costPerMeasure) ? costPerMeasure : null,
    total_price: Number.isFinite(totalPrice) ? totalPrice : 0,
    is_galvanized: isGalvanized,
    galv_pounds: galvPounds,
    sort_order: sortOrder,
    include_in_proposal: parseIncludeInProposal(formData),
    ...parseCustomerNoteFields(formData),
  };
  if (id) {
    const { error } = await supabase.from("takeoff_component_lines").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("takeoff_component_lines").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
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
  const hours = parseFloat((formData.get("hours") as string) ?? "");
  const days = parseFloat((formData.get("days") as string) ?? "");
  const ratePerHour = parseFloat((formData.get("rate_per_hour") as string) ?? "");
  const ratePerDay = parseFloat((formData.get("rate_per_day") as string) ?? "");
  const weightOfGalv = parseFloat((formData.get("weight_of_galv") as string) ?? "");
  const pricePer = parseFloat((formData.get("price_per") as string) ?? "");
  const sortOrder = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;
  const scope = parseScope(formData);

  if (id) {
    const { data: existing } = await supabase
      .from("takeoff_misc_lines")
      .select("label")
      .eq("id", id)
      .maybeSingle();
    if (existing && isGalvanizerLine(existing.label)) {
      return { error: "Galvanizer weight is managed automatically from metal lines." };
    }
    if (existing && isGalvanizerShortfallLine(existing.label)) {
      return { error: "Galvanizer shortfall is managed automatically when shop minimum applies." };
    }
  }

  if (isGalvanizerLine(label ?? "")) {
    return { error: "Galvanizer weight is managed automatically from metal lines." };
  }
  if (isGalvanizerShortfallLine(label ?? "")) {
    return { error: "Galvanizer shortfall is managed automatically when shop minimum applies." };
  }

  const miscInput = {
    label: label || "Other",
    amount: Number.isFinite(amount) ? amount : null,
    hours: Number.isFinite(hours) ? hours : null,
    days: Number.isFinite(days) ? days : null,
    rate_per_hour: Number.isFinite(ratePerHour) ? ratePerHour : null,
    rate_per_day: Number.isFinite(ratePerDay) ? ratePerDay : null,
    weight_of_galv: Number.isFinite(weightOfGalv) ? weightOfGalv : null,
    price_per: Number.isFinite(pricePer) ? pricePer : null,
    total_price: 0,
  };
  const totalPrice = computeMiscLineTotal(miscInput);

  const payload = {
    takeoff_id: takeoffId,
    scope,
    label: label || "Other",
    amount: miscInput.amount,
    hours: miscInput.hours,
    days: miscInput.days,
    rate_per_hour: miscInput.rate_per_hour,
    rate_per_day: miscInput.rate_per_day,
    weight_of_galv: miscInput.weight_of_galv,
    price_per: miscInput.price_per,
    total_price: totalPrice,
    sort_order: sortOrder,
    include_in_proposal: parseIncludeInProposal(formData),
    ...parseCustomerNoteFields(formData),
  };
  if (id) {
    const { error } = await supabase.from("takeoff_misc_lines").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("takeoff_misc_lines").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
  await recomputeAndSaveTotals(takeoffId, jobId);
  return {};
}

export async function deleteMiscLine(
  takeoffId: string,
  lineId: string,
  jobId: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { data: line } = await supabase
    .from("takeoff_misc_lines")
    .select("label")
    .eq("id", lineId)
    .maybeSingle();
  if (line && isGalvanizerLine(line.label)) {
    return { error: "Galvanizer line is managed automatically." };
  }
  if (line && isGalvanizerShortfallLine(line.label)) {
    return { error: "Galvanizer shortfall is managed automatically." };
  }
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
  const hours = parseFloat((formData.get("hours") as string) ?? "");
  const days = parseFloat((formData.get("days") as string) ?? "");
  const ratePerHour = parseFloat((formData.get("rate_per_hour") as string) ?? "");
  const ratePerDay = parseFloat((formData.get("rate_per_day") as string) ?? "");
  const pricePer = parseFloat((formData.get("price_per") as string) ?? "");
  const hrsDaysNights = (formData.get("hrs_days_nights") as string)?.trim() || null;
  const sortOrder = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;
  const scope = parseScope(formData);
  const fieldInput = {
    label: label || "—",
    amount: Number.isFinite(amount) ? amount : null,
    hours: Number.isFinite(hours) ? hours : null,
    days: Number.isFinite(days) ? days : null,
    rate_per_hour: Number.isFinite(ratePerHour) ? ratePerHour : null,
    rate_per_day: Number.isFinite(ratePerDay) ? ratePerDay : null,
    price_per: Number.isFinite(pricePer) ? pricePer : null,
    total: 0,
  };
  const total = computeFieldMiscTotal(fieldInput);
  const payload = {
    takeoff_id: takeoffId,
    scope,
    label: label || "—",
    amount: fieldInput.amount,
    hours: fieldInput.hours,
    days: fieldInput.days,
    rate_per_hour: fieldInput.rate_per_hour,
    rate_per_day: fieldInput.rate_per_day,
    price_per: fieldInput.price_per,
    hrs_days_nights: hrsDaysNights,
    total,
    sort_order: sortOrder,
    include_in_proposal: parseIncludeInProposal(formData),
    ...parseCustomerNoteFields(formData),
  };
  if (id) {
    const { error } = await supabase.from("takeoff_field_misc").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("takeoff_field_misc").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
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

export async function upsertSectionNote(
  takeoffId: string,
  jobId: string,
  section: TakeoffSectionKey,
  note: string,
  includeInProposal: boolean
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("takeoff_section_notes").upsert(
    {
      takeoff_id: takeoffId,
      section,
      note: note.trim(),
      include_in_proposal: includeInProposal,
    },
    { onConflict: "takeoff_id,section" }
  );
  if (error) return { error: error.message };
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
  return {};
}

export async function getActiveExclusions(): Promise<{
  exclusions: SettingsExclusion[];
  error?: string;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("settings_exclusions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) return { exclusions: [], error: error.message };
  return { exclusions: (data ?? []) as SettingsExclusion[] };
}

export async function getTakeoffExclusionIds(takeoffId: string): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("takeoff_exclusions")
    .select("exclusion_id")
    .eq("takeoff_id", takeoffId);
  return (data ?? []).map((r) => r.exclusion_id as string);
}

export async function setTakeoffExclusions(
  takeoffId: string,
  jobId: string,
  exclusionIds: string[]
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  await supabase.from("takeoff_exclusions").delete().eq("takeoff_id", takeoffId);
  if (exclusionIds.length > 0) {
    const { error } = await supabase.from("takeoff_exclusions").insert(
      exclusionIds.map((exclusion_id) => ({ takeoff_id: takeoffId, exclusion_id }))
    );
    if (error) return { error: error.message };
  }
  revalidatePath(`/admin/jobs/${jobId}/takeoff`);
  revalidatePath(`/admin/jobs/${jobId}/proposal`);
  return {};
}
