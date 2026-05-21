"use client";

import type { LineScope } from "@/lib/db-types";

type Props = {
  value: LineScope;
  onSelect: (scope: LineScope) => void;
  disabled?: boolean;
};

export function ScopeQuickToggle({ value, onSelect, disabled }: Props) {
  return (
    <span
      className="inline-flex rounded border border-steel/50 p-0.5 text-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled || value === "furnish"}
        onClick={() => onSelect("furnish")}
        className={`rounded px-1.5 py-0.5 min-w-[1.75rem] ${
          value === "furnish"
            ? "bg-steel-blue text-foreground"
            : "text-foreground-muted hover:text-foreground"
        } disabled:opacity-50`}
        title="Furnish"
      >
        F
      </button>
      <button
        type="button"
        disabled={disabled || value === "furnish_install"}
        onClick={() => onSelect("furnish_install")}
        className={`rounded px-1.5 py-0.5 min-w-[1.75rem] ${
          value === "furnish_install"
            ? "bg-steel-blue text-foreground"
            : "text-foreground-muted hover:text-foreground"
        } disabled:opacity-50`}
        title="Furnish & Install"
      >
        F&I
      </button>
    </span>
  );
}
