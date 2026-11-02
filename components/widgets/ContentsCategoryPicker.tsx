"use client";

import { useState } from "react";
import { CONTENT_CATEGORIES } from "@/lib/types";

interface Props {
  selected?: string;
  onSelect: (categoryLabel: string) => void;
  disabled?: boolean;
}

export function ContentsCategoryPicker({
  selected,
  onSelect,
  disabled,
}: Props) {
  const [showProhibited, setShowProhibited] = useState(false);

  return (
    <div className="space-y-2 rounded-xl border border-neutral-200 p-3">
      <button
        type="button"
        onClick={() => setShowProhibited(true)}
        className="text-xs font-medium text-brand-orange underline"
      >
        Prohibited or dangerous goods?
      </button>
      <p className="text-xs font-medium text-neutral-600">Choose a category</p>
      <div className="max-h-52 space-y-1 overflow-y-auto">
        {CONTENT_CATEGORIES.map((c) => {
          const isSelected = selected === c.label;
          return (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(c.label)}
              className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition disabled:opacity-50 ${
                isSelected
                  ? "border-brand-orange bg-orange-50 ring-2 ring-brand-orange/30"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              <span>{c.emoji}</span>
              <span className="flex-1">{c.label}</span>
              {isSelected && (
                <span className="text-brand-orange" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
      {showProhibited && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[80vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Prohibited goods</h3>
              <button
                type="button"
                onClick={() => setShowProhibited(false)}
                className="text-sm text-neutral-500"
              >
                Close
              </button>
            </div>
            <p className="text-sm text-neutral-600">
              Explosives, flammables, weapons, and other restricted items cannot
              be sent via PARCELPOINT.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
