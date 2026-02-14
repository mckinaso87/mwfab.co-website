import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrUpdateCustomer } from "../actions";
import { CustomerForm } from "../CustomerForm";
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
    <div>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          ← Customers
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-foreground">{c.company_name}</h1>

      <section className="mt-8 rounded-xl border border-steel/50 bg-gunmetal/30 p-6">
        <h2 className="text-lg font-semibold text-foreground">Edit customer</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Update company and contact details. Changes save to this view.
        </p>
        <CustomerForm action={createOrUpdateCustomer} customer={c} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Jobs</h2>
        {!jobs?.length ? (
          <p className="mt-2 text-sm text-foreground-muted">No jobs yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {jobs.map((j) => (
              <li key={j.id}>
                <Link
                  href={`/admin/jobs/${j.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {j.job_name}
                </Link>
                <span className="ml-2 text-sm text-foreground-muted">
                  {j.status}
                  {j.bid_due_date ? ` · Due ${j.bid_due_date}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/admin/jobs/new?customer_id=${id}`}
          className="mt-3 inline-block rounded-lg border border-steel/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-steel/30"
        >
          Add job
        </Link>
      </section>
    </div>
  );
}
