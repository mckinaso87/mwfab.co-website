/**
 * Seed material_catalog from data/materials/*.csv.
 * Idempotent: TRUNCATE then insert. Source of truth for catalog data.
 *
 * Usage: npm run seed:materials
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ALLOWED_SEED_HOSTS
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "materials");

const CATEGORY_BY_FILE: Record<string, string> = {
  "mwfab-base-materials.csv": "angle",
  "mwfab-base-materials2.csv": "wide_flange",
  "mwfab-base-materials3.csv": "round_bar",
  "mwfab-base-materials4.csv": "flat_bar",
  "mwfab-base-materials5.csv": "flat_bar",
  "mwfab-base-materials6.csv": "channel",
  "mwfab-base-materials7.csv": "mc_channel",
  "mwfab-base-materials8.csv": "pipe",
  "mwfab-base-materials9.csv": "tube",
};

const COST_PER_LB_ALIASES: Record<string, string[]> = {
  angle: ["Current cost per lbs.", "Current Cost per Lbs.", "Current Cost per Lbs", "Current Cost per Lb."],
  round_bar: [
    "Current cost per ft. in lbs.",
    "Current Cost per ft. in Lbs.",
    "Current Cost per ft. in Lbs",
    "Current Cost per Lbs.",
    "Current cost per lbs.",
    "Current Cost per Lb.",
  ],
  flat_bar: ["Current Cost per ft. in Lbs.", "Current cost per ft. in lbs.", "Current Cost per Lbs.", "Current Cost per Lbs"],
  channel: ["Current Cost per Lbs.", "Current cost per lbs.", "Current Cost per Lbs"],
  mc_channel: ["Current Cost per Lbs.", "Current cost per lbs.", "Current Cost per Lbs"],
  pipe: ["Current Cost per Lbs.", "Current cost per lbs.", "Current Cost per Lbs"],
  tube: ["Current Cost per Lbs.", "Current cost per lbs.", "Current Cost per Lbs"],
};
const COST_PER_FOOT_ALIASES: Record<string, string[]> = {
  wide_flange: ["Current cost per foot", "Current Cost per Foot", "Current Cost per foot"],
};

type CatalogRow = {
  category: string;
  item_code: string;
  shorthand_code: string;
  size_label: string | null;
  finish: "HR" | "CF" | null;
  dimensions: Record<string, unknown> | null;
  weight_per_ft: number | null;
  cost_per_lb: number | null;
  cost_per_foot: number | null;
  pricing_unit: "per_lb" | "per_foot";
  is_active: boolean;
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
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const lines = raw.split(/\r?\n/);
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
  return parse(toParse, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, string>[];
}

function normalizeKey(k: string): string {
  return k.replace(/\s+/g, " ").replace(/\n/g, " ").toLowerCase().trim();
}

function pickCol(row: Record<string, string>, ...aliases: string[]): string | null {
  const keyMap: Record<string, string> = {};
  for (const k of Object.keys(row)) keyMap[normalizeKey(k)] = k;
  for (const a of aliases) {
    const n = normalizeKey(a);
    if (keyMap[n] !== undefined) {
      const val = row[keyMap[n]]?.trim();
      if (val) return val;
    }
  }
  return null;
}

function pickNum(row: Record<string, string>, ...aliases: string[]): number | null {
  const v = pickCol(row, ...aliases);
  return v !== null ? parseNum(v) : null;
}

/** Compact size token for shorthand (strip units/spaces). */
function compactToken(s: string | null): string {
  if (!s) return "";
  return s
    .replace(/\s*in\.?\s*/gi, "")
    .replace(/\s+/g, "")
    .replace(/"/g, "");
}

/** Pretty token for size_label (keep readable). */
function prettyToken(s: string | null): string {
  if (!s) return "";
  return s.replace(/\s*in\.?\s*/gi, " in").trim();
}

function buildAngleCodes(d: Record<string, unknown>): { shorthand: string; label: string } {
  const a = compactToken(String(d.size_a ?? ""));
  const b = compactToken(String(d.size_b ?? ""));
  const c = compactToken(String(d.size_c ?? ""));
  const shorthand = `L${a}x${b}x${c}`;
  const label = `L ${prettyToken(String(d.size_a ?? ""))}×${prettyToken(String(d.size_b ?? ""))}×${prettyToken(String(d.size_c ?? ""))}`;
  return { shorthand, label };
}

/** W nominal from depth when Section Number is blank (AISC depth bands). */
function inferWideFlangeSectionFromDepth(depthIn: number | null): string | null {
  if (depthIn == null || !Number.isFinite(depthIn)) return null;
  const d = depthIn;
  if (d < 4.6) return "W4";
  if (d < 5.6) return "W5";
  if (d < 6.6) return "W6";
  if (d < 7.6) return "W7";
  if (d < 9.0) return "W8";
  if (d < 11.0) return "W10";
  if (d < 13.0) return "W12";
  if (d < 15.0) return "W14";
  if (d < 17.0) return "W16";
  if (d < 19.0) return "W18";
  if (d < 22.0) return "W21";
  if (d < 25.0) return "W24";
  return `W${Math.round(d)}`;
}

/** W designation from Section Number (e.g. W12 → 12), not physical depth of section. */
function wideFlangeWNumber(d: Record<string, unknown>): string {
  const sn = String(d.section_number ?? d.size_c ?? "").trim();
  const m = /^W(\d+(?:\.\d+)?)/i.exec(sn);
  if (m) return m[1];
  return compactToken(sn.replace(/^W/i, ""));
}

function buildWideFlangeCodes(
  d: Record<string, unknown>,
  weightPerFt: number | null
): { shorthand: string; label: string } {
  const wNum = wideFlangeWNumber(d);
  const wpf = weightPerFt != null ? String(weightPerFt) : compactToken(String(d.weight_per_ft ?? ""));
  const wLabel = prettyToken(String(d.section_number ?? d.size_c ?? "")).replace(/^W/i, "W");
  return {
    shorthand: wNum ? `W${wNum}x${wpf}` : `Wx${wpf}`,
    label: wNum ? `${wLabel || `W${wNum}`}×${wpf}` : `×${wpf}`,
  };
}

function buildRoundBarCodes(d: Record<string, unknown>, finish: "HR" | "CF"): { shorthand: string; label: string } {
  const a = compactToken(String(d.size_a ?? ""));
  return {
    shorthand: `RB${a}`,
    label: `RB ${prettyToken(String(d.size_a ?? ""))} (${finish})`,
  };
}

function buildFlatBarCodes(d: Record<string, unknown>): { shorthand: string; label: string } {
  const a = compactToken(String(d.size_a ?? ""));
  const b = compactToken(String(d.size_b ?? ""));
  if (b) {
    return {
      shorthand: `FB${a}x${b}`,
      label: `FB ${prettyToken(String(d.size_a ?? ""))}×${prettyToken(String(d.size_b ?? ""))}`,
    };
  }
  return {
    shorthand: `FB${a}`,
    label: `FB ${prettyToken(String(d.size_a ?? ""))}`,
  };
}

function buildChannelCodes(
  category: "channel" | "mc_channel",
  d: Record<string, unknown>,
  weightPerFt: number | null
): { shorthand: string; label: string } {
  const prefix = category === "mc_channel" ? "MC" : "C";
  const depth = compactToken(String(d.section_depth_a ?? ""));
  const wpf = weightPerFt != null ? String(weightPerFt) : "";
  return {
    shorthand: `${prefix}${depth}x${wpf}`,
    label: `${prefix} ${prettyToken(String(d.section_depth_a ?? ""))}×${wpf}`,
  };
}

function buildPipeCodes(d: Record<string, unknown>): { shorthand: string; label: string } {
  const ps = compactToken(String(d.pipe_size ?? ""));
  const sch = compactToken(String(d.schedule ?? ""));
  return {
    shorthand: `PIPE${ps}-SCH${sch}`,
    label: `Pipe ${prettyToken(String(d.pipe_size ?? ""))} Sch ${prettyToken(String(d.schedule ?? ""))}`,
  };
}

function tubeThicknessToken(d: Record<string, unknown>): string {
  const avg = d.average_wall_thickness ?? d.avg_wall_thickness;
  if (avg != null && String(avg).trim() !== "") {
    const s = String(avg).trim();
    const n = parseFloat(s);
    if (Number.isFinite(n) && n > 0) return compactToken(s);
    return compactToken(s);
  }
  const gauge = String(d.gauge ?? "").trim();
  if (gauge) return compactToken(gauge);
  return "0";
}

function buildTubeCodes(d: Record<string, unknown>): { shorthand: string; label: string } {
  const w = compactToken(String(d.width ?? ""));
  const h = compactToken(String(d.height ?? ""));
  const t = tubeThicknessToken(d);
  return {
    shorthand: `TS${w}x${h}x${t}`,
    label: `TS ${prettyToken(String(d.width ?? ""))}×${prettyToken(String(d.height ?? ""))}×${prettyToken(t)}`,
  };
}

function isPlateSizedFlatBarRow(row: Record<string, string>): boolean {
  const item = pickCol(row, "Item #") ?? "";
  const materials = pickCol(row, "Materials") ?? "";
  const notes = pickCol(row, "NOTES:") ?? pickCol(row, "NOTES") ?? "";
  if (/plate/i.test(item) || /plate/i.test(materials) || /plate/i.test(notes)) return true;
  const height = pickCol(row, "Height");
  if (height && height.trim()) return true;
  return false;
}

function rowToCatalog(
  row: Record<string, string>,
  category: string,
  sourceFile: string,
  pricingUnit: "per_lb" | "per_foot",
  finish: "HR" | "CF" | null = null,
  wideFlangeCtx?: { lastSection: string | null }
): CatalogRow | null {
  if (sourceFile === "mwfab-base-materials5.csv" && isPlateSizedFlatBarRow(row)) {
    return null;
  }

  const itemCode =
    pickCol(row, "Item #", "Section Number", "Section number", "Size", "#");
  if (itemCode === "Item #" || itemCode === "Section Number") return null;

  const weightPerFt =
    pickNum(
      row,
      "Estimated Pounds Per Foot",
      "Estimated Lbs. Per Ft.",
      "Weight Per Ft. in Lbs.",
      "Weight per Ft. in Lbs.",
      "Weight Per Foot",
      "Weight per Foot",
      "Weight Per Linear Ft.",
      "Weight Per Lbs.",
      "Weight\nPer/Foot",
      "Weight Per/Foot"
    ) ?? pickNum(row, "Weight Per Foot");

  const isWideFlange = sourceFile === "mwfab-base-materials2.csv";
  const isThicknessOnlyFlat = sourceFile === "mwfab-base-materials4.csv";

  if (!isWideFlange && !isThicknessOnlyFlat && (!itemCode || itemCode === "" || /^,/.test(itemCode))) {
    return null;
  }
  if (isWideFlange && weightPerFt == null) return null;
  if (isThicknessOnlyFlat && !pickCol(row, "Size") && weightPerFt == null) return null;

  const lbAliases = COST_PER_LB_ALIASES[category];
  const ftAliases = COST_PER_FOOT_ALIASES[category];
  const costPerLb =
    pricingUnit === "per_lb" && lbAliases ? pickNum(row, ...lbAliases) : null;
  const costPerFoot =
    pricingUnit === "per_foot" && ftAliases ? pickNum(row, ...ftAliases) : null;

  const dimensions: Record<string, unknown> = {};
  const sizeA = pickCol(row, "Size A", "Size", "Thickness", "Pipe Size", "Width");
  const sizeB = pickCol(row, "Size B", "Width", "Height");
  const sizeC = pickCol(row, "Size C", "Schedule", "Gauge");
  const sizeD = pickCol(row, "Section Depth A", "Depth of Section", "Outer Diameter", "Average Wall Thickness");
  const flangeB = pickCol(row, "Flange Width B", "Flange Width");
  const flangeC = pickCol(row, "Flange Thickness C", "Flange Thickness");
  const webD = pickCol(row, "Web Thickness D", "Web Thickness", "Wall Thickness");

  if (isWideFlange) {
    const sectionNumber = pickCol(row, "Section Number", "Section number");
    const depthOfSection = pickCol(row, "Depth of Section");
    const depthNum = depthOfSection ? parseNum(depthOfSection) : null;
    if (sectionNumber && /^W/i.test(sectionNumber.trim())) {
      const sn = sectionNumber.trim();
      dimensions.section_number = sn;
      if (wideFlangeCtx) wideFlangeCtx.lastSection = sn;
    } else if (wideFlangeCtx?.lastSection) {
      dimensions.section_number = wideFlangeCtx.lastSection;
    } else {
      const inferred = inferWideFlangeSectionFromDepth(depthNum);
      if (inferred) {
        dimensions.section_number = inferred;
        if (wideFlangeCtx) wideFlangeCtx.lastSection = inferred;
      }
    }
    if (depthOfSection) dimensions.section_depth_a = depthOfSection;
    if (flangeB) dimensions.flange_width_b = flangeB;
    if (flangeC) dimensions.flange_thickness_c = flangeC;
    if (webD) dimensions.web_thickness_d = webD;
  } else {
    const sectionNumber = pickCol(row, "Section Number", "Section number");
    if (sizeA) dimensions.size_a = sizeA;
    if (sizeB) dimensions.size_b = sizeB;
    if (sizeC && category !== "pipe") dimensions.size_c = sizeC;
    else if (sectionNumber && category !== "pipe") dimensions.size_c = sectionNumber;
    if (sizeD) dimensions.section_depth_a = sizeD;
    if (flangeB) dimensions.flange_width_b = flangeB;
    if (flangeC) dimensions.flange_thickness_c = flangeC;
    if (webD) dimensions.web_thickness_d = webD;
  }

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
    const avgWall = pickCol(row, "Average Wall Thickness");
    if (w) dimensions.width = w;
    if (h) dimensions.height = h;
    if (gauge) dimensions.gauge = gauge;
    if (avgWall) dimensions.average_wall_thickness = avgWall;
  }

  let resolvedFinish: "HR" | "CF" | null = finish;
  if (category === "round_bar") {
    const t = pickCol(row, "Type", "Materials") ?? "";
    resolvedFinish = /cold|cf|finished/i.test(t) ? "CF" : "HR";
  }

  let finalItemCode =
    isWideFlange && weightPerFt != null
      ? (() => {
          const rowNum = pickCol(row, "#");
          const sectionNum = pickCol(row, "Section Number", "Section number");
          if (rowNum) return `${rowNum}-${weightPerFt}`;
          if (sectionNum && /^W/i.test(sectionNum)) return `${sectionNum}-${weightPerFt}`;
          const sn = dimensions.section_number ? String(dimensions.section_number) : "WF";
          return `${sn}-${weightPerFt}`;
        })()
      : String(itemCode ?? pickCol(row, "Size") ?? "").trim().slice(0, 255);

  if (isThicknessOnlyFlat) {
    finalItemCode = `FB-${compactToken(pickCol(row, "Size") ?? "")}`.slice(0, 255);
    if (!dimensions.size_a) dimensions.size_a = pickCol(row, "Size");
  }

  let codes: { shorthand: string; label: string };
  switch (category) {
    case "angle":
      codes = buildAngleCodes(dimensions);
      break;
    case "wide_flange":
      codes = buildWideFlangeCodes(dimensions, weightPerFt);
      break;
    case "round_bar":
      codes = buildRoundBarCodes(dimensions, resolvedFinish ?? "HR");
      break;
    case "flat_bar":
      codes = buildFlatBarCodes(dimensions);
      break;
    case "channel":
      codes = buildChannelCodes("channel", dimensions, weightPerFt);
      break;
    case "mc_channel":
      codes = buildChannelCodes("mc_channel", dimensions, weightPerFt);
      break;
    case "pipe":
      codes = buildPipeCodes(dimensions);
      break;
    case "tube":
      codes = buildTubeCodes(dimensions);
      break;
    default:
      codes = { shorthand: finalItemCode, label: finalItemCode };
  }

  return {
    category,
    item_code: finalItemCode,
    shorthand_code: codes.shorthand.slice(0, 255),
    size_label: codes.label.slice(0, 512),
    finish: resolvedFinish,
    dimensions: Object.keys(dimensions).length ? dimensions : null,
    weight_per_ft: weightPerFt,
    cost_per_lb: costPerLb,
    cost_per_foot: costPerFoot,
    pricing_unit: pricingUnit,
    is_active: true,
    source_file: sourceFile,
  };
}

function seedFile(
  fileName: string,
  pricingUnit: "per_lb" | "per_foot"
): CatalogRow[] {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) return [];
  const category = CATEGORY_BY_FILE[fileName] ?? "angle";
  const rows = parseCsvFile(filePath);
  const out: CatalogRow[] = [];
  const wideFlangeCtx = { lastSection: null as string | null };
  for (const row of rows) {
    const r = rowToCatalog(
      row,
      category,
      fileName,
      pricingUnit,
      null,
      fileName === "mwfab-base-materials2.csv" ? wideFlangeCtx : undefined
    );
    if (r) out.push(r);
  }
  return out;
}

function assertAllowedHost(url: string): void {
  const allowed = (process.env.ALLOWED_SEED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  if (allowed.length === 0) {
    console.error(
      "Set ALLOWED_SEED_HOSTS in .env.local (comma-separated Supabase project URLs).\n" +
        "Example: ALLOWED_SEED_HOSTS=https://YOUR_PROJECT.supabase.co\n" +
        "Use the same host as NEXT_PUBLIC_SUPABASE_URL."
    );
    process.exit(1);
  }
  const normalized = url.replace(/\/$/, "");
  const ok = allowed.some((h) => normalized === h.replace(/\/$/, ""));
  if (!ok) {
    console.error("Refusing to seed against this Supabase project");
    process.exit(1);
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local)");
    process.exit(1);
  }

  assertAllowedHost(url);

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const allRows: CatalogRow[] = [
    ...seedFile("mwfab-base-materials.csv", "per_lb"),
    ...seedFile("mwfab-base-materials2.csv", "per_foot"),
    ...seedFile("mwfab-base-materials3.csv", "per_lb"),
    ...seedFile("mwfab-base-materials4.csv", "per_lb"),
    ...seedFile("mwfab-base-materials5.csv", "per_lb"),
    ...seedFile("mwfab-base-materials6.csv", "per_lb"),
    ...seedFile("mwfab-base-materials7.csv", "per_lb"),
    ...seedFile("mwfab-base-materials8.csv", "per_lb"),
    ...seedFile("mwfab-base-materials9.csv", "per_lb"),
  ];

  const byKey = new Map<string, CatalogRow>();
  for (const r of allRows) {
    let key = `${r.category}:${r.item_code}`;
    if (byKey.has(key) && r.category === "round_bar" && r.finish) {
      const suffix = r.finish === "CF" ? "-CF" : "-HR";
      key = `${r.category}:${r.item_code}${suffix}`;
      r.item_code = `${r.item_code}${suffix}`.slice(0, 255);
    }
    if (!byKey.has(key)) byKey.set(key, r);
  }
  const toInsert = Array.from(byKey.values());

  console.log(`Truncating material_catalog and inserting ${toInsert.length} rows...`);

  const { error: truncateError } = await supabase.rpc("truncate_material_catalog");
  if (truncateError?.message?.includes("Could not find the function")) {
    const { error: delError } = await supabase.from("material_catalog").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (delError) {
      console.error("Delete all rows failed:", delError);
      process.exit(1);
    }
  } else if (truncateError) {
    const { error: delError } = await supabase.from("material_catalog").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (delError) {
      console.error("Truncate/delete failed:", truncateError, delError);
      process.exit(1);
    }
  }

  const BATCH = 200;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from("material_catalog").insert(batch);
    if (error) {
      console.error("Insert error:", error);
      process.exit(1);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
