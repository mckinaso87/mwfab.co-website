"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  updateMaterialCatalogRow,
  type MaterialCatalogUpdate,
} from "@/app/admin/materials/actions";
import {
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableHead,
  AdminDataTableHeaderCell,
  AdminDataTableRow,
  AdminEmptyState,
  AdminToolbar,
} from "@/components/admin";
import type { MaterialCatalogRow } from "@/lib/db-types";
import { getCatalogCategories, CATEGORY_LABELS } from "@/lib/takeoff-catalog-spec";

function formatNum(n: number | null): string {
  if (n == null) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(4);
}

export function MaterialsTable({
  rows,
  currentCategory,
}: {
  rows: MaterialCatalogRow[];
  currentCategory: string | null;
}) {
  const router = useRouter();
  const categories = getCatalogCategories();
  const [editingRow, setEditingRow] = useState<MaterialCatalogRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    const params = new URLSearchParams();
    if (v && v !== "all") params.set("category", v);
    router.push(`/admin/materials${params.toString() ? `?${params}` : ""}`);
  }

  async function handleSave(payload: MaterialCatalogUpdate) {
    if (!editingRow) return;
    setSaving(true);
    setError(null);
    const { error: err } = await updateMaterialCatalogRow(editingRow.id, payload);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setEditingRow(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <AdminToolbar>
        <label className="flex items-center gap-2 text-sm text-foreground-muted">
          Category
          <select
            value={currentCategory ?? "all"}
            onChange={handleCategoryChange}
            className="rounded-lg border border-steel/50 bg-card px-3 py-2 text-sm text-foreground focus:border-steel-blue focus:outline-none focus:ring-1 focus:ring-steel-blue focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          >
            <option value="all">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
          </select>
        </label>
      </AdminToolbar>

      {rows.length === 0 ? (
        <AdminEmptyState message="No materials in this category." />
      ) : (
        <AdminDataTable stickyHeader>
          <AdminDataTableHead>
            <AdminDataTableHeaderCell>Category</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Item code</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Display name</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Weight/ft</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Cost/lb</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Cost/ft</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Pricing unit</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Source file</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Actions</AdminDataTableHeaderCell>
          </AdminDataTableHead>
          <AdminDataTableBody>
            {rows.map((row) => (
              <AdminDataTableRow key={row.id}>
                <AdminDataTableCell className="text-foreground-muted">
                  {CATEGORY_LABELS[row.category] ?? row.category}
                </AdminDataTableCell>
                <AdminDataTableCell className="font-mono text-foreground">
                  {row.item_code}
                </AdminDataTableCell>
                <AdminDataTableCell className="text-foreground">
                  {row.display_name ?? "—"}
                </AdminDataTableCell>
                <AdminDataTableCell align="right" className="text-foreground-muted">
                  {formatNum(row.weight_per_ft)}
                </AdminDataTableCell>
                <AdminDataTableCell align="right" className="text-foreground-muted">
                  {formatNum(row.cost_per_lb)}
                </AdminDataTableCell>
                <AdminDataTableCell align="right" className="text-foreground-muted">
                  {formatNum(row.cost_per_foot)}
                </AdminDataTableCell>
                <AdminDataTableCell className="text-foreground-muted">
                  {row.pricing_unit}
                </AdminDataTableCell>
                <AdminDataTableCell className="text-xs text-foreground-muted">
                  {row.source_file ?? "—"}
                </AdminDataTableCell>
                <AdminDataTableCell align="right">
                  <button
                    type="button"
                    onClick={() => setEditingRow(row)}
                    className="text-sm font-medium text-steel-blue hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-steel-blue focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    Edit
                  </button>
                </AdminDataTableCell>
              </AdminDataTableRow>
            ))}
          </AdminDataTableBody>
        </AdminDataTable>
      )}

      {editingRow && (
        <EditSlideOver
          row={editingRow}
          onClose={() => { setEditingRow(null); setError(null); }}
          onSave={handleSave}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}

const CATEGORY_OPTIONS = [
  "angles",
  "wide_flange",
  "bars_hr_rounds",
  "bars_cf_rounds",
  "bars_flat",
  "channels",
  "mc_channels",
  "pipe",
  "tube",
] as const;

function EditSlideOver({
  row,
  onClose,
  onSave,
  saving,
  error,
}: {
  row: MaterialCatalogRow;
  onClose: () => void;
  onSave: (p: MaterialCatalogUpdate) => Promise<void>;
  saving: boolean;
  error: string | null;
}) {
  const [category, setCategory] = useState(row.category);
  const [itemCode, setItemCode] = useState(row.item_code ?? "");
  const [displayName, setDisplayName] = useState(row.display_name ?? "");
  const [dimensionsJson, setDimensionsJson] = useState(() =>
    row.dimensions && typeof row.dimensions === "object"
      ? JSON.stringify(row.dimensions, null, 2)
      : ""
  );
  const [weightPerFt, setWeightPerFt] = useState(
    row.weight_per_ft != null ? String(row.weight_per_ft) : ""
  );
  const [costPerLb, setCostPerLb] = useState(
    row.cost_per_lb != null ? String(row.cost_per_lb) : ""
  );
  const [costPerFoot, setCostPerFoot] = useState(
    row.cost_per_foot != null ? String(row.cost_per_foot) : ""
  );
  const [pricingUnit, setPricingUnit] = useState<"per_lb" | "per_foot">(row.pricing_unit);
  const [sourceFile, setSourceFile] = useState(row.source_file ?? "");
  const [dimensionsError, setDimensionsError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDimensionsError(null);
    let dimensions: Record<string, unknown> | null = null;
    if (dimensionsJson.trim()) {
      try {
        dimensions = JSON.parse(dimensionsJson) as Record<string, unknown>;
      } catch {
        setDimensionsError("Dimensions must be valid JSON");
        return;
      }
    }
    onSave({
      category,
      item_code: itemCode.trim() || "",
      display_name: displayName.trim() || null,
      dimensions,
      weight_per_ft: weightPerFt === "" ? null : parseFloat(weightPerFt),
      cost_per_lb: costPerLb === "" ? null : parseFloat(costPerLb),
      cost_per_foot: costPerFoot === "" ? null : parseFloat(costPerFoot),
      pricing_unit: pricingUnit,
      source_file: sourceFile.trim() || null,
    });
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-steel/50 bg-charcoal px-3 py-2 text-foreground focus:border-steel-blue focus:outline-none focus:ring-1 focus:ring-steel-blue";

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-charcoal/80 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-steel/50 bg-gunmetal shadow-xl">
        <div className="flex items-center justify-between border-b border-steel/50 px-4 py-3">
          <h2 className="text-lg font-semibold text-foreground">Edit material</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-foreground-muted hover:bg-steel/50 hover:text-foreground"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {error && (
              <p className="rounded-md bg-red-900/30 px-3 py-2 text-sm text-red-200">{error}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCatalogRow["category"])}
                className={inputClass}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c] ?? c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Item code</label>
              <input
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Weight per ft</label>
              <input
                type="number"
                step="any"
                min="0"
                value={weightPerFt}
                onChange={(e) => setWeightPerFt(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Cost per lb</label>
              <input
                type="number"
                step="any"
                min="0"
                value={costPerLb}
                onChange={(e) => setCostPerLb(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Cost per foot</label>
              <input
                type="number"
                step="any"
                min="0"
                value={costPerFoot}
                onChange={(e) => setCostPerFoot(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Pricing unit</label>
              <select
                value={pricingUnit}
                onChange={(e) => setPricingUnit(e.target.value as "per_lb" | "per_foot")}
                className={inputClass}
              >
                <option value="per_lb">per_lb</option>
                <option value="per_foot">per_foot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Source file</label>
              <input
                type="text"
                value={sourceFile}
                onChange={(e) => setSourceFile(e.target.value)}
                placeholder="e.g. mwfab-base-materials2.csv"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Dimensions (JSON)</label>
              <textarea
                value={dimensionsJson}
                onChange={(e) => setDimensionsJson(e.target.value)}
                rows={6}
                className={`${inputClass} font-mono text-xs`}
                placeholder='{"size_a": "1 in", "size_b": "1 in"}'
              />
              {dimensionsError && (
                <p className="mt-1 text-sm text-red-400">{dimensionsError}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 border-t border-steel/50 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-steel/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-steel/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-steel-blue px-4 py-2.5 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
