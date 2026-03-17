"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const STAFF_ROLES = ["admin", "estimator", "office", "read_only"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

function isStaffRole(s: string): s is StaffRole {
  return STAFF_ROLES.includes(s as StaffRole);
}

export async function createStaff(formData: FormData) {
  const supabase = createAdminClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  const roleRaw = (formData.get("role") as string)?.trim() || "office";
  if (!isStaffRole(roleRaw)) return { error: "Invalid role." };

  const { error } = await supabase.from("users").insert({
    name,
    role: roleRaw,
    clerk_id: null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/staff");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/dashboard");
  redirect("/admin/staff");
}

export async function updateStaff(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  const roleRaw = (formData.get("role") as string)?.trim() || "office";
  if (!isStaffRole(roleRaw)) return { error: "Invalid role." };

  const { error } = await supabase
    .from("users")
    .update({ name, role: roleRaw })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/staff");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

/** Server action for form: when user_id is present in formData, updates that user. */
export async function createOrUpdateStaff(formData: FormData) {
  const id = (formData.get("user_id") as string)?.trim();
  if (id) return updateStaff(id, formData);
  return createStaff(formData);
}

export async function deleteStaff(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/staff");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
