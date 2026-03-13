import type { Metadata } from "next";
import { listMaterialCatalog } from "@/app/admin/materials/actions";
import { MaterialsTable } from "@/app/admin/materials/MaterialsTable";
import { AdminPageHeader } from "@/components/admin";

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
    <div className="space-y-8">
      <AdminPageHeader
        title="Materials"
        subtitle="Edit pricing and display names for the material catalog used in takeoffs."
      />

      {error && (
        <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <MaterialsTable rows={rows} currentCategory={category} />
    </div>
  );
}
