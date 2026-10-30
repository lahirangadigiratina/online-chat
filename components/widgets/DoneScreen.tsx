"use client";

import { PARCEL_SIZE_INFO } from "@/lib/flow";
import { computeTotals } from "@/lib/pricing";
import type { Booking } from "@/lib/types";
import { BookingBarcode } from "./BookingBarcode";

interface Props {
  booking: Booking;
  onBookAnother: () => void;
}

export function DoneScreen({ booking, onBookAnother }: Props) {
  const totals = computeTotals(booking);
  const instore = booking.paymentMethod === "instore";
  const size = booking.parcelSize
    ? PARCEL_SIZE_INFO[booking.parcelSize]
    : null;
  const dropSuburb =
    booking.dropOffPoint?.address.split(",").slice(-2).join(",") ??
    booking.senderSuburb ??
    "Drop-off";
  const receiverStreet =
    booking.receiverAddress?.split(",")[0] ?? booking.receiverAddress ?? "Destination";

  return (
    <div className="space-y-4 pb-2 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
        ✓
      </div>
      <div>
        <h2 className="text-xl font-bold">All Booked!</h2>
        <p className="mt-1 text-sm text-neutral-600">
          {instore
            ? "Your booking is confirmed. Pay over the counter when you drop off your parcel."
            : "Your booking is confirmed and paid."}
        </p>
        <p className="mt-2 text-sm font-medium">
          1 shipment confirmed · ${totals.total.toFixed(2)}
        </p>
      </div>

      {instore && (
        <div className="rounded-xl border-2 border-brand-orange px-3 py-2 text-sm font-medium text-brand-orange">
          Please pay ${totals.total.toFixed(2)} over the counter.
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 p-4 text-left text-sm">
        <p className="text-lg">📦</p>
        <p className="font-semibold">
          {dropSuburb} → {receiverStreet}
        </p>
        {size && (
          <p className="text-xs text-neutral-500">
            {size.label} · {size.maxWeight}
          </p>
        )}
        <p className="mt-1 font-bold text-brand-orange">
          ${totals.total.toFixed(2)}{" "}
          <span className="text-xs font-normal text-neutral-500">incl. GST</span>
        </p>
        <hr className="my-3 border-neutral-100" />
        <p className="text-xs text-neutral-500">Booking Ref</p>
        <p className="font-mono text-base font-bold">{booking.bookingRef}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 p-4">
        <BookingBarcode value={booking.bookingRef ?? "PH000000"} />
        <p className="mt-2 font-mono text-sm font-semibold">{booking.bookingRef}</p>
        <p className="mt-2 text-xs text-neutral-600">Show this at the counter.</p>
        <p className="text-xs text-neutral-500">
          They&apos;ll scan this barcode when you drop off your parcel at the store.
        </p>
      </div>

      <button
        type="button"
        onClick={onBookAnother}
        className="w-full rounded-xl bg-brand-black py-3 text-sm font-semibold text-white"
      >
        Book another parcel
      </button>
    </div>
  );
}
