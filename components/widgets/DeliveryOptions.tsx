"use client";

import { useEffect, useMemo, useState } from "react";
import { STANDARD_DELIVERY_PRICE } from "@/lib/pricing";
import type { Booking, DeliveryMethod } from "@/lib/types";

interface Props {
  booking: Booking;
  onSelect: (method: DeliveryMethod, summary: string) => void;
  disabled?: boolean;
  selectedMethod?: DeliveryMethod;
}

function estimateDelivery(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function defaultQuote(method: DeliveryMethod) {
  return {
    price: STANDARD_DELIVERY_PRICE,
    estimatedDelivery: estimateDelivery(method === "collect" ? 3 : 2),
  };
}

export function DeliveryOptions({
  booking,
  onSelect,
  disabled,
  selectedMethod,
}: Props) {
  const [quotes, setQuotes] = useState<
    Record<DeliveryMethod, { price: number; estimatedDelivery: string } | null>
  >({ door: null, collect: null });

  const quoteReady = !!booking.parcelSize && !!booking.senderSuburb;

  useEffect(() => {
    if (!quoteReady) return;
    const to = booking.receiverAddress?.trim() || booking.senderSuburb!;
    (["door", "collect"] as DeliveryMethod[]).forEach(async (method) => {
      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            parcelSize: booking.parcelSize,
            deliveryMethod: method,
            from: booking.senderSuburb,
            to,
          }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          price: number;
          estimatedDelivery: string;
        };
        setQuotes((q) => ({ ...q, [method]: data }));
      } catch {
        /* keep default quote in UI */
      }
    });
  }, [
    quoteReady,
    booking.parcelSize,
    booking.senderSuburb,
    booking.receiverAddress,
  ]);

  const options: {
    id: DeliveryMethod;
    title: string;
    tags: string[];
  }[] = useMemo(
    () => [
      {
        id: "door",
        title: "Deliver to Door",
        tags: ["Straight to door", "ATL/Signature on delivery available"],
      },
      {
        id: "collect",
        title: "Collect from PARCELPOINT",
        tags: ["Held until collection", "Hours that suit them"],
      },
    ],
    []
  );

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const q = quotes[opt.id] ?? defaultQuote(opt.id);
        const selected = selectedMethod === opt.id;
        const priceLabel = `$${q.price.toFixed(2)}`;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled || !quoteReady}
            onClick={() =>
              onSelect(
                opt.id,
                `${opt.title} · ${priceLabel} · Est. ${q.estimatedDelivery}`
              )
            }
            className={`w-full rounded-xl border p-4 text-left transition disabled:opacity-60 ${
              selected
                ? "border-brand-orange bg-orange-50 ring-2 ring-brand-orange/30"
                : "border-neutral-200 hover:border-brand-orange"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-black">
                  {opt.title}
                </p>
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
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-brand-orange">
                  {priceLabel}
                </p>
                <p className="text-xs text-neutral-500">
                  Est. {q.estimatedDelivery}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
