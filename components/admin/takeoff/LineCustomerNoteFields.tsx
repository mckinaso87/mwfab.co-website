"use client";

type Props = {
  note: string;
  includeInProposal: boolean;
  onNoteChange: (note: string) => void;
  onIncludeChange: (include: boolean) => void;
  className?: string;
};

/** Customer note for a line item (used inside TakeoffLineProposalPanel). */
export function LineCustomerNoteFields({
  note,
  includeInProposal,
  onNoteChange,
  onIncludeChange,
  className,
}: Props) {
  return (
    <div className={className}>
      <textarea
        name="customer_note"
        className="input-admin w-full min-h-[72px] text-sm"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="e.g. Owner to verify field dimensions before fab…"
        aria-label="Customer note for this line"
      />
      <label className="mt-3 flex items-start gap-2.5 rounded-md border border-steel/35 bg-steel/10 px-3 py-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={includeInProposal}
          onChange={(e) => onIncludeChange(e.target.checked)}
          className="mt-0.5 rounded border-steel/50"
        />
        <span>
          <span className="font-medium">Show this note on the proposal</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-foreground-muted">
            Displays indented under this line&apos;s description. Independent of &ldquo;show
            line on proposal&rdquo; above—you can hide the line but still show a note only if
            both are enabled.
          </span>
        </span>
      </label>
      <input
        type="hidden"
        name="customer_note_in_proposal"
        value={includeInProposal ? "true" : "false"}
      />
    </div>
  );
}
