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
