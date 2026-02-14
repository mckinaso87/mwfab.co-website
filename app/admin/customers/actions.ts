"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPhoneDisplay, isValidPhone } from "@/lib/format-phone";

function normalizePhoneForDb(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return null;
  return digits.length >= 10 ? formatPhoneDisplay(digits.slice(0, 10)) : value.trim();
}

export async function createCustomer(formData: FormData) {
  const supabase = createAdminClient();
  const company_name = (formData.get("company_name") as string)?.trim();
  if (!company_name) return { error: "Company name is required." };

  const phoneRaw = (formData.get("phone") as string)?.trim() || null;
  if (phoneRaw && !isValidPhone(phoneRaw))
    return { error: "Phone must be 10 digits (e.g. (555) 123-4567)." };

  const phone = normalizePhoneForDb(phoneRaw);

  const { data, error } = await supabase
    .from("customers")
    .insert({
      company_name,
      contact_name: (formData.get("contact_name") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      phone,
      address: (formData.get("address") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/customers");
  revalidatePath("/admin/dashboard");
  redirect("/admin/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const company_name = (formData.get("company_name") as string)?.trim();
  if (!company_name) return { error: "Company name is required." };

  const phoneRaw = (formData.get("phone") as string)?.trim() || null;
  if (phoneRaw && !isValidPhone(phoneRaw))
    return { error: "Phone must be 10 digits (e.g. (555) 123-4567)." };

  const phone = normalizePhoneForDb(phoneRaw);

  const { error } = await supabase
    .from("customers")
    .update({
      company_name,
      contact_name: (formData.get("contact_name") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      phone,
      address: (formData.get("address") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true };
}

/** Server action for form: when customer_id is present in formData, updates that customer. */
export async function createOrUpdateCustomer(formData: FormData) {
  const id = (formData.get("customer_id") as string)?.trim();
  if (id) return updateCustomer(id, formData);
  return createCustomer(formData);
}
