/**
 * Link a Clerk login to a Supabase staff row (or create one).
 * Use when someone can sign in but is missing from Admin → Staff.
 *
 * Usage:
 *   npm run staff:sync -- it@mwfab.co
 *   npm run staff:sync -- it@mwfab.co admin "IT Admin"
 */

import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { createClient } from "@supabase/supabase-js";
import { isStaffRole, type StaffRole } from "../lib/auth-constants";

async function main() {
  const emailArg = process.argv[2]?.trim().toLowerCase();
  const roleArg = (process.argv[3]?.trim() || "admin") as StaffRole;
  const nameArg = process.argv[4]?.trim() || emailArg?.split("@")[0] || "Staff";

  if (!emailArg || !emailArg.includes("@")) {
    console.error("Usage: npm run staff:sync -- <email> [role] [name]");
    console.error("Example: npm run staff:sync -- it@mwfab.co admin");
    process.exit(1);
  }

  if (!isStaffRole(roleArg)) {
    console.error(`Invalid role "${roleArg}". Use: admin, estimator, office, read_only`);
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clerkSecret = process.env.CLERK_SECRET_KEY;

  if (!supabaseUrl || !serviceKey || !clerkSecret) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or CLERK_SECRET_KEY");
    process.exit(1);
  }

  const { clerkClient } = await import("@clerk/nextjs/server");
  const clerk = await clerkClient();
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: clerkUsers } = await clerk.users.getUserList({
    emailAddress: [emailArg],
    limit: 5,
  });

  const clerkUser = clerkUsers.find((u) =>
    u.emailAddresses.some((a) => a.emailAddress.toLowerCase() === emailArg)
  );

  if (!clerkUser) {
    console.error(`No Clerk user found for ${emailArg}. Create them in Clerk Dashboard first.`);
    process.exit(1);
  }

  const clerkRole = clerkUser.publicMetadata?.role;
  const role =
    typeof clerkRole === "string" && isStaffRole(clerkRole) ? clerkRole : roleArg;

  if (clerkRole !== role) {
    await clerk.users.updateUser(clerkUser.id, {
      publicMetadata: { role },
    });
    console.log(`Updated Clerk publicMetadata.role → ${role}`);
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id, name, role, email, clerk_id")
    .or(`email.eq.${emailArg},clerk_id.eq.${clerkUser.id}`)
    .limit(2);

  const row = existing?.[0];

  if (row) {
    const { error } = await supabase
      .from("users")
      .update({
        name: row.name || nameArg,
        email: emailArg,
        role,
        clerk_id: clerkUser.id,
      })
      .eq("id", row.id);

    if (error) {
      console.error("Update failed:", error.message);
      process.exit(1);
    }
    console.log(`Updated staff row ${row.id} for ${emailArg} (clerk_id linked).`);
  } else {
    const { data: inserted, error } = await supabase
      .from("users")
      .insert({
        name: nameArg,
        email: emailArg,
        role,
        clerk_id: clerkUser.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Insert failed:", error.message);
      process.exit(1);
    }
    console.log(`Created staff row ${inserted?.id} for ${emailArg}.`);
  }

  console.log(`Done. ${emailArg} should appear under Admin → Staff and can access /admin.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
