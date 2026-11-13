"use client";

import { useState, type ReactNode } from "react";
import {
  AI_SIZE_OPTIONS,
  type AiSizeId,
} from "@/lib/ai-booking-recommendations";

const INTAKE_FIELD_SHELL_IDLE =
  "rounded-xl border-2 border-neutral-200 bg-white transition-[border-color] duration-150";
const INTAKE_FIELD_SHELL_FOCUS =
  "focus-within:border-[#C44717]";
const INTAKE_FIELD_SHELL_LOCKED = "rounded-xl border-2 border-neutral-200 bg-white";
const INTAKE_FIELD_INPUT =
  "min-w-0 flex-1 bg-transparent text-[15px] font-bold text-[#0B1B32] outline-none";

function IntakeFieldFrame({
  locked,
  className = "",
  children,
}: {
  locked?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={
        locked
          ? `${INTAKE_FIELD_SHELL_LOCKED} ${className}`
          : `${INTAKE_FIELD_SHELL_IDLE} ${INTAKE_FIELD_SHELL_FOCUS} ${className}`
      }
    >
      {children}
    </div>
  );
}

function LocationPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function sizeLimitLabel(limit: string) {
  const weight = limit.replace(/^≤\s*/i, "").trim();
  return `Up to ${weight}`;
}

const SIZE_GUIDE_BLURB: Record<AiSizeId, string> = {
  satchel: "Documents, accessories, small gifts",
  shoebox: "Shoes, books, toys, folded clothing",
  briefcase: "Multiple items or larger clothing",
  carryon: "Bulky, heavy, or oversized parcels",
};

/** Rough starting point from declared value — user can override. */
function suggestSizeFromValue(value: number): AiSizeId {
  if (value <= 100) return "satchel";
  if (value <= 250) return "shoebox";
  if (value <= 500) return "briefcase";
  return "carryon";
}

function IntakeFormSection({
  step,
  title,
  action,
  className = "",
  children,
}: {
  step: string;
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-bold tracking-wide text-[#0B1B32]">
          {step} · {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AiIntakeFormWidget({
  locked,
  sizeId,
  valueText,
  suburb,
  lockedSizeId,
  lockedValue,
  lockedSuburb,
  onSizeIdChange,
  onValueTextChange,
  onSuburbChange,
}: {
  locked?: boolean;
  sizeId: AiSizeId | null;
  valueText: string;
  suburb: string;
  lockedSizeId?: AiSizeId | null;
  lockedValue?: number;
  lockedSuburb?: string;
  onSizeIdChange: (id: AiSizeId) => void;
  onValueTextChange: (value: string) => void;
  onSuburbChange: (suburb: string) => void;
}) {
  const [sizeHelpOpen, setSizeHelpOpen] = useState(false);

  const displaySizeId = locked ? lockedSizeId : sizeId;
  const displayValue =
    locked && lockedValue != null ? String(lockedValue) : valueText;
  const displaySuburb = locked ? lockedSuburb ?? suburb : suburb;

  const parsedValue = Number(
    (locked && lockedValue != null ? String(lockedValue) : valueText).replace(
      /[^\d.]/g,
      "",
    ),
  );

  const handleHelpChoose = () => {
    setSizeHelpOpen((open) => {
      const next = !open;
      if (next && parsedValue > 0 && sizeId == null) {
        onSizeIdChange(suggestSizeFromValue(parsedValue));
      }
      return next;
    });
  };

  const selectSize = (id: AiSizeId) => {
    onSizeIdChange(id);
    setSizeHelpOpen(false);
  };

  return (
    <div
      data-chat-form
      className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <IntakeFormSection
        step="1"
        title="SIZE"
        action={
          locked ? null : (
            <button
              type="button"
              onClick={handleHelpChoose}
              className="text-[13px] font-bold text-[#C44717]"
              aria-expanded={sizeHelpOpen}
            >
              {sizeHelpOpen ? "Hide guide" : "Help me choose"}
            </button>
          )
        }
      >
        {sizeHelpOpen && !locked ? (
          <div className="mb-3 space-y-2 rounded-xl border border-neutral-200 bg-[#F7F8FA] p-3">
            <p className="text-[13px] leading-snug text-neutral-600">
              {parsedValue > 0
                ? `For about $${parsedValue.toLocaleString()}, we'd start with ${
                    AI_SIZE_OPTIONS.find((s) => s.id === suggestSizeFromValue(parsedValue))
                      ?.label ?? "a size"
                  } — pick the smallest that fits your parcel.`
                : "Pick the smallest size that fits what you're sending. Tap a row to select it."}
            </p>
            <ul className="space-y-1.5">
              {AI_SIZE_OPTIONS.map((size) => {
                const suggested =
                  parsedValue > 0 && suggestSizeFromValue(parsedValue) === size.id;
                return (
                  <li key={size.id}>
                    <button
                      type="button"
                      onClick={() => selectSize(size.id)}
                      className={`flex w-full items-start gap-2 rounded-lg border-2 bg-white px-3 py-2.5 text-left transition active:scale-[0.99] ${
                        displaySizeId === size.id
                          ? "border-[#C44717] bg-[#FFF8F4]"
                          : "border-transparent"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[14px] font-bold text-[#0B1B32]">
                            {size.label}
                          </span>
                          <span className="text-[11px] font-semibold text-neutral-500">
                            {size.dims} · {sizeLimitLabel(size.limit)}
                          </span>
                          {suggested ? (
                            <span className="rounded-full bg-[#FFF0E8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C44717]">
                              Suggested
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-neutral-600">
                          {SIZE_GUIDE_BLURB[size.id]}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        <div className="grid grid-cols-4 gap-2">
          {AI_SIZE_OPTIONS.map((size) => {
            const selected =
              displaySizeId != null && displaySizeId === size.id;
            return (
              <button
                key={size.id}
                type="button"
                disabled={locked}
                onClick={() => selectSize(size.id)}
                className={`rounded-xl border-2 px-1.5 py-2.5 text-center transition active:scale-[0.99] disabled:cursor-default ${
                  selected
                    ? "border-[#C44717] bg-[#FFF8F4] shadow-sm"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <span className="block text-[13px] font-bold leading-tight text-[#0B1B32]">
                  {size.label}
                </span>
                <span className="mt-1 block text-[10px] font-medium leading-none text-neutral-500">
                  {sizeLimitLabel(size.limit)}
                </span>
              </button>
            );
          })}
        </div>
      </IntakeFormSection>

      <IntakeFormSection step="2" title="VALUE" className="mt-5">
        <IntakeFieldFrame locked={locked} className="flex items-center gap-1 px-3.5 py-3">
          <span className="text-[15px] font-medium text-neutral-400">$</span>
          {locked ? (
            <span className={INTAKE_FIELD_INPUT}>{displayValue}</span>
          ) : (
            <input
              type="text"
              inputMode="decimal"
              value={valueText}
              onChange={(e) =>
                onValueTextChange(e.target.value.replace(/[^\d.]/g, ""))
              }
              className={INTAKE_FIELD_INPUT}
              aria-label="Declared value"
            />
          )}
        </IntakeFieldFrame>
      </IntakeFormSection>

      <IntakeFormSection step="3" title="DELIVERING TO" className="mt-5">
        <IntakeFieldFrame locked={locked} className="flex items-center gap-2 px-3.5 py-3">
          <span className="shrink-0 text-neutral-400">
            <LocationPinIcon />
          </span>
          {locked ? (
            <span className={INTAKE_FIELD_INPUT}>{displaySuburb}</span>
          ) : (
            <input
              type="text"
              value={suburb}
              onChange={(e) => onSuburbChange(e.target.value)}
              className={INTAKE_FIELD_INPUT}
              aria-label="Delivery suburb or address"
            />
          )}
        </IntakeFieldFrame>
      </IntakeFormSection>
    </div>
  );
}
