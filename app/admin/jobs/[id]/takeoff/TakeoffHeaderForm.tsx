"use client";

import { useActionState } from "react";
import { updateTakeoffHeader } from "./actions";
import { AdminFormSection } from "@/components/admin";
import type { Takeoff } from "@/lib/db-types";

type Props = { takeoff: Takeoff; jobId: string };

const labelClass = "block text-sm font-medium text-foreground";

export function TakeoffHeaderForm({ takeoff, jobId }: Props) {
  const action = updateTakeoffHeader.bind(null, takeoff.id, jobId);
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => action(formData),
    null as { error?: string } | null
  );

  return (
    <form
      action={formAction}
      className="rounded-xl border border-steel/50 bg-card p-6 space-y-8"
    >
      <div className="flex items-center justify-between gap-4 border-b border-steel/50 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Quote settings</h2>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          {isPending ? "Saving…" : "Save header"}
        </button>
      </div>

      <AdminFormSection
        title="Quote details"
        description="Date, preparer, tax and margin rates."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="quote_date" className={labelClass}>
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
            <label htmlFor="quoted_by" className={labelClass}>
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
            <label htmlFor="tax_rate" className={labelClass}>
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
            <label htmlFor="margin_rate" className={labelClass}>
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
          <label htmlFor="notes" className={labelClass}>
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
      </AdminFormSection>

      <AdminFormSection
        title="Shop labor"
        description="Hours, rate, days/nights, and drawings."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="shop_labor_hours" className={labelClass}>
              Hours
            </label>
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
            <label htmlFor="shop_labor_rate" className={labelClass}>
              Rate ($)
            </label>
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
            <label htmlFor="shop_days_or_nights" className={labelClass}>
              Days/Nights
            </label>
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
          <label htmlFor="shop_drawings_amount" className={labelClass}>
            Shop drawings amount ($)
          </label>
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
      </AdminFormSection>

      <AdminFormSection
        title="Field labor"
        description="Amount, rate, and days/nights."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="field_labor_amount" className={labelClass}>
              Amount (e.g. hours)
            </label>
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
            <label htmlFor="field_labor_rate" className={labelClass}>
              Rate ($)
            </label>
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
            <label htmlFor="field_days_or_nights" className={labelClass}>
              Days/Nights
            </label>
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
      </AdminFormSection>

      {state?.error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
    </form>
  );
}
