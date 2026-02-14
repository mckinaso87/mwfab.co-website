import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Dashboard | Admin | McKinados Welding & Fabrication",
  description: "Admin dashboard.",
  robots: "noindex, nofollow",
};

const OPEN_STATUSES = [
  "To Bid",
  "In Takeoff",
  "Under Review",
  "Proposal Ready",
  "Sent",
] as const;

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [
    { count: openBids },
    { data: jobsByStatus },
    { data: overdueJobs },
    { data: jobsPerEstimator },
    { data: recentFiles },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .in("status", [...OPEN_STATUSES]),
    supabase.from("jobs").select("status").then((r) => {
      const list = r.data ?? [];
      const counts: Record<string, number> = {};
      list.forEach((j) => {
        counts[j.status] = (counts[j.status] ?? 0) + 1;
      });
      return { data: counts };
    }),
    supabase
      .from("jobs")
      .select("id, job_name, bid_due_date, status")
      .lt("bid_due_date", new Date().toISOString().slice(0, 10))
      .in("status", [...OPEN_STATUSES])
      .order("bid_due_date", { ascending: true })
      .limit(10),
    supabase
      .from("jobs")
      .select("assigned_to")
      .not("assigned_to", "is", null)
      .then((r) => {
        const list = r.data ?? [];
        const counts: Record<string, number> = {};
        list.forEach((j) => {
          const id = j.assigned_to as string;
          counts[id] = (counts[id] ?? 0) + 1;
        });
        return { data: counts };
      }),
    supabase
      .from("job_files")
      .select("id, file_name, job_id, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const openBidsCount = openBids ?? 0;
  const statusBreakdown = jobsByStatus ?? {};
  const overdueList = overdueJobs ?? [];
  const estimatorCounts = jobsPerEstimator ?? {};
  const filesList = recentFiles ?? [];

  // Resolve user names for assigned_to and recent files (we'll show job_id for now; can join jobs for job_name)
  const { data: usersList } = await supabase.from("users").select("id, name");
  const usersById = new Map((usersList ?? []).map((u) => [u.id, u.name]));
  const jobIds = [...new Set(filesList.map((f) => f.job_id))];
  const { data: jobsForFiles } = await supabase
    .from("jobs")
    .select("id, job_name")
    .in("id", jobIds);
  const jobNameById = new Map((jobsForFiles ?? []).map((j) => [j.id, j.job_name]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-steel/50 bg-gunmetal/50 p-5">
          <p className="text-sm text-foreground-muted">Open bids</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{openBidsCount}</p>
        </div>
        <div className="rounded-xl border border-steel/50 bg-gunmetal/50 p-5">
          <p className="text-sm text-foreground-muted">Jobs by status</p>
          <ul className="mt-2 text-sm text-foreground">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <li key={status}>
                {status}: {count}
              </li>
            ))}
            {Object.keys(statusBreakdown).length === 0 && (
              <li className="text-foreground-muted">No jobs yet</li>
            )}
          </ul>
        </div>
      </div>

      <section className="mt-8 rounded-xl border border-steel/50 bg-gunmetal/30 p-5">
        <h2 className="text-lg font-semibold text-foreground">Overdue bids</h2>
        {overdueList.length === 0 ? (
          <p className="mt-2 text-sm text-foreground-muted">None</p>
        ) : (
          <ul className="mt-2 list-inside list-disc text-sm text-foreground">
            {overdueList.map((j) => (
              <li key={j.id}>
                <a href={`/admin/jobs/${j.id}`} className="hover:underline">
                  {j.job_name}
                </a>{" "}
                — due {j.bid_due_date}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-steel/50 bg-gunmetal/30 p-5">
        <h2 className="text-lg font-semibold text-foreground">Jobs per estimator</h2>
        {Object.keys(estimatorCounts).length === 0 ? (
          <p className="mt-2 text-sm text-foreground-muted">No assignments yet</p>
        ) : (
          <ul className="mt-2 list-inside list-disc text-sm text-foreground">
            {Object.entries(estimatorCounts).map(([userId, count]) => (
              <li key={userId}>
                {usersById.get(userId) ?? userId}: {count}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-steel/50 bg-gunmetal/30 p-5">
        <h2 className="text-lg font-semibold text-foreground">Recently uploaded files</h2>
        {filesList.length === 0 ? (
          <p className="mt-2 text-sm text-foreground-muted">No files yet</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {filesList.map((f) => (
              <li key={f.id}>
                <a href={`/admin/jobs/${f.job_id}`} className="hover:underline">
                  {f.file_name}
                </a>{" "}
                — {jobNameById.get(f.job_id) ?? f.job_id} ·{" "}
                {new Date(f.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
