"use client";

import { useState } from "react";
import { TakeoffLineProposalPanel } from "@/components/admin/takeoff/TakeoffLineProposalPanel";
import { TakeoffFormSection } from "@/components/admin/takeoff/TakeoffFormSection";
import { MiscPricingInputs } from "@/components/admin/takeoff/MiscPricingInputs";
import type { TakeoffMiscLine, LineScope } from "@/lib/db-types";

type Props = {
  initial?: TakeoffMiscLine | null;
  sortOrder: number;
  onSubmit: (formData: FormData) => Promise<void>;
  error?: string | null;
  submitLabel: string;
  pending?: boolean;
};

export function TakeoffMiscLineEditor({
  initial,
  sortOrder,
  onSubmit,
  error,
  submitLabel,
  pending,
}: Props) {
  const [scope, setScope] = useState<LineScope>(initial?.scope ?? "furnish_install");
  const [includeInProposal, setIncludeInProposal] = useState(
    initial?.include_in_proposal ?? true
  );
  const [customerNote, setCustomerNote] = useState(initial?.customer_note ?? "");
  const [customerNoteInProposal, setCustomerNoteInProposal] = useState(
    initial?.customer_note_in_proposal ?? false
  );
  const [label, setLabel] = useState(
    initial?.label ?? "Gray Primer Paint (per Gallon - estimate)"
  );
  const [totalPrice, setTotalPrice] = useState(
    initial?.total_price != null ? String(initial.total_price) : ""
  );

  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <form action={onSubmit} className="space-y-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="sort_order" value={initial?.sort_order ?? sortOrder} />

      <TakeoffFormSection
        title="Misc line"
        subtitle="Label and pricing for paint, concrete, delivery, and similar items."
        variant="misc"
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="misc_label" className={labelClass}>
              Label
            </label>
            <select
              id="misc_label"
              name="label"
              className="input-admin"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            >
              <option value="Galvanization Delivery">Galvanization Delivery</option>
              <option value="Gray Primer Paint (per Gallon - estimate)">Gray Primer Paint</option>
              <option value="Concrete (for filled columns)">Concrete</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <MiscPricingInputs
            label={label}
            variant="misc"
            totalDisplay={totalPrice}
            onTotalChange={setTotalPrice}
          />
        </div>
      </TakeoffFormSection>

      <TakeoffLineProposalPanel
        scope={scope}
        onScopeChange={setScope}
        includeLineOnProposal={includeInProposal}
        onIncludeLineChange={setIncludeInProposal}
        customerNote={customerNote}
        customerNoteInProposal={customerNoteInProposal}
        onNoteChange={setCustomerNote}
        onNoteIncludeChange={setCustomerNoteInProposal}
      />

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
