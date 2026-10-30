"use client";

import { useEffect, useState } from "react";
import type { Booking, DeliveryMethod } from "@/lib/types";

interface Props {
  booking: Booking;
  onSelect: (method: DeliveryMethod, summary: string) => void;
  disabled?: boolean;
  selectedMethod?: DeliveryMethod;
}

export function DeliveryOptions({ booking, onSelect, disabled, selectedMethod }: Props) {
  const [quotes, setQuotes] = useState<
    Record<DeliveryMethod, { price: number; estimatedDelivery: string } | null>
  >({ door: null, collect: null });

  useEffect(() => {
    if (!booking.parcelSize || !booking.senderSuburb || !booking.receiverAddress) {
      return;
    }
    (["door", "collect"] as DeliveryMethod[]).forEach(async (method) => {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcelSize: booking.parcelSize,
          deliveryMethod: method,
          from: booking.senderSuburb,
          to: booking.receiverAddress,
        }),
      });
      const data = await res.json();
      setQuotes((q) => ({ ...q, [method]: data }));
    });
  }, [booking.parcelSize, booking.senderSuburb, booking.receiverAddress]);

  const options: {
    id: DeliveryMethod;
    title: string;
    tags: string[];
  }[] = [
    {
      id: "door",
      title: "Deliver to Door",
      tags: ["Straight to door", "ATL/Signature on delivery available"],
    },
    {
      id: "collect",
      title: "Collect from PARCELPOINT",
      tags: ["Held until collection", "Often lower cost", "Hours that suit them"],
    },
  ];

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const q = quotes[opt.id];
        const selected = selectedMethod === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled || !q}
            onClick={() =>
              onSelect(
                opt.id,
                `${opt.title} · $${q!.price.toFixed(2)} · Est. ${q!.estimatedDelivery}`
              )
            }
            className={`w-full rounded-xl border p-4 text-left transition disabled:opacity-60 ${
              selected
                ? "border-brand-orange bg-orange-50 ring-2 ring-brand-orange/30"
                : "border-neutral-200 hover:border-brand-orange"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{opt.title}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {opt.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {q && (
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-brand-orange">
                    ${q.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-neutral-500">Est. {q.estimatedDelivery}</p>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
