import { auth, clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { ADMIN_ROLES, isAdminRole, type AdminRole } from "./auth-constants";
import { createAdminClient } from "./supabase/admin";

export { ADMIN_ROLES, type AdminRole } from "./auth-constants";

type SessionClaims = Record<string, unknown> | null | undefined;

function roleFromSessionClaims(sessionClaims: SessionClaims): string | undefined {
  if (!sessionClaims) return undefined;

  const metadata = sessionClaims.metadata;
  if (metadata && typeof metadata === "object" && metadata !== null) {
    const role = (metadata as { role?: unknown }).role;
    if (typeof role === "string") return role;
  }

  const publicMetadata = sessionClaims.publicMetadata ?? sessionClaims.public_metadata;
  if (publicMetadata && typeof publicMetadata === "object" && publicMetadata !== null) {
    const role = (publicMetadata as { role?: unknown }).role;
    if (typeof role === "string") return role;
  }

  const role = sessionClaims.role;
  return typeof role === "string" ? role : undefined;
}

function emailFromSessionClaims(sessionClaims: SessionClaims): string | undefined {
  if (!sessionClaims) return undefined;
  const direct = sessionClaims.email;
  if (typeof direct === "string" && direct.includes("@")) return direct.toLowerCase();

  const primary =
    sessionClaims.primary_email_address ?? sessionClaims.primaryEmailAddress;
  if (typeof primary === "string" && primary.includes("@")) return primary.toLowerCase();

  return undefined;
}

async function roleFromDatabase(
  clerkId: string,
  email?: string
): Promise<AdminRole | null> {
  try {
    const supabase = createAdminClient();

    const { data: byClerk } = await supabase
      .from("users")
      .select("id, role, clerk_id, email")
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (byClerk?.role && isAdminRole(byClerk.role)) return byClerk.role;

    if (email) {
      const { data: byEmail } = await supabase
        .from("users")
        .select("id, role, clerk_id, email")
        .eq("email", email)
        .maybeSingle();

      if (byEmail?.role && isAdminRole(byEmail.role)) {
        if (!byEmail.clerk_id) {
          await supabase.from("users").update({ clerk_id: clerkId }).eq("id", byEmail.id);
        }
        return byEmail.role;
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function roleFromClerkApi(clerkId: string): Promise<AdminRole | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkId);
    const role = user.publicMetadata?.role;
    if (typeof role === "string" && isAdminRole(role)) return role;
    return null;
  } catch (err) {
    if (isClerkAPIResponseError(err)) {
      console.error("[auth] Clerk user API failed:", err.status, err.errors?.[0]?.message);
    }
    return null;
  }
}

/**
 * Returns the current user's admin role (admin | estimator | office).
 * Session JWT → Supabase staff row → Clerk publicMetadata (last resort).
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const sessionRole = roleFromSessionClaims(sessionClaims);
  if (sessionRole && isAdminRole(sessionRole)) return sessionRole;

  const email = emailFromSessionClaims(sessionClaims);
  const dbRole = await roleFromDatabase(userId, email);
  if (dbRole) return dbRole;

  return roleFromClerkApi(userId);
}

/** Returns true if the current user is allowed in admin. */
export async function canAccessAdmin(): Promise<boolean> {
  return (await getAdminRole()) !== null;
}
