"use client";

import { useActionState } from "react";
import { pushEstimateToQbo } from "./actions";

export function PushEstimateToQboForm({
  jobId,
  disabled,
  disabledReason,
}: {
  jobId: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown) => pushEstimateToQbo(jobId),
    null as {
      error?: string;
      success?: boolean;
      estimateUrl?: string;
      estimateId?: string;
    } | null
  );

  return (
    <section className="admin-card admin-card-accent-top rounded-xl border p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Push to QuickBooks</h2>
      <p className="mb-6 text-sm text-foreground-muted">
        Create or update a QBO Estimate from this takeoff. Customer must sync to QuickBooks first.
      </p>
      {disabled && disabledReason && (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {disabledReason}
        </p>
      )}
      <form action={formAction}>
        {state?.error && (
          <p className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </p>
        )}
        {state?.success && (
          <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            <p>Estimate synced to QuickBooks.</p>
            {state.estimateUrl && (
              <a
                href={state.estimateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-medium text-admin-teal underline"
              >
                Open estimate in QuickBooks →
              </a>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={isPending || disabled}
          className="btn-admin-primary rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Pushing…" : "Push estimate to QuickBooks"}
        </button>
      </form>
    </section>
  );
}
