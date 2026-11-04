"use client";

import { useMemo } from "react";
import {
  buildBookingConfirmedDetails,
  type ChatMessage,
} from "./chatThread";
import { ChatFlowHeader } from "./ChatFlowHeader";
import { BotReply, ChatTranscript } from "./ChatTranscript";

const PGO_ORANGE = "#C44717";
const PGO_NAVY = "#0B1B32";

function BotBubble({ children }: { children: React.ReactNode }) {
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

function BarcodePlaceholder() {
  const bars = [
    3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 2, 1, 3, 1, 2, 4, 1, 2,
    3, 1, 2, 1, 3, 2, 1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 1, 3, 2, 1, 2, 3, 1, 2,
  ];
  return (
    <div className="flex h-16 w-full items-end justify-center gap-[2px] px-2">
      {bars.map((w, index) => (
        <span
          key={index}
          className="rounded-sm bg-[#0B1B32]"
          style={{ width: w, height: "100%" }}
          aria-hidden
        />
      ))}
    </div>
  );
}

function ClockIconSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#92400E" strokeWidth="2" />
      <path
        d="M12 7v5l3 2"
        stroke="#92400E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12M8 11l4 4 4-4M5 21h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4M12 4l-4 4M12 4l4 4M5 20h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Props {
  onClose: () => void;
  onSendAnother: () => void;
  priorThread?: ChatMessage[];
}

export function BookingConfirmedInStoreScreen({
  onClose,
  onSendAnother,
  priorThread = [],
}: Props) {
  const details = useMemo(
    () =>
      buildBookingConfirmedDetails(priorThread, { paymentMethod: "store" }),
    [priorThread],
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep="Pay"
        onBack={onClose}
        accentOrange={PGO_ORANGE}
        assistantTagline="Conversation ended"
        assistantTaglineClassName="text-neutral-500"
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <ChatTranscript messages={priorThread} />
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1.5 text-[13px] font-bold text-[#92400E]">
              <ClockIconSmall />
              {details.statusBadge}
            </span>
          </div>

          <BotBubble>
            {details.bookedMessage}{" "}
            <span className="font-bold">{details.total}</span> by EFTPOS or
            cash — they&apos;ll print and attach the label.
          </BotBubble>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="px-4 pt-4">
              <BarcodePlaceholder />
              <p className="mt-2 text-center font-mono text-[13px] font-bold tracking-wide text-[#0B1B32]">
                {details.barcodeCaption}
              </p>
            </div>
            <div className="mt-4 border-t border-neutral-100 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                {details.infoSectionTitle}
              </p>
              <p className="mt-1 text-[15px] font-bold text-[#C44717]">
                {details.infoPrimary}
              </p>
              <p className="mt-0.5 text-sm text-neutral-600">
                {details.infoSecondary}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white"
              style={{ backgroundColor: PGO_ORANGE }}
            >
              <DownloadIcon />
              {details.primaryActionLabel}
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full border border-[#0B1B32] bg-white py-3.5 text-sm font-bold text-[#0B1B32]"
            >
              <ShareIcon />
              Share
            </button>
          </div>

          <BotBubble>
            I&apos;ve also emailed your receipt and booking to{" "}
            {details.receiptEmail}.
          </BotBubble>
        </div>
      </div>

      <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
        <p className="mb-3 text-center text-xs text-neutral-500">
          ✓ Booking complete — this conversation has ended
        </p>
        <button
          type="button"
          onClick={onSendAnother}
          className="w-full rounded-full py-3.5 text-[15px] font-bold text-white transition active:scale-[0.99]"
          style={{ backgroundColor: PGO_NAVY }}
        >
          Send another parcel
        </button>
      </footer>
    </div>
  );
}
