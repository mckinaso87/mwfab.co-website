/** All roles stored on public.users and set in Clerk publicMetadata. */
export const STAFF_ROLES = ["admin", "estimator", "office", "read_only"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(s: string): s is StaffRole {
  return STAFF_ROLES.includes(s as StaffRole);
}

/** Roles that can access the admin platform. Use in client components (e.g. Header). */
export const ADMIN_ROLES = ["admin", "estimator", "office"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string | undefined): role is AdminRole {
  return !!role && ADMIN_ROLES.includes(role as AdminRole);
}
