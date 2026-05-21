"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertMetalLine, deleteMetalLineForm, setLineScope } from "./actions";
import { formatMoney } from "./formatMoney";
import { CATEGORY_LABEL } from "@/lib/takeoff-catalog-spec";
import type { Takeoff, TakeoffMetalLine, LineScope } from "@/lib/db-types";
import { TakeoffSlideOver } from "@/components/admin/takeoff/TakeoffSlideOver";
import { ScopeQuickToggle } from "@/components/admin/takeoff/ScopeQuickToggle";
import { TakeoffMetalLineEditor } from "./TakeoffMetalLineEditor";

type Props = {
  takeoffId: string;
  jobId: string;
  takeoff: Takeoff;
  lines: TakeoffMetalLine[];
};

export function TakeoffMetalSection({ takeoffId, jobId, takeoff, lines }: Props) {
  const router = useRouter();
  const [editingLine, setEditingLine] = useState<TakeoffMetalLine | null>(null);
  const [scopePendingId, setScopePendingId] = useState<string | null>(null);
  const [scopeTransition, startScopeTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => upsertMetalLine(takeoffId, jobId, formData),
    null as { error?: string } | null
  );
  const deleteAction = (lineId: string) =>
    deleteMetalLineForm.bind(null, takeoffId, lineId, jobId);

  async function handleSubmit(formData: FormData) {
    await formAction(formData);
    router.refresh();
    setEditingLine(null);
  }

  function handleScopeSelect(line: TakeoffMetalLine, scope: LineScope) {
    if (line.scope === scope) return;
    setScopePendingId(line.id);
    startScopeTransition(async () => {
      await setLineScope("metal", line.id, jobId, scope);
      setScopePendingId(null);
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Metal lines</h2>
      <p className="mb-4 text-sm text-foreground-muted">
        Shorthand search, plate, or custom other lines.
      </p>

      {lines.length > 0 ? (
        <div className="overflow-x-auto border border-steel/50 rounded-lg mb-6">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-steel/50 bg-steel/20">
                <th className="px-4 py-3 text-left font-medium text-foreground">Description</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Category</th>
                <th className="px-4 py-3 text-center font-medium text-foreground">Galv</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Count</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Length</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Pounds</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Total</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-steel/30 hover:bg-steel/10">
                  <td className="px-4 py-2.5 font-medium text-foreground">{line.display_name}</td>
                  <td className="px-4 py-2.5 text-foreground-muted">
                    {CATEGORY_LABEL[line.category] ?? line.category}
                  </td>
                  <td className="px-4 py-2.5 text-center text-foreground-muted">
                    {line.is_galvanized
                      ? line.galv_pounds != null
                        ? `${line.galv_pounds.toFixed(0)} lb`
                        : "Yes"
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{line.count}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {line.total_length_ft != null ? `${line.total_length_ft} ft` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {line.total_pounds != null ? `${line.total_pounds.toFixed(1)} lb` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">
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
          </table>
        </div>
      ) : (
        <p className="mb-6 text-sm text-foreground-muted">No metal lines yet. Add one below.</p>
      )}

      <h3 className="mb-3 text-sm font-semibold text-foreground">Add metal line</h3>
      <TakeoffMetalLineEditor
        takeoff={takeoff}
        sortOrder={lines.length}
        onSubmit={handleSubmit}
        error={state?.error}
        submitLabel={isPending ? "Adding…" : "Add metal line"}
        pending={isPending}
      />

      {editingLine && (
        <TakeoffSlideOver title="Edit metal line" onClose={() => setEditingLine(null)}>
          <TakeoffMetalLineEditor
            key={editingLine.id}
            takeoff={takeoff}
            initial={editingLine}
            sortOrder={editingLine.sort_order}
            onSubmit={handleSubmit}
            error={state?.error}
            submitLabel={isPending ? "Saving…" : "Save changes"}
            pending={isPending}
            lockMode
          />
        </TakeoffSlideOver>
      )}
    </section>
  );
}
