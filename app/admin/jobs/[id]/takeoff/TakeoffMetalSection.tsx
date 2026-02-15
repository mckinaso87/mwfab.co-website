"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { upsertMetalLine, deleteMetalLineForm } from "./actions";
import type { TakeoffMetalLine } from "@/lib/db-types";
import type { MaterialCatalogRow } from "@/lib/db-types";

const CATALOG_SEARCH_LIMIT = 40;

function searchableCatalogLabel(row: MaterialCatalogRow): string {
  const name =
    row.display_name && row.display_name.trim() !== "" && row.display_name !== row.item_code
      ? row.display_name
      : row.item_code;
  const parts = [name];
  if (row.item_code && name !== row.item_code) parts.push(`[${row.item_code}]`);
  if (row.weight_per_ft != null && Number.isFinite(row.weight_per_ft))
    parts.push(`${Number(row.weight_per_ft)} lb/ft`);
  const cost =
    row.pricing_unit === "per_lb"
      ? row.cost_per_lb
      : row.pricing_unit === "per_foot"
        ? row.cost_per_foot
        : null;
  if (cost != null && Number.isFinite(cost))
    parts.push(row.pricing_unit === "per_foot" ? `$${Number(cost).toFixed(2)}/ft` : `$${Number(cost).toFixed(2)}/lb`);
  return parts.join(" · ");
}

function catalogMatchesSearch(row: MaterialCatalogRow, q: string): boolean {
  if (!q || q.length < 1) return true;
  const lower = q.toLowerCase().trim();
  if (row.item_code?.toLowerCase().includes(lower)) return true;
  if (row.display_name?.toLowerCase().includes(lower)) return true;
  const dims = row.dimensions && typeof row.dimensions === "object"
    ? Object.values(row.dimensions).join(" ").toLowerCase()
    : "";
  if (dims.includes(lower)) return true;
  return false;
}

type Props = {
  takeoffId: string;
  jobId: string;
  lines: TakeoffMetalLine[];
  catalogByCategory: Record<string, MaterialCatalogRow[]>;
  categoryOrder: TakeoffMetalLine["category"][];
};


export function TakeoffMetalSection({
  takeoffId,
  jobId,
  lines,
  catalogByCategory,
  categoryOrder,
}: Props) {
  const catalogById = useMemo(() => {
    const map: Record<string, MaterialCatalogRow> = {};
    for (const rows of Object.values(catalogByCategory)) {
      for (const row of rows) map[row.id] = row;
    }
    return map;
  }, [catalogByCategory]);

  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) =>
      upsertMetalLine(takeoffId, jobId, formData),
    null as { error?: string } | null
  );
  const deleteAction = (lineId: string) =>
    deleteMetalLineForm.bind(null, takeoffId, lineId, jobId);

  const [category, setCategory] = useState<string>("angles");
  const [catalogId, setCatalogId] = useState<string>("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const catalogPickerRef = useRef<HTMLDivElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [count, setCount] = useState(1);
  const [totalLengthFt, setTotalLengthFt] = useState<string>("");
  const [totalPounds, setTotalPounds] = useState<string>("");
  const [costPerUnit, setCostPerUnit] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState<string>("");

  const filteredCatalog = useMemo(() => {
    const items = catalogByCategory[category] ?? [];
    const q = catalogSearch.trim();
    const matched = q.length < 1
      ? items
      : items.filter((row) => catalogMatchesSearch(row, q));
    return matched.slice(0, CATALOG_SEARCH_LIMIT);
  }, [catalogByCategory, category, catalogSearch]);

  useEffect(() => {
    if (!catalogOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (catalogPickerRef.current && !catalogPickerRef.current.contains(e.target as Node)) {
        setCatalogOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [catalogOpen]);

  const weightPerFt = catalogId ? catalogById[catalogId]?.weight_per_ft ?? null : null;
  const pricingUnit = catalogId ? catalogById[catalogId]?.pricing_unit ?? null : null;

  useEffect(() => {
    if (!catalogId) return;
    const row = catalogById[catalogId];
    if (!row) return;
    setCategory(row.category);
    const name =
      row.display_name && row.display_name.trim() !== "" ? row.display_name : row.item_code;
    setDisplayName(name);
    const cost =
      row.pricing_unit === "per_lb"
        ? row.cost_per_lb
        : row.pricing_unit === "per_foot"
          ? row.cost_per_foot
          : null;
    if (cost != null && Number.isFinite(cost)) setCostPerUnit(String(cost));
  }, [catalogId, catalogById]);

  useEffect(() => {
    const length = parseFloat(totalLengthFt);
    const pounds = parseFloat(totalPounds);
    const cost = parseFloat(costPerUnit);
    const computedPounds =
      Number.isFinite(length) && weightPerFt != null && Number.isFinite(weightPerFt)
        ? length * weightPerFt
        : null;
    const poundsVal =
      Number.isFinite(pounds) && pounds > 0
        ? pounds
        : computedPounds ?? 0;
    if (pricingUnit === "per_foot" && catalogId && Number.isFinite(length)) {
      const row = catalogById[catalogId];
      const rate = row?.cost_per_foot;
      if (rate != null && Number.isFinite(rate)) {
        setTotalPrice((length * rate).toFixed(2));
        return;
      }
    }
    if (Number.isFinite(poundsVal) && Number.isFinite(cost)) {
      setTotalPrice((poundsVal * cost).toFixed(2));
    } else {
      setTotalPrice("");
    }
  }, [totalLengthFt, totalPounds, costPerUnit, weightPerFt, pricingUnit, catalogId, catalogById]);

  const resetForm = () => {
    setCatalogId("");
    setDisplayName("");
    setCount(1);
    setTotalLengthFt("");
    setTotalPounds("");
    setCostPerUnit("");
    setTotalPrice("");
  };

  return (
    <section className="mt-8 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Metal lines</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {lines.map((line) => (
          <li key={line.id} className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
            <span className="font-medium">{line.display_name}</span>
            <span className="text-foreground-muted">({line.category})</span>
            <span>Count: {line.count}</span>
            {line.total_length_ft != null && <span>{line.total_length_ft} ft</span>}
            {line.total_pounds != null && <span>{line.total_pounds} lb</span>}
            <span>${Number(line.total_price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            <form
              action={async (fd: FormData) => {
                await deleteAction(line.id)(fd);
              }}
              className="inline"
            >
              <button type="submit" className="text-red-500 hover:underline">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
      <form
        action={(formData) => {
          formAction(formData);
          resetForm();
        }}
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input type="hidden" name="sort_order" value={lines.length} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="material_catalog_id" value={catalogId} />
        <div>
          <label htmlFor="metal_category" className="block text-sm text-foreground-muted">Category</label>
          <select
            id="metal_category"
            className="input-admin"
            value={category}
            onChange={(e) => {
              const next = e.target.value;
              setCategory(next);
              if (catalogId && catalogById[catalogId]?.category !== next) {
                setCatalogId("");
                setCatalogSearch("");
              }
            }}
          >
            {categoryOrder.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="relative" ref={catalogPickerRef}>
          <label htmlFor="metal_catalog_search" className="block text-sm text-foreground-muted">
            Catalog item (optional)
          </label>
          <input type="hidden" name="material_catalog_id" value={catalogId} />
          {catalogId && catalogById[catalogId] ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-steel/20 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-foreground">
                {searchableCatalogLabel(catalogById[catalogId])}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCatalogId("");
                  setCatalogSearch("");
                  setDisplayName("");
                  setCostPerUnit("");
                  setTotalPrice("");
                }}
                className="shrink-0 text-steel-blue hover:underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <>
              <input
                id="metal_catalog_search"
                type="text"
                className="input-admin"
                placeholder="Search by item #, name, or size (e.g. LS12 or 1/2)"
                value={catalogSearch}
                onChange={(e) => {
                  setCatalogSearch(e.target.value);
                  setCatalogOpen(true);
                }}
                onFocus={() => setCatalogOpen(true)}
              />
              {catalogOpen && (
                <ul
                  className="absolute left-0 top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-gunmetal py-1 shadow-lg"
                  role="listbox"
                >
                  {filteredCatalog.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-foreground-muted">
                      {catalogSearch.trim() ? "No matches. Try another search or category." : `Type to search in ${category}.`}
                    </li>
                  ) : (
                    filteredCatalog.map((row) => (
                      <li
                        key={row.id}
                        role="option"
                        className="cursor-pointer px-3 py-2 text-sm text-foreground hover:bg-steel-blue/30"
                        onClick={() => {
                          setCatalogId(row.id);
                          setCatalogSearch("");
                          setCatalogOpen(false);
                        }}
                      >
                        {searchableCatalogLabel(row)}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </>
          )}
        </div>
        <div>
          <label htmlFor="metal_display_name" className="block text-sm text-foreground-muted">Display name</label>
          <input
            id="metal_display_name"
            name="display_name"
            type="text"
            className="input-admin"
            placeholder="e.g. Plate 12 x 12 x 1/2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="metal_count" className="block text-sm text-foreground-muted">Count</label>
          <input
            id="metal_count"
            name="count"
            type="number"
            step="1"
            min="0"
            className="input-admin"
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <label htmlFor="metal_total_length_ft" className="block text-sm text-foreground-muted">Total length (ft)</label>
          <input
            id="metal_total_length_ft"
            name="total_length_ft"
            type="number"
            step="0.01"
            min="0"
            className="input-admin"
            value={totalLengthFt}
            onChange={(e) => setTotalLengthFt(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="metal_total_pounds" className="block text-sm text-foreground-muted">Total pounds</label>
          <input
            id="metal_total_pounds"
            name="total_pounds"
            type="number"
            step="0.01"
            min="0"
            className="input-admin"
            value={totalPounds}
            onChange={(e) => setTotalPounds(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="metal_cost_per_unit" className="block text-sm text-foreground-muted">Cost per unit ($/lb or $/ft)</label>
          <input
            id="metal_cost_per_unit"
            name="cost_per_unit"
            type="number"
            step="0.01"
            min="0"
            className="input-admin"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="metal_total_price" className="block text-sm text-foreground-muted">Total price (auto)</label>
          <input
            id="metal_total_price"
            name="total_price"
            type="number"
            step="0.01"
            min="0"
            readOnly
            className="input-admin bg-steel/30"
            value={totalPrice}
            title="Auto-calculated from pounds × cost (or length × $/ft)"
          />
        </div>
        {state?.error && <p className="col-span-full text-sm text-red-500">{state.error}</p>}
        <div className="col-span-full">
          <button type="submit" disabled={isPending} className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50">
            {isPending ? "Adding…" : "Add metal line"}
          </button>
        </div>
      </form>
    </section>
  );
}
