"use client";

import { useCallback, useEffect, useState } from "react";
import {
  searchCatalogByShorthand,
  getMaterialFieldConfig,
  getCatalogRowById,
} from "./actions";
import type { Takeoff, TakeoffMetalLine, LineScope } from "@/lib/db-types";
import { TakeoffLineProposalPanel } from "@/components/admin/takeoff/TakeoffLineProposalPanel";
import { ShorthandCatalogSearch } from "@/components/admin/takeoff/ShorthandCatalogSearch";
import type { MaterialCatalogRow, MaterialFieldConfig } from "@/lib/db-types";
import { STEEL_DENSITY_LB_PER_IN3 } from "@/lib/takeoff-catalog-spec";
import { TakeoffFormSection } from "@/components/admin/takeoff/TakeoffFormSection";
import {
  MODE_BUTTON_ACTIVE,
  MODE_BUTTON_IDLE,
} from "@/components/admin/takeoff/takeoff-form-variants";
import { FractionalInput } from "@/components/admin/takeoff/FractionalInput";
import { parseFractionalToDecimal, formatDecimalAsFraction } from "@/lib/parse-fraction";

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
  const [poundsPerPiece, setPoundsPerPiece] = useState("");
  const [poundsPerPieceTouched, setPoundsPerPieceTouched] = useState(false);
  const [scope, setScope] = useState<LineScope>(initial?.scope ?? "furnish_install");
  const [includeInProposal, setIncludeInProposal] = useState(
    initial?.include_in_proposal ?? true
  );
  const [customerNote, setCustomerNote] = useState(initial?.customer_note ?? "");
  const [customerNoteInProposal, setCustomerNoteInProposal] = useState(
    initial?.customer_note_in_proposal ?? false
  );
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
    setIncludeInProposal(initial.include_in_proposal ?? true);
    setCustomerNote(initial.customer_note ?? "");
    setCustomerNoteInProposal(initial.customer_note_in_proposal ?? false);
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
      const perPiece =
        initial.total_pounds_per_piece != null
          ? initial.total_pounds_per_piece
          : initial.total_pounds != null && initial.count > 0
            ? initial.total_pounds / initial.count
            : null;
      if (perPiece != null && Number.isFinite(perPiece)) {
        setPoundsPerPiece(String(perPiece));
      }
      setPoundsPerPieceTouched(true);
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
      const lbsPerPiece = parseFloat(poundsPerPiece);
      if (Number.isFinite(lbsPerPiece) && lbsPerPiece > 0 && Number.isFinite(c)) {
        return (mult * lbsPerPiece * c).toFixed(2);
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
    if (mode !== "plate") return;
    const t = parseFloat(plateThickness);
    const w = parseFloat(plateWidth);
    const h = parseFloat(plateHeight);
    if (!poundsPerPieceTouched && Number.isFinite(t) && Number.isFinite(w) && Number.isFinite(h) && t > 0 && w > 0 && h > 0) {
      setPoundsPerPiece((t * w * h * STEEL_DENSITY_LB_PER_IN3).toFixed(1));
    }
    if (!displayName.trim() && Number.isFinite(t) && Number.isFinite(w) && Number.isFinite(h)) {
      setDisplayName(
        `PL ${formatDecimalAsFraction(t)} × ${formatDecimalAsFraction(w)} × ${formatDecimalAsFraction(h)}`
      );
    }
  }, [plateThickness, plateWidth, plateHeight, mode, poundsPerPieceTouched, displayName]);

  const plateTotalPounds = (() => {
    const lbsPerPiece = parseFloat(poundsPerPiece);
    const mult = Math.max(1, Math.floor(Number(count) || 1));
    if (Number.isFinite(lbsPerPiece) && lbsPerPiece > 0) {
      return String(lbsPerPiece * mult);
    }
    return "";
  })();

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
    setPoundsPerPiece("");
    setPoundsPerPieceTouched(false);
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
        <TakeoffFormSection
          title="How are you adding this line?"
          subtitle="Shorthand search uses the material catalog. Plate and Other are manual entry."
          variant="mode"
          className="mb-4 !p-3 sm:!p-4"
        >
          <div className="flex flex-wrap gap-2">
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
                setPoundsPerPieceTouched(false);
                setPoundsPerPiece("");
              }
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  mode === m ? MODE_BUTTON_ACTIVE[m] : MODE_BUTTON_IDLE
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </TakeoffFormSection>
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
          <TakeoffFormSection
            step={1}
            title="Find material in catalog"
            subtitle="Search by shorthand code or size label. Select a row to unlock quantity fields."
            variant="catalog"
          >
            <ShorthandCatalogSearch
              searchQuery={searchQuery}
              onSearchQueryChange={(value) => {
                setSearchQuery(value);
                setCatalogRow(null);
              }}
              searchResults={searchResults}
              searchLoading={searchLoading}
              searchError={searchError}
              catalogRow={catalogRow}
              onSelectRow={selectCatalogRow}
              onClearSelection={() => {
                setCatalogRow(null);
                setSearchQuery("");
              }}
              fieldConfigByCategory={fieldConfigByCategory}
              displaySelectedRow={displayCatalogRow}
            />
          </TakeoffFormSection>
        )}

        {mode === "plate" && (
          <TakeoffFormSection
            step={1}
            title="Plate dimensions"
            subtitle="Enter thickness and size; count and pricing are in the next section."
            variant="plate"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="plate_thickness" className={labelClass}>
                  Thickness (in)
                </label>
                <FractionalInput
                  id="plate_thickness"
                  name="plate_thickness_in"
                  className="input-admin"
                  min={0}
                  value={plateThickness === "" ? null : parseFractionalToDecimal(plateThickness)}
                  onValueChange={(d) => setPlateThickness(d == null ? "" : String(d))}
                />
              </div>
              <div>
                <label htmlFor="plate_width" className={labelClass}>
                  Width (in)
                </label>
                <FractionalInput
                  id="plate_width"
                  name="plate_width_in"
                  className="input-admin"
                  min={0}
                  value={plateWidth === "" ? null : parseFractionalToDecimal(plateWidth)}
                  onValueChange={(d) => setPlateWidth(d == null ? "" : String(d))}
                />
              </div>
              <div>
                <label htmlFor="plate_height" className={labelClass}>
                  Height (in)
                </label>
                <FractionalInput
                  id="plate_height"
                  name="plate_height_in"
                  className="input-admin"
                  min={0}
                  value={plateHeight === "" ? null : parseFractionalToDecimal(plateHeight)}
                  onValueChange={(d) => setPlateHeight(d == null ? "" : String(d))}
                />
              </div>
              <div>
                <label htmlFor="plate_pounds_per_piece" className={labelClass}>
                  Pounds per piece
                </label>
                <input
                  id="plate_pounds_per_piece"
                  name="total_pounds_per_piece"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-admin"
                  value={poundsPerPiece}
                  onChange={(e) => {
                    setPoundsPerPiece(e.target.value);
                    setPoundsPerPieceTouched(true);
                  }}
                />
                <p className="mt-1 text-xs text-foreground-muted">
                  Suggested: T × W × H × 0.2836. Override if needed.
                </p>
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
            </div>
          </TakeoffFormSection>
        )}

        {mode === "other" && (
          <TakeoffFormSection
            step={1}
            title="Custom line"
            subtitle="Description, unit type, quantities, and pricing."
            variant="details"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  <FractionalInput
                    id="other_length_ft"
                    name="total_length_ft"
                    className="input-admin"
                    min={0}
                    value={totalLengthFt === "" ? null : parseFractionalToDecimal(totalLengthFt)}
                    onValueChange={(d) => setTotalLengthFt(d == null ? "" : String(d))}
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
              <div>
                <label htmlFor="metal_total_price_other" className={labelClass}>
                  Total price (auto)
                </label>
                <input type="hidden" name="total_price" value={computedTotalPrice ?? ""} />
                <input
                  id="metal_total_price_other"
                  type="text"
                  readOnly
                  className="input-admin bg-steel/30"
                  value={computedTotalPrice ? `$${computedTotalPrice}` : ""}
                  placeholder="—"
                />
              </div>
            </div>
          </TakeoffFormSection>
        )}

        {(mode === "plate" || (mode === "shorthand" && catalogRow)) && (
          <TakeoffFormSection
            step={mode === "shorthand" ? 2 : 2}
            title="Quantities & pricing"
            subtitle="Takeoff totals update when you save this line."
            variant="quantities"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="col-span-full">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isGalvanized}
                  onChange={(e) => setIsGalvanized(e.target.checked)}
                />
                Galvanized?
              </label>
            </div>
            <input type="hidden" name="total_pounds" value={plateTotalPounds} />
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
                <FractionalInput
                  id="metal_total_length_ft"
                  name="total_length_ft"
                  className="input-admin"
                  min={0}
                  value={totalLengthFt === "" ? null : parseFractionalToDecimal(totalLengthFt)}
                  onValueChange={(d) => setTotalLengthFt(d == null ? "" : String(d))}
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
              <p className="mt-1 text-xs text-foreground-muted">
                Saving updates the materials catalog for this item on future takeoffs.
              </p>
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
                  <FractionalInput
                    id="galv_length_ft"
                    name="galv_length_ft"
                    className="input-admin"
                    min={0}
                    value={galvLengthFt === "" ? null : parseFractionalToDecimal(galvLengthFt)}
                    onValueChange={(d) => setGalvLengthFt(d == null ? "" : String(d))}
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
          <div className="col-span-full lg:col-span-4">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="text-sm text-foreground-muted underline"
            >
              {showDetails ? "Hide" : "Show"} catalog details
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
            </div>
          </TakeoffFormSection>
        )}

        {error && (
          <p className="col-span-full text-sm text-red-500">{error}</p>
        )}

        <TakeoffLineProposalPanel
          scope={scope}
          onScopeChange={setScope}
          includeLineOnProposal={includeInProposal}
          onIncludeLineChange={setIncludeInProposal}
          customerNote={customerNote}
          customerNoteInProposal={customerNoteInProposal}
          onNoteChange={setCustomerNote}
          onNoteIncludeChange={setCustomerNoteInProposal}
        />

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
