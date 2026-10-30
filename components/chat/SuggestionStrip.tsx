"use client";

import { useMemo } from "react";
import {
  getSuggestionsForStep,
  SUGGESTION_ACTION,
  type Suggestion,
} from "@/lib/suggestions";
import type { Booking, StepId } from "@/lib/types";
interface Props {
  step: StepId;
  booking: Booking;
  canBack: boolean;
  visible: boolean;
  busy?: boolean;
  /** Pill `value` to highlight as pending Send confirmation */
  selectedValue?: string;
  onPillPress: (suggestion: Suggestion) => void;
  onDismiss?: () => void;
  /** Short question shown above options */
  promptHint?: string;
}

export function SuggestionStrip({
  step,
  booking,
  canBack,
  visible,
  busy,
  selectedValue,
  onPillPress,
  onDismiss,
  promptHint,
}: Props) {
  const pills = useMemo(
    () => getSuggestionsForStep(step, booking, { canBack }),
    [step, booking, canBack]
  );

  const contextual = pills.filter(
    (p) =>
      !p.muted &&
      p.value !== SUGGESTION_ACTION.typeManual &&
      p.value !== SUGGESTION_ACTION.startOver &&
      p.value !== SUGGESTION_ACTION.back
  );
  const typeManual = pills.find(
    (p) => p.value === SUGGESTION_ACTION.typeManual
  );
  const trailing = pills.filter((p) => p.muted);

  if (!visible || pills.length === 0) return null;

  const numbered = contextual.length > 0;

  return (
    <div key={step} className="relative px-3 pb-2 pt-4">
      {promptHint && (
        <p
          className={`text-xs font-medium text-neutral-500 ${
            numbered ? "mb-2 pr-10" : "mb-2"
          }`}
        >
          {promptHint}
        </p>
      )}
      {numbered && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close suggestions"
          className="absolute right-3 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
        >
          <span className="text-xl leading-none" aria-hidden>
            ×
          </span>
        </button>
      )}
      {numbered ? (
        <div
          role="list"
          className="max-h-44 space-y-2 overflow-y-auto overscroll-y-contain pr-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {contextual.map((pill, index) => (
            <NumberedOption
              key={`${pill.value}-${pill.label}`}
              number={index + 1}
              pill={pill}
              index={index}
              selected={selectedValue === pill.value}
              disabled={busy}
              onPress={() => onPillPress(pill)}
            />
          ))}
          {typeManual && (
            <TypeManualRow
              pill={typeManual}
              index={contextual.length}
              disabled={busy}
              onPress={() => onPillPress(typeManual)}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {trailing.map((pill, index) => (
            <TrailingPill
              key={pill.label}
              pill={pill}
              index={index}
              disabled={busy}
              onPress={() => onPillPress(pill)}
            />
          ))}
        </div>
      )}

      {numbered && trailing.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
          {trailing.map((pill, index) => (
            <TrailingPill
              key={pill.label}
              pill={pill}
              index={index}
              disabled={busy}
              onPress={() => onPillPress(pill)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NumberedOption({
  number,
  pill,
  index,
  selected,
  disabled,
  onPress,
}: {
  number: number;
  pill: Suggestion;
  index: number;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      role="listitem"
      disabled={disabled}
      onClick={onPress}
      style={{ animationDelay: `${index * 30}ms` }}
      className={`flex w-full animate-[pillIn_150ms_ease-out_both] items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-1 disabled:opacity-50 ${
        selected
          ? "border-brand-orange bg-orange-50 text-brand-black ring-2 ring-brand-orange/30"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
        {number}
      </span>
      <span className="min-w-0 flex-1 truncate">{pill.label}</span>
    </button>
  );
}

function TypeManualRow({
  pill,
  index,
  disabled,
  onPress,
}: {
  pill: Suggestion;
  index: number;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      style={{ animationDelay: `${index * 30}ms` }}
      className="flex w-full animate-[pillIn_150ms_ease-out_both] items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-3 py-2.5 text-left text-sm font-medium text-neutral-600 transition hover:border-brand-orange hover:bg-orange-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:opacity-50"
    >
      <span>{pill.label}</span>
    </button>
  );
}

function TrailingPill({
  pill,
  index,
  disabled,
  onPress,
}: {
  pill: Suggestion;
  index: number;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      style={{ animationDelay: `${index * 30}ms` }}
      className="flex h-9 shrink-0 animate-[pillIn_150ms_ease-out_both] items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-brand-orange disabled:opacity-50"
    >
      <span className="whitespace-nowrap">{pill.label}</span>
    </button>
  );
}
