"use client";

import { useState, type ReactNode } from "react";
import { ChatFlowHeader } from "./ChatFlowHeader";
import { PaymentMethodSheet } from "./PaymentMethodSheet";

const PGO_ORANGE = "#C44717";
const PGO_NAVY = "#0B1B32";
const TOTAL = "$24.90";

function BotBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-[1.25rem] rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-snug text-[#0B1B32] shadow-sm">
        {children}
      </div>
    </div>
  );
}

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

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 118 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 border-b border-neutral-100 py-3 last:border-0">
      <span className="w-16 shrink-0 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span className="min-w-0 flex-1 text-[14px] leading-snug text-[#0B1B32]">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Edit ${label}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-600"
      >
        <PencilIcon />
      </button>
    </div>
  );
}

function PriceLine({
  label,
  amount,
  muted,
}: {
  label: string;
  amount: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span
        className={`text-[14px] leading-snug ${
          muted ? "text-neutral-500" : "text-[#0B1B32]"
        }`}
      >
        {label}
      </span>
      <span
        className={`shrink-0 text-[14px] ${
          muted ? "text-neutral-500" : "text-[#0B1B32]"
        }`}
      >
        {amount}
      </span>
    </div>
  );
}

interface Props {
  onBack: () => void;
  onBooked?: () => void;
  onBookedInStore?: () => void;
}

export function ChatBookingReviewScreen({
  onBack,
  onBooked,
  onBookedInStore,
}: Props) {
  const [coupon, setCoupon] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep="Price"
        onBack={onBack}
        accentOrange={PGO_ORANGE}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <BotBubble>
            Here&apos;s everything. Tap any line — or just tell me — to change
            it.
          </BotBubble>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white px-4 shadow-sm">
            <SummaryRow
              label="From"
              value="Sam Perera · 0423 556 789"
            />
            <SummaryRow
              label="To"
              value="Margaret Fernando · door, Paddington QLD"
            />
            <SummaryRow
              label="Parcel"
              value="Medium · running shoes · $180"
            />
            <SummaryRow
              label="Delivery"
              value="ParcelPoint → Door · arrives 2–4 business days"
            />
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <PriceLine
              label="ParcelPoint → Door delivery"
              amount="$14.95"
            />
            <PriceLine label="Packaging (Medium box)" amount="$2.00" />
            <PriceLine label="Parcel Protection ($180)" amount="$4.95" />
            <PriceLine label="Signature on delivery" amount="$3.00" />
            <PriceLine
              label="Text updates to Margaret"
              amount="Free"
              muted
            />
            <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-3">
              <span className="text-[15px] font-bold text-[#0B1B32]">
                Total incl. GST
              </span>
              <span className="text-[15px] font-bold text-[#0B1B32]">
                {TOTAL}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Have a coupon code?"
              aria-label="Coupon code"
              className="min-w-0 flex-1 rounded-full border border-neutral-200 bg-white px-4 py-3 text-[15px] text-[#0B1B32] outline-none placeholder:text-neutral-400 focus:border-[#C44717]"
            />
            <button
              type="button"
              className="shrink-0 px-2 text-[15px] font-bold text-[#C44717]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPaymentOpen(true)}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold text-white transition active:scale-[0.99]"
            style={{ backgroundColor: PGO_ORANGE }}
          >
            <LockIcon />
            Continue to payment · {TOTAL}
          </button>
          <button
            type="button"
            aria-label="Voice input"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: PGO_NAVY }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
              <path d="M19 11a7 7 0 0 1-14 0M12 18v3" />
            </svg>
          </button>
        </div>
      </footer>

      <PaymentMethodSheet
        open={paymentOpen}
        total={TOTAL}
        onClose={() => setPaymentOpen(false)}
        onConfirm={(method) => {
          setPaymentOpen(false);
          if (method === "card") onBooked?.();
          else onBookedInStore?.();
        }}
      />
    </div>
  );
}
