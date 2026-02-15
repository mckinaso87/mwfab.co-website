"use client";

import { useActionState, useEffect, useState } from "react";
import { upsertComponentLine, deleteComponentLineForm } from "./actions";
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

  return (
    <section className="mt-8 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Components</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {lines.map((line) => (
          <li key={line.id} className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
            <span className="font-medium">{line.display_name}</span>
            <span>Count: {line.count}</span>
            <span>${Number(line.total_price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            <form
              action={async (fd: FormData) => {
                await deleteAction(line.id)(fd);
              }}
              className="inline"
            >
              <button type="submit" className="text-red-500 hover:underline">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
      <form
        action={(formData) => {
          formAction(formData);
          resetForm();
        }}
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input type="hidden" name="sort_order" value={lines.length} />
        <div>
          <label htmlFor="comp_display_name" className="block text-sm text-foreground-muted">Name</label>
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
          <label htmlFor="comp_count" className="block text-sm text-foreground-muted">Count</label>
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
          <label htmlFor="comp_total_pounds_per_piece" className="block text-sm text-foreground-muted">Total pounds per piece</label>
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
          <label htmlFor="comp_total_pounds" className="block text-sm text-foreground-muted">Total pounds</label>
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
          <label htmlFor="comp_cost_per_measure" className="block text-sm text-foreground-muted">Cost per measure ($)</label>
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
          <label htmlFor="comp_total_price" className="block text-sm text-foreground-muted">Total price (auto)</label>
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
