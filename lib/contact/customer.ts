import { createAdminClient } from "@/lib/supabase/admin";
import { formatPhoneDisplay } from "@/lib/format-phone";
import { normalizeEmail } from "@/lib/normalize-email";
import type { ContactFormPayload } from "@/lib/email/contact-types";

function normalizePhoneForDb(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return null;
  return digits.length >= 10 ? formatPhoneDisplay(digits.slice(0, 10)) : value.trim();
}

function formatSubmittedAt(): string {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildNotes(projectDescription: string): string {
  return `Website bid request (${formatSubmittedAt()}):\n\n${projectDescription.trim()}`;
}

function appendNotes(existing: string | null, incoming: string): string {
  if (!existing?.trim()) return incoming;
  return `${existing.trim()}\n\n---\n\n${incoming}`;
}

function companyNameFromPayload(data: ContactFormPayload): string {
  const company = data.company?.trim();
  if (company) return company;
  return data.name.trim();
}

/**
 * Create or update a customer from the public contact form so the lead appears in /admin/customers.
 * Matches existing customer when email is present; otherwise inserts a new row.
 */
export async function upsertCustomerFromContact(
  data: ContactFormPayload
): Promise<{ ok: true; customerId: string; created: boolean } | { ok: false; error: string }> {
  try {
    const supabase = createAdminClient();
    const email = normalizeEmail(data.email);
    if (!email) {
      return { ok: false, error: "Email is required." };
    }
    const company_name = companyNameFromPayload(data);
    const contact_name = data.name.trim();
    const phone = normalizePhoneForDb(data.phone);
    const notes = buildNotes(data.projectDescription);

    if (email) {
      const { data: matches, error: fetchError } = await supabase
        .from("customers")
        .select("id, notes, email")
        .ilike("email", email);

      if (fetchError) {
        return { ok: false, error: fetchError.message };
      }

      const existing =
        matches?.find((row) => normalizeEmail(row.email) === email) ?? matches?.[0];

      if (existing) {
        const updates: {
          company_name: string;
          contact_name: string;
          email: string;
          notes: string;
          phone?: string | null;
        } = {
          company_name,
          contact_name,
          email,
          notes: appendNotes(existing.notes, notes),
        };
        if (phone !== null) updates.phone = phone;

        const { error: updateError } = await supabase
          .from("customers")
          .update(updates)
          .eq("id", existing.id);

        if (updateError) return { ok: false, error: updateError.message };
        return { ok: true, customerId: existing.id, created: false };
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .from("customers")
      .insert({
        company_name,
        contact_name,
        email,
        phone,
        notes,
      })
      .select("id")
      .single();

    if (insertError) return { ok: false, error: insertError.message };
    return { ok: true, customerId: inserted.id, created: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database unavailable";
    return { ok: false, error: message };
  }
}
