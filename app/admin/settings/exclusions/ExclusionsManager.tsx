"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { upsertExclusion, deleteExclusion } from "./actions";
import type { SettingsExclusion } from "@/lib/db-types";

type Props = { exclusions: SettingsExclusion[] };

export function ExclusionsManager({ exclusions }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => upsertExclusion(formData),
    null as { error?: string } | null
  );

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto rounded-xl border border-steel/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel/50 bg-steel/20">
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Label</th>
              <th className="px-4 py-3 text-left font-medium">Active</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exclusions.map((ex) => (
              <tr key={ex.id} className="border-b border-steel/30">
                <td className="px-4 py-2.5 tabular-nums">{ex.sort_order}</td>
                <td className="px-4 py-2.5">
                  <span className="font-medium">{ex.label}</span>
                  <p className="text-xs text-foreground-muted mt-0.5 line-clamp-2">{ex.body}</p>
                </td>
                <td className="px-4 py-2.5">{ex.is_active ? "Yes" : "No"}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteExclusion(ex.id);
                      router.refresh();
                    }}
                    className="text-red-400 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        action={async (fd) => {
          await formAction(fd);
          router.refresh();
        }}
        className="rounded-xl border border-steel/50 bg-card p-6 space-y-4 max-w-xl"
      >
        <h2 className="text-lg font-semibold text-foreground">Add exclusion</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input name="label" type="text" required className="input-admin w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Body</label>
          <textarea name="body" rows={3} required className="input-admin w-full" />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sort order</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={exclusions.length + 1}
              className="input-admin w-24"
            />
          </div>
          <label className="flex items-center gap-2 text-sm mt-6">
            <input type="checkbox" name="is_active" defaultChecked className="rounded" />
            Active
          </label>
        </div>
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-steel-blue px-4 py-2 text-sm font-medium hover:bg-steel disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Add exclusion"}
        </button>
      </form>
    </div>
  );
}
