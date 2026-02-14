import type { Metadata } from "next";
import Link from "next/link";
import { createOrUpdateCustomer } from "../actions";
import { CustomerForm } from "../CustomerForm";

export const metadata: Metadata = {
  title: "New customer | Admin | McKinados Welding & Fabrication",
  description: "Add a customer.",
  robots: "noindex, nofollow",
};

export default function NewCustomerPage() {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          ← Customers
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-foreground">New customer</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        After saving, you’ll be taken to the customer page to add jobs.
      </p>
      <div className="mt-6 rounded-xl border border-steel/50 bg-gunmetal/30 p-6">
        <CustomerForm action={createOrUpdateCustomer} />
      </div>
    </div>
  );
}
