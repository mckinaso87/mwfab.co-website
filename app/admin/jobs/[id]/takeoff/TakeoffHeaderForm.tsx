"use client";

import { useActionState } from "react";
import { updateTakeoffHeader } from "./actions";
import type { Takeoff } from "@/lib/db-types";

type Props = { takeoff: Takeoff; jobId: string };

export function TakeoffHeaderForm({ takeoff, jobId }: Props) {
  const action = updateTakeoffHeader.bind(null, takeoff.id, jobId);
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => action(formData),
    null as { error?: string } | null
  );
  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Quote header</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="quote_date" className="block text-sm font-medium text-foreground">
            Quote date
          </label>
          <input
            id="quote_date"
            name="quote_date"
            type="date"
            defaultValue={takeoff.quote_date ?? ""}
            className="input-admin"
          />
        </div>
        <div>
          <label htmlFor="quoted_by" className="block text-sm font-medium text-foreground">
            Quoted by
          </label>
          <input
            id="quoted_by"
            name="quoted_by"
            type="text"
            defaultValue={takeoff.quoted_by ?? ""}
            className="input-admin"
          />
        </div>
        <div>
          <label htmlFor="tax_rate" className="block text-sm font-medium text-foreground">
            Tax rate (e.g. 0.07)
          </label>
          <input
            id="tax_rate"
            name="tax_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={takeoff.tax_rate ?? 0.07}
            className="input-admin"
          />
        </div>
        <div>
          <label htmlFor="margin_rate" className="block text-sm font-medium text-foreground">
            Margin rate (e.g. 0.2 for 20%)
          </label>
          <input
            id="margin_rate"
            name="margin_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={takeoff.margin_rate ?? 0.2}
            className="input-admin"
          />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={takeoff.notes ?? ""}
          className="input-admin resize-y"
        />
      </div>
      <h3 className="text-sm font-semibold text-foreground">Shop labor</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="shop_labor_hours" className="block text-sm text-foreground-muted">Hours</label>
          <input
            id="shop_labor_hours"
            name="shop_labor_hours"
            type="number"
            step="0.5"
            min="0"
            defaultValue={takeoff.shop_labor_hours ?? ""}
            className="input-admin"
          />
        </div>
        <div>
          <label htmlFor="shop_labor_rate" className="block text-sm text-foreground-muted">Rate</label>
          <input
            id="shop_labor_rate"
            name="shop_labor_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={takeoff.shop_labor_rate ?? ""}
            className="input-admin"
          />
        </div>
        <div>
          <label htmlFor="shop_days_or_nights" className="block text-sm text-foreground-muted">Days/Nights</label>
          <input
            id="shop_days_or_nights"
            name="shop_days_or_nights"
            type="number"
            min="0"
            defaultValue={takeoff.shop_days_or_nights ?? ""}
            className="input-admin"
          />
        </div>
      </div>
      <div>
        <label htmlFor="shop_drawings_amount" className="block text-sm text-foreground-muted">Shop drawings amount</label>
        <input
          id="shop_drawings_amount"
          name="shop_drawings_amount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={takeoff.shop_drawings_amount ?? 0}
          className="input-admin"
        />
      </div>
      <h3 className="text-sm font-semibold text-foreground">Field labor</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="field_labor_amount" className="block text-sm text-foreground-muted">Amount (e.g. hours)</label>
          <input
            id="field_labor_amount"
            name="field_labor_amount"
            type="number"
            step="0.5"
            min="0"
            defaultValue={takeoff.field_labor_amount ?? ""}
            className="input-admin"
          />
        </div>
        <div>
          <label htmlFor="field_labor_rate" className="block text-sm text-foreground-muted">Rate</label>
          <input
            id="field_labor_rate"
            name="field_labor_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={takeoff.field_labor_rate ?? ""}
            className="input-admin"
          />
        </div>
        <div>
          <label htmlFor="field_days_or_nights" className="block text-sm text-foreground-muted">Days/Nights</label>
          <input
            id="field_days_or_nights"
            name="field_days_or_nights"
            type="number"
            min="0"
            defaultValue={takeoff.field_days_or_nights ?? ""}
            className="input-admin"
          />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button type="submit" disabled={isPending} className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50">
        {isPending ? "Saving…" : "Save header"}
      </button>
    </form>
  );
}
