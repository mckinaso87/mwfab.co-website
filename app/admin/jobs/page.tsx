import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AdminBadge,
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableHead,
  AdminDataTableHeaderCell,
  AdminDataTableRow,
  AdminEmptyState,
  AdminPageHeader,
  AdminToolbar,
} from "@/components/admin";
import { DeleteJobButton } from "./DeleteJobButton";
import type { Job } from "@/lib/db-types";
import type { Customer } from "@/lib/db-types";
import { JOB_STATUSES } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Jobs | Admin | McKinados Welding & Fabrication",
  description: "Manage jobs.",
  robots: "noindex, nofollow",
};

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("jobs")
    .select(
      `
      id,
      job_name,
      description,
      bid_due_date,
      status,
      assigned_to,
      created_at,
      updated_at,
      customer_id,
      customers ( company_name )
    `
    )
    .order("bid_due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filterStatus) {
    query = query.eq("status", filterStatus);
  }

  const { data: rows } = await query;
  type JobRow = Job & { customers: { company_name: string } | null };
  const jobs = (rows ?? []) as unknown as JobRow[];

  const { data: usersList } = await supabase.from("users").select("id, name");
  const usersById = new Map((usersList ?? []).map((u) => [u.id, u.name]));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Jobs"
        subtitle="Open a job to build a takeoff and proposal (quote totals)."
        actions={
          <Link
            href="/admin/jobs/new"
            className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          >
            New job
          </Link>
        }
      />

      <AdminToolbar>
        <Link
          href="/admin/jobs"
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
            !filterStatus
              ? "bg-steel-blue text-foreground"
              : "bg-steel/50 text-foreground-muted hover:text-foreground"
          }`}
        >
          All
        </Link>
        {JOB_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/jobs?status=${encodeURIComponent(s)}`}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal ${
              filterStatus === s
                ? "bg-steel-blue text-foreground"
                : "bg-steel/50 text-foreground-muted hover:text-foreground"
            }`}
          >
            {s}
          </Link>
        ))}
      </AdminToolbar>

      {jobs.length === 0 ? (
        <AdminEmptyState
          message="No jobs yet."
          actionLabel="Create your first job"
          actionHref="/admin/jobs/new"
        />
      ) : (
        <AdminDataTable stickyHeader>
          <AdminDataTableHead>
            <AdminDataTableHeaderCell>Job</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Customer</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Status</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Due</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Assigned</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Actions</AdminDataTableHeaderCell>
          </AdminDataTableHead>
          <AdminDataTableBody>
            {jobs.map((j) => (
              <AdminDataTableRow key={j.id}>
                <AdminDataTableCell>
                  <Link
                    href={`/admin/jobs/${j.id}`}
                    className="font-medium text-foreground hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    {j.job_name}
                  </Link>
                </AdminDataTableCell>
                <AdminDataTableCell className="text-foreground-muted">
                  <Link
                    href={`/admin/customers/${j.customer_id}`}
                    className="hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    {j.customers?.company_name ?? "—"}
                  </Link>
                </AdminDataTableCell>
                <AdminDataTableCell>
                  <AdminBadge variant="muted">{j.status}</AdminBadge>
                </AdminDataTableCell>
                <AdminDataTableCell className="text-foreground-muted">
                  {j.bid_due_date ?? "—"}
                </AdminDataTableCell>
                <AdminDataTableCell className="text-foreground-muted">
                  {j.assigned_to
                    ? usersById.get(j.assigned_to) ?? j.assigned_to
                    : "—"}
                </AdminDataTableCell>
                <AdminDataTableCell align="right">
                  <span className="flex justify-end items-center gap-3">
                    <Link
                      href={`/admin/jobs/${j.id}/takeoff`}
                      className="rounded-lg border border-steel/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                    >
                      Proposal
                    </Link>
                    <Link
                      href={`/admin/jobs/${j.id}`}
                      className="rounded-lg border border-steel/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                    >
                      Edit
                    </Link>
                    <DeleteJobButton jobId={j.id} jobName={j.job_name} variant="list" />
                  </span>
                </AdminDataTableCell>
              </AdminDataTableRow>
            ))}
          </AdminDataTableBody>
        </AdminDataTable>
      )}
    </div>
  );
}
