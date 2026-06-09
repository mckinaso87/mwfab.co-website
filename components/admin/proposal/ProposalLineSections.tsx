import { formatMoney } from "@/app/admin/jobs/[id]/takeoff/formatMoney";
import {
  groupLinesByScope,
  subgroupSubtotal,
  SCOPE_SUBGROUP_TITLE,
} from "@/lib/proposal-line-groups";
import { isGalvanizerLine, galvanizerProposalAmount } from "@/lib/takeoff-calculations";
import { proposalLineCustomerNote } from "@/lib/proposal-line-note";
import type {
  TakeoffMetalLine,
  TakeoffComponentLine,
  TakeoffMiscLine,
  TakeoffFieldMisc,
  TakeoffSectionKey,
  TakeoffSectionNote,
} from "@/lib/db-types";
import { ScopedSubgroupCard } from "./ScopedSubgroupCard";
import { ProposalSectionNote } from "./ProposalSectionNote";
import { ProposalLineCustomerNote } from "./ProposalLineCustomerNote";

type CustomerLine = {
  id: string;
  description: string;
  amount: number | null | undefined;
  scope?: string | null;
  sortKey: number;
  galv?: boolean;
  customerNote?: string | null;
};

function LineRow({
  lineNumber,
  description,
  amount,
  galv,
  showAmounts,
  customerNote,
}: {
  lineNumber: number;
  description: string;
  amount: number | null | undefined;
  galv?: boolean;
  showAmounts: boolean;
  customerNote?: string | null;
}) {
  return (
    <div className="last:mb-0">
      <div
        className={
          showAmounts
            ? "flex justify-between gap-4 border-b border-steel/30 py-2.5 last:border-0 print:border-gray-200"
            : "flex gap-3 border-b border-steel/30 py-2.5 last:border-0 print:border-gray-200"
        }
      >
        <span className="flex min-w-0 flex-1 gap-2 text-foreground print:text-black">
          <span className="w-6 shrink-0 tabular-nums font-medium text-foreground-muted print:text-gray-600">
            {lineNumber}.
          </span>
          <span className="min-w-0">
            {description}
            {galv && (
              <span className="ml-1.5 text-xs text-foreground-muted print:text-gray-600">
                (galv)
              </span>
            )}
          </span>
        </span>
        {showAmounts && (
          <span className="shrink-0 tabular-nums font-medium text-foreground print:text-black">
            {formatMoney(amount)}
          </span>
        )}
      </div>
      {customerNote && <ProposalLineCustomerNote text={customerNote} />}
    </div>
  );
}

function ScopeLineCards({
  lines,
  showAmounts,
}: {
  lines: CustomerLine[];
  showAmounts: boolean;
}) {
  if (lines.length === 0) return null;
  const groups = groupLinesByScope(lines);
  return (
    <>
      {groups.map(({ scope, lines: scoped }) => {
        const sorted = [...scoped].sort((a, b) => a.sortKey - b.sortKey);
        return (
          <ScopedSubgroupCard
            key={scope}
            scope={scope}
            title={SCOPE_SUBGROUP_TITLE[scope]}
            subtotal={subgroupSubtotal(
              sorted.map((l) => ({
                total_price: l.amount,
                total: l.amount,
              }))
            )}
            showAmounts={showAmounts}
          >
            {sorted.map((line, index) => (
              <LineRow
                key={line.id}
                lineNumber={index + 1}
                description={line.description}
                amount={line.amount}
                galv={line.galv}
                showAmounts={showAmounts}
                customerNote={line.customerNote}
              />
            ))}
          </ScopedSubgroupCard>
        );
      })}
    </>
  );
}

const sectionBlockClass =
  "rounded-xl border-2 border-steel-blue/50 bg-steel-blue/15 p-5 shadow-md ring-1 ring-steel/40 print:border-gray-400 print:bg-gray-100 print:shadow-none";

const sectionCategoryClass =
  "mb-4 border-b border-steel-blue/40 pb-3 text-[15px] font-semibold tracking-wide text-foreground print:border-gray-300 print:text-black";

/** Takeoff section names shown above scope subgroups (Furnish / Furnish & Install). */
const PROPOSAL_SECTION_LABEL: Record<string, string> = {
  metal: "Metal lines",
  components: "Components",
  misc: "Materials – Miscellaneous",
  field: "Field – Miscellaneous",
};

type Props = {
  metalLines: TakeoffMetalLine[];
  componentLines: TakeoffComponentLine[];
  miscLines: TakeoffMiscLine[];
  fieldMiscLines: TakeoffFieldMisc[];
  sectionNotes: Partial<Record<TakeoffSectionKey, TakeoffSectionNote>>;
  galvMode: string;
  galvPct?: number | null;
  galvRatePerLb?: number | null;
  /** When false, list scope/line descriptions only; amounts still roll into takeoff.grand_total. */
  showAmounts?: boolean;
};

export function ProposalLineSections({
  metalLines,
  componentLines,
  miscLines,
  fieldMiscLines,
  sectionNotes,
  galvMode,
  galvPct,
  galvRatePerLb,
  showAmounts = false,
}: Props) {
  const galvRates = { galvPct, galvRatePerLb };
  const miscDisplay = miscLines.filter(
    (l) => !(isGalvanizerLine(l.label) && galvMode === "not_galvanized")
  );

  const metalCustomer: CustomerLine[] = metalLines.map((l) => ({
    id: l.id,
    description: l.display_name,
    amount: l.total_price,
    scope: l.scope,
    sortKey: l.sort_order,
    galv: l.is_galvanized,
    customerNote: proposalLineCustomerNote(l),
  }));

  const componentCustomer: CustomerLine[] = componentLines.map((l) => ({
    id: l.id,
    description: l.display_name,
    amount: l.total_price,
    scope: l.scope,
    sortKey: l.sort_order,
    customerNote: proposalLineCustomerNote(l),
  }));

  const miscCustomer: CustomerLine[] = miscDisplay.map((l) => ({
    id: l.id,
    description: l.label,
    amount: isGalvanizerLine(l.label)
      ? galvanizerProposalAmount(l.weight_of_galv, galvRates)
      : l.total_price,
    scope: l.scope,
    sortKey: l.sort_order,
    customerNote: proposalLineCustomerNote(l),
  }));

  const fieldCustomer: CustomerLine[] = fieldMiscLines.map((l) => ({
    id: l.id,
    description: l.label ?? "",
    amount: l.total,
    scope: l.scope,
    sortKey: l.sort_order,
    customerNote: proposalLineCustomerNote(l),
  }));

  const blocks: {
    key: keyof typeof PROPOSAL_SECTION_LABEL;
    lines: CustomerLine[];
    note?: TakeoffSectionNote | null;
  }[] = [
    { key: "metal", lines: metalCustomer, note: sectionNotes.metal },
    { key: "components", lines: componentCustomer, note: sectionNotes.components },
    { key: "misc", lines: miscCustomer, note: sectionNotes.materials_misc },
    { key: "field", lines: fieldCustomer, note: sectionNotes.field_misc },
  ].filter((b) => b.lines.length > 0);

  if (blocks.length === 0) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <div
          key={block.key}
          className={`${sectionBlockClass} ${index > 0 ? "mt-2" : ""}`}
        >
          <h3 className={sectionCategoryClass}>
            {PROPOSAL_SECTION_LABEL[block.key]}
          </h3>
          <ScopeLineCards lines={block.lines} showAmounts={showAmounts} />
          <ProposalSectionNote note={block.note} />
        </div>
      ))}
    </div>
  );
}
