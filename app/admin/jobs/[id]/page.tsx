import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrUpdateJob } from "../actions";
import { JobForm } from "../JobForm";
import { JobFileUpload } from "../JobFileUpload";
import { DeleteJobFileButton } from "../DeleteJobFileButton";
import { DeleteJobButton } from "../DeleteJobButton";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import type { Job, JobFile, JobStatusHistory } from "@/lib/db-types";
import type { Customer } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Job | Admin | McKinados Welding & Fabrication",
  description: "Job detail.",
  robots: "noindex, nofollow",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(
      `
      *,
      customers ( id, company_name )
    `
    )
    .eq("id", id)
    .single();

  if (!job) notFound();
  const j = job as Job & { customers: { id: string; company_name: string } | null };

  const [
    { data: customers },
    { data: users },
    { data: files },
    { data: history },
  ] = await Promise.all([
    supabase.from("customers").select("*").order("company_name", { ascending: true }),
    supabase.from("users").select("id, name").order("name", { ascending: true }),
    supabase.from("job_files").select("*").eq("job_id", id).order("created_at", { ascending: false }),
    supabase
      .from("job_status_history")
      .select("*")
      .eq("job_id", id)
      .order("timestamp", { ascending: false })
      .limit(20),
  ]);

  const filesList = (files ?? []) as JobFile[];
  const historyList = (history ?? []) as JobStatusHistory[];

  const filesWithUrls = await Promise.all(
    filesList.map(async (f) => {
      const { data } = await supabase.storage
        .from("job-files")
        .createSignedUrl(f.file_url, 3600);
      return { ...f, signedUrl: data?.signedUrl ?? f.file_url };
    })
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/jobs"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          ← Jobs
        </Link>
        {j.customers && (
          <Link
            href={`/admin/customers/${j.customers.id}`}
            className="text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          >
            {j.customers.company_name}
          </Link>
        )}
      </div>

      <AdminPageHeader
        title={j.job_name}
        actions={
          <span className="flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/jobs/${id}/takeoff`}
              className="inline-flex items-center gap-2 rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            >
              Takeoff / Proposal →
            </Link>
            <DeleteJobButton jobId={id} jobName={j.job_name} variant="detail" />
          </span>
        }
      />

      <AdminSectionCard title="Edit job">
        <JobForm
          action={createOrUpdateJob}
          job={j}
          customers={(customers ?? []) as Customer[]}
          users={users ?? []}
        />
      </AdminSectionCard>

      <AdminSectionCard title="Job files">
        {filesWithUrls.length === 0 ? (
          <p className="text-sm text-foreground-muted">No files yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-foreground">
            {filesWithUrls.map((f) => (
              <li key={f.id} className="flex items-center gap-3">
                <a
                  href={f.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                >
                  {f.file_name}
                </a>
                <span className="text-foreground-muted">
                  {new Date(f.created_at).toLocaleString()}
                </span>
                <DeleteJobFileButton fileId={f.id} jobId={id} storagePath={f.file_url} />
              </li>
            ))}
          </ul>
        )}
        <JobFileUpload jobId={id} />
      </AdminSectionCard>

      <AdminSectionCard title="Status history">
        {historyList.length === 0 ? (
          <p className="text-sm text-foreground-muted">No status changes yet.</p>
        ) : (
          <ul className="space-y-1 text-sm text-foreground-muted">
            {historyList.map((h) => (
              <li key={h.id}>
                {h.previous_status ?? "—"} → {h.new_status} at{" "}
                {new Date(h.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </AdminSectionCard>
    </div>
  );
}
