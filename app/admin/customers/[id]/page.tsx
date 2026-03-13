import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrUpdateCustomer } from "../actions";
import { CustomerForm } from "../CustomerForm";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import type { Customer } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Customer | Admin | McKinados Welding & Fabrication",
  description: "Customer detail.",
  robots: "noindex, nofollow",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) notFound();
  const c = customer as Customer;

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, job_name, status, bid_due_date")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

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
      <AdminPageHeader title={c.company_name} />

      <AdminSectionCard
        title="Edit customer"
        className="[&>h2]:mb-1 [&>h2]+p:mb-6"
      >
        <p className="mb-6 text-sm text-foreground-muted">
          Update company and contact details. Changes save to this view.
        </p>
        <CustomerForm action={createOrUpdateCustomer} customer={c} />
      </AdminSectionCard>

      <AdminSectionCard title="Jobs">
        {!jobs?.length ? (
          <p className="text-sm text-foreground-muted">No jobs yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-foreground">
            {jobs.map((j) => (
              <li key={j.id}>
                <Link
                  href={`/admin/jobs/${j.id}`}
                  className="font-medium text-foreground hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                >
                  {j.job_name}
                </Link>
                <span className="ml-2 text-foreground-muted">
                  {j.status}
                  {j.bid_due_date ? ` · Due ${j.bid_due_date}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/admin/jobs/new?customer_id=${id}`}
          className="mt-4 inline-block rounded-lg border border-steel/50 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          Add job
        </Link>
      </AdminSectionCard>
    </div>
  );
}
