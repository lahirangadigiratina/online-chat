"use client";

import type { ReactNode } from "react";
import type {
  ReceiverContactDraft,
  SenderContactDraft,
} from "@/lib/ai-booking-parse";
import {
  buildAuMobileFromLocal,
  formatAuMobileLocalDisplay,
} from "@/lib/ai-booking-parse";

const FIELD_SHELL_IDLE =
  "rounded-xl border-2 border-neutral-200 bg-white transition-[border-color] duration-150";
const FIELD_SHELL_FOCUS = "focus-within:border-[#C44717]";
const FIELD_SHELL_LOCKED = "rounded-xl border-2 border-neutral-200 bg-white";
const FIELD_INPUT =
  "min-w-0 flex-1 bg-transparent text-[15px] font-bold text-[#0B1B32] outline-none placeholder:font-medium placeholder:text-neutral-400";

function FieldFrame({
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
          ? `${FIELD_SHELL_LOCKED} ${className}`
          : `${FIELD_SHELL_IDLE} ${FIELD_SHELL_FOCUS} ${className}`
      }
    >
      {children}
    </div>
  );
}

function FormSection({
  step,
  title,
  className = "",
  children,
}: {
  step: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <div className="mb-2.5">
        <h3 className="text-[12px] font-bold tracking-wide text-[#0B1B32]">
          {step} · {title}
        </h3>
      </div>
      {children}
    </section>
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

function LockedValue({ value }: { value: string }) {
  return (
    <span className={`${FIELD_INPUT} block min-h-[1.35rem]`}>
      {value || "—"}
    </span>
  );
}

const AU_MOBILE_PREFIX = "+61 4";

function applyInputValue(
  e: React.FormEvent<HTMLInputElement>,
  apply: (value: string) => void,
) {
  apply(e.currentTarget.value);
}

function AuMobileField({
  locked,
  value,
  onChange,
  autoComplete = "tel-national",
  name,
}: {
  locked?: boolean;
  value: string;
  onChange: (mobile: string) => void;
  autoComplete?: string;
  name?: string;
}) {
  const localDisplay = formatAuMobileLocalDisplay(value);
  const syncMobile = (raw: string) => onChange(buildAuMobileFromLocal(raw));

  return (
    <FieldFrame
      locked={locked}
      className="flex items-center gap-1.5 px-3.5 py-3"
    >
      <span
        className="shrink-0 text-[15px] font-medium text-neutral-400"
        aria-hidden
      >
        {AU_MOBILE_PREFIX}
      </span>
      {locked ? (
        <LockedValue value={localDisplay} />
      ) : (
        <input
          type="tel"
          inputMode="numeric"
          name={name}
          value={localDisplay}
          onChange={(e) => syncMobile(e.target.value)}
          onInput={(e) => applyInputValue(e, syncMobile)}
          className={`${FIELD_INPUT} w-full`}
          placeholder="XX XXX XXX"
          autoComplete={autoComplete}
          aria-label="Australian mobile number"
        />
      )}
    </FieldFrame>
  );
}

export function AiSenderContactFormWidget({
  locked,
  draft,
  onChange,
  embedded,
}: {
  locked?: boolean;
  draft: SenderContactDraft;
  onChange: (patch: Partial<SenderContactDraft>) => void;
  embedded?: boolean;
}) {
  return (
    <form
      data-chat-form
      autoComplete="on"
      onSubmit={(e) => e.preventDefault()}
      className={
        embedded
          ? "pt-1"
          : "rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
      }
    >
      <FormSection step="1" title="FIRST NAME">
        <FieldFrame locked={locked} className="px-3.5 py-3">
          {locked ? (
            <LockedValue value={draft.firstName} />
          ) : (
            <input
              type="text"
              name="sender-first-name"
              value={draft.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ firstName: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="First name"
              autoComplete="billing given-name"
              aria-label="First name"
            />
          )}
        </FieldFrame>
      </FormSection>

      <FormSection step="2" title="LAST NAME" className="mt-5">
        <FieldFrame locked={locked} className="px-3.5 py-3">
          {locked ? (
            <LockedValue value={draft.lastName} />
          ) : (
            <input
              type="text"
              name="sender-last-name"
              value={draft.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ lastName: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="Last name"
              autoComplete="billing family-name"
              aria-label="Last name"
            />
          )}
        </FieldFrame>
      </FormSection>

      <FormSection step="3" title="EMAIL" className="mt-5">
        <FieldFrame locked={locked} className="px-3.5 py-3">
          {locked ? (
            <LockedValue value={draft.email} />
          ) : (
            <input
              type="email"
              name="sender-email"
              value={draft.email}
              onChange={(e) => onChange({ email: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ email: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="you@example.com"
              autoComplete="billing email"
              aria-label="Email"
            />
          )}
        </FieldFrame>
      </FormSection>

      <FormSection step="4" title="MOBILE" className="mt-5">
        <AuMobileField
          locked={locked}
          value={draft.mobile}
          name="sender-mobile"
          autoComplete="billing tel-national"
          onChange={(mobile) => onChange({ mobile })}
        />
      </FormSection>

      {draft.businessName.trim() || !locked ? (
        <FormSection step="5" title="BUSINESS" className="mt-5">
          <FieldFrame locked={locked} className="px-3.5 py-3">
            {locked ? (
              <LockedValue value={draft.businessName || "—"} />
            ) : (
              <input
                type="text"
                name="sender-organization"
                value={draft.businessName}
                onChange={(e) => onChange({ businessName: e.target.value })}
                onInput={(e) =>
                  applyInputValue(e, (v) => onChange({ businessName: v }))
                }
                className={`${FIELD_INPUT} w-full`}
                placeholder="Optional"
                autoComplete="billing organization"
                aria-label="Business name (optional)"
              />
            )}
          </FieldFrame>
        </FormSection>
      ) : null}
    </form>
  );
}

export function AiReceiverContactFormWidget({
  locked,
  draft,
  onChange,
}: {
  locked?: boolean;
  draft: ReceiverContactDraft;
  onChange: (patch: Partial<ReceiverContactDraft>) => void;
}) {
  return (
    <form
      data-chat-form
      autoComplete="on"
      onSubmit={(e) => e.preventDefault()}
      className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <FormSection step="1" title="FIRST NAME">
        <FieldFrame locked={locked} className="px-3.5 py-3">
          {locked ? (
            <LockedValue value={draft.firstName} />
          ) : (
            <input
              type="text"
              name="receiver-first-name"
              value={draft.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ firstName: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="First name"
              autoComplete="shipping given-name"
              aria-label="First name"
            />
          )}
        </FieldFrame>
      </FormSection>

      <FormSection step="2" title="LAST NAME" className="mt-5">
        <FieldFrame locked={locked} className="px-3.5 py-3">
          {locked ? (
            <LockedValue value={draft.lastName} />
          ) : (
            <input
              type="text"
              name="receiver-last-name"
              value={draft.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ lastName: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="Last name"
              autoComplete="shipping family-name"
              aria-label="Last name"
            />
          )}
        </FieldFrame>
      </FormSection>

      <FormSection step="3" title="MOBILE" className="mt-5">
        <AuMobileField
          locked={locked}
          value={draft.mobile}
          name="receiver-mobile"
          autoComplete="shipping tel-national"
          onChange={(mobile) => onChange({ mobile })}
        />
      </FormSection>

      <FormSection step="4" title="EMAIL" className="mt-5">
        <FieldFrame locked={locked} className="px-3.5 py-3">
          {locked ? (
            <LockedValue value={draft.email} />
          ) : (
            <input
              type="email"
              name="receiver-email"
              value={draft.email}
              onChange={(e) => onChange({ email: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ email: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="them@example.com"
              autoComplete="shipping email"
              aria-label="Email"
            />
          )}
        </FieldFrame>
      </FormSection>

      <FormSection step="5" title="ADDRESS" className="mt-5">
        <FieldFrame
          locked={locked}
          className="flex items-start gap-2 px-3.5 py-3"
        >
          <span className="mt-0.5 shrink-0 text-neutral-400">
            <LocationPinIcon />
          </span>
          {locked ? (
            <LockedValue value={draft.address} />
          ) : (
            <input
              type="text"
              name="receiver-address"
              value={draft.address}
              onChange={(e) => onChange({ address: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ address: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="Street, suburb, state"
              autoComplete="shipping street-address"
              aria-label="Delivery address"
            />
          )}
        </FieldFrame>
      </FormSection>

      {draft.businessName.trim() || !locked ? (
        <FormSection step="6" title="BUSINESS" className="mt-5">
          <FieldFrame locked={locked} className="px-3.5 py-3">
            {locked ? (
              <LockedValue value={draft.businessName || "—"} />
            ) : (
              <input
                type="text"
                name="receiver-organization"
                value={draft.businessName}
                onChange={(e) => onChange({ businessName: e.target.value })}
                onInput={(e) =>
                  applyInputValue(e, (v) => onChange({ businessName: v }))
                }
                className={`${FIELD_INPUT} w-full`}
                placeholder="Optional"
                autoComplete="shipping organization"
                aria-label="Business name (optional)"
              />
            )}
          </FieldFrame>
        </FormSection>
      ) : null}
    </form>
  );
}
