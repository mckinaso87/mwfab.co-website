/** Roles that can access the admin platform. Use in client components (e.g. Header). */
export const ADMIN_ROLES = ["admin", "estimator", "office"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role: string | undefined): role is AdminRole {
  return !!role && ADMIN_ROLES.includes(role as AdminRole);
}
