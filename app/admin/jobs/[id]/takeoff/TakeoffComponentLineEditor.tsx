"use client";

import { useEffect, useState } from "react";
import { ScopeToggle } from "@/components/admin/takeoff/ScopeToggle";
import type { TakeoffComponentLine, LineScope } from "@/lib/db-types";

type Props = {
  initial?: TakeoffComponentLine | null;
  sortOrder: number;
  onSubmit: (formData: FormData) => Promise<void>;
  error?: string | null;
  submitLabel: string;
  pending?: boolean;
};

export function TakeoffComponentLineEditor({
  initial,
  sortOrder,
  onSubmit,
  error,
  submitLabel,
  pending,
}: Props) {
  const [scope, setScope] = useState<LineScope>(initial?.scope ?? "furnish_install");
  const [displayName, setDisplayName] = useState(initial?.display_name ?? "");
  const [count, setCount] = useState(initial?.count ?? 1);
  const [totalPoundsPerPiece, setTotalPoundsPerPiece] = useState(
    initial?.total_pounds_per_piece != null ? String(initial.total_pounds_per_piece) : ""
  );
  const [totalPounds, setTotalPounds] = useState(
    initial?.total_pounds != null ? String(initial.total_pounds) : ""
  );
  const [costPerMeasure, setCostPerMeasure] = useState(
    initial?.cost_per_measure != null ? String(initial.cost_per_measure) : ""
  );
  const [totalPrice, setTotalPrice] = useState(
    initial?.total_price != null ? String(initial.total_price) : ""
  );

  useEffect(() => {
    const cnt = count;
    const pp = parseFloat(totalPoundsPerPiece);
    const lbs = parseFloat(totalPounds);
    const cost = parseFloat(costPerMeasure);
    const effectivePounds =
      Number.isFinite(lbs) && lbs > 0
        ? lbs
        : Number.isFinite(pp) && pp > 0 && cnt > 0
          ? cnt * pp
          : 0;
    if (Number.isFinite(cost) && effectivePounds > 0) {
      setTotalPrice((effectivePounds * cost).toFixed(2));
    } else if (!initial) {
      setTotalPrice("");
    }
  }, [count, totalPoundsPerPiece, totalPounds, costPerMeasure, initial]);

  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <form
      action={onSubmit}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="sort_order" value={initial?.sort_order ?? sortOrder} />
      <div className="sm:col-span-2">
        <label htmlFor="comp_display_name" className={labelClass}>
          Name
        </label>
        <input
          id="comp_display_name"
          name="display_name"
          type="text"
          className="input-admin"
          placeholder="e.g. Anchor bolts"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="comp_count" className={labelClass}>
          Count
        </label>
        <input
          id="comp_count"
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
        <label htmlFor="comp_total_pounds_per_piece" className={labelClass}>
          Total pounds per piece
        </label>
        <input
          id="comp_total_pounds_per_piece"
          name="total_pounds_per_piece"
          type="number"
          step="0.01"
          min="0"
          className="input-admin"
          value={totalPoundsPerPiece}
          onChange={(e) => setTotalPoundsPerPiece(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="comp_total_pounds" className={labelClass}>
          Total pounds
        </label>
        <input
          id="comp_total_pounds"
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
        <label htmlFor="comp_cost_per_measure" className={labelClass}>
          Cost per measure ($)
        </label>
        <input
          id="comp_cost_per_measure"
          name="cost_per_measure"
          type="number"
          step="0.01"
          min="0"
          className="input-admin"
          value={costPerMeasure}
          onChange={(e) => setCostPerMeasure(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="comp_total_price" className={labelClass}>
          Total price (auto)
        </label>
        <input
          id="comp_total_price"
          name="total_price"
          type="number"
          step="0.01"
          min="0"
          readOnly
          className="input-admin bg-steel/30"
          value={totalPrice}
        />
      </div>
      <div className="sm:col-span-2">
        <span className={labelClass}>Scope</span>
        <div className="mt-1">
          <ScopeToggle value={scope} onChange={setScope} />
        </div>
      </div>
      {error && <p className="sm:col-span-2 text-sm text-red-500">{error}</p>}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-steel-blue px-4 py-2 text-sm font-medium text-foreground hover:bg-steel disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
