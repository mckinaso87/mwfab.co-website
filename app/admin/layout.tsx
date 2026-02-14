import Link from "next/link";
import { canAccessAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const allowed = await canAccessAdmin();
  if (!allowed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
        <p className="mt-4 text-foreground-muted">
          You don’t have permission to view this area.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="min-h-[calc(100vh-4rem)] min-w-0 flex-1 overflow-auto lg:ml-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
