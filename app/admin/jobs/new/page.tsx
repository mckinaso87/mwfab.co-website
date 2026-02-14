import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrUpdateJob } from "../actions";
import { JobForm } from "../JobForm";
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
    <div>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/jobs"
          className="text-foreground-muted hover:text-foreground"
        >
          ← Jobs
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-foreground">New job</h1>
      <JobForm
        action={createOrUpdateJob}
        customers={(customers ?? []) as Customer[]}
        users={users ?? []}
      />
    </div>
  );
}
