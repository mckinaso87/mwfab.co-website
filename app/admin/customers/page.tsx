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
import { DeleteCustomerButton } from "./DeleteCustomerButton";
import type { Customer } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Customers | Admin | McKinados Welding & Fabrication",
  description: "Manage customers.",
  robots: "noindex, nofollow",
};

export default async function AdminCustomersPage() {
  const supabase = createAdminClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("company_name", { ascending: true });

  const list = (customers ?? []) as Customer[];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Customers"
        actions={
          <Link
            href="/admin/customers/new"
            className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          >
            New customer
          </Link>
        }
      />

      {list.length === 0 ? (
        <AdminEmptyState
          message="No customers yet."
          actionLabel="Add your first customer"
          actionHref="/admin/customers/new"
        />
      ) : (
        <AdminDataTable stickyHeader>
          <AdminDataTableHead>
            <AdminDataTableHeaderCell>Company</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Contact</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Email</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Phone</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Actions</AdminDataTableHeaderCell>
          </AdminDataTableHead>
          <AdminDataTableBody>
            {list.map((c) => (
              <AdminDataTableRow key={c.id}>
                <AdminDataTableCell>
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="font-medium text-foreground hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    {c.company_name}
                  </Link>
                </AdminDataTableCell>
                <AdminDataTableCell className="text-foreground-muted">
                  {c.contact_name ?? "—"}
                </AdminDataTableCell>
                <AdminDataTableCell className="text-foreground-muted">
                  {c.email ?? "—"}
                </AdminDataTableCell>
                <AdminDataTableCell className="text-foreground-muted">
                  {c.phone ?? "—"}
                </AdminDataTableCell>
                <AdminDataTableCell align="right">
                  <span className="flex justify-end items-center gap-3">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="rounded-lg border border-steel/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                    >
                      Edit
                    </Link>
                    <DeleteCustomerButton
                      customerId={c.id}
                      companyName={c.company_name}
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
