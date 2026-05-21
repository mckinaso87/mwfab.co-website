"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertFieldMiscLine, deleteFieldMiscLineForm, setLineScope } from "./actions";
import { formatMoney } from "./formatMoney";
import type { TakeoffFieldMisc, LineScope } from "@/lib/db-types";
import { TakeoffSlideOver } from "@/components/admin/takeoff/TakeoffSlideOver";
import { ScopeQuickToggle } from "@/components/admin/takeoff/ScopeQuickToggle";
import { TakeoffFieldMiscLineEditor } from "./TakeoffFieldMiscLineEditor";

type Props = {
  takeoffId: string;
  jobId: string;
  lines: TakeoffFieldMisc[];
};

export function TakeoffFieldMiscSection({ takeoffId, jobId, lines }: Props) {
  const router = useRouter();
  const [editingLine, setEditingLine] = useState<TakeoffFieldMisc | null>(null);
  const [scopePendingId, setScopePendingId] = useState<string | null>(null);
  const [scopeTransition, startScopeTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => upsertFieldMiscLine(takeoffId, jobId, formData),
    null as { error?: string } | null
  );
  const deleteAction = (lineId: string) =>
    deleteFieldMiscLineForm.bind(null, takeoffId, lineId, jobId);

  async function handleSubmit(formData: FormData) {
    await formAction(formData);
    router.refresh();
    setEditingLine(null);
  }

  function handleScopeSelect(line: TakeoffFieldMisc, scope: LineScope) {
    if (line.scope === scope) return;
    setScopePendingId(line.id);
    startScopeTransition(async () => {
      await setLineScope("field_misc", line.id, jobId, scope);
      setScopePendingId(null);
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Field – Miscellaneous</h2>
      <p className="mb-4 text-sm text-foreground-muted">
        Field costs: crane, transport, per diem, lodging, etc.
      </p>

      {lines.length > 0 ? (
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
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-steel/30 hover:bg-steel/10">
                  <td className="px-4 py-2.5 font-medium text-foreground">{line.label}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                    {formatMoney(line.total)}
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
        <p className="mb-6 text-sm text-foreground-muted">No field misc lines yet. Add one below.</p>
      )}

      <h3 className="mb-3 text-sm font-semibold text-foreground">Add field misc line</h3>
      <TakeoffFieldMiscLineEditor
        sortOrder={lines.length}
        onSubmit={handleSubmit}
        error={state?.error}
        submitLabel={isPending ? "Adding…" : "Add field misc"}
        pending={isPending}
      />

      {editingLine && (
        <TakeoffSlideOver title="Edit field misc line" onClose={() => setEditingLine(null)}>
          <TakeoffFieldMiscLineEditor
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
