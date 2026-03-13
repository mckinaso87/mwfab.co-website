import type { Metadata } from "next";
import Link from "next/link";
import { createOrUpdateCustomer } from "../actions";
import { CustomerForm } from "../CustomerForm";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";

export const metadata: Metadata = {
  title: "New customer | Admin | McKinados Welding & Fabrication",
  description: "Add a customer.",
  robots: "noindex, nofollow",
};

export default function NewCustomerPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/customers"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          ← Customers
        </Link>
      </div>
      <AdminPageHeader
        title="New customer"
        subtitle="After saving, you'll be taken back to the customer list."
      />
      <AdminSectionCard>
        <CustomerForm action={createOrUpdateCustomer} />
      </AdminSectionCard>
    </div>
  );
}
