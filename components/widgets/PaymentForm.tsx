"use client";

import { useMemo, useState } from "react";
import { computeTotals } from "@/lib/pricing";
import type { Booking } from "@/lib/types";
import { ContinueButton } from "./shared/ContinueButton";

interface Props {
  booking: Booking;
  onComplete: (payload: { paidOnline: boolean }) => void;
}

/**
 * MOCK card form — replace fields with Airwallex embedded/hosted element.
 * Do not log or persist PAN/CVC in production.
 */
export function PaymentForm({ booking, onComplete }: Props) {
  const total = computeTotals(booking).total;
  const instore = booking.paymentMethod === "instore";

  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardValid = useMemo(() => {
    if (instore) return true;
    const digits = card.replace(/\s/g, "");
    return (
      digits.length >= 15 &&
      /^\d{2}\/\d{2}$/.test(expiry) &&
      cvc.length >= 3 &&
      name.trim().length > 1
    );
  }, [card, cvc, expiry, name, instore]);

  const pay = async () => {
    setError(null);
    setBusy(true);
    try {
      if (!instore) {
        const res = await fetch("/api/payments", { method: "POST" });
        if (!res.ok) throw new Error("Payment failed");
      }
      onComplete({ paidOnline: !instore });
    } catch {
      setError("Payment could not be processed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-3">
      {instore ? (
        <p className="text-sm text-neutral-600">
          Pay <strong>${total.toFixed(2)}</strong> over the counter when you drop off
          your parcel. No card details needed.
        </p>
      ) : (
        <>
          <p className="text-xs text-neutral-600">
            Complete your secure card payment for{" "}
            <strong>${total.toFixed(2)}</strong>. You&apos;re all set once payment is
            confirmed — nothing else to do in-store.
          </p>
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-2 text-[10px] text-neutral-500">
            {/* AIRWALLEX_INTEGRATION: replace mock inputs below with Airwallex card element */}
            <label className="block text-xs font-medium text-neutral-700">
              Card number
              <input
                value={card}
                onChange={(e) => setCard(e.target.value)}
                placeholder="4242 4242 4242 4242"
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <div className="mt-2 flex gap-2 text-[10px] text-neutral-400">
              Visa · MC · Amex · Diners
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
              <input
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="CVC"
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name on card"
              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <p className="text-[10px] text-neutral-500">
            Payments are securely processed by Airwallex.{" "}
            <a href="#" className="text-brand-orange underline">
              Airwallex Terms & Policies
            </a>
          </p>
        </>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <ContinueButton
        disabled={!cardValid || busy}
        label={instore ? "Continue" : "Pay"}
        onClick={() => void pay()}
      />
    </div>
  );
}
