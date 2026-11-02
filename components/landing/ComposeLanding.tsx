"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { MicButton } from "@/components/chat/MicButton";
import { SendArrowIcon } from "@/components/chat/SendArrowIcon";
import {
  COMPOSE_INPUT_PLACEHOLDER,
  COMPOSE_OPTIONS,
  type ComposeOption,
} from "@/lib/compose-actions";
import { APP_ORANGE_GRADIENT_BG, LANDING_INPUT_TEXT } from "@/lib/landing-ui";
import { ComposeBrandMark } from "./ComposeBrandMark";

interface Props {
  busy: boolean;
  text: string;
  onTextChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onSelectOption: (option: ComposeOption) => void;
}

export function ComposeLanding({
  busy,
  text,
  onTextChange,
  onSubmit,
  onSelectOption,
}: Props) {
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  useLayoutEffect(() => {
    syncTextareaHeight();
  }, [text, syncTextareaHeight]);

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    onSubmit(trimmed);
  };

  const canSend = text.trim().length > 0 && !busy;

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-y-auto px-4 py-5 sm:px-5 sm:py-6 ${APP_ORANGE_GRADIENT_BG}`}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 sm:gap-5">
        <div className="w-full text-center">
          <div className="mb-4 flex justify-center px-1 sm:mb-5">
            <ComposeBrandMark />
          </div>
          <h1 className="text-[1.65rem] font-bold leading-tight tracking-tight text-brand-black sm:text-[1.85rem]">
            How can we help you today?
          </h1>
          <p className="mt-1.5 text-sm text-neutral-500 sm:mt-2 sm:text-[15px]">
            Send your parcel easily in just a few taps.
          </p>
        </div>

        <div className="flex w-full min-w-0 items-center gap-0.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 shadow-sm sm:gap-1 sm:px-4 sm:py-2">
          <div className="relative min-w-0 flex-1 overflow-hidden">
            {!text && (
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center truncate text-sm text-neutral-400">
                {COMPOSE_INPUT_PLACEHOLDER}
              </span>
            )}
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => {
                onTextChange(e.target.value);
                syncTextareaHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(text);
                }
              }}
              className={`relative z-[1] block w-full max-h-32 min-h-0 resize-none overflow-y-auto overflow-x-hidden bg-transparent p-0 outline-none placeholder:text-transparent ${LANDING_INPUT_TEXT} text-brand-black`}
              aria-label="Ask ParcelPoint Go"
            />
          </div>
          <MicButton
            embedded
            active={listening}
            disabled={busy}
            onClick={() => setListening((v) => !v)}
          />
          <button
            type="button"
            disabled={busy || !canSend}
            onClick={() => submit(text)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white transition enabled:hover:bg-[#d45a16] disabled:bg-neutral-200 disabled:text-neutral-400 sm:h-10 sm:w-10"
            aria-label="Send message"
          >
            <SendArrowIcon />
          </button>
        </div>

        <ul className="w-full space-y-2 sm:space-y-2.5" aria-label="Quick options">
          {COMPOSE_OPTIONS.map((option) => (
            <li key={option.label}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onSelectOption(option)}
                className="w-full rounded-xl border border-white/90 bg-white/95 px-4 py-3 text-center text-sm font-medium text-brand-black shadow-sm transition hover:border-brand-orange/40 hover:bg-white active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5 sm:text-[15px]"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
