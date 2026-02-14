"use client";

import { useActionState } from "react";
import type { Customer } from "@/lib/db-types";
import { formatPhoneDisplay } from "@/lib/format-phone";

type FormAction = (formData: FormData) => Promise<{ error?: string; success?: boolean }>;

type Props = {
  action: FormAction;
  customer?: Customer | null;
};

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
    <form action={formAction} className="mt-6 max-w-xl space-y-5">
      {c?.id && <input type="hidden" name="customer_id" value={c.id} />}
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
      {state?.error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-400">
          Customer updated.
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-steel-blue px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel disabled:opacity-50"
        >
          {isPending ? "Saving…" : isEdit ? "Update customer" : "Create customer"}
        </button>
        {isEdit && (
          <a
            href={`/admin/customers/${c!.id}`}
            className="rounded-lg border border-steel/50 px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-steel/30"
          >
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
