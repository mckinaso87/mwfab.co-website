"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upsertFieldMiscLine, deleteFieldMiscLineForm } from "./actions";
import { formatMoney } from "./formatMoney";
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
  const router = useRouter();
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

  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Field – Miscellaneous</h2>
      <p className="mb-4 text-sm text-foreground-muted">Field costs: crane, transport, per diem, lodging, etc.</p>

      {lines.length > 0 ? (
        <div className="overflow-x-auto border border-steel/50 rounded-lg mb-6">
          <table className="w-full min-w-[360px] text-sm">
            <thead>
              <tr className="border-b border-steel/50 bg-steel/20">
                <th className="px-4 py-3 text-left font-medium text-foreground">Label</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Total</th>
                <th className="px-4 py-3 text-right font-medium text-foreground w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-steel/30 hover:bg-steel/10">
                  <td className="px-4 py-2.5 font-medium text-foreground">{line.label}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">{formatMoney(line.total)}</td>
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
        <p className="mb-6 text-sm text-foreground-muted">No field misc lines yet. Add one below.</p>
      )}

      <h3 className="mb-3 text-sm font-semibold text-foreground">Add field misc line</h3>
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
          <label htmlFor="field_misc_label" className={labelClass}>Label</label>
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
          <label htmlFor="field_misc_amount" className={labelClass}>Amount</label>
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
          <label htmlFor="field_misc_price_per" className={labelClass}>Price per</label>
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
          <label htmlFor="field_misc_hrs_days_nights" className={labelClass}>Hr, Days, or Nights</label>
          <input id="field_misc_hrs_days_nights" name="hrs_days_nights" type="text" className="input-admin" placeholder="e.g. 1" />
        </div>
        <div>
          <label htmlFor="field_misc_total" className={labelClass}>Total (auto)</label>
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
