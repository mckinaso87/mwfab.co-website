import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORY_ORDER } from "@/lib/takeoff-catalog-spec";
import type {
  Takeoff,
  TakeoffMetalLine,
  TakeoffComponentLine,
  TakeoffMiscLine,
  TakeoffFieldMisc,
} from "@/lib/db-types";

export type ProposalDataJob = {
  id: string;
  job_name: string;
  customer_id: string;
  customers: { id: string; company_name: string; email: string | null } | null;
};

export type ProposalData = {
  job: ProposalDataJob;
  takeoff: Takeoff;
  metalLines: TakeoffMetalLine[];
  componentLines: TakeoffComponentLine[];
  miscLines: TakeoffMiscLine[];
  fieldMiscLines: TakeoffFieldMisc[];
};

/** Load job, takeoff, and all line items for proposal preview/send. Returns null if no takeoff. */
export async function getProposalData(jobId: string): Promise<ProposalData | null> {
  const supabase = createAdminClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, job_name, customer_id, customers ( id, company_name, email )")
    .eq("id", jobId)
    .single();

  if (!job) return null;

  const { data: takeoff } = await supabase
    .from("takeoffs")
    .select("*")
    .eq("job_id", jobId)
    .maybeSingle();

  if (!takeoff) return null;

  const [
    { data: metalLines },
    { data: componentLines },
    { data: miscLines },
    { data: fieldMiscLines },
  ] = await Promise.all([
    supabase
      .from("takeoff_metal_lines")
      .select("*")
      .eq("takeoff_id", takeoff.id)
      .order("sort_order"),
    supabase
      .from("takeoff_component_lines")
      .select("*")
      .eq("takeoff_id", takeoff.id)
      .order("sort_order"),
    supabase
      .from("takeoff_misc_lines")
      .select("*")
      .eq("takeoff_id", takeoff.id)
      .order("sort_order"),
    supabase
      .from("takeoff_field_misc")
      .select("*")
      .eq("takeoff_id", takeoff.id)
      .order("sort_order"),
  ]);

  const metal = (metalLines ?? []) as TakeoffMetalLine[];
  const metalSorted = [...metal].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      a.sort_order - b.sort_order
  );

  return {
    job: job as unknown as ProposalDataJob,
    takeoff: takeoff as Takeoff,
    metalLines: metalSorted,
    componentLines: (componentLines ?? []) as TakeoffComponentLine[],
    miscLines: (miscLines ?? []) as TakeoffMiscLine[],
    fieldMiscLines: (fieldMiscLines ?? []) as TakeoffFieldMisc[],
  };
}
