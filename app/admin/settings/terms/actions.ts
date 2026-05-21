"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveTerms(formData: FormData): Promise<{ error?: string }> {
  const bodyMd = (formData.get("body_md") as string) ?? "";
  const supabase = createAdminClient();
  const { data: current } = await supabase
    .from("settings_terms")
    .select("id, version")
    .eq("is_active", true)
    .maybeSingle();

  if (current) {
    const { error } = await supabase
      .from("settings_terms")
      .update({
        body_md: bodyMd,
        version: (current.version ?? 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("settings_terms").insert({
      body_md: bodyMd,
      version: 1,
      is_active: true,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/settings/terms");
  revalidatePath("/admin/jobs");
  return {};
}
