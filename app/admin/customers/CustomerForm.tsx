"use client";

import { useActionState } from "react";
import type { Customer } from "@/lib/db-types";
import { formatPhoneDisplay } from "@/lib/format-phone";
import { AdminFormSection } from "@/components/admin";

type FormAction = (formData: FormData) => Promise<{ error?: string; success?: boolean }>;

type Props = {
  action: FormAction;
  customer?: Customer | null;
};

const btnPrimary =
  "rounded-lg bg-steel-blue px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal";
const btnSecondary =
  "rounded-lg border border-steel/50 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal";

export function CustomerForm(props: Props) {
  const c = props.customer ?? null;
  const isEdit = !!c;

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => props.action(formData),
    null as { error?: string; success?: boolean } | null
  );

  function handlePhoneBlur(e: React.FocusEvent<HTMLInputElement>) {
    const formatted = formatPhoneDisplay(e.target.value);
    if (formatted !== e.target.value) e.target.value = formatted;
  }

  return (
    <form action={formAction} className="space-y-8">
      {c?.id && <input type="hidden" name="customer_id" value={c.id} />}

      <AdminFormSection title="Company" description="Primary business details.">
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-foreground">
            Company name <span className="text-red-400">*</span>
          </label>
          <input
            id="company_name"
            name="company_name"
            type="text"
            required
            placeholder="Acme Construction"
            defaultValue={c?.company_name ?? ""}
            className="input-admin"
          />
        </div>
      </AdminFormSection>

      <AdminFormSection title="Contact" description="Primary contact and communication.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact_name" className="block text-sm font-medium text-foreground">
              Contact name
            </label>
            <input
              id="contact_name"
              name="contact_name"
              type="text"
              placeholder="John Smith"
              defaultValue={c?.contact_name ?? ""}
              className="input-admin"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="john@acme.com"
              defaultValue={c?.email ?? ""}
              className="input-admin"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(555) 123-4567"
            defaultValue={c?.phone ?? ""}
            onBlur={handlePhoneBlur}
            className="input-admin"
          />
          <p className="mt-1 text-xs text-foreground-muted">10 digits; formats as (555) 123-4567</p>
        </div>
      </AdminFormSection>

      <AdminFormSection title="Address & notes" description="Location and internal notes.">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-foreground">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            placeholder="Street, city, state, ZIP"
            defaultValue={c?.address ?? ""}
            className="input-admin resize-y"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-foreground">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Internal notes"
            defaultValue={c?.notes ?? ""}
            className="input-admin resize-y"
          />
        </div>
      </AdminFormSection>

      {state?.error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Customer updated.
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-steel/50 pt-6">
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? "Saving…" : isEdit ? "Update customer" : "Create customer"}
        </button>
        {isEdit && (
          <a href={`/admin/customers/${c!.id}`} className={btnSecondary}>
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
