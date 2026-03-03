/**
 * Phase 3: Seed material_catalog from data/materials/*.csv.
 * Idempotent: upserts by (category, item_code). Re-run to update prices.
 *
 * Usage: npx tsx scripts/seed-material-catalog.ts
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config(); // fallback .env

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "materials");

const CATEGORY_BY_FILE: Record<string, string> = {
  "mwfab-base-materials.csv": "angles",
  "mwfab-base-materials2.csv": "wide_flange",
  "mwfab-base-materials3.csv": "bars_hr_rounds", // may override to bars_cf_rounds by row
  "mwfab-base-materials4.csv": "bars_flat",
  "mwfab-base-materials5.csv": "bars_flat",
  "mwfab-base-materials6.csv": "channels",
  "mwfab-base-materials7.csv": "mc_channels",
  "mwfab-base-materials8.csv": "pipe",
  "mwfab-base-materials9.csv": "tube",
};

/** CSV cost column aliases by category – matches headers in data/materials CSVs. See data/materials/SCHEMA_AND_MAPPING.md */
const COST_PER_LB_ALIASES: Record<string, string[]> = {
  angles: ["Current cost per lbs.", "Current Cost per Lbs.", "Current Cost per Lbs", "Current Cost per Lb."],
  bars_hr_rounds: ["Current cost per ft. in lbs.", "Current Cost per ft. in Lbs.", "Current Cost per ft. in Lbs", "Current Cost per Lbs.", "Current Cost per Lbs"],
  bars_cf_rounds: ["Current cost per lbs.", "Current Cost per Lbs.", "Current Cost per Lbs", "Current Cost per Lb."],
  bars_flat: ["Current Cost per ft. in Lbs.", "Current cost per ft. in lbs.", "Current Cost per Lbs.", "Current Cost per Lbs"],
  channels: ["Current Cost per Lbs.", "Current cost per lbs.", "Current Cost per Lbs"],
  mc_channels: ["Current Cost per Lbs.", "Current cost per lbs.", "Current Cost per Lbs"],
  pipe: ["Current Cost per Lbs.", "Current cost per lbs.", "Current Cost per Lbs"],
  tube: ["Current Cost per Lbs.", "Current cost per lbs.", "Current Cost per Lbs"],
};
const COST_PER_FOOT_ALIASES: Record<string, string[]> = {
  wide_flange: ["Current cost per foot", "Current Cost per Foot", "Current Cost per foot"],
};

type CatalogRow = {
  category: string;
  item_code: string;
  display_name: string | null;
  dimensions: Record<string, unknown> | null;
  weight_per_ft: number | null;
  cost_per_lb: number | null;
  cost_per_foot: number | null;
  pricing_unit: "per_lb" | "per_foot";
  source_file: string;
};

function parseNum(s: unknown): number | null {
  if (s === undefined || s === null || s === "") return null;
  const t = String(s).replace(/[$,]/g, "").trim();
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function parseCsvFile(filePath: string): Record<string, string>[] {
  let raw = fs.readFileSync(filePath, "utf-8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1); // strip BOM
  const lines = raw.split(/\r?\n/);
  // Angles file has two header lines; always use line 0 so we get "Available Length(s)" and "Current Cost per Lbs."
  const fileName = path.basename(filePath);
  const headerLineIndex =
    fileName === "mwfab-base-materials.csv"
      ? 0
      : lines.findIndex(
          (l) =>
            l.includes("Item #") ||
            l.includes("Section Number") ||
            l.includes("Size") ||
            l.includes("Weight Per")
        );
  const start = headerLineIndex >= 0 ? headerLineIndex : 0;
  const toParse = lines.slice(start).join("\n");
  const parsed = parse(toParse, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, string>[];
  return parsed;
}

function normalizeKey(k: string): string {
  return k
    .replace(/\s+/g, " ")
    .replace(/\n/g, " ")
    .toLowerCase()
    .trim();
}

function pickCol(row: Record<string, string>, ...aliases: string[]): string | null {
  const keys = Object.keys(row).map(normalizeKey);
  const keyMap: Record<string, string> = {};
  for (const k of Object.keys(row)) keyMap[normalizeKey(k)] = k;
  for (const a of aliases) {
    const n = normalizeKey(a);
    if (keyMap[n] !== undefined) return row[keyMap[n]]?.trim() || null;
  }
  return null;
}

function pickNum(row: Record<string, string>, ...aliases: string[]): number | null {
  const v = pickCol(row, ...aliases);
  return v !== null ? parseNum(v) : null;
}

function rowToCatalog(
  row: Record<string, string>,
  category: string,
  sourceFile: string,
  pricingUnit: "per_lb" | "per_foot"
): CatalogRow | null {
  const itemCode =
    pickCol(row, "Item #", "Section Number", "Section number", "Size", "#");
  // Skip subheader/header rows (second line in CSVs that have two header lines)
  if (itemCode === "Item #" || itemCode === "Section Number") return null;
  const weightPerFt =
    pickNum(row, "Estimated Pounds Per Foot", "Estimated Lbs. Per Ft.", "Weight Per Ft. in Lbs.", "Weight per Ft. in Lbs.", "Weight Per Foot", "Weight per Foot", "Weight Per Ft. in Lbs.", "Weight Per Linear Ft.", "Weight Per Lbs.", "Weight Per Ft. in Lbs.", "Weight\nPer/Foot", "Weight Per/Foot") ??
    pickNum(row, "Weight Per Foot");
  // wide_flange (materials2) can have empty Section Number; we'll use weight for item_code
  const isWideFlange = sourceFile === "mwfab-base-materials2.csv";
  if (!isWideFlange && (!itemCode || itemCode === "" || /^,/.test(itemCode) || itemCode === "Item #")) return null;
  if (isWideFlange && weightPerFt == null) return null;

  const displayName =
    pickCol(row, "Item #", "Section Number") ||
    pickCol(row, "Size") ||
    itemCode ||
    (isWideFlange && weightPerFt != null ? `W${weightPerFt}` : "");
  const lbAliases = COST_PER_LB_ALIASES[category];
  const ftAliases = COST_PER_FOOT_ALIASES[category];
  const costPerLb =
    pricingUnit === "per_lb" && lbAliases
      ? pickNum(row, ...lbAliases)
      : null;
  const costPerFoot =
    pricingUnit === "per_foot" && ftAliases
      ? pickNum(row, ...ftAliases)
      : null;

  const dimensions: Record<string, unknown> = {};
  const sizeA = pickCol(row, "Size A", "Size", "Thickness", "Pipe Size", "Width");
  const sizeB = pickCol(row, "Size B", "Width", "Height");
  const sizeC = pickCol(row, "Size C", "Section Number", "Schedule", "Gauge");
  const sizeD = pickCol(row, "Section Depth A", "Depth of Section", "Outer Diameter", "Average Wall Thickness");
  const flangeB = pickCol(row, "Flange Width B", "Flange Width");
  const flangeC = pickCol(row, "Flange Thickness C", "Flange Thickness");
  const webD = pickCol(row, "Web Thickness D", "Web Thickness", "Wall Thickness");
  if (sizeA) dimensions.size_a = sizeA;
  if (sizeB) dimensions.size_b = sizeB;
  if (sizeC) dimensions.size_c = sizeC;
  if (sizeD) dimensions.section_depth_a = sizeD;
  if (flangeB) dimensions.flange_width_b = flangeB;
  if (flangeC) dimensions.flange_thickness_c = flangeC;
  if (webD) dimensions.web_thickness_d = webD;
  const typeCol = pickCol(row, "Type", "Angle Type", "Materials");
  if (typeCol) dimensions.type = typeCol;
  let availableLength = pickCol(
    row,
    "Available Length(s)",
    "Available Lengths",
    "Available Length",
    "Available lengths"
  );
  if (!availableLength && sourceFile === "mwfab-base-materials.csv") {
    const key = Object.keys(row).find((k) => /available/i.test(k) && /length/i.test(k));
    if (key) availableLength = row[key]?.trim() || null;
    // Fallback: any cell value that looks like "20 ft 40 ft"
    if (!availableLength) {
      for (const v of Object.values(row)) {
        const s = typeof v === "string" ? v.trim() : "";
        if (s && /^\d+\s*ft(\s+\d+\s*ft)*\s*$/i.test(s)) {
          availableLength = s;
          break;
        }
      }
    }
  }
  if (availableLength && String(availableLength).trim()) dimensions.available_length = String(availableLength).trim();
  if (sourceFile === "mwfab-base-materials8.csv") {
    const pipeSize = pickCol(row, "Pipe Size");
    const schedule = pickCol(row, "Schedule");
    const od = pickCol(row, "Outer Diameter");
    const wall = pickCol(row, "Wall Thickness");
    if (pipeSize) dimensions.pipe_size = pipeSize;
    if (schedule) dimensions.schedule = schedule;
    if (od) dimensions.outer_diameter = od;
    if (wall) dimensions.wall_thickness = wall;
  }
  if (sourceFile === "mwfab-base-materials9.csv") {
    const w = pickCol(row, "Width");
    const h = pickCol(row, "Height");
    const gauge = pickCol(row, "Gauge");
    if (w) dimensions.width = w;
    if (h) dimensions.height = h;
    if (gauge) dimensions.gauge = gauge;
  }

  // wide_flange has many rows per Section Number (different weights); need unique item_code so we don't lose rows when deduping
  const finalItemCode =
    sourceFile === "mwfab-base-materials2.csv" && weightPerFt != null
      ? ((itemCode && String(itemCode).trim()) ? String(itemCode).trim() + "-" : "WF-") + String(weightPerFt)
      : String(itemCode ?? "").trim().slice(0, 255);

  return {
    category,
    item_code: finalItemCode,
    display_name: displayName ? String(displayName).trim().slice(0, 512) : null,
    dimensions: Object.keys(dimensions).length ? dimensions : null,
    weight_per_ft: weightPerFt,
    cost_per_lb: costPerLb,
    cost_per_foot: costPerFoot,
    pricing_unit: pricingUnit,
    source_file: sourceFile,
  };
}

function seedFile(
  fileName: string,
  pricingUnit: "per_lb" | "per_foot",
  overrideCategory?: (row: Record<string, string>) => string
): CatalogRow[] {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) return [];
  const category = CATEGORY_BY_FILE[fileName] ?? "angles";
  const rows = parseCsvFile(filePath);
  const out: CatalogRow[] = [];
  for (const row of rows) {
    const cat = overrideCategory ? overrideCategory(row) : category;
    const r = rowToCatalog(row, cat, fileName, pricingUnit);
    if (r) out.push(r);
  }
  return out;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local)");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const allRows: CatalogRow[] = [];

  allRows.push(
    ...seedFile("mwfab-base-materials.csv", "per_lb")
  );
  allRows.push(
    ...seedFile("mwfab-base-materials2.csv", "per_foot")
  );
  allRows.push(
    ...seedFile("mwfab-base-materials3.csv", "per_lb", (row) => {
      const t = pickCol(row, "Type", "Materials") ?? "";
      return /cold|cf|finished/i.test(t) ? "bars_cf_rounds" : "bars_hr_rounds";
    })
  );
  allRows.push(
    ...seedFile("mwfab-base-materials4.csv", "per_lb")
  );
  allRows.push(
    ...seedFile("mwfab-base-materials5.csv", "per_lb")
  );
  allRows.push(
    ...seedFile("mwfab-base-materials6.csv", "per_lb")
  );
  allRows.push(
    ...seedFile("mwfab-base-materials7.csv", "per_lb")
  );
  allRows.push(
    ...seedFile("mwfab-base-materials8.csv", "per_lb")
  );
  allRows.push(
    ...seedFile("mwfab-base-materials9.csv", "per_lb")
  );

  const deduped = new Map<string, CatalogRow>();
  for (const r of allRows) {
    const key = `${r.category}:${r.item_code}`;
    if (!deduped.has(key)) deduped.set(key, r);
  }
  const toUpsert = Array.from(deduped.values());

  console.log(`Upserting ${toUpsert.length} material_catalog rows...`);
  const { error } = await supabase
    .from("material_catalog")
    .upsert(toUpsert, { onConflict: "category,item_code" });

  if (error) {
    console.error("Supabase upsert error:", error);
    process.exit(1);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
