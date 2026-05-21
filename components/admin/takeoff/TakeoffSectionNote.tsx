"use client";

import { useState, useTransition } from "react";
import type { TakeoffSectionKey, TakeoffSectionNote as NoteRow } from "@/lib/db-types";

const SECTION_LABELS: Record<TakeoffSectionKey, string> = {
  metal: "Metal — customer note",
  components: "Components — customer note",
  materials_misc: "Materials misc — customer note",
  field_misc: "Field misc — customer note",
  drawings: "Drawings — customer note",
  shop: "Shop — customer note",
  install: "Install — customer note",
  general: "General — customer note",
};

const SECTION_FRIENDLY: Record<TakeoffSectionKey, string> = {
  metal: "metal",
  components: "components",
  materials_misc: "materials misc",
  field_misc: "field misc",
  drawings: "drawings",
  shop: "shop",
  install: "install",
  general: "general",
};

type Props = {
  takeoffId: string;
  jobId: string;
  section: TakeoffSectionKey;
  note?: NoteRow | null;
  label?: string;
  upsertAction: (
    takeoffId: string,
    jobId: string,
    section: TakeoffSectionKey,
    note: string,
    includeInProposal: boolean
  ) => Promise<{ error?: string }>;
};

export function TakeoffSectionNote({
  takeoffId,
  jobId,
  section,
  note,
  label,
  upsertAction,
}: Props) {
  const [text, setText] = useState(note?.note ?? "");
  const [include, setInclude] = useState(note?.include_in_proposal ?? true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const displayLabel = label ?? SECTION_LABELS[section];
  const friendly = SECTION_FRIENDLY[section];

  function save() {
    startTransition(async () => {
      const res = await upsertAction(takeoffId, jobId, section, text, include);
      setError(res.error ?? null);
    });
  }

  return (
    <div className="mt-4 rounded-lg border border-steel/30 bg-steel/5 p-4">
      <label className="block text-sm font-medium text-foreground mb-1">{displayLabel}</label>
      <textarea
        className="input-admin w-full min-h-[72px] text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Optional note shown to the customer in the ${friendly} section…`}
      />
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground-muted">
          <input
            type="checkbox"
            checked={include}
            onChange={(e) => setInclude(e.target.checked)}
            className="rounded border-steel/50"
          />
          Include in proposal
        </label>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-md bg-steel/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-steel disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save note"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
