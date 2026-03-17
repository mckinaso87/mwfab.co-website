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

// Phase 3: Material catalog
export type MaterialCatalogCategory =
  | "angles"
  | "wide_flange"
  | "bars_hr_rounds"
  | "bars_cf_rounds"
  | "bars_flat"
  | "channels"
  | "mc_channels"
  | "pipe"
  | "tube";

export interface MaterialCatalogRow {
  id: string;
  category: MaterialCatalogCategory;
  item_code: string;
  display_name: string | null;
  dimensions: Record<string, unknown> | null;
  weight_per_ft: number | null;
  cost_per_lb: number | null;
  cost_per_foot: number | null;
  pricing_unit: "per_lb" | "per_foot";
  source_file: string | null;
  created_at: string;
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
  field_labor_amount: number | null;
  field_labor_rate: number | null;
  field_days_or_nights: number | null;
  field_labor_total: number;
  field_total: number;
  project_total: number;
  with_pct_total: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
}

export type TakeoffMetalCategory =
  | MaterialCatalogCategory
  | "other";

export interface TakeoffMetalLine {
  id: string;
  takeoff_id: string;
  material_catalog_id: string | null;
  category: TakeoffMetalCategory;
  display_name: string;
  count: number;
  total_length_ft: number | null;
  total_pounds_per_piece: number | null;
  total_pounds: number | null;
  cost_per_unit: number | null;
  total_price: number;
  sort_order: number;
}

export interface TakeoffComponentLine {
  id: string;
  takeoff_id: string;
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
  label: string;
  amount: number | null;
  weight_of_galv: number | null;
  price_per: number | null;
  total_price: number;
  sort_order: number;
}

export interface TakeoffFieldMisc {
  id: string;
  takeoff_id: string;
  label: string;
  amount: number | null;
  price_per: number | null;
  hrs_days_nights: string | null;
  total: number;
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
