import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Open a job to build a takeoff and proposal (quote totals).
          </p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel"
        >
          New job
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/jobs"
          className={`rounded-lg px-3 py-2 text-sm transition-colors ${
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
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              filterStatus === s
                ? "bg-steel-blue text-foreground"
                : "bg-steel/50 text-foreground-muted hover:text-foreground"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-steel/50 bg-gunmetal/50 p-12 text-center">
          <p className="text-foreground-muted">No jobs yet.</p>
          <Link
            href="/admin/jobs/new"
            className="mt-4 inline-block rounded-lg bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel"
          >
            Create your first job
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-steel/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-steel/50 bg-gunmetal/80 text-left">
                  <th className="px-4 py-3 font-medium text-foreground-muted">Job</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Customer</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Status</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Due</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Assigned</th>
                  <th className="w-24 px-4 py-3 font-medium text-foreground-muted text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr
                    key={j.id}
                    className="border-b border-steel/30 transition-colors last:border-0 hover:bg-steel/20"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/jobs/${j.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {j.job_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      <Link
                        href={`/admin/customers/${j.customer_id}`}
                        className="hover:underline"
                      >
                        {j.customers?.company_name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">{j.status}</td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {j.bid_due_date ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {j.assigned_to
                        ? usersById.get(j.assigned_to) ?? j.assigned_to
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex justify-end gap-3">
                        <Link
                          href={`/admin/jobs/${j.id}/takeoff`}
                          className="text-sm text-steel-blue hover:underline"
                        >
                          Proposal
                        </Link>
                        <Link
                          href={`/admin/jobs/${j.id}`}
                          className="text-sm text-steel-blue hover:underline"
                        >
                          Edit
                        </Link>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
