import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
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
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <Link
          href="/admin/customers/new"
          className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-steel"
        >
          New customer
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-xl border border-steel/50 bg-gunmetal/50 p-12 text-center">
          <p className="text-foreground-muted">No customers yet.</p>
          <Link
            href="/admin/customers/new"
            className="mt-4 inline-block rounded-lg bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel"
          >
            Add your first customer
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-steel/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-steel/50 bg-gunmetal/80 text-left">
                  <th className="px-4 py-3 font-medium text-foreground-muted">Company</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Contact</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Email</th>
                  <th className="px-4 py-3 font-medium text-foreground-muted">Phone</th>
                  <th className="w-24 px-4 py-3 font-medium text-foreground-muted text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-steel/30 transition-colors last:border-0 hover:bg-steel/20"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {c.company_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {c.contact_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {c.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-sm text-steel-blue hover:underline"
                      >
                        Edit
                      </Link>
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
