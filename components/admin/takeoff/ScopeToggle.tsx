"use client";

import type { LineScope } from "@/lib/db-types";

type Props = {
  value: LineScope;
  onChange: (v: LineScope) => void;
  name?: string;
};

export function ScopeToggle({ value, onChange, name = "scope" }: Props) {
  return (
    <div className="inline-flex rounded-md border border-steel/50 p-0.5 text-xs">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => onChange("furnish")}
        className={`rounded px-2 py-1 ${value === "furnish" ? "bg-steel-blue text-foreground" : "text-foreground-muted hover:text-foreground"}`}
      >
        Furnish
      </button>
      <button
        type="button"
        onClick={() => onChange("furnish_install")}
        className={`rounded px-2 py-1 ${value === "furnish_install" ? "bg-steel-blue text-foreground" : "text-foreground-muted hover:text-foreground"}`}
      >
        Furnish &amp; Install
      </button>
    </div>
  );
}

export function ScopeBadge({ scope }: { scope?: string }) {
  const label = scope === "furnish" ? "F" : "F&I";
  return (
    <span className="inline-flex rounded px-1.5 py-0.5 text-xs font-medium bg-steel/40 text-foreground-muted">
      {label}
    </span>
  );
}
