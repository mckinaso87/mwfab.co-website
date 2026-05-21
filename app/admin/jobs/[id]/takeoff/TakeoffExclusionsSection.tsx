"use client";

import { useState, useTransition } from "react";
import { setTakeoffExclusions } from "./actions";
import type { SettingsExclusion } from "@/lib/db-types";

type Props = {
  takeoffId: string;
  jobId: string;
  exclusions: SettingsExclusion[];
  selectedIds: string[];
};

export function TakeoffExclusionsSection({
  takeoffId,
  jobId,
  exclusions,
  selectedIds,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const res = await setTakeoffExclusions(takeoffId, jobId, [...selected]);
      setError(res.error ?? null);
    });
  }

  if (exclusions.length === 0) {
    return (
      <section className="rounded-xl border border-steel/50 bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Proposal exclusions</h2>
        <p className="mt-2 text-sm text-foreground-muted">
          No active exclusions. Add them in Admin → Settings → Exclusions.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Proposal exclusions</h2>
      <p className="mb-4 text-sm text-foreground-muted">
        Select items to list on the proposal before the signature block.
      </p>
      <ul className="space-y-2 mb-4">
        {exclusions.map((ex) => (
          <li key={ex.id}>
            <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={selected.has(ex.id)}
                onChange={() => toggle(ex.id)}
                className="mt-1 rounded border-steel/50"
              />
              <span>
                <span className="font-medium">{ex.label}</span>
                <span className="block text-foreground-muted text-xs mt-0.5">{ex.body}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save exclusions"}
      </button>
    </section>
  );
}
