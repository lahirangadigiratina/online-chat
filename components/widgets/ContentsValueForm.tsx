"use client";

import { useEffect, useState } from "react";
import { MAX_PARCEL_VALUE } from "@/lib/validation";

interface Props {
  initialValue?: number;
  categoryLabel?: string;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

export function ContentsValueForm({
  initialValue,
  categoryLabel,
  onValueChange,
  disabled,
}: Props) {
  const [value, setValue] = useState(
    initialValue && initialValue > 0 ? String(initialValue) : ""
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValue && initialValue > 0) {
      setValue(String(initialValue));
    }
  }, [initialValue]);

  const commit = (raw: string) => {
    const num = parseFloat(raw) || 0;
    if (num <= 0) {
      setError(null);
      return;
    }
    if (num > MAX_PARCEL_VALUE) {
      setError(`Maximum parcel value is $${MAX_PARCEL_VALUE.toLocaleString()}.`);
      return;
    }
    setError(null);
    onValueChange(num);
  };

  return (
    <div className="space-y-2 rounded-xl border border-neutral-200 p-3">
      {categoryLabel ? (
        <p className="text-xs text-neutral-500">
          Contents:{" "}
          <span className="font-medium text-brand-black">{categoryLabel}</span>
        </p>
      ) : null}
      <label className="block text-xs font-medium text-neutral-600">
        Parcel value (AUD) *
        <input
          type="number"
          min={0}
          max={MAX_PARCEL_VALUE}
          step={0.01}
          disabled={disabled}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            commit(e.target.value);
          }}
          placeholder="e.g. 120"
          className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 disabled:opacity-50"
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-[11px] text-neutral-400">
        Or type the amount in the message box below and tap Send.
      </p>
    </div>
  );
}
