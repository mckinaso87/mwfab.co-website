"use client";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  title?: string;
  description?: string;
};

/** Checkbox + hidden field for server actions (include_in_proposal). */
export function IncludeInProposalField({
  checked,
  onChange,
  className,
  title = "Show on proposal",
  description = "Uncheck to hide this line from the customer proposal. It still counts in takeoff totals.",
}: Props) {
  return (
    <div className={className}>
      <label className="flex items-start gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 rounded border-steel/50"
        />
        <span>
          <span className="font-medium">{title}</span>
          {description && (
            <span className="mt-0.5 block text-xs leading-relaxed text-foreground-muted">
              {description}
            </span>
          )}
        </span>
      </label>
      <input type="hidden" name="include_in_proposal" value={checked ? "true" : "false"} />
    </div>
  );
}

export function ProposalHiddenBadge() {
  return (
    <span className="ml-2 inline-flex rounded bg-steel/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground-muted">
      Hidden on proposal
    </span>
  );
}
