import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableHead,
  AdminDataTableHeaderCell,
  AdminDataTableRow,
  AdminEmptyState,
  AdminPageHeader,
} from "@/components/admin";
import { DeleteStaffButton } from "./DeleteStaffButton";
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
    <div className="space-y-8">
      <AdminPageHeader
        title="Staff"
        subtitle="Staff listed here can be assigned to jobs. Manage Clerk sign-in separately."
        actions={
          <Link
            href="/admin/staff/new"
            className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          >
            Add staff
          </Link>
        }
      />

      {list.length === 0 ? (
        <AdminEmptyState
          message="No staff yet."
          actionLabel="Add your first staff member"
          actionHref="/admin/staff/new"
        />
      ) : (
        <AdminDataTable stickyHeader>
          <AdminDataTableHead>
            <AdminDataTableHeaderCell>Name</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Role</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Actions</AdminDataTableHeaderCell>
          </AdminDataTableHead>
          <AdminDataTableBody>
            {list.map((u) => (
              <AdminDataTableRow key={u.id}>
                <AdminDataTableCell className="font-medium text-foreground">
                  <Link
                    href={`/admin/staff/${u.id}`}
                    className="text-foreground hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    {u.name ?? "—"}
                  </Link>
                </AdminDataTableCell>
                <AdminDataTableCell className="capitalize text-foreground-muted">
                  {u.role.replace("_", " ")}
                </AdminDataTableCell>
                <AdminDataTableCell align="right">
                  <span className="flex justify-end items-center gap-3">
                    <Link
                      href={`/admin/staff/${u.id}`}
                      className="rounded-lg border border-steel/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                    >
                      Edit
                    </Link>
                    <DeleteStaffButton
                      staffId={u.id}
                      staffName={u.name ?? "Staff"}
                      variant="list"
                    />
                  </span>
                </AdminDataTableCell>
              </AdminDataTableRow>
            ))}
          </AdminDataTableBody>
        </AdminDataTable>
      )}
    </div>
  );
}
