import { currentUser } from "@clerk/nextjs/server";
import { ADMIN_ROLES, type AdminRole } from "./auth-constants";

export { ADMIN_ROLES, type AdminRole } from "./auth-constants";

/**
 * Returns the current user's role from Clerk publicMetadata.
 * Use in admin layout to restrict access to admin | estimator | office.
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  const user = await currentUser();
  if (!user) return null;
  const role = user.publicMetadata?.role as string | undefined;
  if (!role || !ADMIN_ROLES.includes(role as AdminRole)) return null;
  return role as AdminRole;
}

/** Returns true if the current user is allowed in admin. */
export async function canAccessAdmin(): Promise<boolean> {
  return (await getAdminRole()) !== null;
}
