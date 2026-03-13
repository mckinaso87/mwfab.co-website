import type { Metadata } from "next";
import Link from "next/link";
import { createStaff } from "../actions";
import { StaffForm } from "../StaffForm";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";

export const metadata: Metadata = {
  title: "Add staff | Admin | McKinados Welding & Fabrication",
  description: "Add a staff member.",
  robots: "noindex, nofollow",
};

export default function NewStaffPage() {
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
        title="Add staff"
        subtitle="After saving, the staff member can be assigned to jobs."
      />
      <AdminSectionCard>
        <StaffForm action={createStaff} />
      </AdminSectionCard>
    </div>
  );
}
