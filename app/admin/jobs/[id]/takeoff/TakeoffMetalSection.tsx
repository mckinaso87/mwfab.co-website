"use client";

import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { upsertMetalLine, deleteMetalLineForm, getCatalogDimensionOptions, getCatalogRow } from "./actions";
import { formatMoney } from "./formatMoney";
import type { TakeoffMetalLine } from "@/lib/db-types";
import type { MaterialCatalogRow } from "@/lib/db-types";
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  getCategorySpec,
  type CategorySpec,
} from "@/lib/takeoff-catalog-spec";

type Props = {
  takeoffId: string;
  jobId: string;
  lines: TakeoffMetalLine[];
};

function displayCatalogRow(row: MaterialCatalogRow): string {
  const name = row.display_name?.trim() ? row.display_name : row.item_code;
  const parts = [name, `[${row.item_code}]`];
  if (row.weight_per_ft != null && Number.isFinite(row.weight_per_ft))
    parts.push(`${Number(row.weight_per_ft)} lb/ft`);
  const cost =
    row.pricing_unit === "per_lb" ? row.cost_per_lb : row.cost_per_foot;
  if (cost != null && Number.isFinite(cost))
    parts.push(row.pricing_unit === "per_foot" ? `$${Number(cost).toFixed(2)}/ft` : `$${Number(cost).toFixed(2)}/lb`);
  return parts.join(" · ");
}

export function TakeoffMetalSection({ takeoffId, jobId, lines }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => upsertMetalLine(takeoffId, jobId, formData),
    null as { error?: string } | null
  );
  const deleteAction = (lineId: string) =>
    deleteMetalLineForm.bind(null, takeoffId, lineId, jobId);

  const [category, setCategory] = useState<string>("angles");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [stepOptions, setStepOptions] = useState<string[]>([]);
  const [stepOptionsLoading, setStepOptionsLoading] = useState(false);
  const [catalogRow, setCatalogRow] = useState<MaterialCatalogRow | null>(null);
  const [catalogRowLoading, setCatalogRowLoading] = useState(false);
  const [count, setCount] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [totalLengthFt, setTotalLengthFt] = useState("");
  const [totalPounds, setTotalPounds] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");

  const spec = getCategorySpec(category as TakeoffMetalLine["category"]);
  const isOther = category === "other";
  const steps = useMemo(() => spec?.steps ?? [], [spec]);
  const currentStepIndex = steps.findIndex((s) => !selections[s.key]?.trim());
  const allStepsFilled = steps.length > 0 && currentStepIndex === -1;

  const filtersForStep = useCallback(
    (stepIndex: number): Record<string, string> => {
      const f: Record<string, string> = {};
      for (let i = 0; i < stepIndex; i++) {
        const k = steps[i]!.key;
        if (selections[k]) f[k] = selections[k]!;
      }
      return f;
    },
    [steps, selections]
  );

  useEffect(() => {
    if (isOther || steps.length === 0) {
      setStepOptions([]);
      setCatalogRow(null);
      return;
    }
    if (allStepsFilled) {
      setStepOptionsLoading(false);
      setStepOptions([]);
      setCatalogRowLoading(true);
      getCatalogRow(category, selections)
        .then(({ row }) => {
          if (row) {
            setCatalogRow(row);
            setDisplayName(row.display_name?.trim() || row.item_code || "");
            const costVal = row.pricing_unit === "per_lb" ? row.cost_per_lb : row.cost_per_foot;
            const numCost = costVal != null && String(costVal).trim() !== "" ? Number(costVal) : NaN;
            setCostPerUnit(Number.isFinite(numCost) ? String(numCost) : "");
          } else {
            setCatalogRow(null);
          }
        })
        .finally(() => setCatalogRowLoading(false));
      return;
    }
    setCatalogRow(null);
    if (currentStepIndex < 0) return;
    const stepKey = steps[currentStepIndex]!.key;
    setStepOptionsLoading(true);
    getCatalogDimensionOptions(category, stepKey, filtersForStep(currentStepIndex))
      .then(({ options }) => setStepOptions(options))
      .catch(() => setStepOptions([]))
      .finally(() => setStepOptionsLoading(false));
  }, [category, isOther, steps, selections, currentStepIndex, allStepsFilled, filtersForStep]);

  const weightPerFt =
    catalogRow?.weight_per_ft != null ? Number(catalogRow.weight_per_ft) : null;
  const pricingUnit = catalogRow?.pricing_unit ?? null;
  const costFromRow =
    pricingUnit === "per_lb" ? catalogRow?.cost_per_lb : catalogRow?.cost_per_foot;
  const costFromRowNum =
    costFromRow != null && Number.isFinite(Number(costFromRow)) ? Number(costFromRow) : NaN;
  const manualCost = costPerUnit.trim() !== "" ? parseFloat(costPerUnit) : NaN;
  const cost = Number.isFinite(manualCost) ? manualCost : (Number.isFinite(costFromRowNum) ? costFromRowNum : NaN);

  // Total = (length OR weight) × count × cost — per_foot: (length × count) × cost; per_lb: weight × cost (weight can be total or length×count×wpf)
  function getComputedTotalPrice(): string {
    const length = parseFloat(totalLengthFt);
    const pounds = parseFloat(totalPounds);
    const c = parseFloat(costPerUnit);
    const effectiveCost = Number.isFinite(cost) ? cost : (Number.isFinite(c) ? c : NaN);
    if (!Number.isFinite(effectiveCost)) return "";

    const mult = Math.max(1, Math.floor(Number(count) || 1));
    const hasPounds = Number.isFinite(pounds) && pounds > 0;
    const hasLength = Number.isFinite(length) && length > 0;

    if (isOther) {
      // total_pounds is total for line; if you use per-piece pounds, enter total or count×per-piece
      return hasPounds ? (pounds * effectiveCost).toFixed(2) : "";
    }

    const unit = catalogRow ? pricingUnit : spec?.pricingUnit ?? "per_lb";

    if (unit === "per_foot") {
      const effectiveLength =
        hasLength
          ? length * mult
          : catalogRow && weightPerFt != null && weightPerFt > 0 && hasPounds
            ? (pounds / weightPerFt) * mult
            : NaN;
      if (Number.isFinite(effectiveLength)) return (effectiveLength * effectiveCost).toFixed(2);
      return "";
    }

    // per_lb: prefer computed weight (length × count × weight_per_ft) when we have catalog so count and lb/ft are reflected
    const computedPounds =
      catalogRow && hasLength && weightPerFt != null && weightPerFt > 0 ? length * mult * weightPerFt : null;
    const weightForTotal =
      computedPounds != null && Number.isFinite(computedPounds)
        ? computedPounds
        : (hasPounds ? pounds : NaN);
    if (Number.isFinite(weightForTotal) && weightForTotal > 0)
      return (weightForTotal * effectiveCost).toFixed(2);
    return "";
  }
  const computedTotalPrice = getComputedTotalPrice();

  useEffect(() => {
    if (catalogRow) {
      setDisplayName(catalogRow.display_name?.trim() || catalogRow.item_code);
      const costLb = catalogRow.cost_per_lb;
      const costFt = catalogRow.cost_per_foot;
      const hasLb = costLb != null && String(costLb).trim() !== "" && Number.isFinite(Number(costLb));
      const hasFt = costFt != null && String(costFt).trim() !== "" && Number.isFinite(Number(costFt));
      if (catalogRow.pricing_unit === "per_lb" && hasLb)
        setCostPerUnit(String(Number(costLb)));
      else if (catalogRow.pricing_unit === "per_foot" && hasFt)
        setCostPerUnit(String(Number(costFt)));
      else
        setCostPerUnit(""); // No price in catalog — user can type cost; total will update automatically
    }
  }, [catalogRow]);

  // When catalog has weight_per_ft and user has length + count, auto-fill Total pounds (length × count × lb/ft)
  useEffect(() => {
    if (!catalogRow?.weight_per_ft) return;
    const length = parseFloat(totalLengthFt);
    const mult = Math.max(1, Math.floor(Number(count) || 1));
    if (Number.isFinite(length) && length > 0) {
      const wpf = Number(catalogRow.weight_per_ft);
      if (Number.isFinite(wpf) && wpf > 0)
        setTotalPounds(String(length * mult * wpf));
    }
  }, [catalogRow?.id, catalogRow?.weight_per_ft, totalLengthFt, count]);

  const resetForm = () => {
    setSelections({});
    setCatalogRow(null);
    setDisplayName("");
    setCount(1);
    setTotalLengthFt("");
    setTotalPounds("");
    setCostPerUnit("");
  };

  const handleCategoryChange = (next: string) => {
    setCategory(next);
    setSelections({});
    setCatalogRow(null);
    setDisplayName("");
    setCostPerUnit("");
  };

  const handleStepSelect = (stepKey: string, value: string) => {
    const idx = steps.findIndex((s) => s.key === stepKey);
    const next: Record<string, string> = {};
    for (let i = 0; i < idx; i++) next[steps[i]!.key] = selections[steps[i]!.key] ?? "";
    next[stepKey] = value;
    setSelections(next);
  };

  const clearCatalogSelection = () => {
    setSelections({});
    setCatalogRow(null);
    setDisplayName("");
    setCostPerUnit("");
  };

  const catalogId = catalogRow?.id ?? "";
  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <section className="rounded-xl border border-steel/50 bg-card p-6">
      <h2 className="mb-1 text-lg font-semibold text-foreground">Metal lines</h2>
      <p className="mb-4 text-sm text-foreground-muted">Catalog-based and custom metal line items.</p>

      {lines.length > 0 ? (
        <div className="overflow-x-auto border border-steel/50 rounded-lg mb-6">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-steel/50 bg-steel/20">
                <th className="px-4 py-3 text-left font-medium text-foreground">Description</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Category</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Count</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Length</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Pounds</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Total</th>
                <th className="px-4 py-3 text-right font-medium text-foreground w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-steel/30 hover:bg-steel/10">
                  <td className="px-4 py-2.5 font-medium text-foreground">{line.display_name}</td>
                  <td className="px-4 py-2.5 text-foreground-muted">{CATEGORY_LABELS[line.category] ?? line.category}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{line.count}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{line.total_length_ft != null ? `${line.total_length_ft} ft` : "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{line.total_pounds != null ? `${line.total_pounds} lb` : "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">{formatMoney(line.total_price)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <form
                      action={async (fd: FormData) => {
                        await deleteAction(line.id)(fd);
                        router.refresh();
                      }}
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="text-red-400 hover:text-red-300 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-6 text-sm text-foreground-muted">No metal lines yet. Add one below.</p>
      )}

      <h3 className="mb-3 text-sm font-semibold text-foreground">Add metal line</h3>
      <form
        action={async (formData) => {
          await formAction(formData);
          router.refresh();
          resetForm();
        }}
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input type="hidden" name="sort_order" value={lines.length} />
        <input type="hidden" name="material_catalog_id" value={catalogId} />
        <div>
          <label htmlFor="metal_category" className={labelClass}>Category</label>
          <select
            id="metal_category"
            name="category"
            className="input-admin"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
            ))}
          </select>
        </div>

        {!isOther && steps.length > 0 && (
          <>
            {steps.map((step, idx) => {
              const value = selections[step.key] ?? "";
              const isCurrentStep = idx === currentStepIndex;
              const isPastStep = idx < currentStepIndex;
              return (
                <div key={step.key}>
                  <label className={labelClass}>{step.label}</label>
                  {isPastStep ? (
                    <div className="rounded-md border border-steel/50 bg-steel/20 px-3 py-2 text-sm text-foreground">
                      {value}
                    </div>
                  ) : isCurrentStep ? (
                    <select
                      className="input-admin"
                      value={value}
                      onChange={(e) => handleStepSelect(step.key, e.target.value)}
                      disabled={stepOptionsLoading}
                    >
                      <option value="">Select {step.label.toLowerCase()}…</option>
                      {stepOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : null}
                </div>
              );
            })}
            {allStepsFilled && (
              <div className="col-span-full rounded-md border border-steel/50 bg-steel/20 p-3 text-sm">
                {catalogRowLoading ? (
                  <span className="text-foreground-muted">Loading…</span>
                ) : catalogRow ? (
                  <span className="text-foreground">{displayCatalogRow(catalogRow)}</span>
                ) : null}
              </div>
            )}
            {Object.keys(selections).length > 0 && (
              <div className="col-span-full">
                <button
                  type="button"
                  onClick={clearCatalogSelection}
                  className="text-sm text-foreground-muted hover:text-foreground underline"
                >
                  Clear selection
                </button>
              </div>
            )}
          </>
        )}

        <div>
          <label htmlFor="metal_count" className={labelClass}>Count</label>
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
          <label htmlFor="metal_total_length_ft" className={labelClass}>Length (ft)</label>
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
          <label htmlFor="metal_total_pounds" className={labelClass}>Total pounds</label>
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
          <label htmlFor="metal_cost_per_unit" className={labelClass}>
            Cost per unit {!isOther && catalogRow ? `(${spec?.pricingUnit === "per_foot" ? "$/ft" : "$/lb"})` : "($/lb or $/ft)"}
            {!isOther && catalogRow && !Number.isFinite(costFromRowNum) && (
              <span className="ml-1 text-amber-500">— enter manually if not in catalog</span>
            )}
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
        <div>
          <label htmlFor="metal_total_price" className={labelClass}>Total price (auto)</label>
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
        <div className="col-span-full">
          <label htmlFor="metal_display_name" className={labelClass}>Display name</label>
          <input
            id="metal_display_name"
            name="display_name"
            type="text"
            className="input-admin"
            placeholder={isOther ? "e.g. Plate 12 x 12 x 1/2" : undefined}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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
