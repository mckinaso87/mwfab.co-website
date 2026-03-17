import Link from "next/link";
import type { Takeoff } from "@/lib/db-types";

type Props = {
  jobId: string;
  jobName: string;
  customerName: string | null;
  customerId: string | null;
  takeoff: Takeoff;
  previewHref?: string;
};

export function TakeoffWorkspaceHeader({
  jobId,
  jobName,
  customerName,
  customerId,
  takeoff,
  previewHref,
}: Props) {
  const quoteParts: string[] = [];
  if (takeoff.quote_date) quoteParts.push(takeoff.quote_date);
  if (takeoff.quoted_by?.trim()) quoteParts.push(takeoff.quoted_by.trim());
  const quoteSummary = quoteParts.length > 0 ? quoteParts.join(" · ") : null;

  return (
    <header className="rounded-xl border border-steel/50 bg-card px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href={`/admin/jobs/${jobId}`}
              className="text-foreground-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            >
              ← Job
            </Link>
            {customerId && customerName && (
              <>
                <span className="text-steel/70" aria-hidden>|</span>
                <Link
                  href={`/admin/customers/${customerId}`}
                  className="text-foreground-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                >
                  {customerName}
                </Link>
              </>
            )}
          </nav>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Takeoff / Proposal — {jobName}
          </h1>
          {quoteSummary && (
            <p className="text-sm text-foreground-muted">
              Quote: {quoteSummary}
            </p>
          )}
        </div>
        {previewHref && (
          <Link
            href={previewHref}
            className="shrink-0 rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          >
            Preview proposal
          </Link>
        )}
      </div>
    </header>
  );
}
