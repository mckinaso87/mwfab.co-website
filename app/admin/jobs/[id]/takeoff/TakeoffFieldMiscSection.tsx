"use client";

import { useActionState, useEffect, useState } from "react";
import { upsertFieldMiscLine, deleteFieldMiscLineForm } from "./actions";
import type { TakeoffFieldMisc } from "@/lib/db-types";

type Props = {
  takeoffId: string;
  jobId: string;
  lines: TakeoffFieldMisc[];
};

export function TakeoffFieldMiscSection({
  takeoffId,
  jobId,
  lines,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) =>
      upsertFieldMiscLine(takeoffId, jobId, formData),
    null as { error?: string } | null
  );
  const deleteAction = (lineId: string) =>
    deleteFieldMiscLineForm.bind(null, takeoffId, lineId, jobId);

  const [amount, setAmount] = useState<string>("");
  const [pricePer, setPricePer] = useState<string>("");
  const [total, setTotal] = useState<string>("");

  useEffect(() => {
    const a = parseFloat(amount);
    const p = parseFloat(pricePer);
    if (Number.isFinite(a) && Number.isFinite(p)) {
      setTotal((a * p).toFixed(2));
    } else {
      setTotal("");
    }
  }, [amount, pricePer]);

  const resetForm = () => {
    setAmount("");
    setPricePer("");
    setTotal("");
  };

  return (
    <section className="mt-8 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Field – Miscellaneous</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {lines.map((line) => (
          <li key={line.id} className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
            <span className="font-medium">{line.label}</span>
            <span>${Number(line.total ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
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
          <label htmlFor="field_misc_label" className="block text-sm text-foreground-muted">Label</label>
          <select id="field_misc_label" name="label" className="input-admin">
            <option value="Rental - Crane">Rental - Crane</option>
            <option value="w/ $200.00 - Fuel Deposit">Fuel Deposit</option>
            <option value="Transportation">Transportation</option>
            <option value="Per Diem (Meals)">Per Diem (Meals)</option>
            <option value="Lodging">Lodging</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="field_misc_amount" className="block text-sm text-foreground-muted">Amount</label>
          <input
            id="field_misc_amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            className="input-admin"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="field_misc_price_per" className="block text-sm text-foreground-muted">Price per</label>
          <input
            id="field_misc_price_per"
            name="price_per"
            type="number"
            step="0.01"
            min="0"
            className="input-admin"
            value={pricePer}
            onChange={(e) => setPricePer(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="field_misc_hrs_days_nights" className="block text-sm text-foreground-muted">Hr, Days, or Nights</label>
          <input id="field_misc_hrs_days_nights" name="hrs_days_nights" type="text" className="input-admin" placeholder="e.g. 1" />
        </div>
        <div>
          <label htmlFor="field_misc_total" className="block text-sm text-foreground-muted">Total (auto)</label>
          <input
            id="field_misc_total"
            name="total"
            type="number"
            step="0.01"
            min="0"
            readOnly
            className="input-admin bg-steel/30"
            value={total}
            title="Amount × price per"
          />
        </div>
        {state?.error && <p className="col-span-full text-sm text-red-500">{state.error}</p>}
        <div className="col-span-full">
          <button type="submit" disabled={isPending} className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50">
            {isPending ? "Adding…" : "Add field misc"}
          </button>
        </div>
      </form>
    </section>
  );
}
