import type { Metadata } from "next";
import Link from "next/link";
import { listAllMaterialFieldConfig } from "@/app/admin/materials/actions";
import { FieldConfigEditor } from "./FieldConfigEditor";
import { AdminPageHeader } from "@/components/admin";
import { CATEGORY_LABEL, CATALOG_CATEGORIES } from "@/lib/takeoff-catalog-spec";

export const metadata: Metadata = {
  title: "Field visibility | Materials | Admin",
  robots: "noindex, nofollow",
};

export default async function FieldConfigPage() {
  const { rows, error } = await listAllMaterialFieldConfig();

  const byCategory = CATALOG_CATEGORIES.map((cat) => ({
    category: cat,
    label: CATEGORY_LABEL[cat],
    fields: rows.filter((r) => r.category === cat).sort((a, b) => a.sort_order - b.sort_order),
  }));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Takeoff field visibility"
        subtitle="Control which catalog fields operators see when picking materials in takeoff."
      />
      <p>
        <Link href="/admin/materials" className="text-sm text-steel-blue hover:underline">
          ← Back to materials
        </Link>
      </p>
      {error && (
        <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}
      <FieldConfigEditor groups={byCategory} />
    </div>
  );
}
