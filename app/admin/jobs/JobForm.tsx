"use client";

import { useActionState } from "react";
import type { Job } from "@/lib/db-types";
import type { Customer } from "@/lib/db-types";
import { JOB_STATUSES } from "@/lib/db-types";
import { AdminFormSection } from "@/components/admin";

type FormAction = (formData: FormData) => Promise<{ error?: string; success?: boolean }>;

type Props = {
  action: FormAction;
  job?: Job | null;
  customers: Customer[];
  users: { id: string; name: string | null }[];
};

const btnPrimary =
  "rounded-lg bg-steel-blue px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal";
const btnSecondary =
  "rounded-lg border border-steel/50 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal";

export function JobForm(props: Props) {
  const j = props.job ?? null;
  const isEdit = !!j;

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => props.action(formData),
    null as { error?: string; success?: boolean } | null
  );

  return (
    <form action={formAction} className="space-y-8">
      {j?.id && <input type="hidden" name="job_id" value={j.id} />}

      <AdminFormSection title="Job details" description="Name, customer, and description.">
        <div>
          <label htmlFor="job_name" className="block text-sm font-medium text-foreground">
            Job name <span className="text-red-400">*</span>
          </label>
          <input
            id="job_name"
            name="job_name"
            type="text"
            required
            defaultValue={j?.job_name ?? ""}
            className="input-admin"
          />
        </div>
        <div>
          <label htmlFor="customer_id" className="block text-sm font-medium text-foreground">
            Customer <span className="text-red-400">*</span>
          </label>
          <select
            id="customer_id"
            name="customer_id"
            required
            defaultValue={j?.customer_id ?? ""}
            className="input-admin"
          >
            <option value="">Select customer</option>
            {props.customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={j?.description ?? ""}
            className="input-admin resize-y"
          />
        </div>
      </AdminFormSection>

      <AdminFormSection title="Schedule & assignment" description="Due date, status, and assignee.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="bid_due_date" className="block text-sm font-medium text-foreground">
              Bid due date
            </label>
            <input
              id="bid_due_date"
              name="bid_due_date"
              type="date"
              defaultValue={j?.bid_due_date ?? ""}
              className="input-admin"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-foreground">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={j?.status ?? "To Bid"}
              className="input-admin"
            >
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="assigned_to" className="block text-sm font-medium text-foreground">
              Assigned to
            </label>
            <select
              id="assigned_to"
              name="assigned_to"
              defaultValue={j?.assigned_to ?? ""}
              className="input-admin"
            >
              <option value="">Unassigned</option>
              {props.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </AdminFormSection>

      {state?.error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Job updated.
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-steel/50 pt-6">
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? "Saving…" : isEdit ? "Update job" : "Create job"}
        </button>
        {isEdit && (
          <a href={`/admin/jobs/${j.id}`} className={btnSecondary}>
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
