/**
 * Category-specific step definitions for takeoff metal line cascading dropdowns.
 * stepKey must match material_catalog dimensions key or top-level column (e.g. weight_per_ft).
 */

import type { TakeoffMetalLine } from "@/lib/db-types";

export type CatalogStep = { key: string; label: string };

export type CategorySpec = {
  steps: CatalogStep[];
  pricingUnit: "per_lb" | "per_foot";
};

const SPECS: Record<Exclude<TakeoffMetalLine["category"], "other">, CategorySpec> = {
  angles: {
    steps: [
      { key: "size_a", label: "Size A" },
      { key: "size_b", label: "Size B" },
      { key: "size_c", label: "Size C" },
      { key: "available_length", label: "Available Length" },
    ],
    pricingUnit: "per_lb",
  },
  wide_flange: {
    steps: [
      { key: "weight_per_ft", label: "Weight per foot" },
      { key: "section_depth_a", label: "Depth of Section" },
      { key: "flange_width_b", label: "Flange Width" },
      { key: "flange_thickness_c", label: "Flange Thickness" },
      { key: "web_thickness_d", label: "Web Thickness" },
    ],
    pricingUnit: "per_foot",
  },
  bars_hr_rounds: {
    steps: [
      { key: "size_a", label: "Thickness" },
      { key: "available_length", label: "Available Length" },
      { key: "weight_per_ft", label: "Weight per ft (lbs)" },
    ],
    pricingUnit: "per_lb",
  },
  bars_cf_rounds: {
    steps: [
      { key: "size_a", label: "Size" },
      { key: "available_length", label: "Available Length" },
      { key: "weight_per_ft", label: "Weight per ft (lbs)" },
    ],
    pricingUnit: "per_lb",
  },
  bars_flat: {
    steps: [
      { key: "size_a", label: "Thickness" },
      { key: "size_b", label: "Width" },
      { key: "weight_per_ft", label: "Weight per ft (lbs)" },
    ],
    pricingUnit: "per_lb",
  },
  channels: {
    steps: [
      { key: "size_c", label: "Section Number" },
      { key: "section_depth_a", label: "Depth A" },
      { key: "flange_width_b", label: "Flange Width B" },
      { key: "flange_thickness_c", label: "Flange Thickness C" },
      { key: "web_thickness_d", label: "Web Thickness D" },
      { key: "weight_per_ft", label: "Weight per ft (lbs)" },
    ],
    pricingUnit: "per_lb",
  },
  mc_channels: {
    steps: [
      { key: "size_c", label: "Section Number" },
      { key: "section_depth_a", label: "Depth A" },
      { key: "flange_width_b", label: "Flange Width B" },
      { key: "flange_thickness_c", label: "Flange Thickness C" },
      { key: "web_thickness_d", label: "Web Thickness D" },
      { key: "weight_per_ft", label: "Weight per ft (lbs)" },
    ],
    pricingUnit: "per_lb",
  },
  pipe: {
    steps: [
      { key: "pipe_size", label: "Pipe Size" },
      { key: "schedule", label: "Schedule" },
      { key: "outer_diameter", label: "Outer Diameter" },
      { key: "wall_thickness", label: "Wall Thickness" },
      { key: "weight_per_ft", label: "Weight per ft (lbs)" },
    ],
    pricingUnit: "per_lb",
  },
  tube: {
    steps: [
      { key: "type", label: "Type" },
      { key: "width", label: "Width" },
      { key: "height", label: "Height" },
      { key: "gauge", label: "Gauge" },
      { key: "weight_per_ft", label: "Weight per ft (lbs)" },
    ],
    pricingUnit: "per_lb",
  },
};

/** UI display names for category (used in Materials and Takeoff metal lines). */
export const CATEGORY_LABELS: Record<TakeoffMetalLine["category"], string> = {
  angles: "Angles",
  wide_flange: "Wide Flange",
  bars_hr_rounds: "Bars HR Rounds",
  bars_cf_rounds: "Bars CF Rounds",
  bars_flat: "Bars Flat",
  channels: "Channels",
  mc_channels: "MC Channels",
  pipe: "Pipe",
  tube: "Tube",
  other: "Other",
};

export const CATEGORY_ORDER: TakeoffMetalLine["category"][] = [
  "angles",
  "wide_flange",
  "bars_hr_rounds",
  "bars_cf_rounds",
  "bars_flat",
  "channels",
  "mc_channels",
  "pipe",
  "tube",
  "other",
];

export function getCategorySpec(category: TakeoffMetalLine["category"]): CategorySpec | null {
  if (category === "other") return null;
  return SPECS[category] ?? null;
}

export function getCatalogCategories(): Exclude<TakeoffMetalLine["category"], "other">[] {
  return CATEGORY_ORDER.filter((c): c is Exclude<TakeoffMetalLine["category"], "other"> => c !== "other");
}
