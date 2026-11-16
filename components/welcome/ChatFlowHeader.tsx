"use client";

import { useEffect, useRef, type RefObject } from "react";
import { PpGoMark } from "./PpGoMark";

const STEPS = ["Route", "Parcel", "Price", "Pay"] as const;

export type ChatFlowStep = (typeof STEPS)[number];

function BackChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
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
  );
}

function SendPlaneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9 22 2z" />
    </svg>
  );
}

interface HeaderProps {
  activeStep: ChatFlowStep;
  onBack: () => void;
  accentOrange?: string;
  assistantTagline?: string;
  assistantTaglineClassName?: string;
  hideProgress?: boolean;
}

export function ChatFlowHeader({
  activeStep,
  onBack,
  accentOrange = "#E8651A",
  assistantTagline = "Your shipping assistant",
  assistantTaglineClassName = "text-[#2D7A4D]",
  hideProgress = false,
}: HeaderProps) {
  return (
    <header
      className={`shrink-0 border-b border-neutral-200/80 bg-white px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 ${
        hideProgress ? "pb-3" : "pb-0"
      }`}
    >
      <div className="flex items-center gap-2.5 pb-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECEEF2] text-[#0B1B32]"
        >
          <BackChevron />
        </button>
        <PpGoMark size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight text-[#0B1B32]">
            PPGo
          </p>
          <p className={`text-xs font-medium ${assistantTaglineClassName}`}>
            {assistantTagline}
          </p>
        </div>
      </div>
      {!hideProgress ? (
        <nav
          className="flex gap-1 border-t border-neutral-100 pb-3 pt-2.5"
          aria-label="Booking progress"
        >
          {STEPS.map((step, index) => {
            const activeIndex = STEPS.indexOf(activeStep);
            const active = step === activeStep;
            const completed = index < activeIndex;
            const highlighted = completed || active;
            return (
              <div
                key={step}
                className="flex min-w-0 flex-1 flex-col items-start gap-1.5"
              >
                <span
                  className={`block w-full rounded-full ${
                    highlighted ? "h-1" : "h-0.5 bg-[#E5E7EB]"
                  }`}
                  style={
                    highlighted ? { backgroundColor: accentOrange } : undefined
                  }
                  aria-hidden
                />
                <span
                  className={`text-[13px] leading-none ${
                    active
                      ? "font-bold text-[#0B1B32]"
                      : completed
                        ? "font-normal text-[#0B1B32]"
                        : "font-normal text-[#6B7280]"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}

export function ChatFlowFooter({
  input,
  onInputChange,
  accentOrange = "#E8651A",
  onSubmitMessage,
  inputRef,
  submitEnabled,
}: {
  input: string;
  onInputChange: (v: string) => void;
  accentOrange?: string;
  onSubmitMessage?: () => void;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  /** When set, Send works even if the composer is empty (e.g. structured form submit). */
  submitEnabled?: boolean;
}) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const fieldRef = inputRef ?? localRef;
  const hasText = input.trim().length > 0;
  const canSend = submitEnabled ?? hasText;

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 132);
    el.style.height = `${Math.max(48, next)}px`;
  }, [input, fieldRef]);

  return (
    <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
      <div className="flex items-end gap-2.5">
        <textarea
          ref={fieldRef}
          rows={1}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onInput={(e) => onInputChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && onSubmitMessage && canSend) {
              e.preventDefault();
              onSubmitMessage();
            }
          }}
          aria-label="Message"
          className={`min-h-12 min-w-0 max-h-[132px] flex-1 resize-none overflow-y-auto bg-[#ECEEF2] px-5 py-3.5 text-[15px] leading-snug text-[#0B1B32] outline-none placeholder:text-[#9CA3AF] ${
            hasText ? "rounded-2xl" : "rounded-full"
          }`}
        />
        <button
          type="button"
          aria-label="Voice input"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: accentOrange }}
        >
          <MicIcon />
        </button>
        <button
          type="button"
          aria-label="Send"
          disabled={!canSend}
          onClick={() => {
            if (canSend) onSubmitMessage?.();
          }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0B1B32] text-white transition enabled:active:scale-[0.98] disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          <SendPlaneIcon />
        </button>
      </div>
    </footer>
  );
}
