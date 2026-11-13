"use client";

import { useState } from "react";

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryRow({
  label,
  value,
  onEdit,
  disabled,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 border-b border-neutral-100 py-3 last:border-0">
      <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span className="min-w-0 flex-1 text-[14px] leading-snug text-[#0B1B32]">{value}</span>
      {onEdit ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={`Edit ${label}`}
          onClick={onEdit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-600 disabled:opacity-50"
        >
          <PencilIcon />
        </button>
      ) : null}
    </div>
  );
}

function PriceLine({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[15px] leading-snug text-neutral-600">{label}</span>
      <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">{amount}</span>
    </div>
  );
}

export type AiBookingSummaryLines = {
  fromLine: string;
  toLine: string;
  parcelLine: string;
  deliveryLine: string;
  priceLines: { label: string; amount: string }[];
  total: string;
};

export function AiBookingSummaryWidget({
  summary,
  disabled,
  priceOnly = false,
  onEditFrom,
  onEditTo,
  onEditParcel,
  onEditDelivery,
}: {
  summary: AiBookingSummaryLines;
  disabled?: boolean;
  priceOnly?: boolean;
  onEditFrom?: () => void;
  onEditTo?: () => void;
  onEditParcel?: () => void;
  onEditDelivery?: () => void;
}) {
  const [coupon, setCoupon] = useState("");

  if (priceOnly) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-[17px] font-bold text-[#0B1B32]">Price Summary</p>
        <div className="mt-3">
          {summary.priceLines.map((line) => (
            <PriceLine key={line.label} label={line.label} amount={line.amount} />
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-neutral-200 pt-4">
          <span className="text-[17px] font-bold text-[#0B1B32]">Total</span>
          <span className="text-[17px] font-bold text-[#0B1B32]">{summary.total}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white px-4 shadow-sm">
        <SummaryRow
          label="From"
          value={summary.fromLine}
          onEdit={onEditFrom}
          disabled={disabled}
        />
        <SummaryRow
          label="To"
          value={summary.toLine}
          onEdit={onEditTo}
          disabled={disabled}
        />
        <SummaryRow
          label="Parcel"
          value={summary.parcelLine}
          onEdit={onEditParcel}
          disabled={disabled}
        />
        <SummaryRow
          label="Delivery"
          value={summary.deliveryLine}
          onEdit={onEditDelivery}
          disabled={disabled}
        />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-[17px] font-bold text-[#0B1B32]">Price Summary</p>
        <div className="mt-3">
          {summary.priceLines.map((line) => (
            <PriceLine key={line.label} label={line.label} amount={line.amount} />
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-neutral-200 pt-4">
          <span className="text-[17px] font-bold text-[#0B1B32]">Total</span>
          <span className="text-[17px] font-bold text-[#0B1B32]">{summary.total}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          disabled={disabled}
          placeholder="Have a coupon code?"
          aria-label="Coupon code"
          className="min-w-0 flex-1 rounded-full border border-neutral-200 bg-white px-4 py-3 text-[15px] text-[#0B1B32] outline-none placeholder:text-neutral-400 focus:border-[#C44717] disabled:opacity-50"
        />
        <button
          type="button"
          disabled={disabled}
          className="shrink-0 rounded-full border border-neutral-200 bg-white px-5 py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99] disabled:opacity-50"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
