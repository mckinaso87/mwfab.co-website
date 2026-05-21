/** Matches public.job_status enum. */
export type JobStatus =
  | "To Bid"
  | "In Takeoff"
  | "Under Review"
  | "Proposal Ready"
  | "Sent"
  | "Awarded"
  | "Lost";

export interface User {
  id: string;
  name: string | null;
  role: "admin" | "estimator" | "office" | "read_only";
  clerk_id: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  customer_id: string;
  job_name: string;
  description: string | null;
  bid_due_date: string | null;
  date_of_plan: string | null;
  status: JobStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobFile {
  id: string;
  job_id: string;
  file_url: string;
  file_name: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface JobStatusHistory {
  id: string;
  job_id: string;
  previous_status: JobStatus | null;
  new_status: JobStatus;
  changed_by: string | null;
  timestamp: string;
}

export const JOB_STATUSES: JobStatus[] = [
  "To Bid",
  "In Takeoff",
  "Under Review",
  "Proposal Ready",
  "Sent",
  "Awarded",
  "Lost",
];

// Material catalog (restructured categories)
export type MaterialCatalogCategory =
  | "angle"
  | "wide_flange"
  | "round_bar"
  | "flat_bar"
  | "channel"
  | "mc_channel"
  | "pipe"
  | "tube";

export interface MaterialCatalogRow {
  id: string;
  category: MaterialCatalogCategory;
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
  source_file: string | null;
  created_at: string;
}

export interface MaterialFieldConfig {
  category: string;
  field_key: string;
  label: string;
  show_in_takeoff: boolean;
  sort_order: number;
}

// Phase 3: Takeoffs (grand-totals layout)
export interface Takeoff {
  id: string;
  job_id: string;
  quote_date: string | null;
  quoted_by: string | null;
  tax_rate: number;
  margin_rate: number;
  notes: string | null;
  metal_subtotal: number;
  other_material_subtotal: number;
  all_material_subtotal: number;
  tax_total: number;
  material_total_with_tax: number;
  shop_labor_hours: number | null;
  shop_labor_rate: number | null;
  shop_days_or_nights: number | null;
  shop_labor_amount: number;
  shop_drawings_amount: number;
  shop_total: number;
  drawings_total: number;
  install_total: number;
  misc_total: number;
  field_labor_amount: number | null;
  field_labor_rate: number | null;
  field_days_or_nights: number | null;
  field_labor_total: number;
  field_total: number;
  project_total: number;
  with_pct_total: number;
  grand_total: number;
  galv_mode: "not_galvanized" | "baked_in" | "optional_addon";
  galv_total_override: number | null;
  galv_addon_amount: number;
  plate_default_cost_per_lb: number;
  created_at: string;
  updated_at: string;
}

export type TakeoffMetalCategory =
  | MaterialCatalogCategory
  | "plate"
  | "other";

export type LineScope = "furnish" | "furnish_install";

export interface TakeoffMetalLine {
  id: string;
  takeoff_id: string;
  material_catalog_id: string | null;
  category: TakeoffMetalCategory;
  scope: LineScope;
  display_name: string;
  count: number;
  total_length_ft: number | null;
  total_pounds_per_piece: number | null;
  total_pounds: number | null;
  cost_per_unit: number | null;
  total_price: number;
  is_galvanized: boolean;
  galv_length_ft: number | null;
  galv_pounds: number | null;
  plate_thickness_in: number | null;
  plate_width_in: number | null;
  plate_height_in: number | null;
  other_unit: "lbs" | "ft" | null;
  sort_order: number;
}

export interface TakeoffComponentLine {
  id: string;
  takeoff_id: string;
  scope: LineScope;
  display_name: string;
  count: number;
  total_pounds_per_piece: number | null;
  total_pounds: number | null;
  cost_per_measure: number | null;
  total_price: number;
  sort_order: number;
}

export interface TakeoffMiscLine {
  id: string;
  takeoff_id: string;
  scope: LineScope;
  label: string;
  amount: number | null;
  hours: number | null;
  days: number | null;
  rate_per_hour: number | null;
  rate_per_day: number | null;
  weight_of_galv: number | null;
  price_per: number | null;
  total_price: number;
  sort_order: number;
}

export interface TakeoffFieldMisc {
  id: string;
  takeoff_id: string;
  scope: LineScope;
  label: string;
  amount: number | null;
  hours: number | null;
  days: number | null;
  rate_per_hour: number | null;
  rate_per_day: number | null;
  price_per: number | null;
  hrs_days_nights: string | null;
  total: number;
  sort_order: number;
}

export type TakeoffSectionKey =
  | "metal"
  | "components"
  | "materials_misc"
  | "field_misc"
  | "drawings"
  | "shop"
  | "install"
  | "general";

export interface TakeoffSectionNote {
  id: string;
  takeoff_id: string;
  section: TakeoffSectionKey;
  note: string;
  include_in_proposal: boolean;
}

export interface SettingsTerms {
  id: string;
  version: number;
  body_md: string;
  is_active: boolean;
  updated_at: string;
}

export interface SettingsExclusion {
  id: string;
  label: string;
  body: string;
  is_active: boolean;
  sort_order: number;
}

/** Phase 4: One row per proposal email sent; attached to customer for history. */
export interface Proposal {
  id: string;
  customer_id: string;
  job_id: string;
  takeoff_id: string;
  sent_at: string;
  recipient_email: string;
  subject: string | null;
  created_at: string;
}
