import { formatMoney } from "@/app/admin/jobs/[id]/takeoff/formatMoney";
import {
  groupLinesByScope,
  subgroupSubtotal,
  SCOPE_SUBGROUP_TITLE,
} from "@/lib/proposal-line-groups";
import { isGalvanizerLine } from "@/lib/takeoff-calculations";
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

type CustomerLine = {
  id: string;
  description: string;
  amount: number | null | undefined;
  scope?: string | null;
  sortKey: number;
  galv?: boolean;
};

function LineRow({
  description,
  amount,
  galv,
}: {
  description: string;
  amount: number | null | undefined;
  galv?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-steel/30 py-2.5 last:border-0 print:border-gray-200">
      <span className="text-foreground print:text-black">
        {description}
        {galv && (
          <span className="ml-1.5 text-xs text-foreground-muted print:text-gray-600">
            (galv)
          </span>
        )}
      </span>
      <span className="shrink-0 tabular-nums font-medium text-foreground print:text-black">
        {formatMoney(amount)}
      </span>
    </div>
  );
}

function ScopeLineCards({ lines }: { lines: CustomerLine[] }) {
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
          >
            {sorted.map((line) => (
              <LineRow
                key={line.id}
                description={line.description}
                amount={line.amount}
                galv={line.galv}
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

type Props = {
  metalLines: TakeoffMetalLine[];
  componentLines: TakeoffComponentLine[];
  miscLines: TakeoffMiscLine[];
  fieldMiscLines: TakeoffFieldMisc[];
  sectionNotes: Partial<Record<TakeoffSectionKey, TakeoffSectionNote>>;
  galvMode: string;
};

export function ProposalLineSections({
  metalLines,
  componentLines,
  miscLines,
  fieldMiscLines,
  sectionNotes,
  galvMode,
}: Props) {
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
  }));

  const componentCustomer: CustomerLine[] = componentLines.map((l) => ({
    id: l.id,
    description: l.display_name,
    amount: l.total_price,
    scope: l.scope,
    sortKey: l.sort_order,
  }));

  const miscCustomer: CustomerLine[] = miscDisplay.map((l) => ({
    id: l.id,
    description: l.label,
    amount: l.total_price,
    scope: l.scope,
    sortKey: l.sort_order,
  }));

  const fieldCustomer: CustomerLine[] = fieldMiscLines.map((l) => ({
    id: l.id,
    description: l.label ?? "",
    amount: l.total,
    scope: l.scope,
    sortKey: l.sort_order,
  }));

  const blocks: { key: string; lines: CustomerLine[]; note?: TakeoffSectionNote | null }[] =
    [
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
          <ScopeLineCards lines={block.lines} />
          <ProposalSectionNote note={block.note} />
        </div>
      ))}
    </div>
  );
}
