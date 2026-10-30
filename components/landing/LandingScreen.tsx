"use client";

import { useState } from "react";
import {
  LANDING_PLACEHOLDERS,
  LANDING_QUICK_CHIPS,
} from "@/lib/landing-placeholders";
import { LANDING_INPUT_TEXT } from "@/lib/landing-ui";
import { useChatStore } from "@/lib/store";
import { ParcelPointLogo } from "./ParcelPointLogo";
import { RotatingPlaceholder } from "./RotatingPlaceholder";

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="sm:h-[18px] sm:w-[18px]"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

export function LandingScreen() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const beginChat = useChatStore((s) => s.beginChat);

  const submit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await beginChat(trimmed);
      setText("");
    } finally {
      setBusy(false);
    }
  };

  const canSend = text.trim().length > 0 && !busy;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white px-4 pt-6 pb-5 sm:px-5 sm:pt-8 sm:pb-6">
      <ParcelPointLogo size="lg" className="shrink-0" />

      <div className="mt-6 shrink-0 sm:mt-8">
        <div className="relative rounded-2xl border border-neutral-200/90 bg-white p-2.5 shadow-[0_6px_24px_rgba(0,0,0,0.05)] sm:p-3 sm:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="relative flex min-h-[52px] items-center gap-2 sm:min-h-[56px]">
            <div className="relative flex min-h-[40px] flex-1 items-center py-1.5 pl-2.5 pr-0.5 sm:min-h-[44px] sm:py-2 sm:pl-3">
              {!text && (
                <RotatingPlaceholder
                  phrases={LANDING_PLACEHOLDERS}
                  className="absolute inset-y-0 left-2.5 right-0.5 flex items-center sm:left-3 sm:right-1"
                />
              )}
              <textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submit(text);
                  }
                }}
                className={`relative z-[1] min-h-[20px] w-full max-h-28 resize-none bg-transparent outline-none placeholder:text-transparent sm:min-h-[22px] sm:max-h-32 ${LANDING_INPUT_TEXT} text-brand-black`}
                aria-label="Message ParcelPoint Go"
              />
            </div>
            <button
              type="button"
              disabled={!canSend}
              onClick={() => void submit(text)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white transition enabled:hover:bg-[#d45a16] disabled:bg-neutral-200 disabled:text-neutral-400 sm:h-10 sm:w-10"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
          {LANDING_QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              disabled={busy}
              onClick={() => void submit(chip.message)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-brand-orange hover:text-brand-orange disabled:opacity-50 sm:px-3.5 sm:py-2 sm:text-sm"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" aria-hidden />
    </div>
  );
}
