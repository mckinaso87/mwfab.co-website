import type { Metadata } from "next";
import Link from "next/link";
import { createStaff } from "../actions";
import { StaffForm } from "../StaffForm";

export const metadata: Metadata = {
  title: "Add staff | Admin | McKinados Welding & Fabrication",
  description: "Add a staff member for job assignment.",
  robots: "noindex, nofollow",
};

export default function NewStaffPage() {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/staff"
          className="text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          ← Staff
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Add staff</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Staff can be assigned to jobs. They are managed here only; Clerk sign-in is separate.
      </p>
      <div className="mt-6 rounded-xl border border-steel/50 bg-gunmetal/30 p-6">
        <StaffForm action={createStaff} />
      </div>
    </div>
  );
}
