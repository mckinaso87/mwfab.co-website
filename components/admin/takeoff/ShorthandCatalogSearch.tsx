"use client";

import { getCatalogFieldValue } from "@/lib/catalog-field-value";
import { CATEGORY_SHORT } from "@/lib/takeoff-catalog-spec";
import { TAKEOFF_INNER_BOX } from "@/components/admin/takeoff/takeoff-form-variants";
import type { MaterialCatalogRow, MaterialFieldConfig } from "@/lib/db-types";

type Props = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: MaterialCatalogRow[];
  searchLoading: boolean;
  searchError: string | null;
  catalogRow: MaterialCatalogRow | null;
  onSelectRow: (row: MaterialCatalogRow) => void;
  onClearSelection: () => void;
  fieldConfigByCategory: Record<string, MaterialFieldConfig[]>;
  displaySelectedRow: (row: MaterialCatalogRow) => string;
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20 16.5 16.5" />
    </svg>
  );
}

export function ShorthandCatalogSearch({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  searchLoading,
  searchError,
  catalogRow,
  onSelectRow,
  onClearSelection,
  fieldConfigByCategory,
  displaySelectedRow,
}: Props) {
  const showDropdown =
    !catalogRow && !searchLoading && searchResults.length > 0;
  const showLoading = !catalogRow && searchQuery.trim().length >= 2 && searchLoading;
  const showEmpty =
    !catalogRow &&
    !searchLoading &&
    !searchError &&
    searchQuery.trim().length >= 2 &&
    searchResults.length === 0;

  return (
    <div className="space-y-3">
      <label htmlFor="shorthand_search" className="sr-only">
        Search material catalog by shorthand
      </label>
      <div
        className={`relative overflow-hidden rounded-xl border-2 transition-colors ${
          catalogRow
            ? TAKEOFF_INNER_BOX.catalogSearchSelected
            : TAKEOFF_INNER_BOX.catalogSearchIdle
        }`}
      >
        <div
          className={`flex items-center gap-3 border-b px-4 py-2.5 ${TAKEOFF_INNER_BOX.catalogSearchHeader}`}
        >
          <SearchIcon className="shrink-0 text-sky-300" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Catalog shorthand search</p>
            <p className="text-xs text-foreground-muted">
              Examples: <span className="font-mono text-foreground/90">L 4x4</span>,{" "}
              <span className="font-mono text-foreground/90">W12×30</span>,{" "}
              <span className="font-mono text-foreground/90">HSS4×4</span>
            </p>
          </div>
        </div>
        <div className="px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
          <input
            id="shorthand_search"
            type="search"
            className={`input-admin !mt-0 w-full !pl-3 text-base sm:text-lg ${
              showDropdown || showLoading ? "rounded-b-none border-b-0" : ""
            }`}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Start typing a shorthand (min. 2 characters)…"
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="shorthand-search-listbox"
          />
        </div>
      </div>

      {!catalogRow && searchQuery.trim().length >= 2 && !searchLoading && searchResults.length > 0 && (
        <p className="text-xs text-foreground-muted">
          {searchResults.length} match{searchResults.length === 1 ? "" : "es"} — select one to
          continue
        </p>
      )}

      {searchError && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {searchError}
        </p>
      )}

      {showLoading && (
        <div
          className="-mt-3 rounded-b-xl border border-t-0 border-sky-500/35 bg-card px-4 py-8 text-center shadow-lg"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-foreground">Searching catalog…</p>
        </div>
      )}

      {showEmpty && (
        <div className="-mt-3 rounded-b-xl border border-t-0 border-steel/50 bg-steel/10 px-4 py-4 text-sm text-foreground-muted">
          No matches for &ldquo;{searchQuery.trim()}&rdquo;. Try another shorthand or run{" "}
          <code className="text-xs">npm run seed:materials</code>.
        </div>
      )}

      {showDropdown && (
        <div
          id="shorthand-search-listbox"
          role="listbox"
          aria-label="Catalog matches"
                className="-mt-3 overflow-hidden rounded-b-xl border border-t-0 border-sky-500/45 bg-card shadow-xl shadow-sky-950/25 ring-1 ring-sky-500/20"
        >
                <div className="flex items-center justify-between gap-2 border-b border-sky-500/30 bg-sky-500/15 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Pick a material
            </span>
                  <span className="rounded-full bg-sky-500/25 px-2.5 py-0.5 text-xs font-medium tabular-nums">
              {searchResults.length}
            </span>
          </div>
          <ul className="max-h-72 divide-y divide-steel/25 overflow-y-auto">
            {searchResults.map((row) => {
              const fields = fieldConfigByCategory[row.category] ?? [];
              const detail = fields
                .map((f) => {
                  const v = getCatalogFieldValue(row, f.field_key);
                  return v ? `${f.label}: ${v}` : null;
                })
                .filter(Boolean)
                .join(" · ");
              const cost = row.pricing_unit === "per_lb" ? row.cost_per_lb : row.cost_per_foot;
              return (
                <li key={row.id} role="option">
                  <button
                    type="button"
                    onClick={() => onSelectRow(row)}
                          className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-sky-500/15 focus-visible:bg-sky-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-xs font-bold text-[var(--takeoff-step-catalog)] group-hover:bg-sky-500/30">
                      {CATEGORY_SHORT[row.category] ?? "?"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-semibold text-foreground group-hover:text-[var(--takeoff-step-catalog)]">
                          {row.shorthand_code}
                        </span>
                        {row.size_label && row.size_label !== row.shorthand_code && (
                          <span className="text-sm text-foreground-muted">{row.size_label}</span>
                        )}
                      </span>
                      {detail && (
                        <span className="mt-1 block text-xs leading-relaxed text-foreground-muted">
                          {detail}
                        </span>
                      )}
                      {(cost != null || row.weight_per_ft != null) && (
                        <span className="mt-1.5 flex flex-wrap gap-2">
                          {row.weight_per_ft != null && (
                            <span className="inline-flex rounded bg-steel/30 px-1.5 py-0.5 text-xs tabular-nums">
                              {Number(row.weight_per_ft)} lb/ft
                            </span>
                          )}
                          {cost != null && Number.isFinite(Number(cost)) && (
                            <span className="inline-flex rounded bg-sky-500/20 px-1.5 py-0.5 text-xs tabular-nums text-[var(--takeoff-step-catalog)]">
                              ${Number(cost).toFixed(2)}
                              {row.pricing_unit === "per_foot" ? "/ft" : "/lb"}
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                    <span
                      className="shrink-0 self-center text-xs font-semibold text-sky-300 opacity-0 group-hover:opacity-100"
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
        <div className="flex items-start justify-between gap-3 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 px-4 py-3.5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Material selected
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {displaySelectedRow(catalogRow)}
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              Fill in quantities below, then set scope and proposal options.
            </p>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            className="shrink-0 rounded-lg border border-steel/50 bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-steel/30"
          >
            Change material
          </button>
        </div>
      )}
    </div>
  );
}
