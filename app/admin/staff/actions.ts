"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { isStaffRole, type StaffRole } from "@/lib/auth-constants";
import { getAppBaseUrl } from "@/lib/app-url";
import { generateTempPassword, parseClerkError, staffPublicMetadata } from "@/lib/clerk-staff";
import { requireClerkEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export type StaffActionResult = {
  error?: string;
  success?: boolean;
  tempPassword?: string;
  message?: string;
};

const STAFF_PATHS = ["/admin/staff", "/admin/jobs", "/admin/dashboard"] as const;

function revalidateStaffPaths() {
  for (const path of STAFF_PATHS) {
    revalidatePath(path);
  }
}

function parseRole(formData: FormData): { role: StaffRole } | { error: string } {
  const roleRaw = (formData.get("role") as string)?.trim() || "office";
  if (!isStaffRole(roleRaw)) return { error: "Invalid role." };
  return { role: roleRaw };
}

function parseEmail(formData: FormData): { email: string } | { error: string } {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Email is required when login is enabled." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  return { email };
}

function canLoginFromForm(formData: FormData): boolean {
  return formData.get("can_login") === "on" || formData.get("enable_login") === "on";
}

function inviteMethodFromForm(formData: FormData): "invite" | "password" {
  const method = (formData.get("invite_method") as string)?.trim();
  return method === "password" ? "password" : "invite";
}

async function sendClerkInvite(email: string, role: StaffRole): Promise<StaffActionResult> {
  requireClerkEnv();
  const client = await clerkClient();
  const redirectUrl = `${getAppBaseUrl()}/after-sign-in`;
  try {
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: staffPublicMetadata(role),
      redirectUrl,
    });
    return { success: true, message: `Invitation sent to ${email}.` };
  } catch (err) {
    return { error: parseClerkError(err) };
  }
}

async function createClerkUserWithPassword(
  email: string,
  role: StaffRole
): Promise<{ clerkId: string; tempPassword: string } | { error: string }> {
  requireClerkEnv();
  const client = await clerkClient();
  const tempPassword = generateTempPassword();
  try {
    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      password: tempPassword,
      publicMetadata: staffPublicMetadata(role),
    });
    return { clerkId: clerkUser.id, tempPassword };
  } catch (err) {
    return { error: parseClerkError(err) };
  }
}

export async function createStaff(formData: FormData): Promise<StaffActionResult> {
  const supabase = createAdminClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  const roleParsed = parseRole(formData);
  if ("error" in roleParsed) return roleParsed;
  const { role } = roleParsed;

  const canLogin = canLoginFromForm(formData);

  if (!canLogin) {
    const { error } = await supabase.from("users").insert({
      name,
      role,
      clerk_id: null,
      email: null,
    });
    if (error) return { error: error.message };
    revalidateStaffPaths();
    return { success: true, message: "Staff member added." };
  }

  const emailParsed = parseEmail(formData);
  if ("error" in emailParsed) return emailParsed;
  const { email } = emailParsed;
  const method = inviteMethodFromForm(formData);

  if (method === "invite") {
    const inviteResult = await sendClerkInvite(email, role);
    if (inviteResult.error) return inviteResult;

    const { error } = await supabase.from("users").insert({
      name,
      role,
      email,
      clerk_id: null,
    });
    if (error) return { error: error.message };

    revalidateStaffPaths();
    return inviteResult;
  }

  const clerkResult = await createClerkUserWithPassword(email, role);
  if ("error" in clerkResult) return clerkResult;

  const { error } = await supabase.from("users").insert({
    name,
    role,
    email,
    clerk_id: clerkResult.clerkId,
  });

  if (error) {
    try {
      const client = await clerkClient();
      await client.users.deleteUser(clerkResult.clerkId);
    } catch {
      return {
        error: `${error.message} The Clerk account could not be rolled back; remove it manually in Clerk.`,
      };
    }
    return { error: error.message };
  }

  revalidateStaffPaths();
  return {
    success: true,
    tempPassword: clerkResult.tempPassword,
    message: "Staff member created with login.",
  };
}

export async function updateStaff(id: string, formData: FormData): Promise<StaffActionResult> {
  const supabase = createAdminClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  const roleParsed = parseRole(formData);
  if ("error" in roleParsed) return roleParsed;
  const { role } = roleParsed;

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("clerk_id, role")
    .eq("id", id)
    .single();

  if (fetchError || !existing) return { error: "Staff member not found." };

  if (formData.get("enable_login") === "on" && !existing.clerk_id) {
    return enableStaffLogin(id, formData);
  }

  const { error } = await supabase.from("users").update({ name, role }).eq("id", id);
  if (error) return { error: error.message };

  if (existing.clerk_id && existing.role !== role) {
    requireClerkEnv();
    try {
      const client = await clerkClient();
      await client.users.updateUser(existing.clerk_id, {
        publicMetadata: staffPublicMetadata(role),
      });
    } catch (err) {
      return { error: parseClerkError(err) };
    }
  }

  revalidateStaffPaths();
  return { success: true, message: "Staff updated." };
}

export async function enableStaffLogin(
  id: string,
  formData: FormData
): Promise<StaffActionResult> {
  const supabase = createAdminClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("clerk_id, name, role")
    .eq("id", id)
    .single();

  if (fetchError || !existing) return { error: "Staff member not found." };
  if (existing.clerk_id) return { error: "Login is already enabled for this staff member." };

  const roleParsed = parseRole(formData);
  if ("error" in roleParsed) return roleParsed;
  const { role } = roleParsed;

  const emailParsed = parseEmail(formData);
  if ("error" in emailParsed) return emailParsed;
  const { email } = emailParsed;
  const method = inviteMethodFromForm(formData);

  if (method === "invite") {
    const inviteResult = await sendClerkInvite(email, role);
    if (inviteResult.error) return inviteResult;

    const { error } = await supabase
      .from("users")
      .update({ name, email, role })
      .eq("id", id);
    if (error) return { error: error.message };

    revalidateStaffPaths();
    return inviteResult;
  }

  const clerkResult = await createClerkUserWithPassword(email, role);
  if ("error" in clerkResult) return clerkResult;

  const { error } = await supabase
    .from("users")
    .update({ name, email, role, clerk_id: clerkResult.clerkId })
    .eq("id", id);

  if (error) {
    try {
      const client = await clerkClient();
      await client.users.deleteUser(clerkResult.clerkId);
    } catch {
      return {
        error: `${error.message} The Clerk account could not be rolled back; remove it manually in Clerk.`,
      };
    }
    return { error: error.message };
  }

  revalidateStaffPaths();
  return {
    success: true,
    tempPassword: clerkResult.tempPassword,
    message: "Login enabled with temporary password.",
  };
}

export async function revokeStaffLogin(id: string): Promise<StaffActionResult> {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("clerk_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) return { error: "Staff member not found." };
  if (!existing.clerk_id) return { error: "This staff member does not have login enabled." };

  const clerkId = existing.clerk_id;

  const { error: clearError } = await supabase
    .from("users")
    .update({ clerk_id: null })
    .eq("id", id);

  if (clearError) return { error: clearError.message };

  requireClerkEnv();
  try {
    const client = await clerkClient();
    await client.users.deleteUser(clerkId);
  } catch (err) {
    await supabase.from("users").update({ clerk_id: clerkId }).eq("id", id);
    return { error: parseClerkError(err) };
  }

  revalidateStaffPaths();
  return { success: true, message: "Login revoked. Staff record kept for job assignment." };
}

export async function createOrUpdateStaff(formData: FormData): Promise<StaffActionResult> {
  const id = (formData.get("user_id") as string)?.trim();
  if (id) return updateStaff(id, formData);
  return createStaff(formData);
}

export async function deleteStaff(id: string): Promise<StaffActionResult> {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("clerk_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) return { error: "Staff member not found." };

  if (existing.clerk_id) {
    requireClerkEnv();
    try {
      const client = await clerkClient();
      await client.users.deleteUser(existing.clerk_id);
    } catch (err) {
      return { error: parseClerkError(err) };
    }
  }

  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateStaffPaths();
  return { success: true };
}
