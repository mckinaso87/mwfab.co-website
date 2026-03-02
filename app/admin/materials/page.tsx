import type { Metadata } from "next";
import { listMaterialCatalog } from "@/app/admin/materials/actions";
import { MaterialsTable } from "@/app/admin/materials/MaterialsTable";

export const metadata: Metadata = {
  title: "Materials | Admin | McKinados Welding & Fabrication",
  description: "View and edit material catalog pricing.",
  robots: "noindex, nofollow",
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function AdminMaterialsPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = (params.category?.trim() || null) ?? null;
  const { rows, error } = await listMaterialCatalog(category);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Materials</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Edit pricing and display names for the material catalog used in takeoffs.
      </p>
      {error && (
        <p className="mt-4 rounded-md bg-red-900/30 px-3 py-2 text-sm text-red-200">{error}</p>
      )}
      <div className="mt-6">
        <MaterialsTable rows={rows} currentCategory={category} />
      </div>
    </div>
  );
}
