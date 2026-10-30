"use client";

import { PARCEL_SIZE_INFO } from "@/lib/flow";
import type { ParcelSize } from "@/lib/types";

const SIZES: ParcelSize[] = ["satchel", "shoebox", "briefcase", "carry_on"];

interface Props {
  onSelect: (size: ParcelSize) => void;
  disabled?: boolean;
  selected?: ParcelSize;
}

export function ParcelSizePicker({ onSelect, disabled, selected }: Props) {
  return (
    <div role="list" className="space-y-2">
      {SIZES.map((id, index) => {
        const info = PARCEL_SIZE_INFO[id];
        const isSelected = selected === id;
        return (
          <button
            key={id}
            type="button"
            role="listitem"
            disabled={disabled}
            onClick={() => onSelect(id)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-60 ${
              isSelected
                ? "border-brand-orange bg-orange-50 ring-2 ring-brand-orange/30"
                : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-brand-black">
                {info.label}
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                {info.dimensions} · {info.maxWeight}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
