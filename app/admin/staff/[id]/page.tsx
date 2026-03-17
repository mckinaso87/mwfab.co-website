import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrUpdateStaff } from "../actions";
import { StaffForm } from "../StaffForm";
import { DeleteStaffButton } from "../DeleteStaffButton";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import type { User } from "@/lib/db-types";

export const metadata: Metadata = {
  title: "Edit staff | Admin | McKinados Welding & Fabrication",
  description: "Edit staff member.",
  robots: "noindex, nofollow",
};

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: user } = await supabase.from("users").select("*").eq("id", id).single();

  if (!user) notFound();
  const u = user as User;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/staff"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        >
          ← Staff
        </Link>
      </div>
      <AdminPageHeader
        title={u.name ?? "Edit staff"}
        subtitle="Update name and role."
        actions={<DeleteStaffButton staffId={id} staffName={u.name ?? "Staff"} variant="detail" />}
      />
      <AdminSectionCard>
        <StaffForm action={createOrUpdateStaff} user={u} />
      </AdminSectionCard>
    </div>
  );
}
