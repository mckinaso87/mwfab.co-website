/**
 * Phase 3: Takeoff totals and line calculations. Shared for UI display and Phase 4 PDF.
 * Galvanizer: LBs × 15% × $0.50, cap $750.
 */

const GALV_PCT = 0.15;
const GALV_RATE = 0.5;
const GALV_CAP = 750;

export interface MetalLineInput {
  category: string;
  total_price: number;
}

export interface ComponentLineInput {
  total_price: number;
}

export interface MiscLineInput {
  label: string;
  amount: number | null;
  weight_of_galv: number | null;
  price_per: number | null;
  total_price: number;
}

export interface FieldMiscInput {
  total: number;
}

export interface TakeoffTotalsInput {
  metalLines: MetalLineInput[];
  componentLines: ComponentLineInput[];
  miscLines: MiscLineInput[];
  fieldMisc: FieldMiscInput[];
  taxRate: number;
  shopLaborHours: number | null;
  shopLaborRate: number | null;
  shopDaysOrNights: number | null;
  shopLaborAmount: number;
  shopDrawingsAmount: number;
  fieldLaborAmount: number | null;
  fieldLaborRate: number | null;
  fieldDaysOrNights: number | null;
  fieldLaborTotal: number;
}

const LINKED_CATEGORIES = new Set([
  "angles",
  "wide_flange",
  "bars_hr_rounds",
  "bars_cf_rounds",
  "bars_flat",
  "channels",
  "mc_channels",
  "pipe",
  "tube",
]);

/** Metal subtotal from linked-tab categories (Angles, Wide Flange, …). */
export function linkedMetalSubtotal(lines: MetalLineInput[]): number {
  return lines
    .filter((l) => LINKED_CATEGORIES.has(l.category))
    .reduce((s, l) => s + (l.total_price ?? 0), 0);
}

/** Other metals (custom rows). */
export function otherMetalSubtotal(lines: MetalLineInput[]): number {
  return lines
    .filter((l) => l.category === "other")
    .reduce((s, l) => s + (l.total_price ?? 0), 0);
}

/** All metal (linked + other) — "Metal TOTALS" in sheet. */
export function metalSubtotal(lines: MetalLineInput[]): number {
  return linkedMetalSubtotal(lines) + otherMetalSubtotal(lines);
}

/** Sum of component line total_price. */
export function componentSubtotal(lines: ComponentLineInput[]): number {
  return lines.reduce((s, l) => s + (l.total_price ?? 0), 0);
}

/** Galvanizer total: min(weight_of_galv * 0.15 * 0.50, 750). Other rows use stored total_price. */
export function miscLineTotal(line: MiscLineInput): number {
  if (/galvanizer/i.test(line.label ?? "")) {
    const lbs = line.weight_of_galv ?? 0;
    return Math.min(lbs * GALV_PCT * GALV_RATE, GALV_CAP);
  }
  if (line.total_price != null && Number.isFinite(line.total_price)) return line.total_price;
  const amt = line.amount ?? 0;
  const price = line.price_per ?? 0;
  return amt * price;
}

/** Sum of misc line totals (Galvanizer formula applied for that label). */
export function miscSubtotal(lines: MiscLineInput[]): number {
  return lines.reduce((s, l) => s + miscLineTotal(l), 0);
}

/** Other material = components + misc. */
export function otherMaterialSubtotal(
  componentLines: ComponentLineInput[],
  miscLines: MiscLineInput[]
): number {
  return componentSubtotal(componentLines) + miscSubtotal(miscLines);
}

/** All material = metal TOTALS + other material (components + misc). */
export function allMaterialSubtotal(
  metalLines: MetalLineInput[],
  componentLines: ComponentLineInput[],
  miscLines: MiscLineInput[]
): number {
  return metalSubtotal(metalLines) + otherMaterialSubtotal(componentLines, miscLines);
}

export function taxTotal(allMaterial: number, taxRate: number): number {
  return allMaterial * taxRate;
}

export function materialTotalWithTax(allMaterial: number, taxTotalVal: number): number {
  return allMaterial + taxTotalVal;
}

/** Shop total = shop_labor_amount + shop_drawings_amount (amounts assumed precomputed). */
export function shopTotal(shopLaborAmount: number, shopDrawingsAmount: number): number {
  return shopLaborAmount + shopDrawingsAmount;
}

/** Field total = field_labor_total + sum(field_misc.total). */
export function fieldTotal(fieldLaborTotal: number, fieldMisc: FieldMiscInput[]): number {
  const miscSum = fieldMisc.reduce((s, r) => s + (r.total ?? 0), 0);
  return fieldLaborTotal + miscSum;
}

export function projectTotal(
  materialTotalWithTaxVal: number,
  shopTotalVal: number,
  fieldTotalVal: number
): number {
  return materialTotalWithTaxVal + shopTotalVal + fieldTotalVal;
}

export function withPctTotal(projectTotalVal: number, marginRate: number): number {
  return projectTotalVal * (1 + marginRate);
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
  const allMat = allMaterialSubtotal(
    input.metalLines,
    input.componentLines,
    input.miscLines
  );
  const tax = taxTotal(allMat, input.taxRate);
  const materialWithTax = materialTotalWithTax(allMat, tax);
  const metalSub = metalSubtotal(input.metalLines);
  const otherMatSub = otherMaterialSubtotal(input.componentLines, input.miscLines);
  const shopTotalVal = shopTotal(input.shopLaborAmount, input.shopDrawingsAmount);
  const fieldTotalVal = fieldTotal(input.fieldLaborTotal, input.fieldMisc);
  const proj = projectTotal(materialWithTax, shopTotalVal, fieldTotalVal);
  const withPct = withPctTotal(proj, input.marginRate);
  const margins = marginOptions(proj);
  return {
    metal_subtotal: metalSub,
    other_material_subtotal: otherMatSub,
    all_material_subtotal: allMat,
    tax_total: tax,
    material_total_with_tax: materialWithTax,
    shop_total: shopTotalVal,
    field_total: fieldTotalVal,
    project_total: proj,
    with_pct_total: withPct,
    grand_total: withPct,
    margin_pct15: margins.pct15,
    margin_pct20: margins.pct20,
    margin_pct25: margins.pct25,
  };
}
