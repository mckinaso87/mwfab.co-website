import type { ReactNode } from "react";
import type { LineScope } from "@/lib/db-types";
import { formatMoney } from "@/app/admin/jobs/[id]/takeoff/formatMoney";

type Props = {
  title: string;
  subtotal: number;
  children: ReactNode;
  scope?: LineScope;
  /** When false, hide subgroup subtotal (customer lump-sum proposals). */
  showAmounts?: boolean;
};

const scopeStyles: Record<LineScope, string> = {
  furnish:
    "border-2 border-cyan-500/40 bg-cyan-950/30 ring-1 ring-cyan-500/20 print:border-cyan-700 print:bg-cyan-50",
  furnish_install:
    "border-2 border-amber-500/40 bg-amber-950/25 ring-1 ring-amber-500/20 print:border-amber-700 print:bg-amber-50",
};

const headerStyles: Record<LineScope, string> = {
  furnish: "border-b border-cyan-500/30 bg-cyan-950/40 print:border-cyan-200 print:bg-cyan-100",
  furnish_install:
    "border-b border-amber-500/30 bg-amber-950/35 print:border-amber-200 print:bg-amber-100",
};

export function ScopedSubgroupCard({
  title,
  subtotal,
  children,
  scope,
  showAmounts = true,
}: Props) {
  const variant = scope ?? "furnish_install";
  return (
    <div
      className={`mb-4 rounded-lg p-0 shadow-md overflow-hidden print:shadow-none ${scopeStyles[variant]}`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 ${headerStyles[variant]}`}
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-widest text-foreground-muted print:text-gray-600">
            Scope
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground print:text-gray-800">
            {title}
          </span>
        </span>
        {showAmounts && (
          <span className="text-sm font-bold tabular-nums text-foreground print:text-black">
            {formatMoney(subtotal)}
          </span>
        )}
      </div>
      <div className="space-y-0 bg-charcoal/40 px-4 py-3 print:bg-white">{children}</div>
    </div>
  );
}
