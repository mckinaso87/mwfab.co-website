import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin";

export const metadata: Metadata = {
  title: "Settings | Admin | McKinados Welding & Fabrication",
  robots: "noindex, nofollow",
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader title="Settings" subtitle="Proposal terms and default exclusions." />
      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
        <Link
          href="/admin/settings/terms"
          className="rounded-xl border border-steel/50 bg-card p-6 hover:border-steel-blue/50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-foreground">Terms &amp; Conditions</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Edit the markdown terms shown on proposal page 2.
          </p>
        </Link>
        <Link
          href="/admin/settings/exclusions"
          className="rounded-xl border border-steel/50 bg-card p-6 hover:border-steel-blue/50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-foreground">Exclusions</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Manage default exclusion items for takeoff proposals.
          </p>
        </Link>
        <Link
          href="/admin/settings/integrations"
          className="admin-card rounded-xl border p-6 transition-colors hover:border-admin-teal/40"
        >
          <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Connect QuickBooks Online to sync customers and push estimates.
          </p>
        </Link>
      </div>
    </div>
  );
}
