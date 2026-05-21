import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminPageHeader } from "@/components/admin";
import { TermsEditor } from "./TermsEditor";
import type { SettingsTerms } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Terms | Settings | Admin",
  robots: "noindex, nofollow",
};

export default async function TermsSettingsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("settings_terms")
    .select("*")
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const terms = (data as SettingsTerms | null) ?? {
    id: "",
    version: 0,
    body_md: "",
    is_active: true,
    updated_at: "",
  };

  return (
    <div className="space-y-8">
      <Link href="/admin/settings" className="text-sm text-foreground-muted hover:text-foreground">
        ← Settings
      </Link>
      <AdminPageHeader
        title="Terms & Conditions"
        subtitle={`Version ${terms.version} · Last updated ${terms.updated_at ? new Date(terms.updated_at).toLocaleString() : "—"}`}
      />
      <TermsEditor initialBody={terms.body_md} version={terms.version} />
    </div>
  );
}
