"use client";

import { useState } from "react";
import { ScopeToggle } from "@/components/admin/takeoff/ScopeToggle";
import { MiscPricingInputs } from "@/components/admin/takeoff/MiscPricingInputs";
import type { TakeoffFieldMisc, LineScope } from "@/lib/db-types";

type Props = {
  initial?: TakeoffFieldMisc | null;
  sortOrder: number;
  onSubmit: (formData: FormData) => Promise<void>;
  error?: string | null;
  submitLabel: string;
  pending?: boolean;
};

export function TakeoffFieldMiscLineEditor({
  initial,
  sortOrder,
  onSubmit,
  error,
  submitLabel,
  pending,
}: Props) {
  const [scope, setScope] = useState<LineScope>(initial?.scope ?? "furnish_install");
  const [total, setTotal] = useState(initial?.total != null ? String(initial.total) : "");

  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <form action={onSubmit} className="grid grid-cols-1 gap-3">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="sort_order" value={initial?.sort_order ?? sortOrder} />
      <div>
        <label htmlFor="field_misc_label" className={labelClass}>
          Label
        </label>
        <select
          id="field_misc_label"
          name="label"
          className="input-admin"
          defaultValue={initial?.label ?? "Rental - Crane"}
        >
          <option value="Rental - Crane">Rental - Crane</option>
          <option value="w/ $200.00 - Fuel Deposit">Fuel Deposit</option>
          <option value="Transportation">Transportation</option>
          <option value="Per Diem (Meals)">Per Diem (Meals)</option>
          <option value="Lodging">Lodging</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="field_misc_hrs" className={labelClass}>
          Hr, Days, or Nights (optional note)
        </label>
        <input
          id="field_misc_hrs"
          name="hrs_days_nights"
          type="text"
          className="input-admin"
          defaultValue={initial?.hrs_days_nights ?? ""}
          placeholder="e.g. 1"
        />
      </div>
      <div>
        <span className={labelClass}>Scope</span>
        <div className="mt-1">
          <ScopeToggle value={scope} onChange={setScope} />
        </div>
      </div>
      <MiscPricingInputs variant="field" totalDisplay={total} onTotalChange={setTotal} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
