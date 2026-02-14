import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Staff | Admin | McKinados Welding & Fabrication",
  description: "Manage staff for job assignment.",
  robots: "noindex, nofollow",
};

export default async function AdminStaffPage() {
  const supabase = createAdminClient();
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("name", { ascending: true, nullsFirst: false });

  const list = (users ?? []) as User[];

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Staff</h1>
        <Link
          href="/admin/staff/new"
          className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel"
        >
          Add staff
        </Link>
      </div>
      <p className="mt-1 text-sm text-foreground-muted">
        Staff listed here can be assigned to jobs. Manage Clerk sign-in separately.
      </p>

      {list.length === 0 ? (
        <div className="mt-8 rounded-xl border border-steel/50 bg-gunmetal/50 p-12 text-center">
          <p className="text-foreground-muted">No staff yet.</p>
          <Link
            href="/admin/staff/new"
            className="mt-4 inline-block rounded-lg bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel"
          >
            Add your first staff member
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-steel/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-steel/50 bg-gunmetal/80 text-left">
                  <th className="px-4 py-3 font-medium text-foreground-muted">Name</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Role</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-steel/30 transition-colors last:border-0 hover:bg-steel/20"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {u.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted capitalize">
                      {u.role.replace("_", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
