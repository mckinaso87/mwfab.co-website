"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { upsertMiscLine, deleteMiscLineForm } from "./actions";
import { formatMoney } from "./formatMoney";
import type { TakeoffMiscLine } from "@/lib/db-types";

const GALV_PCT = 0.15;
const GALV_RATE = 0.5;
const GALV_CAP = 750;

type Props = {
  takeoffId: string;
  jobId: string;
  lines: TakeoffMiscLine[];
};

export function TakeoffMiscSection({
  takeoffId,
  jobId,
  lines,
}: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) =>
      upsertMiscLine(takeoffId, jobId, formData),
    null as { error?: string } | null
  );
  const deleteAction = (lineId: string) =>
    deleteMiscLineForm.bind(null, takeoffId, lineId, jobId);

  const [label, setLabel] = useState("Galvanizer");
  const [amount, setAmount] = useState<string>("");
  const [weightOfGalv, setWeightOfGalv] = useState<string>("");
  const [pricePer, setPricePer] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState<string>("");

  useEffect(() => {
    if (/galvanizer/i.test(label)) {
      const lbs = parseFloat(weightOfGalv);
      if (Number.isFinite(lbs) && lbs > 0) {
        const t = Math.min(lbs * GALV_PCT * GALV_RATE, GALV_CAP);
        setTotalPrice(t.toFixed(2));
      } else {
        setTotalPrice("");
      }
    } else {
      const a = parseFloat(amount);
      const p = parseFloat(pricePer);
      if (Number.isFinite(a) && Number.isFinite(p)) {
        setTotalPrice((a * p).toFixed(2));
      } else {
        setTotalPrice("");
      }
    }
  }, [label, amount, weightOfGalv, pricePer]);

  const resetForm = () => {
    setAmount("");
    setWeightOfGalv("");
    setPricePer("");
    setTotalPrice("");
  };

  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Materials – Miscellaneous</h2>
      <p className="mb-4 text-sm text-foreground-muted">
        Galvanizer: LBs × 15% × $0.50, cap $750.
      </p>

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
        <p className="mb-6 text-sm text-foreground-muted">No misc lines yet. Add one below.</p>
      )}

      <h3 className="mb-3 text-sm font-semibold text-foreground">Add misc line</h3>
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
          <label htmlFor="misc_label" className={labelClass}>Label</label>
          <select
            id="misc_label"
            name="label"
            className="input-admin"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          >
            <option value="Galvanizer">Galvanizer</option>
            <option value="Galvanization Delivery">Galvanization Delivery</option>
            <option value="Gray Primer Paint (per Gallon - estimate)">Gray Primer Paint</option>
            <option value="Concrete (for filled columns)">Concrete</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="misc_amount" className={labelClass}>Amount</label>
          <input
            id="misc_amount"
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
          <label htmlFor="misc_weight_of_galv" className={labelClass}>Weight of Galv. (LBs)</label>
          <input
            id="misc_weight_of_galv"
            name="weight_of_galv"
            type="number"
            step="0.01"
            min="0"
            className="input-admin"
            placeholder="For Galvanizer formula"
            value={weightOfGalv}
            onChange={(e) => setWeightOfGalv(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="misc_price_per" className={labelClass}>Price per</label>
          <input
            id="misc_price_per"
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
          <label htmlFor="misc_total_price" className={labelClass}>Total price (auto)</label>
          <input
            id="misc_total_price"
            name="total_price"
            type="number"
            step="0.01"
            min="0"
            readOnly
            className="input-admin bg-steel/30"
            value={totalPrice}
            title="Galvanizer: formula; others: amount × price per"
          />
        </div>
        {state?.error && <p className="col-span-full text-sm text-red-500">{state.error}</p>}
        <div className="col-span-full">
          <button type="submit" disabled={isPending} className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50">
            {isPending ? "Adding…" : "Add misc line"}
          </button>
        </div>
      </form>
    </section>
  );
}
