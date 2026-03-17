"use client";

import { useActionState } from "react";
import { sendProposal } from "./actions";
import type { ProposalData } from "./loadProposalData";

const labelClass = "block text-sm font-medium text-foreground";

export function SendProposalForm({
  jobId,
  data,
}: {
  jobId: string;
  data: ProposalData;
}) {
  const defaultTo = data.job.customers?.email ?? "";
  const defaultSubject = `Proposal: ${data.job.job_name} – McKinados Welding & Fabrication`;

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, fd: FormData) => sendProposal(jobId, fd),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Send proposal</h2>
      <p className="mb-6 text-sm text-foreground-muted">
        Email this proposal to the client. The proposal will be stored on the customer profile.
      </p>
      <form action={formAction} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="proposal-to" className={labelClass}>
            To
          </label>
          <input
            id="proposal-to"
            name="to"
            type="email"
            required
            defaultValue={defaultTo}
            placeholder="client@example.com"
            className="input-admin"
          />
        </div>
        <div>
          <label htmlFor="proposal-subject" className={labelClass}>
            Subject (optional)
          </label>
          <input
            id="proposal-subject"
            name="subject"
            type="text"
            defaultValue={defaultSubject}
            className="input-admin"
          />
        </div>
        {state?.error && (
          <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            Proposal sent.
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          {isPending ? "Sending…" : "Send proposal"}
        </button>
      </form>
    </section>
  );
}
