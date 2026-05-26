/** Subtle takeoff form color cues — section shells and inner accent boxes. */

export type TakeoffFormVariant =
  | "default"
  | "mode"
  | "catalog"
  | "quantities"
  | "details"
  | "proposal"
  | "galvanizer"
  | "plate"
  | "misc"
  | "field";

type VariantStyle = {
  section: string;
  step: string;
  accentBar: string;
};

export const TAKEOFF_VARIANT: Record<TakeoffFormVariant, VariantStyle> = {
  default: {
    section: "border-steel/50 bg-steel/5",
    step: "text-foreground-muted",
    accentBar: "bg-steel/50",
  },
  mode: {
    section:
      "border-zinc-500/35 bg-gradient-to-br from-zinc-500/10 via-transparent to-transparent ring-1 ring-zinc-500/15",
    step: "text-[var(--takeoff-step-mode)]",
    accentBar: "bg-zinc-400/70",
  },
  catalog: {
    section:
      "border-sky-500/45 bg-gradient-to-br from-sky-500/18 via-sky-400/8 to-transparent shadow-[0_4px_6px_-1px_var(--takeoff-catalog-shadow)] ring-1 ring-sky-500/25",
    step: "text-[var(--takeoff-step-catalog)]",
    accentBar: "bg-sky-400",
  },
  quantities: {
    section:
      "border-amber-500/40 bg-gradient-to-br from-amber-500/12 via-amber-400/5 to-transparent ring-1 ring-amber-500/20",
    step: "text-[var(--takeoff-step-quantities)]",
    accentBar: "bg-amber-400/80",
  },
  details: {
    section:
      "border-slate-400/35 bg-gradient-to-br from-slate-400/10 via-transparent to-transparent ring-1 ring-slate-400/15",
    step: "text-[var(--takeoff-step-details)]",
    accentBar: "bg-slate-400/70",
  },
  proposal: {
    section:
      "border-violet-500/40 bg-gradient-to-br from-violet-500/14 via-violet-400/5 to-transparent ring-1 ring-violet-500/22",
    step: "text-[var(--takeoff-step-proposal)]",
    accentBar: "bg-violet-400/75",
  },
  galvanizer: {
    section:
      "border-teal-500/40 bg-gradient-to-br from-teal-500/14 via-teal-400/5 to-transparent ring-1 ring-teal-500/20",
    step: "text-[var(--takeoff-step-galvanizer)]",
    accentBar: "bg-teal-400/75",
  },
  plate: {
    section:
      "border-orange-500/35 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent ring-1 ring-orange-500/18",
    step: "text-[var(--takeoff-step-plate)]",
    accentBar: "bg-orange-400/70",
  },
  misc: {
    section:
      "border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent ring-1 ring-rose-500/15",
    step: "text-[var(--takeoff-step-misc)]",
    accentBar: "bg-rose-400/65",
  },
  field: {
    section:
      "border-emerald-500/35 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent ring-1 ring-emerald-500/18",
    step: "text-[var(--takeoff-step-field)]",
    accentBar: "bg-emerald-400/70",
  },
};

/** Inner panels inside a section (e.g. proposal sub-blocks). */
export const TAKEOFF_INNER_BOX = {
  lineOnProposal:
    "rounded-lg border border-violet-500/30 bg-violet-500/8 p-4 ring-1 ring-violet-500/10",
  noteOnProposal:
    "rounded-lg border border-dashed border-violet-400/35 bg-violet-500/5 p-4",
  galvanizerLine:
    "rounded-lg border border-teal-500/30 bg-teal-500/8 p-4 ring-1 ring-teal-500/10",
  galvanizerNote:
    "rounded-lg border border-dashed border-teal-400/35 bg-teal-500/5 p-4",
  catalogSearchIdle:
    "border-sky-500/50 bg-sky-500/10 shadow-inner focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/35 [box-shadow:inset_0_2px_4px_0_var(--takeoff-catalog-shadow)]",
  catalogSearchSelected: "border-emerald-500/45 bg-emerald-500/8 ring-1 ring-emerald-500/25",
  catalogSearchHeader: "border-sky-400/30 bg-sky-500/20",
} as const;

export const MODE_BUTTON_ACTIVE: Record<"shorthand" | "plate" | "other", string> = {
  shorthand:
    "bg-sky-500/90 text-white shadow-sm ring-1 ring-sky-400/50 border border-sky-400/40",
  plate:
    "bg-orange-500/85 text-white shadow-sm ring-1 ring-orange-400/45 border border-orange-400/35",
  other:
    "bg-slate-500/80 text-white shadow-sm ring-1 ring-slate-400/40 border border-slate-400/35",
};

export const MODE_BUTTON_IDLE =
  "border border-steel/50 text-foreground-muted hover:bg-steel/15 hover:text-foreground";

/** Wrapper for “Add line” forms under each takeoff section table. */
export const TAKEOFF_ADD_LINE_SHELL: Record<
  "metal" | "component" | "misc" | "field",
  string
> = {
  metal:
    "rounded-xl border border-sky-500/25 bg-[var(--takeoff-shell-sky)] p-4 sm:p-5 ring-1 ring-sky-500/10",
  component:
    "rounded-xl border border-slate-400/25 bg-[var(--takeoff-shell-slate)] p-4 sm:p-5 ring-1 ring-slate-400/10",
  misc: "rounded-xl border border-rose-500/22 bg-[var(--takeoff-shell-rose)] p-4 sm:p-5 ring-1 ring-rose-500/10",
  field:
    "rounded-xl border border-emerald-500/25 bg-[var(--takeoff-shell-emerald)] p-4 sm:p-5 ring-1 ring-emerald-500/10",
};
