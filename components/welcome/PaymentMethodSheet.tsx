"use client";

import { useState } from "react";

const PGO_ORANGE = "#C44717";

type PayMethod = "card" | "store";

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10h16l-1.5-5H5.5L4 10zM6 10v8h12v-8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M10 18v-4h4v4" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function RadioMark({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#C44717]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#C44717]" />
      </span>
    );
  }
  return (
    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-neutral-300" />
  );
}

interface Props {
  open: boolean;
  total: string;
  onClose: () => void;
  onConfirm?: (method: PayMethod) => void;
}

export function PaymentMethodSheet({
  open,
  total,
  onClose,
  onConfirm,
}: Props) {
  const [method, setMethod] = useState<PayMethod>("card");

  if (!open) return null;

  const payLabel =
    method === "card"
      ? `Pay ${total} by card`
      : "Confirm — pay in store";

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-[#3D4F63]/75"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="payment-method-title"
        className="max-h-[85%] overflow-y-auto rounded-t-[1.75rem] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-neutral-300"
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-500">Total to pay</p>
            <p className="text-[2rem] font-bold leading-tight text-[#0B1B32]">
              {total}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECEEF2] text-[#0B1B32]"
          >
            <CloseIcon />
          </button>
        </div>

        <h2
          id="payment-method-title"
          className="mt-5 text-[17px] font-bold text-[#0B1B32]"
        >
          How would you like to pay?
        </h2>

        <div className="mt-3 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setMethod("card")}
            className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
              method === "card"
                ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                : "border border-neutral-200 bg-white"
            }`}
          >
            <span
              className={
                method === "card" ? "text-[#C44717]" : "text-neutral-400"
              }
            >
              <CardIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-[#0B1B32]">
                Pay online by card
              </span>
              <span className="mt-0.5 block text-sm text-neutral-500">
                Visa or Mastercard · label ready straight away
              </span>
            </span>
            <RadioMark selected={method === "card"} />
          </button>

          <button
            type="button"
            onClick={() => setMethod("store")}
            className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
              method === "store"
                ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                : "border border-neutral-200 bg-white"
            }`}
          >
            <span
              className={
                method === "store" ? "text-[#C44717]" : "text-neutral-400"
              }
            >
              <StoreIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-[#0B1B32]">
                Pay in store
              </span>
              <span className="mt-0.5 block text-sm text-neutral-500">
                EFTPOS or cash at the PARCELPOINT when you drop it off
              </span>
            </span>
            <RadioMark selected={method === "store"} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onConfirm?.(method)}
          className="mt-5 w-full rounded-full py-3.5 text-base font-bold text-white transition active:scale-[0.99]"
          style={{ backgroundColor: PGO_ORANGE }}
        >
          {payLabel}
        </button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-500">
          <LockIcon />
          Card details go to our secure payment provider, never to PGo
        </p>
      </div>
    </div>
  );
}
