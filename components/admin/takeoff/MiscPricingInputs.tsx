"use client";

import { useEffect, useState } from "react";
import { computeMiscLineTotal, computeFieldMiscTotal } from "@/lib/takeoff-calculations";

type Props = {
  label?: string;
  variant?: "misc" | "field";
  totalDisplay?: string;
  onTotalChange: (total: string) => void;
};

export function MiscPricingInputs({ label = "", variant = "misc", totalDisplay, onTotalChange }: Props) {
  const [hours, setHours] = useState("");
  const [ratePerHour, setRatePerHour] = useState("");
  const [days, setDays] = useState("");
  const [ratePerDay, setRatePerDay] = useState("");
  const [amount, setAmount] = useState("");
  const [pricePer, setPricePer] = useState("");

  const labelClass = "block text-sm font-medium text-foreground";

  useEffect(() => {
    const input = {
      label,
      hours: parseFloat(hours) || null,
      days: parseFloat(days) || null,
      rate_per_hour: parseFloat(ratePerHour) || null,
      rate_per_day: parseFloat(ratePerDay) || null,
      amount: parseFloat(amount) || null,
      price_per: parseFloat(pricePer) || null,
      weight_of_galv: null,
      total_price: 0,
      total: 0,
    };
    const total =
      variant === "field"
        ? computeFieldMiscTotal(input)
        : computeMiscLineTotal(input);
    const s = total > 0 ? total.toFixed(2) : "";
    onTotalChange?.(s);
  }, [hours, ratePerHour, days, ratePerDay, amount, pricePer, label, variant, onTotalChange]);

  return (
    <>
      <div className="col-span-full grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-steel/30 p-3 space-y-2">
          <span className="text-xs font-medium text-foreground-muted">Hours</span>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor={`${variant}_hours`} className={labelClass}>Hours</label>
              <input
                id={`${variant}_hours`}
                name="hours"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor={`${variant}_rate_hr`} className={labelClass}>Rate/hr</label>
              <input
                id={`${variant}_rate_hr`}
                name="rate_per_hour"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={ratePerHour}
                onChange={(e) => setRatePerHour(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-steel/30 p-3 space-y-2">
          <span className="text-xs font-medium text-foreground-muted">Days</span>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor={`${variant}_days`} className={labelClass}>Days</label>
              <input
                id={`${variant}_days`}
                name="days"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor={`${variant}_rate_day`} className={labelClass}>Rate/day</label>
              <input
                id={`${variant}_rate_day`}
                name="rate_per_day"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={ratePerDay}
                onChange={(e) => setRatePerDay(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-steel/30 p-3 space-y-2">
          <span className="text-xs font-medium text-foreground-muted">Qty × price</span>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor={`${variant}_qty`} className={labelClass}>Qty</label>
              <input
                id={`${variant}_qty`}
                name="amount"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor={`${variant}_price`} className={labelClass}>Price/each</label>
              <input
                id={`${variant}_price`}
                name="price_per"
                type="number"
                step="0.01"
                min="0"
                className="input-admin"
                value={pricePer}
                onChange={(e) => setPricePer(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-full">
        <span className="text-sm text-foreground-muted">Line total: </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {totalDisplay ? `$${totalDisplay}` : "—"}
        </span>
      </div>
    </>
  );
}
