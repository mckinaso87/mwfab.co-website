import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrUpdateJob } from "../actions";
import { JobForm } from "../JobForm";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import type { Customer } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "New job | Admin | McKinados Welding & Fabrication",
  description: "Add a job.",
  robots: "noindex, nofollow",
};

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string }>;
}) {
  const { customer_id: preselectedCustomerId } = await searchParams;
  const supabase = createAdminClient();
  const [
    { data: customers },
    { data: users },
  ] = await Promise.all([
    supabase.from("customers").select("*").order("company_name", { ascending: true }),
    supabase.from("users").select("id, name").order("name", { ascending: true }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/jobs"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          ← Jobs
        </Link>
      </div>
      <AdminPageHeader
        title="New job"
        subtitle="After saving, you'll be taken back to the jobs list."
      />
      <AdminSectionCard>
        <JobForm
          action={createOrUpdateJob}
          customers={(customers ?? []) as Customer[]}
          users={users ?? []}
        />
      </AdminSectionCard>
    </div>
  );
}
