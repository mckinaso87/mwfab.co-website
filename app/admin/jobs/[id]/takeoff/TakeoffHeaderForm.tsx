"use client";

import { useActionState, useState } from "react";
import { updateTakeoffHeader } from "./actions";
import { AdminFormSection } from "@/components/admin";
import type { Takeoff } from "@/lib/db-types";

type StaffMember = { id: string; name: string | null };
type Props = { takeoff: Takeoff; jobId: string; staff: StaffMember[] };

const labelClass = "block text-sm font-medium text-foreground";

export function TakeoffHeaderForm({ takeoff, jobId, staff }: Props) {
  const staffNames = staff
    .map((s) => s.name?.trim())
    .filter((n): n is string => !!n)
    .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
  const currentQuotedBy = takeoff.quoted_by?.trim() || "";
  const quotedByOptions = [...new Set(staffNames)];
  if (currentQuotedBy && !quotedByOptions.includes(currentQuotedBy)) {
    quotedByOptions.push(currentQuotedBy);
    quotedByOptions.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
  }
  const action = updateTakeoffHeader.bind(null, takeoff.id, jobId);
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => action(formData),
    null as { error?: string } | null
  );
  const initialGalvMode = takeoff.galv_mode ?? "not_galvanized";
  const [galvMode, setGalvMode] = useState(initialGalvMode);
  const galvPctDisplay =
    (takeoff.galv_pct ?? 0.15) > 1
      ? takeoff.galv_pct ?? 15
      : (takeoff.galv_pct ?? 0.15) * 100;
  const galvRateDisplay = takeoff.galv_rate_per_lb ?? 0.5;

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
            <select
              id="quoted_by"
              name="quoted_by"
              className="input-admin"
              defaultValue={currentQuotedBy || undefined}
            >
              <option value="">Select staff…</option>
              {quotedByOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-foreground-muted">Staff member who prepared the quote (from Staff list).</p>
          </div>
          <div>
            <label htmlFor="tax_rate" className={labelClass}>
              Tax rate (%)
            </label>
            <input
              id="tax_rate"
              name="tax_rate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              defaultValue={
                (takeoff.tax_rate ?? 0.07) > 1
                  ? takeoff.tax_rate
                  : (takeoff.tax_rate ?? 0.07) * 100
              }
              className="input-admin"
            />
            <p className="mt-1 text-xs text-foreground-muted">Florida default 7% (matches spreadsheet).</p>
          </div>
          <div>
            <label htmlFor="margin_rate" className={labelClass}>
              Margin rate (%)
            </label>
            <input
              id="margin_rate"
              name="margin_rate"
              type="number"
              step="1"
              min="0"
              max="100"
              defaultValue={
                (takeoff.margin_rate ?? 0.2) > 1
                  ? takeoff.margin_rate
                  : (takeoff.margin_rate ?? 0.2) * 100
              }
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
        title="Galvanization & plate"
        description="Galvanization pricing mode and plate default cost. Scope is set per line item."
      >
        <fieldset className="space-y-2">
          <legend className={labelClass}>Galvanization</legend>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="galv_mode"
              value="not_galvanized"
              checked={galvMode === "not_galvanized"}
              onChange={() => setGalvMode("not_galvanized")}
            />
            None
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="galv_mode"
              value="baked_in"
              checked={galvMode === "baked_in"}
              onChange={() => setGalvMode("baked_in")}
            />
            Included in total
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="galv_mode"
              value="optional_addon"
              checked={galvMode === "optional_addon"}
              onChange={() => setGalvMode("optional_addon")}
            />
            Optional add-on
          </label>
        </fieldset>
        {galvMode !== "not_galvanized" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="galv_pct" className={labelClass}>
                Galv rate (%)
              </label>
              <input
                id="galv_pct"
                name="galv_pct"
                type="number"
                step="0.1"
                min="0"
                max="100"
                defaultValue={galvPctDisplay}
                className="input-admin max-w-[8rem]"
              />
            </div>
            <div>
              <label htmlFor="galv_rate_per_lb" className={labelClass}>
                Galv $/lb
              </label>
              <input
                id="galv_rate_per_lb"
                name="galv_rate_per_lb"
                type="number"
                step="0.01"
                min="0"
                defaultValue={galvRateDisplay}
                className="input-admin max-w-[8rem]"
              />
            </div>
            <p className="sm:col-span-2 text-xs text-foreground-muted">
              Formula: lbs × {galvPctDisplay}% × ${galvRateDisplay.toFixed(2)}; shop minimum $750.
            </p>
          </div>
        )}
        <div>
          <label htmlFor="plate_default_cost_per_lb" className={labelClass}>
            Plate default $/lb
          </label>
          <input
            id="plate_default_cost_per_lb"
            name="plate_default_cost_per_lb"
            type="number"
            step="0.01"
            min="0"
            defaultValue={takeoff.plate_default_cost_per_lb ?? 1.1}
            className="input-admin max-w-[8rem]"
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
