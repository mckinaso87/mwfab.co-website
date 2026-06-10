"use client";

import { useEffect, useRef, useState } from "react";
import { parseFractionalToDecimal, formatDecimalAsFraction } from "@/lib/parse-fraction";

type Props = {
  name: string;
  value: number | null;
  onValueChange: (decimal: number | null) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  min?: number;
};

export function FractionalInput({
  name,
  value,
  onValueChange,
  id,
  className,
  placeholder,
  min,
}: Props) {
  const [text, setText] = useState(() => formatDecimalAsFraction(value));
  const lastEmitted = useRef<number | null>(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setText(formatDecimalAsFraction(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const parsed = parseFractionalToDecimal(text);
  const decimalForForm =
    parsed != null && Number.isFinite(parsed) && (min == null || parsed >= min)
      ? parsed
      : null;

  return (
    <>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className={className}
        placeholder={placeholder ?? "e.g. 1/2"}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const p = parseFractionalToDecimal(e.target.value);
          const next = p != null && Number.isFinite(p) ? p : null;
          lastEmitted.current = next;
          onValueChange(next);
        }}
        onBlur={() => {
          if (decimalForForm != null) setText(formatDecimalAsFraction(decimalForForm));
        }}
      />
      <input type="hidden" name={name} value={decimalForForm ?? ""} />
    </>
  );
}
