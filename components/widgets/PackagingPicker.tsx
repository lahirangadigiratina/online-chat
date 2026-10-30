"use client";

import { PACKAGING_FEE } from "@/lib/pricing";

interface Props {
  onSelect: (needsPackaging: boolean) => void;
  selected?: boolean;
}

export function PackagingPicker({ onSelect, selected }: Props) {
  const yes = selected === true;
  const no = selected === false;
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onSelect(true)}
        className={`rounded-xl border p-4 text-left transition ${
          yes
            ? "border-brand-orange bg-orange-50 ring-2 ring-brand-orange/30"
            : "border-neutral-200 hover:border-brand-orange"
        }`}
      >
        <p className="text-sm font-semibold">
          Yes{" "}
          <span className="font-medium text-brand-orange">
            (+${PACKAGING_FEE.toFixed(2)})
          </span>
        </p>
      </button>
      <button
        type="button"
        onClick={() => onSelect(false)}
        className={`rounded-xl border p-4 text-left transition ${
          no
            ? "border-brand-orange bg-orange-50 ring-2 ring-brand-orange/30"
            : "border-neutral-200 hover:border-brand-orange"
        }`}
      >
        <p className="text-sm font-semibold">No</p>
      </button>
    </div>
  );
}
