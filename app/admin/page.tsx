import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | McKinados Welding & Fabrication",
  description: "Admin area. Coming in Phase 2.",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-foreground">Admin</h1>
      <p className="mt-4 text-foreground-muted">
        Coming in Phase 2. No admin logic or dashboard in Phase 1.
      </p>
    </div>
  );
}
