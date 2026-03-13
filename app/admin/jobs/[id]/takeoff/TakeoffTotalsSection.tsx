"use client";

import { useActionState } from "react";
import { recomputeAndSaveTotals } from "./actions";
import { formatMoney } from "./formatMoney";
import type { Takeoff } from "@/lib/db-types";

type Props = { takeoff: Takeoff; jobId: string };

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-steel/30 last:border-0">
      <span className="text-sm text-foreground-muted">{label}</span>
      <span className="text-sm tabular-nums font-medium text-foreground">{value}</span>
    </div>
  );
}

function SummaryBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-steel/50 bg-steel/10 px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">{title}</h3>
      {children}
    </div>
  );
}

export function TakeoffTotalsSection({ takeoff, jobId }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, __: FormData) => recomputeAndSaveTotals(takeoff.id, jobId),
    null as { error?: string } | null
  );

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Pricing summary</h2>
      <p className="mb-6 text-sm text-foreground-muted">Verify amounts and recalculate to update from line items.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryBlock title="Materials">
          <SummaryRow label="Metal subtotal" value={formatMoney(takeoff.metal_subtotal)} />
          <SummaryRow label="Other material" value={formatMoney(takeoff.other_material_subtotal)} />
          <SummaryRow label="All material" value={formatMoney(takeoff.all_material_subtotal)} />
        </SummaryBlock>

        <SummaryBlock title="Tax">
          <SummaryRow label="Tax total" value={formatMoney(takeoff.tax_total)} />
          <SummaryRow label="Material w/ tax" value={formatMoney(takeoff.material_total_with_tax)} />
        </SummaryBlock>

        <SummaryBlock title="Labor">
          <SummaryRow label="Shop total" value={formatMoney(takeoff.shop_total)} />
          <SummaryRow label="Field total" value={formatMoney(takeoff.field_total)} />
          <SummaryRow label="Project total" value={formatMoney(takeoff.project_total)} />
        </SummaryBlock>
      </div>

      <div className="mt-6 rounded-xl border-2 border-steel-blue/60 bg-steel-blue/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-base font-semibold text-foreground">Grand total</span>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {formatMoney(takeoff.grand_total)}
          </span>
        </div>
      </div>

      <form action={formAction} className="mt-6">
        {state?.error && (
          <p className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          {isPending ? "Recalculating…" : "Recalculate totals"}
        </button>
      </form>
    </section>
  );
}
