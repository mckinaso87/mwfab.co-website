"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upsertComponentLine, deleteComponentLineForm } from "./actions";
import { formatMoney } from "./formatMoney";
import type { TakeoffComponentLine } from "@/lib/db-types";

type Props = {
  takeoffId: string;
  jobId: string;
  lines: TakeoffComponentLine[];
};

export function TakeoffComponentSection({
  takeoffId,
  jobId,
  lines,
}: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) =>
      upsertComponentLine(takeoffId, jobId, formData),
    null as { error?: string } | null
  );
  const deleteAction = (lineId: string) =>
    deleteComponentLineForm.bind(null, takeoffId, lineId, jobId);

  const [displayName, setDisplayName] = useState("");
  const [count, setCount] = useState(1);
  const [totalPoundsPerPiece, setTotalPoundsPerPiece] = useState<string>("");
  const [totalPounds, setTotalPounds] = useState<string>("");
  const [costPerMeasure, setCostPerMeasure] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState<string>("");

  useEffect(() => {
    const cnt = count;
    const pp = parseFloat(totalPoundsPerPiece);
    const lbs = parseFloat(totalPounds);
    const cost = parseFloat(costPerMeasure);
    const effectivePounds = Number.isFinite(lbs) && lbs > 0
      ? lbs
      : Number.isFinite(pp) && pp > 0 && cnt > 0
        ? cnt * pp
        : 0;
    if (Number.isFinite(cost) && effectivePounds > 0) {
      setTotalPrice((effectivePounds * cost).toFixed(2));
    } else {
      setTotalPrice("");
    }
  }, [count, totalPoundsPerPiece, totalPounds, costPerMeasure]);

  const resetForm = () => {
    setDisplayName("");
    setCount(1);
    setTotalPoundsPerPiece("");
    setTotalPounds("");
    setCostPerMeasure("");
    setTotalPrice("");
  };

  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Components</h2>
      <p className="mb-4 text-sm text-foreground-muted">Component line items by count and weight.</p>

      {lines.length > 0 ? (
        <div className="overflow-x-auto border border-steel/50 rounded-lg mb-6">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="border-b border-steel/50 bg-steel/20">
                <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Count</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Total</th>
                <th className="px-4 py-3 text-right font-medium text-foreground w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-steel/30 hover:bg-steel/10">
                  <td className="px-4 py-2.5 font-medium text-foreground">{line.display_name}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{line.count}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">{formatMoney(line.total_price)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <form
                      action={async (fd: FormData) => {
                        await deleteAction(line.id)(fd);
                        router.refresh();
                      }}
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="text-red-400 hover:text-red-300 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-6 text-sm text-foreground-muted">No component lines yet. Add one below.</p>
      )}

      <h3 className="mb-3 text-sm font-semibold text-foreground">Add component line</h3>
      <form
        action={async (formData) => {
          await formAction(formData);
          router.refresh();
          resetForm();
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input type="hidden" name="sort_order" value={lines.length} />
        <div>
          <label htmlFor="comp_display_name" className={labelClass}>Name</label>
          <input
            id="comp_display_name"
            name="display_name"
            type="text"
            className="input-admin"
            placeholder="e.g. Anchor bolts"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="comp_count" className={labelClass}>Count</label>
          <input
            id="comp_count"
            name="count"
            type="number"
            step="1"
            min="0"
            className="input-admin"
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <label htmlFor="comp_total_pounds_per_piece" className={labelClass}>Total pounds per piece</label>
          <input
            id="comp_total_pounds_per_piece"
            name="total_pounds_per_piece"
            type="number"
            step="0.01"
            min="0"
            className="input-admin"
            value={totalPoundsPerPiece}
            onChange={(e) => setTotalPoundsPerPiece(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="comp_total_pounds" className={labelClass}>Total pounds</label>
          <input
            id="comp_total_pounds"
            name="total_pounds"
            type="number"
            step="0.01"
            min="0"
            className="input-admin"
            value={totalPounds}
            onChange={(e) => setTotalPounds(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="comp_cost_per_measure" className={labelClass}>Cost per measure ($)</label>
          <input
            id="comp_cost_per_measure"
            name="cost_per_measure"
            type="number"
            step="0.01"
            min="0"
            className="input-admin"
            value={costPerMeasure}
            onChange={(e) => setCostPerMeasure(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="comp_total_price" className={labelClass}>Total price (auto)</label>
          <input
            id="comp_total_price"
            name="total_price"
            type="number"
            step="0.01"
            min="0"
            readOnly
            className="input-admin bg-steel/30"
            value={totalPrice}
            title="Auto: total pounds × cost per measure"
          />
        </div>
        {state?.error && <p className="col-span-full text-sm text-red-500">{state.error}</p>}
        <div className="col-span-full">
          <button type="submit" disabled={isPending} className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50">
            {isPending ? "Adding…" : "Add component"}
          </button>
        </div>
      </form>
    </section>
  );
}
