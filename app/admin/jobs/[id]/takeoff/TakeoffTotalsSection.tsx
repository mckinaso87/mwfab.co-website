"use client";

import { useActionState } from "react";
import { recomputeAndSaveTotals } from "./actions";
import type { Takeoff } from "@/lib/db-types";

type Props = { takeoff: Takeoff; jobId: string };

export function TakeoffTotalsSection({ takeoff, jobId }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, __: FormData) => recomputeAndSaveTotals(takeoff.id, jobId),
    null as { error?: string } | null
  );
  const fmt = (n: number | null | undefined) =>
    n != null && Number.isFinite(n) ? `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—";
  return (
    <section className="mt-8 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Totals</h2>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div><span className="text-foreground-muted">Metal subtotal</span><br />{fmt(takeoff.metal_subtotal)}</div>
        <div><span className="text-foreground-muted">Other material subtotal</span><br />{fmt(takeoff.other_material_subtotal)}</div>
        <div><span className="text-foreground-muted">All material</span><br />{fmt(takeoff.all_material_subtotal)}</div>
        <div><span className="text-foreground-muted">Tax total</span><br />{fmt(takeoff.tax_total)}</div>
        <div><span className="text-foreground-muted">Material w/ tax</span><br />{fmt(takeoff.material_total_with_tax)}</div>
        <div><span className="text-foreground-muted">Shop total</span><br />{fmt(takeoff.shop_total)}</div>
        <div><span className="text-foreground-muted">Field total</span><br />{fmt(takeoff.field_total)}</div>
        <div><span className="text-foreground-muted">Project total</span><br />{fmt(takeoff.project_total)}</div>
        <div><span className="font-medium text-foreground">Grand total</span><br />{fmt(takeoff.grand_total)}</div>
      </div>
      <form action={formAction} className="mt-4">
        {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
        <button type="submit" disabled={isPending} className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50">
          {isPending ? "Recalculating…" : "Recalculate totals"}
        </button>
      </form>
    </section>
  );
}
