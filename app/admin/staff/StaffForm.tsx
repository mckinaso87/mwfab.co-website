"use client";

import Link from "next/link";
import { useActionState } from "react";

const ROLES = [
  { value: "estimator", label: "Estimator" },
  { value: "office", label: "Office" },
  { value: "read_only", label: "Read only" },
] as const;

type FormAction = (formData: FormData) => Promise<{ error?: string; success?: boolean }>;

export function StaffForm({ action }: { action: FormAction }) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => action(formData),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <form action={formAction} className="mt-6 max-w-md space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Alex"
          className="input-admin"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-foreground">
          Role
        </label>
        <select id="role" name="role" defaultValue="office" className="input-admin">
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      {state?.error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-400">
          Staff added.
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-steel-blue px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add staff"}
        </button>
        <Link
          href="/admin/staff"
          className="rounded-lg border border-steel/50 px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-steel/30"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
