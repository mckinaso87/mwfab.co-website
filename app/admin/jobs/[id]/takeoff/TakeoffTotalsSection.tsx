"use client";

import { useActionState } from "react";
import { recomputeAndSaveTotals } from "./actions";
import { formatMoney } from "./formatMoney";
import { normalizeRate, computeGalvanizerWeightCost } from "@/lib/takeoff-calculations";
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

export function TakeoffTotalsSection({ takeoff, jobId }: Props) {
  const taxPct = normalizeRate(takeoff.tax_rate, 0.07) * 100;
  const marginPct = normalizeRate(takeoff.margin_rate, 0.2) * 100;
  const marginAmt = (takeoff.grand_total ?? 0) - (takeoff.project_total ?? 0);
  const galvMode = takeoff.galv_mode ?? "not_galvanized";
  const hasWeightOverride =
    takeoff.galv_total_override != null && Number.isFinite(Number(takeoff.galv_total_override));
  const hasCostOverride =
    takeoff.galv_cost_override != null && Number.isFinite(Number(takeoff.galv_cost_override));
  const galvPct = normalizeRate(takeoff.galv_pct, 0.15);
  const galvRatePerLb =
    takeoff.galv_rate_per_lb != null &&
    Number.isFinite(Number(takeoff.galv_rate_per_lb)) &&
    Number(takeoff.galv_rate_per_lb) >= 0
      ? Number(takeoff.galv_rate_per_lb)
      : 0.5;
  const galvanizerOverrideDollars =
    galvMode === "not_galvanized"
      ? null
      : hasCostOverride
        ? Number(takeoff.galv_cost_override)
        : hasWeightOverride
          ? computeGalvanizerWeightCost(Number(takeoff.galv_total_override), galvPct, galvRatePerLb)
          : null;
  const galvAddonAmount = Number(takeoff.galv_addon_amount ?? 0);
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, __: FormData) => recomputeAndSaveTotals(takeoff.id, jobId),
    null as { error?: string } | null
  );

  const rows: { label: string; value: number }[] = [
    { label: "Materials (w/ tax)", value: takeoff.material_total_with_tax ?? 0 },
    { label: "Drawings", value: takeoff.drawings_total ?? 0 },
    { label: "Shop / Fabrication", value: takeoff.shop_total ?? 0 },
    { label: "Installation", value: takeoff.install_total ?? 0 },
    { label: "Miscellaneous", value: takeoff.misc_total ?? 0 },
    { label: "Subtotal", value: takeoff.project_total ?? 0 },
  ];

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Pricing summary</h2>
      <p className="mb-6 text-sm text-foreground-muted">Verify amounts and recalculate to update from line items.</p>

      <div className="max-w-lg rounded-lg border border-steel/50 bg-steel/10 px-4 py-3 mb-6">
        {rows.map((r) =>
          r.value > 0 || r.label === "Subtotal" ? (
            <SummaryRow key={r.label} label={r.label} value={formatMoney(r.value)} />
          ) : null
        )}
        {galvanizerOverrideDollars != null && galvanizerOverrideDollars >= 0 && (
          <SummaryRow
            label="Galvanizer (override)"
            value={formatMoney(galvanizerOverrideDollars)}
          />
        )}
        {galvMode === "optional_addon" &&
          galvanizerOverrideDollars == null &&
          galvAddonAmount > 0 && (
            <SummaryRow
              label="Galvanizer (optional add-on)"
              value={formatMoney(galvAddonAmount)}
            />
          )}
        {marginAmt > 0 && (
          <SummaryRow
            label={`Margin (${marginPct % 1 === 0 ? marginPct.toFixed(0) : marginPct.toFixed(1)}%)`}
            value={formatMoney(marginAmt)}
          />
        )}
      </div>

      <div className="rounded-xl border-2 border-steel-blue/60 bg-steel-blue/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-base font-semibold text-foreground">Grand total</span>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {formatMoney(takeoff.grand_total)}
          </span>
        </div>
        <p className="mt-2 text-xs text-foreground-muted">
          Tax on materials: {taxPct % 1 === 0 ? taxPct.toFixed(0) : taxPct.toFixed(1)}%
        </p>
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
