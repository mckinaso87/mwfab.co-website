import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateTakeoff } from "./actions";
import { TakeoffHeaderForm } from "./TakeoffHeaderForm";
import { TakeoffMetalSection } from "./TakeoffMetalSection";
import { TakeoffComponentSection } from "./TakeoffComponentSection";
import { TakeoffMiscSection } from "./TakeoffMiscSection";
import { TakeoffFieldMiscSection } from "./TakeoffFieldMiscSection";
import { TakeoffTotalsSection } from "./TakeoffTotalsSection";
import type { Takeoff, TakeoffMetalLine, TakeoffComponentLine, TakeoffMiscLine, TakeoffFieldMisc } from "@/lib/db-types";
import type { MaterialCatalogRow } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Takeoff | Admin | McKinados Welding & Fabrication",
  description: "Build takeoff and proposal.",
  robots: "noindex, nofollow",
};

const METAL_CATEGORY_ORDER: TakeoffMetalLine["category"][] = [
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
    { data: catalogRows },
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
    supabase.from("material_catalog").select("*").order("category").order("item_code"),
  ]);

  const metal = (metalLines ?? []) as TakeoffMetalLine[];
  const components = (componentLines ?? []) as TakeoffComponentLine[];
  const misc = (miscLines ?? []) as TakeoffMiscLine[];
  const fieldMisc = (fieldMiscLines ?? []) as TakeoffFieldMisc[];
  const catalog = (catalogRows ?? []) as MaterialCatalogRow[];
  const catalogByCategory = catalog.reduce(
    (acc, row) => {
      if (!acc[row.category]) acc[row.category] = [];
      acc[row.category].push(row);
      return acc;
    },
    {} as Record<string, MaterialCatalogRow[]>
  );
  const metalSorted = [...metal].sort(
    (a, b) =>
      METAL_CATEGORY_ORDER.indexOf(a.category) - METAL_CATEGORY_ORDER.indexOf(b.category) ||
      a.sort_order - b.sort_order
  );

  const jobWithCustomer = job as unknown as {
    id: string;
    job_name: string;
    customers: { id: string; company_name: string } | null;
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <Link href={`/admin/jobs/${jobId}`} className="text-foreground-muted hover:text-foreground">
          ← Job
        </Link>
        {jobWithCustomer.customers && (
          <Link
            href={`/admin/customers/${jobWithCustomer.customers.id}`}
            className="text-foreground-muted hover:text-foreground"
          >
            {jobWithCustomer.customers.company_name}
          </Link>
        )}
      </div>
      <h1 className="mt-4 text-2xl font-bold text-foreground">
        Takeoff / Proposal — {jobWithCustomer.job_name}
      </h1>

      <TakeoffHeaderForm takeoff={takeoff} jobId={jobId} />

      <TakeoffMetalSection
        takeoffId={takeoff.id}
        jobId={jobId}
        lines={metalSorted}
        catalogByCategory={catalogByCategory}
        categoryOrder={METAL_CATEGORY_ORDER}
      />

      <TakeoffComponentSection takeoffId={takeoff.id} jobId={jobId} lines={components} />

      <TakeoffMiscSection takeoffId={takeoff.id} jobId={jobId} lines={misc} />

      <TakeoffFieldMiscSection takeoffId={takeoff.id} jobId={jobId} lines={fieldMisc} />

      <TakeoffTotalsSection takeoff={takeoff} jobId={jobId} />
    </div>
  );
}
