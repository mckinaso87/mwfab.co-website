import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getOrCreateTakeoff,
  getSumGalvPounds,
  getActiveExclusions,
  getTakeoffExclusionIds,
} from "./actions";
import { TakeoffWorkspaceHeader } from "./TakeoffWorkspaceHeader";
import { TakeoffHeaderForm } from "./TakeoffHeaderForm";
import { TakeoffMetalSection } from "./TakeoffMetalSection";
import { TakeoffComponentSection } from "./TakeoffComponentSection";
import { TakeoffMiscSection } from "./TakeoffMiscSection";
import { TakeoffFieldMiscSection } from "./TakeoffFieldMiscSection";
import { TakeoffTotalsSection } from "./TakeoffTotalsSection";
import { TakeoffExclusionsSection } from "./TakeoffExclusionsSection";
import { TakeoffSectionNote } from "@/components/admin/takeoff/TakeoffSectionNote";
import { upsertSectionNote } from "./actions";
import { CATEGORY_ORDER } from "@/lib/takeoff-catalog-spec";
import type {
  Takeoff,
  TakeoffMetalLine,
  TakeoffComponentLine,
  TakeoffMiscLine,
  TakeoffFieldMisc,
  TakeoffSectionNote as NoteRow,
  TakeoffSectionKey,
} from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Takeoff | Admin | McKinados Welding & Fabrication",
  description: "Build takeoff and proposal.",
  robots: "noindex, nofollow",
};

export default async function TakeoffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = await params;
  const supabase = createAdminClient();
  const { takeoff, error: takeoffError } = await getOrCreateTakeoff(jobId);
  if (takeoffError || !takeoff) {
    notFound();
  }
  const { data: job } = await supabase
    .from("jobs")
    .select("id, job_name, customers ( id, company_name )")
    .eq("id", jobId)
    .single();
  if (!job) notFound();

  const [
    { data: metalLines },
    { data: componentLines },
    { data: miscLines },
    { data: fieldMiscLines },
    { data: users },
    { data: notesRows },
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
    supabase.from("users").select("id, name").order("name", { ascending: true, nullsFirst: false }),
    supabase.from("takeoff_section_notes").select("*").eq("takeoff_id", takeoff.id),
  ]);

  const metal = (metalLines ?? []) as TakeoffMetalLine[];
  const components = (componentLines ?? []) as TakeoffComponentLine[];
  const misc = (miscLines ?? []) as TakeoffMiscLine[];
  const fieldMisc = (fieldMiscLines ?? []) as TakeoffFieldMisc[];
  const metalSorted = [...metal].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      a.sort_order - b.sort_order
  );
  const sumGalvPounds = await getSumGalvPounds(takeoff.id);

  const notesBySection = new Map<TakeoffSectionKey, NoteRow>();
  for (const n of (notesRows ?? []) as NoteRow[]) {
    notesBySection.set(n.section, n);
  }

  const { exclusions } = await getActiveExclusions();
  const selectedExclusionIds = await getTakeoffExclusionIds(takeoff.id);

  const jobWithCustomer = job as unknown as {
    id: string;
    job_name: string;
    customers: { id: string; company_name: string } | null;
  };

  return (
    <div className="space-y-8">
      <TakeoffWorkspaceHeader
        jobId={jobId}
        jobName={jobWithCustomer.job_name}
        customerName={jobWithCustomer.customers?.company_name ?? null}
        customerId={jobWithCustomer.customers?.id ?? null}
        takeoff={takeoff}
        previewHref={`/admin/jobs/${jobId}/proposal`}
      />

      <TakeoffHeaderForm takeoff={takeoff} jobId={jobId} staff={users ?? []} />

      <TakeoffMetalSection
        takeoffId={takeoff.id}
        jobId={jobId}
        takeoff={takeoff}
        lines={metalSorted}
      />
      <TakeoffSectionNote
        takeoffId={takeoff.id}
        jobId={jobId}
        section="metal"
        note={notesBySection.get("metal")}
        upsertAction={upsertSectionNote}
      />

      <TakeoffComponentSection takeoffId={takeoff.id} jobId={jobId} lines={components} />
      <TakeoffSectionNote
        takeoffId={takeoff.id}
        jobId={jobId}
        section="components"
        note={notesBySection.get("components")}
        upsertAction={upsertSectionNote}
      />

      <TakeoffMiscSection
        takeoffId={takeoff.id}
        jobId={jobId}
        takeoff={takeoff}
        lines={misc}
        sumGalvPounds={sumGalvPounds}
      />
      <TakeoffSectionNote
        takeoffId={takeoff.id}
        jobId={jobId}
        section="materials_misc"
        note={notesBySection.get("materials_misc")}
        upsertAction={upsertSectionNote}
      />

      <TakeoffFieldMiscSection takeoffId={takeoff.id} jobId={jobId} lines={fieldMisc} />
      <TakeoffSectionNote
        takeoffId={takeoff.id}
        jobId={jobId}
        section="field_misc"
        note={notesBySection.get("field_misc")}
        upsertAction={upsertSectionNote}
      />

      <TakeoffTotalsSection takeoff={takeoff} jobId={jobId} />

      <TakeoffExclusionsSection
        takeoffId={takeoff.id}
        jobId={jobId}
        exclusions={exclusions}
        selectedIds={selectedExclusionIds}
      />
    </div>
  );
}
