"use client";

import { useState } from "react";
import {
  OnlinePaymentSubOptions,
  type OnlinePaySubMethod,
} from "./OnlinePaymentMethods";

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

function OnlineIcon() {
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

export function AiPaymentMethodChatWidget({
  total,
  selected,
  disabled,
  onSelectOnline,
  onSelectInStore,
}: {
  total: string;
  selected: "online" | "instore" | null;
  disabled?: boolean;
  onSelectOnline: () => void;
  onSelectInStore: () => void;
}) {
  const [onlineSub, setOnlineSub] = useState<OnlinePaySubMethod>("card");

  const pickOnline = () => {
    onSelectOnline();
    setOnlineSub("card");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5">
        <div
          className={`w-full rounded-2xl border bg-white transition ${
            selected === "online"
              ? "border-2 border-[#C44717] bg-[#FFF8F4]"
              : "border-neutral-200"
          }`}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={pickOnline}
            className="flex w-full items-center gap-3 p-4 text-left disabled:opacity-50"
          >
            <span
              className={
                selected === "online" ? "text-[#C44717]" : "text-neutral-400"
              }
            >
              <OnlineIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-[#0B1B32]">
                Pay online
              </span>
              <span className="mt-0.5 block text-sm text-neutral-500">
                Card, Google Pay or Apple Pay
              </span>
            </span>
            <RadioMark selected={selected === "online"} />
          </button>
          {selected === "online" ? (
            <div className="px-4 pb-4">
              <OnlinePaymentSubOptions
                selected={onlineSub}
                disabled={disabled}
                onSelectCard={() => setOnlineSub("card")}
                compact
              />
            </div>
          ) : null}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onSelectInStore}
          className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left transition disabled:opacity-50 ${
            selected === "instore"
              ? "border-2 border-[#C44717] bg-[#FFF8F4]"
              : "border-neutral-200"
          }`}
        >
          <span
            className={
              selected === "instore" ? "text-[#C44717]" : "text-neutral-400"
            }
          >
            <StoreIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-[#0B1B32]">
              Pay in store
            </span>
            <span className="mt-0.5 block text-sm text-neutral-500">
              EFTPOS or cash at the counter when you hand over your parcel
            </span>
          </span>
          <RadioMark selected={selected === "instore"} />
        </button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-neutral-500">
        <LockIcon />
        Card details go to our secure payment provider, never to PGo
      </p>
      <p className="text-center text-[13px] text-neutral-500">
        Choose how you&apos;d like to pay · {total}
      </p>
    </div>
  );
}
