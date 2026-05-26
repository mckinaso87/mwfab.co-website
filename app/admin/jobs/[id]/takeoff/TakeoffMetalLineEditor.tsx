"use client";

import { useCallback, useEffect, useState } from "react";
import {
  searchCatalogByShorthand,
  getMaterialFieldConfig,
  getCatalogRowById,
} from "./actions";
import { getCatalogFieldValue } from "@/lib/catalog-field-value";
import type { Takeoff, TakeoffMetalLine } from "@/lib/db-types";
import type { MaterialCatalogRow, MaterialFieldConfig } from "@/lib/db-types";
import { CATEGORY_SHORT, STEEL_DENSITY_LB_PER_IN3 } from "@/lib/takeoff-catalog-spec";
import { ScopeToggle } from "@/components/admin/takeoff/ScopeToggle";
import type { LineScope } from "@/lib/db-types";

type EntryMode = "shorthand" | "plate" | "other";

type Props = {
  takeoff: Takeoff;
  initial?: TakeoffMetalLine | null;
  sortOrder: number;
  onSubmit: (formData: FormData) => Promise<void>;
  error?: string | null;
  submitLabel: string;
  pending?: boolean;
  lockMode?: boolean;
};

function displayCatalogRow(row: MaterialCatalogRow): string {
  const parts = [row.size_label ?? row.shorthand_code, `[${row.item_code}]`];
  if (row.weight_per_ft != null && Number.isFinite(row.weight_per_ft))
    parts.push(`${Number(row.weight_per_ft)} lb/ft`);
  const cost = row.pricing_unit === "per_lb" ? row.cost_per_lb : row.cost_per_foot;
  if (cost != null && Number.isFinite(cost))
    parts.push(
      row.pricing_unit === "per_foot"
        ? `$${Number(cost).toFixed(2)}/ft`
        : `$${Number(cost).toFixed(2)}/lb`
    );
  return parts.join(" · ");
}

function inferMode(line: TakeoffMetalLine): EntryMode {
  if (line.category === "plate") return "plate";
  if (line.category === "other") return "other";
  return "shorthand";
}

export function TakeoffMetalLineEditor({
  takeoff,
  initial,
  sortOrder,
  onSubmit,
  error,
  submitLabel,
  pending,
  lockMode,
}: Props) {
  const [mode, setMode] = useState<EntryMode>(() =>
    initial ? inferMode(initial) : "shorthand"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MaterialCatalogRow[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [fieldConfigByCategory, setFieldConfigByCategory] = useState<
    Record<string, MaterialFieldConfig[]>
  >({});
  const [catalogRow, setCatalogRow] = useState<MaterialCatalogRow | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [count, setCount] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [totalLengthFt, setTotalLengthFt] = useState("");
  const [totalPounds, setTotalPounds] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [isGalvanized, setIsGalvanized] = useState(false);
  const [galvLengthFt, setGalvLengthFt] = useState("");

  const [plateThickness, setPlateThickness] = useState("");
  const [plateWidth, setPlateWidth] = useState("");
  const [plateHeight, setPlateHeight] = useState("");
  const [scope, setScope] = useState<LineScope>(initial?.scope ?? "furnish_install");
  const [otherUnit, setOtherUnit] = useState<"lbs" | "ft">(
    (initial?.other_unit as "lbs" | "ft" | null) ?? "lbs"
  );

  const plateDefaultCost = takeoff.plate_default_cost_per_lb ?? 1.1;

  const loadFieldConfig = useCallback(async (category: string) => {
    if (fieldConfigByCategory[category]) return;
    const { fields } = await getMaterialFieldConfig(category);
    setFieldConfigByCategory((prev) => ({ ...prev, [category]: fields }));
  }, [fieldConfigByCategory]);

  useEffect(() => {
    if (!initial) return;
    setScope(initial.scope ?? "furnish_install");
    setCount(initial.count);
    setDisplayName(initial.display_name);
    setTotalLengthFt(
      initial.total_length_ft != null ? String(initial.total_length_ft) : ""
    );
    setTotalPounds(initial.total_pounds != null ? String(initial.total_pounds) : "");
    setCostPerUnit(
      initial.cost_per_unit != null ? String(initial.cost_per_unit) : ""
    );
    setIsGalvanized(initial.is_galvanized ?? false);
    setGalvLengthFt(
      initial.galv_length_ft != null ? String(initial.galv_length_ft) : ""
    );
    if (initial.category === "plate") {
      setMode("plate");
      setPlateThickness(
        initial.plate_thickness_in != null ? String(initial.plate_thickness_in) : ""
      );
      setPlateWidth(initial.plate_width_in != null ? String(initial.plate_width_in) : "");
      setPlateHeight(initial.plate_height_in != null ? String(initial.plate_height_in) : "");
    } else if (initial.category === "other") {
      setMode("other");
      setOtherUnit((initial.other_unit as "lbs" | "ft") ?? "lbs");
    } else {
      setMode("shorthand");
      if (initial.material_catalog_id) {
        getCatalogRowById(initial.material_catalog_id).then(({ row }) => {
          if (row) {
            setCatalogRow(row);
            setSearchQuery(row.shorthand_code);
            loadFieldConfig(row.category);
          }
        });
      }
    }
  }, [initial?.id, loadFieldConfig]);

  useEffect(() => {
    if (mode !== "shorthand" || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    const t = setTimeout(() => {
      setSearchLoading(true);
      setSearchError(null);
      searchCatalogByShorthand(searchQuery, 25)
        .then(({ rows, error }) => {
          if (error) {
            setSearchError(error);
            setSearchResults([]);
            return;
          }
          setSearchResults(rows);
          const cats = [...new Set(rows.map((r) => r.category))];
          cats.forEach((c) => loadFieldConfig(c));
        })
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, mode, loadFieldConfig]);

  const weightPerFt =
    catalogRow?.weight_per_ft != null ? Number(catalogRow.weight_per_ft) : null;
  const pricingUnit = catalogRow?.pricing_unit ?? null;

  function getComputedTotalPrice(): string {
    const length = parseFloat(totalLengthFt);
    const pounds = parseFloat(totalPounds);
    const c = parseFloat(costPerUnit);
    const mult = Math.max(1, Math.floor(Number(count) || 1));

    if (mode === "plate") {
      const t = parseFloat(plateThickness);
      const w = parseFloat(plateWidth);
      const h = parseFloat(plateHeight);
      if (Number.isFinite(t) && Number.isFinite(w) && Number.isFinite(h) && Number.isFinite(c)) {
        const lbs = t * w * h * mult * STEEL_DENSITY_LB_PER_IN3;
        return (lbs * c).toFixed(2);
      }
      return "";
    }

    if (mode === "other") {
      const length = parseFloat(totalLengthFt);
      if (otherUnit === "ft" && Number.isFinite(length) && length > 0 && Number.isFinite(c)) {
        return (length * c).toFixed(2);
      }
      if (Number.isFinite(pounds) && pounds > 0 && Number.isFinite(c)) {
        return (pounds * c).toFixed(2);
      }
      return "";
    }

    if (!Number.isFinite(c)) return "";
    const unit = catalogRow?.pricing_unit ?? "per_lb";
    if (unit === "per_foot" && Number.isFinite(length) && length > 0) {
      return (length * mult * c).toFixed(2);
    }
    const computedPounds =
      catalogRow && Number.isFinite(length) && weightPerFt != null && weightPerFt > 0
        ? length * mult * weightPerFt
        : Number.isFinite(pounds)
          ? pounds
          : NaN;
    if (Number.isFinite(computedPounds) && computedPounds > 0) {
      return (computedPounds * c).toFixed(2);
    }
    return "";
  }

  const computedTotalPrice = getComputedTotalPrice();

  useEffect(() => {
    if (mode !== "shorthand" || !catalogRow) return;
    const length = parseFloat(totalLengthFt);
    const mult = Math.max(1, Math.floor(Number(count) || 1));
    if (Number.isFinite(length) && catalogRow.weight_per_ft != null) {
      const wpf = Number(catalogRow.weight_per_ft);
      if (Number.isFinite(wpf) && wpf > 0) setTotalPounds(String(length * mult * wpf));
    }
  }, [catalogRow?.id, catalogRow?.weight_per_ft, totalLengthFt, count, mode]);

  useEffect(() => {
    if (mode === "plate") {
      const t = parseFloat(plateThickness);
      const w = parseFloat(plateWidth);
      const h = parseFloat(plateHeight);
      const mult = Math.max(1, Math.floor(Number(count) || 1));
      if (Number.isFinite(t) && Number.isFinite(w) && Number.isFinite(h)) {
        setTotalPounds(String(t * w * h * mult * STEEL_DENSITY_LB_PER_IN3));
        if (!displayName.trim()) {
          setDisplayName(`PL ${t} × ${w} × ${h}`);
        }
      }
    }
  }, [plateThickness, plateWidth, plateHeight, count, mode]);

  useEffect(() => {
    if (isGalvanized && totalLengthFt && !galvLengthFt) {
      setGalvLengthFt(totalLengthFt);
    }
  }, [isGalvanized, totalLengthFt]);

  const resetForm = () => {
    setSearchQuery("");
    setSearchResults([]);
    setCatalogRow(null);
    setDisplayName("");
    setCount(1);
    setTotalLengthFt("");
    setTotalPounds("");
    setCostPerUnit("");
    setIsGalvanized(false);
    setGalvLengthFt("");
    setPlateThickness("");
    setPlateWidth("");
    setPlateHeight("");
    setShowDetails(false);
  };

  const selectCatalogRow = (row: MaterialCatalogRow) => {
    setCatalogRow(row);
    setDisplayName(row.size_label?.trim() || row.shorthand_code || row.item_code);
    const costVal = row.pricing_unit === "per_lb" ? row.cost_per_lb : row.cost_per_foot;
    setCostPerUnit(
      costVal != null && Number.isFinite(Number(costVal)) ? String(Number(costVal)) : ""
    );
    setSearchQuery(row.shorthand_code);
    setSearchResults([]);
    loadFieldConfig(row.category);
  };

  const formCategory =
    mode === "plate" ? "plate" : mode === "other" ? "other" : catalogRow?.category ?? "angle";

  const labelClass = "block text-sm font-medium text-foreground";
  const showEditDisplayName = !!initial;
  const showAddDisplayName = !initial;

  return (
    <>
      {!lockMode && (
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["shorthand", "Shorthand search"],
            ["plate", "Plate"],
            ["other", "Other / Custom"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              resetForm();
              if (m === "plate") {
                setCostPerUnit(String(plateDefaultCost));
              }
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === m
                ? "bg-steel-blue text-foreground"
                : "border border-steel/50 text-foreground-muted hover:bg-steel/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      )}

      <form
        action={onSubmit}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {initial?.id && <input type="hidden" name="id" value={initial.id} />}
        <input type="hidden" name="sort_order" value={initial?.sort_order ?? sortOrder} />
        <input type="hidden" name="category" value={formCategory} />
        <input
          type="hidden"
          name="material_catalog_id"
          value={
            mode === "shorthand"
              ? catalogRow?.id ?? initial?.material_catalog_id ?? ""
              : ""
          }
        />
        <input type="hidden" name="is_galvanized" value={isGalvanized ? "true" : "false"} />

        {showEditDisplayName && (
          <div className="col-span-full">
            <label htmlFor="metal_display_name_edit" className={labelClass}>
              Display name (shown on proposal)
            </label>
            <input
              id="metal_display_name_edit"
              name="display_name"
              type="text"
              className="input-admin"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Customer-facing line description"
            />
          </div>
        )}

        {mode === "shorthand" && (
          <div className="col-span-full space-y-3">
            <div className="relative">
              <label htmlFor="shorthand_search" className={labelClass}>
                Search (e.g. L 4x4, W12x30, HSS4x4)
              </label>
              <input
                id="shorthand_search"
                type="text"
                className={`input-admin ${
                  !catalogRow && (searchLoading || searchResults.length > 0)
                    ? "rounded-b-none border-b-0 focus:border-steel-blue"
                    : ""
                }`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCatalogRow(null);
                }}
                placeholder="Type at least 2 characters…"
                autoComplete="off"
                role="combobox"
                aria-expanded={!catalogRow && searchResults.length > 0}
                aria-controls="shorthand-search-listbox"
              />
              {!catalogRow && searchQuery.trim().length >= 2 && !searchLoading && searchResults.length > 0 && (
                <p className="mt-1.5 text-xs text-foreground-muted">
                  {searchResults.length} match{searchResults.length === 1 ? "" : "es"} — click a row to select
                </p>
              )}
            </div>

            {searchError && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {searchError}
              </p>
            )}

            {!catalogRow && searchQuery.trim().length >= 2 && searchLoading && (
              <div
                className="-mt-3 rounded-b-lg border border-t-0 border-steel-blue/40 bg-card px-4 py-6 text-center shadow-lg shadow-black/20"
                aria-live="polite"
              >
                <p className="text-sm text-foreground-muted">Searching catalog…</p>
              </div>
            )}

            {!catalogRow &&
              !searchLoading &&
              !searchError &&
              searchQuery.trim().length >= 2 &&
              searchResults.length === 0 && (
                <div className="-mt-3 rounded-b-lg border border-t-0 border-steel/50 bg-steel/10 px-4 py-4 text-sm text-foreground-muted">
                  No matches for &ldquo;{searchQuery.trim()}&rdquo;. Try a different shorthand or check that{" "}
                  <code className="text-xs">npm run seed:materials</code> has been run.
                </div>
              )}

            {!catalogRow && !searchLoading && searchResults.length > 0 && (
              <div
                id="shorthand-search-listbox"
                role="listbox"
                aria-label="Catalog matches"
                className="-mt-3 overflow-hidden rounded-b-xl border border-t-0 border-steel-blue/50 bg-card shadow-lg shadow-black/25 ring-1 ring-steel-blue/20"
              >
                <div className="flex items-center justify-between gap-2 border-b border-steel-blue/30 bg-steel-blue/15 px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Select a material
                  </span>
                  <span className="rounded-full bg-steel-blue/30 px-2.5 py-0.5 text-xs font-medium tabular-nums text-foreground">
                    {searchResults.length}
                  </span>
                </div>
                <ul className="max-h-72 overflow-y-auto divide-y divide-steel/25">
                  {searchResults.map((row) => {
                    const fields = fieldConfigByCategory[row.category] ?? [];
                    const detail = fields
                      .map((f) => {
                        const v = getCatalogFieldValue(row, f.field_key);
                        return v ? `${f.label}: ${v}` : null;
                      })
                      .filter(Boolean)
                      .join(" · ");
                    const cost =
                      row.pricing_unit === "per_lb" ? row.cost_per_lb : row.cost_per_foot;
                    return (
                      <li key={row.id} role="option">
                        <button
                          type="button"
                          onClick={() => selectCatalogRow(row)}
                          className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-steel-blue/20 focus-visible:bg-steel-blue/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-steel-blue"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-steel/40 text-xs font-bold text-foreground group-hover:bg-steel-blue/40">
                            {CATEGORY_SHORT[row.category] ?? "?"}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <span className="font-semibold text-foreground group-hover:text-white">
                                {row.shorthand_code}
                              </span>
                              {row.size_label && row.size_label !== row.shorthand_code && (
                                <span className="text-sm text-foreground-muted group-hover:text-foreground/80">
                                  {row.size_label}
                                </span>
                              )}
                            </span>
                            {detail && (
                              <span className="mt-1 block text-xs leading-relaxed text-foreground-muted group-hover:text-foreground/70">
                                {detail}
                              </span>
                            )}
                            {(cost != null || row.weight_per_ft != null) && (
                              <span className="mt-1.5 flex flex-wrap gap-2">
                                {row.weight_per_ft != null && (
                                  <span className="inline-flex rounded bg-steel/30 px-1.5 py-0.5 text-xs tabular-nums text-foreground-muted">
                                    {Number(row.weight_per_ft)} lb/ft
                                  </span>
                                )}
                                {cost != null && Number.isFinite(Number(cost)) && (
                                  <span className="inline-flex rounded bg-steel-blue/25 px-1.5 py-0.5 text-xs tabular-nums text-foreground">
                                    $
                                    {Number(cost).toFixed(2)}
                                    {row.pricing_unit === "per_foot" ? "/ft" : "/lb"}
                                  </span>
                                )}
                              </span>
                            )}
                          </span>
                          <span
                            className="shrink-0 self-center text-xs font-medium text-steel-blue opacity-0 transition-opacity group-hover:opacity-100"
                            aria-hidden
                          >
                            Select →
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {catalogRow && (
              <div className="flex items-start justify-between gap-3 rounded-lg border-2 border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
                    Selected
                  </p>
                  <p className="mt-1 font-medium text-foreground">{displayCatalogRow(catalogRow)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCatalogRow(null);
                    setSearchQuery("");
                  }}
                  className="shrink-0 rounded-md border border-steel/50 px-2.5 py-1 text-xs font-medium text-foreground-muted hover:bg-steel/30 hover:text-foreground"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        )}

        {mode === "plate" && (
          <>
            <div>
              <label htmlFor="plate_thickness" className={labelClass}>
                Thickness (in)
              </label>
              <input
                id="plate_thickness"
                name="plate_thickness_in"
                type="number"
                step="0.001"
                min="0"
                className="input-admin"
                value={plateThickness}
                onChange={(e) => setPlateThickness(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="plate_width" className={labelClass}>
                Width (in)
              </label>
              <input
                id="plate_width"
                name="plate_width_in"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={plateWidth}
                onChange={(e) => setPlateWidth(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="plate_height" className={labelClass}>
                Height (in)
              </label>
              <input
                id="plate_height"
                name="plate_height_in"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={plateHeight}
                onChange={(e) => setPlateHeight(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="plate_cost" className={labelClass}>
                $/lb
              </label>
              <input
                id="plate_cost"
                name="cost_per_unit"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={costPerUnit || String(plateDefaultCost)}
                onChange={(e) => setCostPerUnit(e.target.value)}
              />
            </div>
          </>
        )}

        {mode === "other" && (
          <>
            <div className="col-span-full">
              <label className={labelClass}>Unit</label>
              <input type="hidden" name="other_unit" value={otherUnit} />
              <div className="mt-1 inline-flex rounded-md border border-steel/50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setOtherUnit("lbs")}
                  className={`rounded px-2 py-1 ${otherUnit === "lbs" ? "bg-steel-blue text-foreground" : "text-foreground-muted"}`}
                >
                  Total lbs
                </button>
                <button
                  type="button"
                  onClick={() => setOtherUnit("ft")}
                  className={`rounded px-2 py-1 ${otherUnit === "ft" ? "bg-steel-blue text-foreground" : "text-foreground-muted"}`}
                >
                  Linear ft
                </button>
              </div>
            </div>
            {showAddDisplayName && (
              <div className="col-span-full">
                <label htmlFor="other_display_name" className={labelClass}>
                  Display name
                </label>
                <input
                  id="other_display_name"
                  name="display_name"
                  type="text"
                  className="input-admin"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Custom description"
                />
              </div>
            )}
            {otherUnit === "lbs" ? (
              <div>
                <label htmlFor="other_pounds" className={labelClass}>
                  Total pounds
                </label>
                <input
                  id="other_pounds"
                  name="total_pounds"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-admin"
                  value={totalPounds}
                  onChange={(e) => setTotalPounds(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="other_length_ft" className={labelClass}>
                  Linear ft
                </label>
                <input
                  id="other_length_ft"
                  name="total_length_ft"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-admin"
                  value={totalLengthFt}
                  onChange={(e) => setTotalLengthFt(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="other_cost" className={labelClass}>
                {otherUnit === "ft" ? "$/ft" : "$/lb"}
              </label>
              <input
                id="other_cost"
                name="cost_per_unit"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
              />
            </div>
          </>
        )}

        {mode === "plate" && (
          <>
            <div>
              <label htmlFor="plate_count" className={labelClass}>
                Count
              </label>
              <input
                id="plate_count"
                name="count"
                type="number"
                step="1"
                min="1"
                className="input-admin"
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
              />
            </div>
            {showAddDisplayName && (
              <div className="col-span-full">
                <label htmlFor="plate_display_name_only" className={labelClass}>
                  Display name
                </label>
                <input
                  id="plate_display_name_only"
                  name="display_name"
                  type="text"
                  className="input-admin"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}
            <input type="hidden" name="total_pounds" value={totalPounds} />
          </>
        )}

        {mode === "shorthand" && catalogRow ? (
          <>
            <div>
              <label htmlFor="metal_count" className={labelClass}>
                Count
              </label>
              <input
                id="metal_count"
                name="count"
                type="number"
                step="1"
                min="1"
                className="input-admin"
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
              />
            </div>
            {mode === "shorthand" && (
              <div>
                <label htmlFor="metal_total_length_ft" className={labelClass}>
                  Linear feet (purchased)
                </label>
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
            )}
            <div>
              <label htmlFor="metal_cost_per_unit" className={labelClass}>
                {catalogRow.pricing_unit === "per_foot" ? "$/ft" : "$/lb"}
              </label>
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
            <div className="col-span-full flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isGalvanized}
                  onChange={(e) => setIsGalvanized(e.target.checked)}
                />
                Galvanized?
              </label>
              {isGalvanized && mode === "shorthand" && (
                <div className="flex-1 max-w-xs">
                  <label htmlFor="galv_length_ft" className={labelClass}>
                    Galv length (ft)
                  </label>
                  <input
                    id="galv_length_ft"
                    name="galv_length_ft"
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-admin"
                    value={galvLengthFt}
                    onChange={(e) => setGalvLengthFt(e.target.value)}
                  />
                </div>
              )}
            </div>
            {mode === "shorthand" && (
              <input type="hidden" name="total_pounds" value={totalPounds} />
            )}
            {mode === "shorthand" && showAddDisplayName && (
              <div className="col-span-full">
                <label htmlFor="metal_display_name" className={labelClass}>
                  Display name
                </label>
                <input
                  id="metal_display_name"
                  name="display_name"
                  type="text"
                  className="input-admin"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}
          </>
        ) : null}

        <div>
          <label htmlFor="metal_total_price" className={labelClass}>
            Total price (auto)
          </label>
          <input type="hidden" name="total_price" value={computedTotalPrice ?? ""} />
          <input
            id="metal_total_price"
            type="text"
            readOnly
            className="input-admin bg-steel/30"
            value={computedTotalPrice ? `$${computedTotalPrice}` : ""}
            placeholder="—"
          />
        </div>

        {mode === "shorthand" && catalogRow && (
          <div className="col-span-full">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="text-sm text-foreground-muted underline"
            >
              {showDetails ? "Hide" : "Edit"} details
            </button>
            {showDetails && (
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-foreground-muted">Weight/ft</dt>
                  <dd>{catalogRow.weight_per_ft ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-foreground-muted">Total lb (calc)</dt>
                  <dd>{totalPounds || "—"}</dd>
                </div>
                {catalogRow.dimensions &&
                  Object.entries(catalogRow.dimensions).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-foreground-muted">{k}</dt>
                      <dd>{String(v)}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </div>
        )}

        {error && (
          <p className="col-span-full text-sm text-red-500">{error}</p>
        )}
        <div className="col-span-full flex flex-wrap items-center gap-4">
          <div>
            <span className={labelClass}>Scope</span>
            <div className="mt-1">
              <ScopeToggle value={scope} onChange={setScope} />
            </div>
          </div>
        </div>

        <div className="col-span-full">
          <button
            type="submit"
            disabled={
              pending ||
              (!initial && mode === "shorthand" && !catalogRow) ||
              (!initial && mode === "plate" && !plateThickness.trim())
            }
            className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </>
  );
}
