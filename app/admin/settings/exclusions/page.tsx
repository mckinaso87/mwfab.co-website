import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin";
import { ExclusionsManager } from "./ExclusionsManager";
import type { SettingsExclusion } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Exclusions | Settings | Admin",
  robots: "noindex, nofollow",
};

export default async function ExclusionsSettingsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("settings_exclusions")
    .select("*")
    .order("sort_order");
  const exclusions = (data ?? []) as SettingsExclusion[];

  return (
    <div className="space-y-8">
      <Link href="/admin/settings" className="text-sm text-foreground-muted hover:text-foreground">
        ← Settings
      </Link>
      <AdminPageHeader
        title="Proposal exclusions"
        subtitle="Active items appear in the takeoff multi-select."
      />
      <ExclusionsManager exclusions={exclusions} />
    </div>
  );
}
