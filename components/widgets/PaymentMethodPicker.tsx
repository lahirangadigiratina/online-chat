"use client";

import { computeTotals } from "@/lib/pricing";
import type { Booking, PaymentMethod } from "@/lib/types";

interface Props {
  booking: Booking;
  onSelect: (method: PaymentMethod) => void;
  selected?: PaymentMethod;
}

export function PaymentMethodPicker({ booking, onSelect, selected }: Props) {
  const total = computeTotals(booking).total;

  const options: {
    id: PaymentMethod;
    title: string;
    subtitle: string;
    icon: string;
  }[] = [
    { id: "online", title: "Pay Online", subtitle: "Payment gateway", icon: "💳" },
    {
      id: "instore",
      title: "Pay Instore",
      subtitle: "EFTPOS and cash",
      icon: "💵",
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-500">
        Total due: <strong>${total.toFixed(2)}</strong>
      </p>
      {options.map((o) => {
        const isSelected = selected === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
              isSelected
                ? "border-brand-orange bg-orange-50 ring-2 ring-brand-orange/30"
                : "border-neutral-200 hover:border-brand-orange hover:bg-orange-50"
            }`}
          >
            <span className="text-2xl">{o.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{o.title}</p>
              <p className="text-xs text-neutral-500">{o.subtitle}</p>
            </div>
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                isSelected
                  ? "border-brand-orange bg-brand-orange text-[10px] text-white"
                  : "border-neutral-300"
              }`}
            >
              {isSelected ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
