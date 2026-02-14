import { redirect } from "next/navigation";
import { getAdminRole } from "@/lib/auth";

/**
 * Post-sign-in redirect: admins go to /admin, everyone else to /.
 */
export default async function AfterSignInPage() {
  const role = await getAdminRole();
  if (role) redirect("/admin");
  redirect("/");
}
