"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  updateMaterialCatalogRow,
  insertMaterialCatalogRow,
  listMaterialFieldConfigForCategory,
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
import type { MaterialCatalogRow, MaterialFieldConfig } from "@/lib/db-types";
import { CATALOG_CATEGORIES, CATEGORY_LABEL } from "@/lib/takeoff-catalog-spec";

function formatNum(n: number | null): string {
  if (n == null) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(4);
}

const EMPTY_ROW: MaterialCatalogRow = {
  id: "",
  category: "angle",
  item_code: "",
  shorthand_code: "",
  size_label: null,
  finish: null,
  dimensions: null,
  weight_per_ft: null,
  cost_per_lb: null,
  cost_per_foot: null,
  pricing_unit: "per_lb",
  is_active: true,
  source_file: "manual",
  created_at: "",
};

export function MaterialsTable({
  rows,
  currentCategory,
}: {
  rows: MaterialCatalogRow[];
  currentCategory: string | null;
}) {
  const router = useRouter();
  const [editingRow, setEditingRow] = useState<MaterialCatalogRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    const params = new URLSearchParams();
    if (v && v !== "all") params.set("category", v);
    router.push(`/admin/materials${params.toString() ? `?${params}` : ""}`);
  }

  async function handleSave(payload: MaterialCatalogUpdate) {
    setSaving(true);
    setError(null);
    if (isNew) {
      const cat = payload.category ?? "angle";
      const { error: err } = await insertMaterialCatalogRow({
        category: cat as MaterialCatalogRow["category"],
        item_code: payload.item_code ?? "NEW",
        shorthand_code: payload.shorthand_code ?? "NEW",
        pricing_unit: payload.pricing_unit ?? "per_lb",
        size_label: payload.size_label,
        finish: payload.finish,
        dimensions: payload.dimensions,
        weight_per_ft: payload.weight_per_ft,
        cost_per_lb: payload.cost_per_lb,
        cost_per_foot: payload.cost_per_foot,
        is_active: payload.is_active,
        source_file: payload.source_file,
      });
      setSaving(false);
      if (err) {
        setError(err);
        return;
      }
    } else if (editingRow) {
      const { error: err } = await updateMaterialCatalogRow(editingRow.id, payload);
      setSaving(false);
      if (err) {
        setError(err);
        return;
      }
    }
    setEditingRow(null);
    setIsNew(false);
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
            className="rounded-lg border border-steel/50 bg-card px-3 py-2 text-sm text-foreground focus:border-steel-blue focus:outline-none focus:ring-1 focus:ring-steel-blue"
          >
            <option value="all">All</option>
            {CATALOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c] ?? c}
              </option>
            ))}
          </select>
        </label>
        <Link
          href="/admin/materials/field-config"
          className="text-sm text-steel-blue hover:underline"
        >
          Field visibility
        </Link>
        <button
          type="button"
          onClick={() => {
            setIsNew(true);
            setEditingRow({ ...EMPTY_ROW });
            setError(null);
          }}
          className="btn-admin-primary rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Add material
        </button>
      </AdminToolbar>

      {rows.length === 0 ? (
        <AdminEmptyState message="No materials in this category." />
      ) : (
        <AdminDataTable stickyHeader>
          <AdminDataTableHead>
            <AdminDataTableHeaderCell>Category</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Shorthand</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Size label</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell>Active</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Weight/ft</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Cost/lb</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Cost/ft</AdminDataTableHeaderCell>
            <AdminDataTableHeaderCell align="right">Actions</AdminDataTableHeaderCell>
          </AdminDataTableHead>
          <AdminDataTableBody>
            {rows.map((row) => (
              <AdminDataTableRow key={row.id}>
                <AdminDataTableCell className="text-foreground-muted">
                  {CATEGORY_LABEL[row.category] ?? row.category}
                </AdminDataTableCell>
                <AdminDataTableCell className="font-mono text-foreground">
                  {row.shorthand_code}
                </AdminDataTableCell>
                <AdminDataTableCell className="text-foreground">
                  {row.size_label ?? "—"}
                </AdminDataTableCell>
                <AdminDataTableCell>
                  {row.is_active ? (
                    <span className="text-emerald-400">Active</span>
                  ) : (
                    <span className="text-foreground-muted">Hidden</span>
                  )}
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
                <AdminDataTableCell align="right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNew(false);
                      setEditingRow(row);
                    }}
                    className="rounded-lg border border-steel/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-steel/30"
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
        <MaterialSlideOver
          row={editingRow}
          isNew={isNew}
          onClose={() => {
            setEditingRow(null);
            setIsNew(false);
            setError(null);
          }}
          onSave={handleSave}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}

function suggestShorthand(
  category: string,
  dimensions: Record<string, unknown>,
  weightPerFt: number | null,
  finish: "HR" | "CF" | null
): string {
  const c = (k: string) => String(dimensions[k] ?? "").replace(/\s*in\.?\s*/gi, "").replace(/\s+/g, "");
  switch (category) {
    case "angle":
      return `L${c("size_a")}x${c("size_b")}x${c("size_c")}`;
    case "wide_flange": {
      const sn = c("section_number") || c("size_c");
      const w = sn.replace(/^W/i, "");
      return `W${w}x${weightPerFt ?? ""}`;
    }
    case "round_bar":
      return `RB${c("size_a")}`;
    case "flat_bar": {
      const b = c("size_b");
      return b ? `FB${c("size_a")}x${b}` : `FB${c("size_a")}`;
    }
    case "channel":
      return `C${c("section_depth_a")}x${weightPerFt ?? ""}`;
    case "mc_channel":
      return `MC${c("section_depth_a")}x${weightPerFt ?? ""}`;
    case "pipe":
      return `PIPE${c("pipe_size")}-SCH${c("schedule")}`;
    case "tube":
      return `HSS${c("width")}x${c("height")}-${c("gauge")}`;
    default:
      return "";
  }
}

function MaterialSlideOver({
  row,
  isNew,
  onClose,
  onSave,
  saving,
  error,
}: {
  row: MaterialCatalogRow;
  isNew: boolean;
  onClose: () => void;
  onSave: (p: MaterialCatalogUpdate) => Promise<void>;
  saving: boolean;
  error: string | null;
}) {
  const [category, setCategory] = useState(row.category);
  const [itemCode, setItemCode] = useState(row.item_code ?? "");
  const [shorthandCode, setShorthandCode] = useState(row.shorthand_code ?? "");
  const [sizeLabel, setSizeLabel] = useState(row.size_label ?? "");
  const [finish, setFinish] = useState<"HR" | "CF" | "">(row.finish ?? "");
  const [dimValues, setDimValues] = useState<Record<string, string>>(() => {
    const d = row.dimensions ?? {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(d)) out[k] = String(v);
    return out;
  });
  const [fieldConfigs, setFieldConfigs] = useState<MaterialFieldConfig[]>([]);
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
  const [isActive, setIsActive] = useState(row.is_active ?? true);
  const [sourceFile, setSourceFile] = useState(row.source_file ?? "manual");

  useEffect(() => {
    listMaterialFieldConfigForCategory(category).then(({ rows: configs }) => {
      setFieldConfigs(configs);
      setDimValues((prev) => {
        const next = { ...prev };
        for (const f of configs) {
          if (f.field_key === "weight_per_ft" || f.field_key === "finish") continue;
          if (next[f.field_key] === undefined) next[f.field_key] = "";
        }
        return next;
      });
    });
  }, [category]);

  useEffect(() => {
    const dims: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(dimValues)) {
      if (v.trim()) dims[k] = v.trim();
    }
    const wpf = weightPerFt === "" ? null : parseFloat(weightPerFt);
    const suggested = suggestShorthand(
      category,
      dims,
      Number.isFinite(wpf) ? wpf : null,
      finish === "HR" || finish === "CF" ? finish : null
    );
    if (suggested && !shorthandCode.trim()) setShorthandCode(suggested);
  }, [category, dimValues, weightPerFt, finish]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dimensions: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(dimValues)) {
      if (v.trim()) dimensions[k] = v.trim();
    }
    onSave({
      category: category as MaterialCatalogRow["category"],
      item_code: itemCode.trim() || "NEW",
      shorthand_code: shorthandCode.trim() || itemCode.trim(),
      size_label: sizeLabel.trim() || null,
      finish: category === "round_bar" && finish ? finish : null,
      dimensions: Object.keys(dimensions).length ? dimensions : null,
      weight_per_ft: weightPerFt === "" ? null : parseFloat(weightPerFt),
      cost_per_lb: costPerLb === "" ? null : parseFloat(costPerLb),
      cost_per_foot: costPerFoot === "" ? null : parseFloat(costPerFoot),
      pricing_unit: pricingUnit,
      is_active: isActive,
      source_file: sourceFile.trim() || null,
    });
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-steel/50 bg-charcoal px-3 py-2 text-foreground focus:border-steel-blue focus:outline-none focus:ring-1 focus:ring-steel-blue";

  const dimensionFields = fieldConfigs.filter(
    (f) => f.field_key !== "weight_per_ft" && f.field_key !== "finish"
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-charcoal/80 backdrop-blur-sm" aria-hidden onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-steel/50 bg-gunmetal shadow-xl">
        <div className="flex items-center justify-between border-b border-steel/50 px-4 py-3">
          <h2 className="text-lg font-semibold text-foreground">
            {isNew ? "Add material" : "Edit material"}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-foreground-muted hover:bg-steel/50" aria-label="Close">
            ×
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
                {CATALOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c] ?? c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Item code</label>
              <input type="text" value={itemCode} onChange={(e) => setItemCode(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Shorthand</label>
              <input type="text" value={shorthandCode} onChange={(e) => setShorthandCode(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Size label</label>
              <input type="text" value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)} className={inputClass} />
            </div>
            {category === "round_bar" && (
              <div>
                <label className="block text-sm font-medium text-foreground-muted">Finish</label>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value as "HR" | "CF" | "")}
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="HR">HR</option>
                  <option value="CF">CF</option>
                </select>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active (visible in takeoff search)
            </label>
            {dimensionFields.map((f) => (
              <div key={f.field_key}>
                <label className="block text-sm font-medium text-foreground-muted">{f.label}</label>
                <input
                  type="text"
                  value={dimValues[f.field_key] ?? ""}
                  onChange={(e) =>
                    setDimValues((prev) => ({ ...prev, [f.field_key]: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
            ))}
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
              <input type="number" step="any" min="0" value={costPerLb} onChange={(e) => setCostPerLb(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Cost per foot</label>
              <input type="number" step="any" min="0" value={costPerFoot} onChange={(e) => setCostPerFoot(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Pricing unit</label>
              <select value={pricingUnit} onChange={(e) => setPricingUnit(e.target.value as "per_lb" | "per_foot")} className={inputClass}>
                <option value="per_lb">per_lb</option>
                <option value="per_foot">per_foot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-muted">Source file</label>
              <input type="text" value={sourceFile} onChange={(e) => setSourceFile(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-2 border-t border-steel/50 px-4 py-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-steel/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-steel/50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-admin-primary rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
