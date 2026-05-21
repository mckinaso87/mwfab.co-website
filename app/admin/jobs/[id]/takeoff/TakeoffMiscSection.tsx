"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  upsertMiscLine,
  deleteMiscLineForm,
  setGalvTotalOverride,
  setLineScope,
} from "./actions";
import { formatMoney } from "./formatMoney";
import { isGalvanizerLine, computeMiscLineTotal } from "@/lib/takeoff-calculations";
import type { Takeoff, TakeoffMiscLine, LineScope } from "@/lib/db-types";
import { TakeoffSlideOver } from "@/components/admin/takeoff/TakeoffSlideOver";
import { ScopeQuickToggle } from "@/components/admin/takeoff/ScopeQuickToggle";
import { TakeoffMiscLineEditor } from "./TakeoffMiscLineEditor";

const GALV_PCT = 0.15;
const GALV_RATE = 0.5;
const GALV_CAP = 750;

type Props = {
  takeoffId: string;
  jobId: string;
  takeoff: Takeoff;
  lines: TakeoffMiscLine[];
  sumGalvPounds: number;
};

export function TakeoffMiscSection({
  takeoffId,
  jobId,
  takeoff,
  lines,
  sumGalvPounds,
}: Props) {
  const router = useRouter();
  const [editingLine, setEditingLine] = useState<TakeoffMiscLine | null>(null);
  const [scopePendingId, setScopePendingId] = useState<string | null>(null);
  const [scopeTransition, startScopeTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => upsertMiscLine(takeoffId, jobId, formData),
    null as { error?: string } | null
  );
  const deleteAction = (lineId: string) =>
    deleteMiscLineForm.bind(null, takeoffId, lineId, jobId);

  const galvMode = takeoff.galv_mode ?? "not_galvanized";
  const showGalvPanel = galvMode !== "not_galvanized";
  const effectiveAuto = sumGalvPounds;
  const effectivePounds =
    takeoff.galv_total_override != null && Number.isFinite(takeoff.galv_total_override)
      ? takeoff.galv_total_override
      : effectiveAuto;

  const [overrideEnabled, setOverrideEnabled] = useState(
    takeoff.galv_total_override != null
  );
  const [overrideLbs, setOverrideLbs] = useState(
    takeoff.galv_total_override != null ? String(takeoff.galv_total_override) : ""
  );
  const [overrideSaving, setOverrideSaving] = useState(false);

  const galvanizerTotal = Math.min(effectivePounds * GALV_PCT * GALV_RATE, GALV_CAP);

  const displayLines = lines.filter((l) => {
    if (isGalvanizerLine(l.label) && galvMode === "not_galvanized") return false;
    return true;
  });

  const labelClass = "block text-sm font-medium text-foreground";

  async function applyOverride(enabled: boolean, lbs: string) {
    setOverrideSaving(true);
    const val = enabled && lbs.trim() !== "" ? parseFloat(lbs) : null;
    await setGalvTotalOverride(
      takeoffId,
      jobId,
      val != null && Number.isFinite(val) ? val : null
    );
    setOverrideSaving(false);
    router.refresh();
  }

  async function handleSubmit(formData: FormData) {
    await formAction(formData);
    router.refresh();
    setEditingLine(null);
  }

  function handleScopeSelect(line: TakeoffMiscLine, scope: LineScope) {
    if (line.scope === scope) return;
    setScopePendingId(line.id);
    startScopeTransition(async () => {
      await setLineScope("misc", line.id, jobId, scope);
      setScopePendingId(null);
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Materials – Miscellaneous</h2>
      <p className="mb-4 text-sm text-foreground-muted">
        Galvanizer: LBs × 15% × $0.50, cap $750. Weight auto-sums from galvanized metal lines.
      </p>

      {showGalvPanel && (
        <div className="mb-6 rounded-lg border border-steel/50 bg-steel/10 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Galvanizer</h3>
          <p className="text-sm text-foreground">
            Auto-summed weight: <strong>{effectiveAuto.toFixed(1)} lb</strong>
          </p>
          <p className="text-sm text-foreground">
            Galvanizer total: <strong>{formatMoney(galvanizerTotal)}</strong>
          </p>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={overrideEnabled}
              onChange={(e) => {
                const on = e.target.checked;
                setOverrideEnabled(on);
                if (!on) {
                  setOverrideLbs("");
                  applyOverride(false, "");
                } else {
                  setOverrideLbs(String(effectiveAuto));
                }
              }}
            />
            Override
          </label>
          {overrideEnabled && (
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label htmlFor="galv_override_lbs" className={labelClass}>
                  Weight (lb)
                </label>
                <input
                  id="galv_override_lbs"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-admin max-w-[10rem]"
                  value={overrideLbs}
                  onChange={(e) => setOverrideLbs(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={overrideSaving}
                onClick={() => applyOverride(true, overrideLbs)}
                className="rounded-md bg-steel-blue px-3 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50"
              >
                {overrideSaving ? "Saving…" : "Apply override"}
              </button>
            </div>
          )}
        </div>
      )}

      {displayLines.length > 0 ? (
        <div className="overflow-x-auto border border-steel/50 rounded-lg mb-6">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="border-b border-steel/50 bg-steel/20">
                <th className="px-4 py-3 text-left font-medium text-foreground">Label</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Total</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayLines.map((line) => {
                const isGalv = isGalvanizerLine(line.label);
                return (
                  <tr key={line.id} className="border-b border-steel/30 hover:bg-steel/10">
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {line.label}
                      {isGalv && line.weight_of_galv != null && (
                        <span className="ml-2 text-xs text-foreground-muted">
                          ({line.weight_of_galv.toFixed(1)} lb)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                      {formatMoney(
                        isGalv ? computeMiscLineTotal(line) : line.total_price
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {isGalv ? (
                        <span className="text-xs text-foreground-muted">Auto</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <ScopeQuickToggle
                            value={line.scope ?? "furnish_install"}
                            disabled={scopePendingId === line.id || scopeTransition}
                            onSelect={(s) => handleScopeSelect(line, s)}
                          />
                          <button
                            type="button"
                            onClick={() => setEditingLine(line)}
                            className="text-sm text-foreground-muted hover:text-foreground hover:underline"
                          >
                            Edit
                          </button>
                          <span className="text-foreground-muted">·</span>
                          <form
                            action={async (fd: FormData) => {
                              await deleteAction(line.id)(fd);
                              router.refresh();
                            }}
                            className="inline"
                          >
                            <button
                              type="submit"
                              className="text-sm text-red-400 hover:text-red-300 hover:underline"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-6 text-sm text-foreground-muted">No misc lines yet. Add one below.</p>
      )}

      <h3 className="mb-3 text-sm font-semibold text-foreground">Add misc line</h3>
      <TakeoffMiscLineEditor
        sortOrder={lines.length}
        onSubmit={handleSubmit}
        error={state?.error}
        submitLabel={isPending ? "Adding…" : "Add misc line"}
        pending={isPending}
      />

      {editingLine && (
        <TakeoffSlideOver title="Edit misc line" onClose={() => setEditingLine(null)}>
          <TakeoffMiscLineEditor
            initial={editingLine}
            sortOrder={editingLine.sort_order}
            onSubmit={handleSubmit}
            error={state?.error}
            submitLabel={isPending ? "Saving…" : "Save changes"}
            pending={isPending}
          />
        </TakeoffSlideOver>
      )}
    </section>
  );
}
