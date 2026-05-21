import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAdminRole } from "@/lib/auth";

/**
 * Post-sign-in redirect: admins go to /admin, everyone else to /.
 * Unauthenticated visitors (e.g. old invite links) go to sign-up.
 */
export default async function AfterSignInPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-up");
  }

  const role = await getAdminRole();
  if (role) redirect("/admin");
  redirect("/");
}
