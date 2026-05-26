"use client";

import { ScopeToggle } from "@/components/admin/takeoff/ScopeToggle";
import { IncludeInProposalField } from "@/components/admin/takeoff/IncludeInProposalField";
import { LineCustomerNoteFields } from "@/components/admin/takeoff/LineCustomerNoteFields";
import { TakeoffFormSection } from "@/components/admin/takeoff/TakeoffFormSection";
import { TAKEOFF_INNER_BOX } from "@/components/admin/takeoff/takeoff-form-variants";
import type { LineScope } from "@/lib/db-types";

type Props = {
  scope: LineScope;
  onScopeChange: (scope: LineScope) => void;
  includeLineOnProposal: boolean;
  onIncludeLineChange: (checked: boolean) => void;
  customerNote: string;
  customerNoteInProposal: boolean;
  onNoteChange: (note: string) => void;
  onNoteIncludeChange: (include: boolean) => void;
};

export function TakeoffLineProposalPanel({
  scope,
  onScopeChange,
  includeLineOnProposal,
  onIncludeLineChange,
  customerNote,
  customerNoteInProposal,
  onNoteChange,
  onNoteIncludeChange,
}: Props) {
  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <TakeoffFormSection
      title="Scope & what the customer sees"
      subtitle="These settings only affect the proposal PDF and email. Takeoff totals always include this line."
      variant="proposal"
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2.5">
          <span className={labelClass}>Scope (furnish vs furnish & install)</span>
          <div className="mt-2">
            <ScopeToggle value={scope} onChange={onScopeChange} />
          </div>
        </div>

        <div className={TAKEOFF_INNER_BOX.lineOnProposal}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-200/90">
            Line item on proposal
          </p>
          <IncludeInProposalField
            checked={includeLineOnProposal}
            onChange={onIncludeLineChange}
            title="Show this line on the proposal"
            description="When off, the line description and price are hidden from the customer. The amount still counts in your takeoff total and lump sum."
          />
        </div>

        <div className={TAKEOFF_INNER_BOX.noteOnProposal}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-200/80">
            Optional note under this line
          </p>
          <p className="mb-3 text-xs text-foreground-muted">
            Appears indented below the line description—not a separate line item.
          </p>
          <LineCustomerNoteFields
            note={customerNote}
            includeInProposal={customerNoteInProposal}
            onNoteChange={onNoteChange}
            onIncludeChange={onNoteIncludeChange}
            className="!col-span-1"
          />
        </div>
      </div>
    </TakeoffFormSection>
  );
}
