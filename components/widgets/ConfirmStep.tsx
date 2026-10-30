"use client";

import { useState } from "react";
import { PARCEL_SIZE_INFO } from "@/lib/flow";
import { computeTotals } from "@/lib/pricing";
import type { Agreements, Booking, StepId } from "@/lib/types";
interface Props {
  booking: Booking;
  onEdit: (step: StepId) => void;
  onBack: () => void;
  onConfirm: (payload: {
    agreements: Agreements;
    coupon?: Booking["coupon"];
  }) => void;
}

export function ConfirmStep({ booking, onEdit, onBack, onConfirm }: Props) {
  const [terms, setTerms] = useState(booking.agreements?.terms ?? false);
  const [noDangerous, setNoDangerous] = useState(
    booking.agreements?.noDangerousGoods ?? false
  );
  const [marketing, setMarketing] = useState(
    booking.agreements?.marketing ?? false
  );
  const [couponInput, setCouponInput] = useState(booking.coupon?.code ?? "");
  const [coupon, setCoupon] = useState(booking.coupon);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponErr, setCouponErr] = useState<string | null>(null);

  const totals = computeTotals({ ...booking, coupon });

  const rows: { label: string; step: StepId; text: string }[] = [
    {
      label: "Drop-off",
      step: "DROP_OFF_POINT",
      text: booking.dropOffPoint
        ? `${booking.dropOffPoint.name}\n${booking.dropOffPoint.address}`
        : "—",
    },
    {
      label: "Parcel size",
      step: "PARCEL_SIZE",
      text: booking.parcelSize
        ? `${PARCEL_SIZE_INFO[booking.parcelSize].label} · ${PARCEL_SIZE_INFO[booking.parcelSize].maxWeight}`
        : "—",
    },
    {
      label: "Packaging",
      step: "PACKAGING",
      text:
        booking.packaging === true
          ? "Yes (+$2.00)"
          : booking.packaging === false
            ? "No"
            : "—",
    },
    {
      label: "Receiver address",
      step: "RECEIVER_ADDRESS",
      text: booking.receiverAddress ?? "—",
    },
    {
      label: "Delivery",
      step: "DELIVERY_METHOD",
      text: `${booking.deliveryMethod === "door" ? "Deliver to Door" : "Collect"} · Est. ${booking.estimatedDelivery ?? "—"}`,
    },
    {
      label: "Sender",
      step: "SENDER_MOBILE",
      text: booking.sender
        ? `${booking.sender.firstName} ${booking.sender.lastName} · ${booking.sender.email}`
        : "—",
    },
    {
      label: "Receiver",
      step: "RECEIVER_NAME",
      text: booking.receiver
        ? `${booking.receiver.firstName} ${booking.receiver.lastName} · ${booking.receiver.email}`
        : "—",
    },
    {
      label: "Contents",
      step: "CONTENTS",
      text: booking.contents
        ? `${booking.contents.category} · $${booking.contents.value}`
        : "—",
    },
  ];

  const applyCoupon = async () => {
    setCouponErr(null);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponErr(data.error ?? "Invalid coupon");
        return;
      }
      setCoupon({ code: data.code, discount: data.discount });
      setCouponMsg(`Coupon applied — $${data.discount.toFixed(2)} off`);
    } catch {
      setCouponErr("Could not apply coupon.");
    }
  };

  const canPay = terms && noDangerous;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100">
        {rows.map((r) => (
          <div key={r.label} className="flex gap-2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase text-neutral-500">
                {r.label}
              </p>
              <p className="whitespace-pre-line text-xs text-brand-black">{r.text}</p>
            </div>
            <button
              type="button"
              onClick={() => onEdit(r.step)}
              className="shrink-0 text-xs font-medium text-brand-orange"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-neutral-200 p-3 text-xs">
        <Check
          checked={terms}
          onChange={setTerms}
          label={
            <>
              I agree to the{" "}
              <a href="#" className="text-brand-orange underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="text-brand-orange underline">
                Privacy Policy
              </a>
              .
            </>
          }
        />
        <Check
          checked={noDangerous}
          onChange={setNoDangerous}
          label="No dangerous goods. I confirm this parcel does not contain prohibited or dangerous goods."
        />
        <Check
          checked={marketing}
          onChange={setMarketing}
          label="I would like to receive marketing and promotional communications from PARCELPOINT."
          optional
        />
      </div>

      <div className="rounded-xl border border-neutral-200 p-3 text-sm">
        <p className="mb-2 font-semibold">Price Summary</p>
        {totals.delivery > 0 && (
          <Line label="Delivery" amount={totals.delivery} />
        )}
        {totals.packaging > 0 && (
          <Line label="Packaging Fee" amount={totals.packaging} />
        )}
        {totals.signature > 0 && (
          <Line label="Signature on Delivery" amount={totals.signature} />
        )}
        {totals.protection > 0 && (
          <Line label="Parcel Protection" amount={totals.protection} />
        )}
        {totals.discount > 0 && (
          <Line label="Coupon" amount={-totals.discount} />
        )}
        <Line label="GST (10%)" amount={totals.gst} />
        <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 font-bold">
          <span>Total</span>
          <span className="text-brand-orange">${totals.total.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Coupon code"
            className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-2 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={() => void applyCoupon()}
            className="rounded-lg border border-brand-orange px-3 py-1.5 text-xs font-medium text-brand-orange"
          >
            Apply
          </button>
        </div>
        {couponMsg && <p className="mt-1 text-xs text-emerald-600">{couponMsg}</p>}
        {couponErr && <p className="mt-1 text-xs text-red-600">{couponErr}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-medium"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canPay}
          onClick={() =>
            onConfirm({
              agreements: { terms, noDangerousGoods: noDangerous, marketing },
              coupon,
            })
          }
          className="flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:bg-neutral-200 disabled:text-neutral-400 enabled:bg-brand-orange"
        >
          Make Payment
        </button>
      </div>
    </div>
  );
}

function Line({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-xs text-neutral-600">
      <span>{label}</span>
      <span>${amount.toFixed(2)}</span>
    </div>
  );
}

function Check({
  checked,
  onChange,
  label,
  optional,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="flex gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5"
      />
      <span>
        {label}
        {optional && (
          <span className="text-neutral-400"> (optional)</span>
        )}
      </span>
    </label>
  );
}
