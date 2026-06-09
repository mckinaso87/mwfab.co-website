/**
 * Takeoff totals and line calculations. Shared for UI display and Phase 4 PDF.
 * Galvanizer: LBs × pct × rate; shop minimum $750 (shortfall tracked on internal misc line).
 */

const GALV_PCT = 0.15;
const GALV_RATE = 0.5;
export const GALV_MINIMUM = 750;

export type GalvRateOptions = {
  galvPct?: number | null;
  galvRatePerLb?: number | null;
};

export function computeGalvanizerWeightCost(
  lbs: number,
  galvPct?: number | null,
  galvRatePerLb?: number | null
): number {
  const weight = Number.isFinite(lbs) && lbs > 0 ? lbs : 0;
  const pct = normalizeRate(galvPct, GALV_PCT);
  const rate =
    galvRatePerLb != null && Number.isFinite(galvRatePerLb) && galvRatePerLb >= 0
      ? galvRatePerLb
      : GALV_RATE;
  return weight * pct * rate;
}

export function computeGalvanizerShortfall(calculated: number): number {
  const cost = Number.isFinite(calculated) && calculated > 0 ? calculated : 0;
  return Math.max(0, GALV_MINIMUM - cost);
}

export function computeGalvanizerBillable(calculated: number): number {
  const cost = Number.isFinite(calculated) && calculated > 0 ? calculated : 0;
  return Math.max(cost, GALV_MINIMUM);
}

/** Weight-based galvanizer cost (no shop minimum applied). */
export function computeGalvanizerCost(
  lbs: number,
  galvPct?: number | null,
  galvRatePerLb?: number | null
): number {
  return computeGalvanizerWeightCost(lbs, galvPct, galvRatePerLb);
}

/** Customer-facing galvanizer amount on proposals (at least shop minimum). */
export function galvanizerProposalAmount(
  weightLbs: number | null | undefined,
  rates?: GalvRateOptions
): number {
  const calculated = computeGalvanizerWeightCost(weightLbs ?? 0, rates?.galvPct, rates?.galvRatePerLb);
  return computeGalvanizerBillable(calculated);
}

export type GalvMode = "not_galvanized" | "baked_in" | "optional_addon";

export interface MetalLineInput {
  category: string;
  total_price: number;
  other_unit?: "lbs" | "ft" | null;
  total_pounds?: number | null;
  total_length_ft?: number | null;
  cost_per_unit?: number | null;
}

export interface ComponentLineInput {
  total_price: number;
}

export interface MiscLineInput {
  label: string;
  amount: number | null;
  hours?: number | null;
  days?: number | null;
  rate_per_hour?: number | null;
  rate_per_day?: number | null;
  weight_of_galv: number | null;
  price_per: number | null;
  total_price: number;
}

export interface FieldMiscInput {
  label?: string;
  amount?: number | null;
  hours?: number | null;
  days?: number | null;
  rate_per_hour?: number | null;
  rate_per_day?: number | null;
  price_per?: number | null;
  total: number;
}

export interface TakeoffTotalsInput {
  metalLines: MetalLineInput[];
  componentLines: ComponentLineInput[];
  miscLines: MiscLineInput[];
  fieldMisc: FieldMiscInput[];
  taxRate: number;
  galvMode: GalvMode;
  shopLaborHours: number | null;
  shopLaborRate: number | null;
  shopDaysOrNights: number | null;
  shopLaborAmount: number;
  shopDrawingsAmount: number;
  fieldLaborAmount: number | null;
  fieldLaborRate: number | null;
  fieldDaysOrNights: number | null;
  fieldLaborTotal: number;
  galvPct?: number | null;
  galvRatePerLb?: number | null;
}

const LINKED_CATEGORIES = new Set([
  "angle",
  "wide_flange",
  "round_bar",
  "flat_bar",
  "channel",
  "mc_channel",
  "pipe",
  "tube",
  "plate",
]);

export function isGalvanizerShortfallLine(label: string): boolean {
  return /galvanizer\s+shortfall/i.test(label ?? "");
}

export function isGalvanizerLine(label: string): boolean {
  return /galvanizer/i.test(label ?? "") && !isGalvanizerShortfallLine(label);
}

function product(a: number | null | undefined, b: number | null | undefined): number {
  const x = a ?? 0;
  const y = b ?? 0;
  if (!Number.isFinite(x) || !Number.isFinite(y) || x <= 0 || y <= 0) return 0;
  return x * y;
}

/** Sum hours×rate + days×rate + amount×price when factors present. */
export function computeMiscLineTotal(line: MiscLineInput, rates?: GalvRateOptions): number {
  if (isGalvanizerShortfallLine(line.label ?? "")) {
    if (line.total_price != null && Number.isFinite(line.total_price)) return line.total_price;
    return product(line.amount, line.price_per);
  }
  if (isGalvanizerLine(line.label ?? "")) {
    const lbs = line.weight_of_galv ?? 0;
    return computeGalvanizerWeightCost(lbs, rates?.galvPct, rates?.galvRatePerLb);
  }
  const fromHours = product(line.hours, line.rate_per_hour);
  const fromDays = product(line.days, line.rate_per_day);
  const fromQty = product(line.amount, line.price_per);
  const summed = fromHours + fromDays + fromQty;
  if (summed > 0) return summed;
  if (line.total_price != null && Number.isFinite(line.total_price)) return line.total_price;
  return 0;
}

export function computeFieldMiscTotal(line: FieldMiscInput, rates?: GalvRateOptions): number {
  if (isGalvanizerLine(line.label ?? "")) {
    const lbs = line.amount ?? 0;
    return computeGalvanizerCost(lbs, rates?.galvPct, rates?.galvRatePerLb);
  }
  const fromHours = product(line.hours, line.rate_per_hour);
  const fromDays = product(line.days, line.rate_per_day);
  const fromQty = product(line.amount, line.price_per);
  const summed = fromHours + fromDays + fromQty;
  if (summed > 0) return summed;
  if (line.total != null && Number.isFinite(line.total)) return line.total;
  return 0;
}

/** Other/custom metal line total from unit mode. */
export function otherMetalLineTotal(line: MetalLineInput): number {
  if (line.category !== "other") return line.total_price ?? 0;
  const unit = line.other_unit ?? "lbs";
  if (unit === "ft") {
    return product(line.total_length_ft, line.cost_per_unit);
  }
  return product(line.total_pounds, line.cost_per_unit);
}

/** Whether galvanizer misc line counts toward material subtotal for this mode. */
export function includeGalvanizerInSubtotal(galvMode: GalvMode): boolean {
  return galvMode === "baked_in";
}

/** Metal subtotal from catalog-linked categories and plate. */
export function linkedMetalSubtotal(lines: MetalLineInput[]): number {
  return lines
    .filter((l) => LINKED_CATEGORIES.has(l.category))
    .reduce((s, l) => s + (l.total_price ?? 0), 0);
}

/** Other metals (custom rows). */
export function otherMetalSubtotal(lines: MetalLineInput[]): number {
  return lines
    .filter((l) => l.category === "other")
    .reduce((s, l) => s + otherMetalLineTotal(l), 0);
}

/** All metal (linked + other) — "Metal TOTALS" in sheet. */
export function metalSubtotal(lines: MetalLineInput[]): number {
  return linkedMetalSubtotal(lines) + otherMetalSubtotal(lines);
}

/** Sum of component line total_price. */
export function componentSubtotal(lines: ComponentLineInput[]): number {
  return lines.reduce((s, l) => s + (l.total_price ?? 0), 0);
}

/** Galvanizer billable total for optional add-on display (shop minimum applied). */
export function galvanizerAddonAmount(
  miscLines: MiscLineInput[],
  rates?: GalvRateOptions
): number {
  const galv = miscLines.find((l) => isGalvanizerLine(l.label));
  if (!galv) return 0;
  const calculated = computeGalvanizerWeightCost(
    galv.weight_of_galv ?? 0,
    rates?.galvPct,
    rates?.galvRatePerLb
  );
  return computeGalvanizerBillable(calculated);
}

/** @deprecated Use computeMiscLineTotal */
export function miscLineTotal(line: MiscLineInput): number {
  return computeMiscLineTotal(line);
}

/** Sum of misc line totals; galvanizer excluded per galv_mode. */
export function miscSubtotal(
  lines: MiscLineInput[],
  galvMode: GalvMode,
  rates?: GalvRateOptions
): number {
  const includeGalv = includeGalvanizerInSubtotal(galvMode);
  return lines.reduce((s, l) => {
    if (
      (isGalvanizerLine(l.label) || isGalvanizerShortfallLine(l.label)) &&
      !includeGalv
    ) {
      return s;
    }
    return s + computeMiscLineTotal(l, rates);
  }, 0);
}

/** Raw sum of all misc line totals (for misc_total column / proposal row). */
export function miscLinesRawTotal(lines: MiscLineInput[], rates?: GalvRateOptions): number {
  return lines.reduce((s, l) => s + computeMiscLineTotal(l, rates), 0);
}

/** Other material = components + misc. */
export function otherMaterialSubtotal(
  componentLines: ComponentLineInput[],
  miscLines: MiscLineInput[],
  galvMode: GalvMode,
  rates?: GalvRateOptions
): number {
  return componentSubtotal(componentLines) + miscSubtotal(miscLines, galvMode, rates);
}

/** All material = metal TOTALS + other material (components + misc). */
export function allMaterialSubtotal(
  metalLines: MetalLineInput[],
  componentLines: ComponentLineInput[],
  miscLines: MiscLineInput[],
  galvMode: GalvMode,
  rates?: GalvRateOptions
): number {
  return metalSubtotal(metalLines) + otherMaterialSubtotal(componentLines, miscLines, galvMode, rates);
}

/**
 * Rates in DB/UI may be decimal (0.07) or whole percent (7). Values above 1 are treated as percent.
 */
export function normalizeRate(rate: number | null | undefined, fallback: number): number {
  const r = rate ?? fallback;
  if (!Number.isFinite(r) || r < 0) return fallback;
  if (r > 1) return r / 100;
  return r;
}

export function taxTotal(allMaterial: number, taxRate: number): number {
  return allMaterial * normalizeRate(taxRate, 0.07);
}

export function materialTotalWithTax(allMaterial: number, taxTotalVal: number): number {
  return allMaterial + taxTotalVal;
}

/** Shop labor only (drawings excluded). */
export function shopLaborTotal(shopLaborAmount: number): number {
  return shopLaborAmount;
}

/** Field labor only. */
export function installTotal(fieldLaborTotal: number): number {
  return fieldLaborTotal;
}

/** Drawings amount. */
export function drawingsTotal(shopDrawingsAmount: number): number {
  return shopDrawingsAmount;
}

/** misc lines + field misc for proposal breakdown row. */
export function miscTotalColumn(
  miscLines: MiscLineInput[],
  fieldMisc: FieldMiscInput[],
  rates?: GalvRateOptions
): number {
  const miscSum = miscLinesRawTotal(miscLines, rates);
  const fieldSum = fieldMisc.reduce((s, r) => s + computeFieldMiscTotal(r, rates), 0);
  return miscSum + fieldSum;
}

/** Field total = field_labor_total + sum(field_misc.total). */
export function fieldTotal(fieldLaborTotal: number, fieldMisc: FieldMiscInput[]): number {
  const miscSum = fieldMisc.reduce((s, r) => s + computeFieldMiscTotal(r), 0);
  return fieldLaborTotal + miscSum;
}

export function projectTotal(
  materialTotalWithTaxVal: number,
  shopLaborAmount: number,
  shopDrawingsAmount: number,
  fieldLaborTotal: number,
  fieldMisc: FieldMiscInput[]
): number {
  const fieldMiscSum = fieldMisc.reduce((s, r) => s + computeFieldMiscTotal(r), 0);
  return (
    materialTotalWithTaxVal +
    shopLaborAmount +
    shopDrawingsAmount +
    fieldLaborTotal +
    fieldMiscSum
  );
}

export function withPctTotal(projectTotalVal: number, marginRate: number): number {
  return projectTotalVal * (1 + normalizeRate(marginRate, 0.2));
}

/** Grand total = project total with margin applied. */
export function grandTotal(projectTotalVal: number, marginRate: number): number {
  return withPctTotal(projectTotalVal, marginRate);
}

/** Margin options for display (15%, 20%, 25%). */
export function marginOptions(projectTotalVal: number): {
  pct15: number;
  pct20: number;
  pct25: number;
} {
  return {
    pct15: projectTotalVal * 1.15,
    pct20: projectTotalVal * 1.2,
    pct25: projectTotalVal * 1.25,
  };
}

/** Compute all totals from current takeoff data. */
export function computeTakeoffTotals(input: TakeoffTotalsInput & { marginRate: number }) {
  const galvMode = input.galvMode;
  const galvRates: GalvRateOptions = {
    galvPct: input.galvPct,
    galvRatePerLb: input.galvRatePerLb,
  };
  const allMat = allMaterialSubtotal(
    input.metalLines,
    input.componentLines,
    input.miscLines,
    galvMode,
    galvRates
  );
  const taxRate = normalizeRate(input.taxRate, 0.07);
  const marginRate = normalizeRate(input.marginRate, 0.2);
  const tax = allMat * taxRate;
  const materialWithTax = materialTotalWithTax(allMat, tax);
  const metalSub = metalSubtotal(input.metalLines);
  const otherMatSub = otherMaterialSubtotal(
    input.componentLines,
    input.miscLines,
    galvMode,
    galvRates
  );
  const drawingsTotalVal = drawingsTotal(input.shopDrawingsAmount);
  const shopTotalVal = shopLaborTotal(input.shopLaborAmount);
  const installTotalVal = installTotal(input.fieldLaborTotal);
  const miscTotalVal = miscTotalColumn(input.miscLines, input.fieldMisc, galvRates);
  const fieldTotalVal = fieldTotal(input.fieldLaborTotal, input.fieldMisc);
  const proj = projectTotal(
    materialWithTax,
    input.shopLaborAmount,
    input.shopDrawingsAmount,
    input.fieldLaborTotal,
    input.fieldMisc
  );
  const withPct = proj * (1 + marginRate);
  const margins = marginOptions(proj);
  const galv_addon_amount =
    galvMode === "optional_addon" ? galvanizerAddonAmount(input.miscLines, galvRates) : 0;
  return {
    metal_subtotal: metalSub,
    other_material_subtotal: otherMatSub,
    all_material_subtotal: allMat,
    tax_total: tax,
    material_total_with_tax: materialWithTax,
    drawings_total: drawingsTotalVal,
    shop_total: shopTotalVal,
    install_total: installTotalVal,
    misc_total: miscTotalVal,
    field_total: fieldTotalVal,
    project_total: proj,
    with_pct_total: withPct,
    grand_total: withPct,
    galv_addon_amount,
    margin_pct15: margins.pct15,
    margin_pct20: margins.pct20,
    margin_pct25: margins.pct25,
  };
}

export function scopeBadge(scope: string | undefined): string {
  return scope === "furnish" ? "F" : "F&I";
}

export function scopeLabel(scope: string | undefined): string {
  return scope === "furnish" ? "Furnish" : "Furnish & Install";
}

export type ScopedAmount = { furnish: number; furnish_install: number };

function normalizeScope(scope: string | null | undefined): "furnish" | "furnish_install" {
  return scope === "furnish" ? "furnish" : "furnish_install";
}

function lineAmount<L extends { total_price?: number | null; total?: number | null }>(
  line: L,
  amountKey: "total_price" | "total"
): number {
  const v = amountKey === "total" ? line.total : line.total_price;
  return v != null && Number.isFinite(v) ? v : 0;
}

export function sumByScope<
  L extends { scope?: string | null; total_price?: number | null; total?: number | null },
>(lines: L[], amountKey: "total_price" | "total" = "total_price"): ScopedAmount {
  const out: ScopedAmount = { furnish: 0, furnish_install: 0 };
  for (const line of lines) {
    const key = normalizeScope(line.scope);
    out[key] += lineAmount(line, amountKey);
  }
  return out;
}
