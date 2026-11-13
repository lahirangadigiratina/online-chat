"use client";

import { BotBubble } from "./ChatTranscript";
import { bookingEmailFollowUp } from "./bookingEmailCopy";

export type AiBookingConfirmedDetails = {
  variant: "card" | "store";
  statusBadge: string;
  bookedMessage: string;
  barcodeCaption: string;
  infoSectionTitle: string;
  infoPrimary: string;
  infoPrimaryAccent: boolean;
  infoSecondary: string;
  receiptEmail: string;
};

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
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PGO_NAVY = "#0B1B32";

export function AiBookingConfirmedPanel({
  details,
  onSendAnother,
  footer,
}: {
  details: AiBookingConfirmedDetails;
  onSendAnother: () => void;
  footer?: boolean;
}) {
  const isStore = details.variant === "store";
  const paymentMethod = isStore ? "store" : "card";

  return (
    <>
      <div className="flex justify-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold ${
            isStore
              ? "bg-[#FEF3C7] text-[#92400E]"
              : "bg-[#E8F5EC] text-[#2D7A4D]"
          }`}
        >
          {isStore ? <ClockIconSmall /> : null}
          {details.statusBadge}
        </span>
      </div>

      <BotBubble>{details.bookedMessage}</BotBubble>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="px-4 pt-4">
          <BarcodePlaceholder />
          <p className="mt-2 text-center text-[13px] font-bold tracking-wide text-[#0B1B32]">
            {details.barcodeCaption}
          </p>
        </div>
        <div className="mt-4 border-t border-neutral-100 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
            {details.infoSectionTitle}
          </p>
          <p
            className={`mt-1 text-[15px] font-bold ${
              details.infoPrimaryAccent ? "text-[#C44717]" : "text-[#0B1B32]"
            }`}
          >
            {details.infoPrimary}
          </p>
          <p className="mt-0.5 text-sm text-neutral-600">{details.infoSecondary}</p>
        </div>
      </div>

      <BotBubble>
        {bookingEmailFollowUp(details.receiptEmail, paymentMethod)}
      </BotBubble>

      {footer ? (
        <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5 -mx-4">
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
      ) : null}
    </>
  );
}
