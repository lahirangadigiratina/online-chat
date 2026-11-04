"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  buildBookingSummaryFromThread,
  type ChatMessage,
} from "./chatThread";
import { ChatFlowHeader } from "./ChatFlowHeader";
import { BotReply, ChatScrollArea, ChatTranscript } from "./ChatTranscript";

const PGO_ORANGE = "#C44717";
const PGO_NAVY = "#0B1B32";

function BotBubble({ children }: { children: ReactNode }) {
  return (
    <BotReply>
      <div className="flex justify-start">
        <div className="max-w-[92%] rounded-[1.25rem] rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-snug text-[#0B1B32] shadow-sm">
          {children}
        </div>
      </div>
    </BotReply>
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

export type BookingSummarySection = "from" | "to" | "parcel" | "delivery";

function SummaryRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
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
        onClick={onEdit}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-600"
      >
        <PencilIcon />
      </button>
    </div>
  );
}

function PriceLine({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[15px] leading-snug text-neutral-600">{label}</span>
      <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
        {amount}
      </span>
    </div>
  );
}

interface Props {
  onBack: () => void;
  onContinueToPayment?: () => void;
  priorThread?: ChatMessage[];
  onEditSection?: (section: BookingSummarySection) => void;
}

export function ChatBookingReviewScreen({
  onBack,
  onContinueToPayment,
  priorThread = [],
  onEditSection,
}: Props) {
  const [coupon, setCoupon] = useState("");
  const summary = useMemo(
    () => buildBookingSummaryFromThread(priorThread),
    [priorThread],
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep="Price"
        onBack={onBack}
        accentOrange={PGO_ORANGE}
      />

      <ChatScrollArea>
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <ChatTranscript messages={priorThread} />
          <BotBubble>
            Here&apos;s everything. Tap any line — or just tell me — to change
            it.
          </BotBubble>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white px-4 shadow-sm">
            <SummaryRow
              label="From"
              value={summary.fromLine}
              onEdit={() => onEditSection?.("from")}
            />
            <SummaryRow
              label="To"
              value={summary.toLine}
              onEdit={() => onEditSection?.("to")}
            />
            <SummaryRow
              label="Parcel"
              value={summary.parcelLine}
              onEdit={() => onEditSection?.("parcel")}
            />
            <SummaryRow
              label="Delivery"
              value={summary.deliveryLine}
              onEdit={() => onEditSection?.("delivery")}
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
              <span className="text-[17px] font-bold text-[#0B1B32]">
                {summary.total}
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
              className="shrink-0 rounded-full border border-neutral-200 bg-white px-5 py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99]"
            >
              Apply
            </button>
          </div>
        </div>
      </ChatScrollArea>

      <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onContinueToPayment?.()}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold text-white transition active:scale-[0.99]"
            style={{ backgroundColor: PGO_ORANGE }}
          >
            <LockIcon />
            Continue to payment · {summary.total}
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
    </div>
  );
}
