"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function upsertExclusion(formData: FormData): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const id = (formData.get("id") as string)?.trim();
  const label = (formData.get("label") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const isActive = formData.get("is_active") === "on";
  const sortOrder = parseInt((formData.get("sort_order") as string) ?? "0", 10) || 0;
  if (!label || !body) return { error: "Label and body are required." };

  const payload = { label, body, is_active: isActive, sort_order: sortOrder };
  if (id) {
    const { error } = await supabase.from("settings_exclusions").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("settings_exclusions").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/settings/exclusions");
  return {};
}

export async function deleteExclusion(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("settings_exclusions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/settings/exclusions");
  return {};
}
