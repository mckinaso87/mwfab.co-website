"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertComponentLine, deleteComponentLineForm, setLineScope } from "./actions";
import { formatMoney } from "./formatMoney";
import { subgroupSubtotal } from "@/lib/proposal-line-groups";
import { TakeoffSlideOver } from "@/components/admin/takeoff/TakeoffSlideOver";
import { ProposalHiddenBadge } from "@/components/admin/takeoff/IncludeInProposalField";
import { TAKEOFF_ADD_LINE_SHELL } from "@/components/admin/takeoff/takeoff-form-variants";
import { ScopeQuickToggle } from "@/components/admin/takeoff/ScopeQuickToggle";
import { TakeoffComponentLineEditor } from "./TakeoffComponentLineEditor";
import type { TakeoffComponentLine, LineScope } from "@/lib/db-types";

type Props = {
  takeoffId: string;
  jobId: string;
  lines: TakeoffComponentLine[];
};

export function TakeoffComponentSection({ takeoffId, jobId, lines }: Props) {
  const router = useRouter();
  const [editingLine, setEditingLine] = useState<TakeoffComponentLine | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [addFormKey, setAddFormKey] = useState(0);
  const [scopePendingId, setScopePendingId] = useState<string | null>(null);
  const [scopeTransition, startScopeTransition] = useTransition();
  const [savePending, startSaveTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => upsertComponentLine(takeoffId, jobId, formData),
    null as { error?: string } | null
  );
  const deleteAction = (lineId: string) =>
    deleteComponentLineForm.bind(null, takeoffId, lineId, jobId);

  async function handleSubmit(formData: FormData) {
    setSubmitError(null);
    return new Promise<void>((resolve) => {
      startSaveTransition(async () => {
        const result = await upsertComponentLine(takeoffId, jobId, formData);
        if (result?.error) {
          setSubmitError(result.error);
          resolve();
          return;
        }
        const id = formData.get("id");
        if (typeof id !== "string" || !id.trim()) {
          setAddFormKey((k) => k + 1);
        }
        router.refresh();
        setEditingLine(null);
        resolve();
      });
    });
  }

  function handleScopeSelect(line: TakeoffComponentLine, scope: LineScope) {
    if (line.scope === scope) return;
    setScopePendingId(line.id);
    startScopeTransition(async () => {
      await setLineScope("component", line.id, jobId, scope);
      setScopePendingId(null);
      router.refresh();
    });
  }

  // All lines in the section (matches what flows into the takeoff total), regardless of
  // proposal visibility.
  const sectionTotal = subgroupSubtotal(lines);

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Components</h2>
      <p className="mb-4 text-sm text-foreground-muted">Component line items by count and weight.</p>

      {lines.length > 0 ? (
        <div className="overflow-x-auto border border-steel/50 rounded-lg mb-6">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-steel/50 bg-steel/20">
                <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Count</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Lb/pc</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Pounds</th>
                <th className="px-4 py-3 text-center font-medium text-foreground">Galv</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Total</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-steel/30 hover:bg-steel/10">
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {line.display_name}
                    {line.include_in_proposal === false && <ProposalHiddenBadge />}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{line.count}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground-muted">
                    {line.total_pounds_per_piece != null
                      ? `${line.total_pounds_per_piece.toFixed(3)} lb`
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground-muted">
                    {line.total_pounds != null ? `${line.total_pounds.toFixed(1)} lb` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center text-foreground-muted">
                    {line.is_galvanized
                      ? line.galv_pounds != null
                        ? `${line.galv_pounds.toFixed(0)} lb`
                        : "Yes"
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                    {formatMoney(line.total_price)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
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
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-steel/50 bg-steel/20">
                <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                  Section total
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-sm font-bold text-foreground">
                  {formatMoney(sectionTotal)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="mb-6 text-sm text-foreground-muted">No component lines yet. Add one below.</p>
      )}

      <h3 className="mb-3 text-base font-semibold text-foreground">Add component line</h3>
      <div className={`mb-6 ${TAKEOFF_ADD_LINE_SHELL.component}`}>
      <TakeoffComponentLineEditor
        key={`add-${addFormKey}`}
        sortOrder={lines.length}
        onSubmit={handleSubmit}
        error={submitError ?? state?.error}
        submitLabel={isPending || savePending ? "Adding…" : "Add component"}
        pending={isPending || savePending}
      />
      </div>

      {editingLine && (
        <TakeoffSlideOver title="Edit component line" onClose={() => setEditingLine(null)}>
          <TakeoffComponentLineEditor
            key={editingLine.id}
            initial={editingLine}
            sortOrder={editingLine.sort_order}
            onSubmit={handleSubmit}
            error={submitError ?? state?.error}
            submitLabel={savePending ? "Saving…" : "Save changes"}
            pending={savePending}
          />
        </TakeoffSlideOver>
      )}
    </section>
  );
}
