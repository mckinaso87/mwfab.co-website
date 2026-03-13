import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateTakeoff } from "./actions";
import { TakeoffWorkspaceHeader } from "./TakeoffWorkspaceHeader";
import { TakeoffHeaderForm } from "./TakeoffHeaderForm";
import { TakeoffMetalSection } from "./TakeoffMetalSection";
import { TakeoffComponentSection } from "./TakeoffComponentSection";
import { TakeoffMiscSection } from "./TakeoffMiscSection";
import { TakeoffFieldMiscSection } from "./TakeoffFieldMiscSection";
import { TakeoffTotalsSection } from "./TakeoffTotalsSection";
import { CATEGORY_ORDER } from "@/lib/takeoff-catalog-spec";
import type { Takeoff, TakeoffMetalLine, TakeoffComponentLine, TakeoffMiscLine, TakeoffFieldMisc } from "@/lib/db-types";

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
  const components = (componentLines ?? []) as TakeoffComponentLine[];
  const misc = (miscLines ?? []) as TakeoffMiscLine[];
  const fieldMisc = (fieldMiscLines ?? []) as TakeoffFieldMisc[];
  const metalSorted = [...metal].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      a.sort_order - b.sort_order
  );

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
      />

      <TakeoffHeaderForm takeoff={takeoff} jobId={jobId} />

      <TakeoffMetalSection takeoffId={takeoff.id} jobId={jobId} lines={metalSorted} />

      <TakeoffComponentSection takeoffId={takeoff.id} jobId={jobId} lines={components} />

      <TakeoffMiscSection takeoffId={takeoff.id} jobId={jobId} lines={misc} />

      <TakeoffFieldMiscSection takeoffId={takeoff.id} jobId={jobId} lines={fieldMisc} />

      <TakeoffTotalsSection takeoff={takeoff} jobId={jobId} />
    </div>
  );
}
