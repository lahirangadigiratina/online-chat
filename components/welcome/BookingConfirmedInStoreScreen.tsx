"use client";

const PGO_ORANGE = "#C44717";
const AMOUNT = "$24.90";

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF3C7]">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="#92400E" strokeWidth="2" />
        <path
          d="M12 7v5l3 2"
          stroke="#92400E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
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

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke="#C44717"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="10" r="2.5" fill="#C44717" />
    </svg>
  );
}

interface Props {
  onClose: () => void;
  onSendAnother: () => void;
}

export function BookingConfirmedInStoreScreen({
  onClose,
  onSendAnother,
}: Props) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F8FA]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0B1B32] shadow-sm"
      >
        <CloseIcon />
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-[max(3rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
          <ClockIcon />
          <h1 className="text-center text-[1.35rem] font-bold leading-snug text-[#0B1B32]">
            Booked! Pay when you drop it off.
          </h1>

          <div className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-[15px] leading-snug text-[#0B1B32] shadow-sm">
            Take it to any ParcelPoint by [cut-off time]. Show this code at the
            counter and pay{" "}
            <span className="font-bold">{AMOUNT}</span> by EFTPOS or cash —
            they&apos;ll print and attach the label.
          </div>

          <div className="flex w-full gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-[#F7F8FA] text-xs text-neutral-400">
              QR code
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                Booking ref
              </p>
              <p className="mt-0.5 text-[15px] font-bold text-[#0B1B32]">
                [BOOKING REF]
              </p>
              <p
                className="mt-1 text-sm font-semibold"
                style={{ color: PGO_ORANGE }}
              >
                {AMOUNT} due in store
              </p>
              <p className="text-sm text-neutral-500">
                Medium · ParcelPoint → Door
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2.5">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white"
              style={{ backgroundColor: PGO_ORANGE }}
            >
              <DownloadIcon />
              Save code
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full border border-[#0B1B32] bg-white py-3.5 text-sm font-bold text-[#0B1B32]"
            >
              <ShareIcon />
              Share
            </button>
          </div>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-left shadow-sm"
          >
            <MapPinIcon />
            <span className="text-[15px] font-bold text-[#0B1B32]">
              Find a ParcelPoint
            </span>
          </button>

          <button
            type="button"
            onClick={onSendAnother}
            className="mt-2 rounded-full border border-[#C44717] bg-white px-6 py-2.5 text-sm font-bold text-[#C44717]"
          >
            Send another
          </button>
        </div>
      </div>
    </div>
  );
}
