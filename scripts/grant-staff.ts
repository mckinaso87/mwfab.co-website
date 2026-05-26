/**
 * Create or update a Supabase staff row without calling Clerk (use when Clerk API is down).
 * Link clerk_id later with: npm run staff:sync -- <email>
 *
 * Usage:
 *   npm run staff:grant -- it@mwfab.co admin "IT"
 *   npm run staff:grant -- it@mwfab.co admin "IT" user_2abc...
 */

import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { createClient } from "@supabase/supabase-js";
import { isStaffRole, type StaffRole } from "../lib/auth-constants";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const roleArg = (process.argv[3]?.trim() || "admin") as StaffRole;
  const nameArg = process.argv[4]?.trim();
  const clerkIdArg = process.argv[5]?.trim() || null;

  if (!email || !email.includes("@")) {
    console.error("Usage: npm run staff:grant -- <email> [role] [name] [clerk_user_id]");
    console.error("Example: npm run staff:grant -- it@mwfab.co admin \"IT\"");
    process.exit(1);
  }

  if (!isStaffRole(roleArg)) {
    console.error(`Invalid role "${roleArg}". Use: admin, estimator, office, read_only`);
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const name = nameArg || email.split("@")[0] || "Staff";

  const { data: existing } = await supabase
    .from("users")
    .select("id, name, role, email, clerk_id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const updates: { name: string; role: StaffRole; clerk_id?: string } = {
      name: existing.name || name,
      role: roleArg,
    };
    if (clerkIdArg && !existing.clerk_id) updates.clerk_id = clerkIdArg;

    const { error } = await supabase.from("users").update(updates).eq("id", existing.id);
    if (error) {
      console.error("Update failed:", error.message);
      process.exit(1);
    }
    console.log(`Updated staff ${existing.id} (${email}, role=${roleArg}).`);
  } else {
    const { data: inserted, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        role: roleArg,
        clerk_id: clerkIdArg,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Insert failed:", error.message);
      process.exit(1);
    }
    console.log(`Created staff ${inserted?.id} (${email}, role=${roleArg}).`);
  }

  if (!clerkIdArg) {
    console.log(
      "No clerk_id set. Copy your Clerk user id from the Dashboard → Users → it@mwfab.co, then run:"
    );
    console.log(`  npm run staff:grant -- ${email} ${roleArg} "${name}" user_xxxx`);
    console.log("Or when Clerk API works: npm run staff:sync --", email);
  } else {
    console.log("clerk_id linked. Sign out and back in, then open /admin.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
