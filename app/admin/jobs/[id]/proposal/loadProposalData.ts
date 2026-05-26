import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORY_ORDER } from "@/lib/takeoff-catalog-spec";
import type {
  Takeoff,
  TakeoffMetalLine,
  TakeoffComponentLine,
  TakeoffMiscLine,
  TakeoffFieldMisc,
  TakeoffSectionNote,
  TakeoffSectionKey,
  SettingsExclusion,
  SettingsTerms,
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
  sectionNotes: Partial<Record<TakeoffSectionKey, TakeoffSectionNote>>;
  exclusions: SettingsExclusion[];
  terms: SettingsTerms | null;
};

function linesForProposal<T extends { include_in_proposal?: boolean }>(lines: T[]): T[] {
  return lines.filter((line) => line.include_in_proposal !== false);
}

/** Load job, takeoff, and line items for proposal preview/send. Returns null if no takeoff. */
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
    { data: notesRows },
    { data: takeoffExRows },
    { data: termsRow },
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
    supabase.from("takeoff_section_notes").select("*").eq("takeoff_id", takeoff.id),
    supabase.from("takeoff_exclusions").select("exclusion_id").eq("takeoff_id", takeoff.id),
    supabase
      .from("settings_terms")
      .select("*")
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const metal = (metalLines ?? []) as TakeoffMetalLine[];
  const metalSorted = [...metal].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      a.sort_order - b.sort_order
  );

  const sectionNotes: Partial<Record<TakeoffSectionKey, TakeoffSectionNote>> = {};
  for (const n of (notesRows ?? []) as TakeoffSectionNote[]) {
    sectionNotes[n.section] = n;
  }

  const exclusionIds = (takeoffExRows ?? []).map((r) => r.exclusion_id as string);
  let exclusions: SettingsExclusion[] = [];
  if (exclusionIds.length > 0) {
    const { data: exRows } = await supabase
      .from("settings_exclusions")
      .select("*")
      .in("id", exclusionIds)
      .order("sort_order");
    exclusions = (exRows ?? []) as SettingsExclusion[];
  }

  return {
    job: job as unknown as ProposalDataJob,
    takeoff: takeoff as Takeoff,
    metalLines: linesForProposal(metalSorted),
    componentLines: linesForProposal((componentLines ?? []) as TakeoffComponentLine[]),
    miscLines: linesForProposal((miscLines ?? []) as TakeoffMiscLine[]),
    fieldMiscLines: linesForProposal((fieldMiscLines ?? []) as TakeoffFieldMisc[]),
    sectionNotes,
    exclusions,
    terms: (termsRow as SettingsTerms | null) ?? null,
  };
}

export function deriveProposalScopeLabel(
  lines: Array<{ scope?: string | null }>
): string {
  const scopes = new Set(
    lines.map((l) => l.scope).filter((s): s is string => !!s)
  );
  if (scopes.has("furnish") && scopes.has("furnish_install")) {
    return "Mixed (furnish and furnish & install)";
  }
  if (scopes.has("furnish") && !scopes.has("furnish_install")) {
    return "Furnish only";
  }
  if (scopes.has("furnish_install") && !scopes.has("furnish")) {
    return "Furnish & install";
  }
  return "—";
}
