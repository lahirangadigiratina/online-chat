"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import type {
  ReceiverContactDraft,
  SenderContactDraft,
} from "@/lib/ai-booking-parse";
import {
  buildAuMobileFromLocal,
  formatAuMobileLocalDisplay,
  readReceiverContactFromForm,
  readSenderContactFromForm,
} from "@/lib/ai-booking-parse";

const CONTACT_AUTOFILL_ANIMATION = "ppgo-contact-autofill-start";

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

function useContactFormDomSync(
  locked: boolean | undefined,
  read: (form: HTMLFormElement) => Partial<SenderContactDraft | ReceiverContactDraft>,
  onChange: (patch: Partial<SenderContactDraft | ReceiverContactDraft>) => void,
) {
  const formRef = useRef<HTMLFormElement>(null);

  const flushFromDomSync = useCallback(() => {
    if (locked || !formRef.current) return;
    onChange(read(formRef.current));
  }, [locked, onChange, read]);

  const flushFromDom = useCallback(() => {
    if (locked || !formRef.current) return;
    const apply = () => {
      if (!formRef.current) return;
      onChange(read(formRef.current));
    };
    apply();
    queueMicrotask(apply);
    window.requestAnimationFrame(() => {
      apply();
      window.requestAnimationFrame(apply);
    });
    window.setTimeout(apply, 0);
    window.setTimeout(apply, 50);
    window.setTimeout(apply, 150);
  }, [locked, onChange, read]);

  useEffect(() => {
    const form = formRef.current;
    if (!form || locked) return;

    const onAnimationStart = (e: AnimationEvent) => {
      if (e.animationName !== CONTACT_AUTOFILL_ANIMATION) return;
      flushFromDom();
    };

    form.addEventListener("animationstart", onAnimationStart, true);
    return () => form.removeEventListener("animationstart", onAnimationStart, true);
  }, [flushFromDom, locked]);

  const bindForm = {
    ref: formRef,
    onInput: flushFromDom,
    onChange: flushFromDom,
  };

  return { bindForm, flushFromDom, flushFromDomSync };
}

function contactFieldInputProps(onAutoFill: () => void) {
  return {
    "data-chat-field": true,
    onAnimationStart: (e: React.AnimationEvent<HTMLInputElement>) => {
      if (e.animationName === CONTACT_AUTOFILL_ANIMATION) onAutoFill();
    },
  } as const;
}

function AuMobileField({
  locked,
  value,
  onChange,
  autoComplete = "tel-national",
  name,
  onAutoFill,
  onAutoFillSync,
}: {
  locked?: boolean;
  value: string;
  onChange: (mobile: string) => void;
  autoComplete?: string;
  name?: string;
  onAutoFill?: () => void;
  onAutoFillSync?: () => void;
}) {
  const localDisplay = formatAuMobileLocalDisplay(value);
  const syncMobile = (raw: string) => {
    onAutoFillSync?.();
    onChange(buildAuMobileFromLocal(raw));
  };

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
          {...(onAutoFill ? contactFieldInputProps(onAutoFill) : {})}
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
  const { bindForm, flushFromDom, flushFromDomSync } = useContactFormDomSync(
    locked,
    readSenderContactFromForm,
    onChange,
  );
  const fieldProps = contactFieldInputProps(flushFromDom);

  return (
    <form
      data-chat-form
      ref={bindForm.ref}
      autoComplete="section-sender on"
      onSubmit={(e) => e.preventDefault()}
      onInput={bindForm.onInput}
      onChange={bindForm.onChange}
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
              id="sender-first-name"
              name="sender-first-name"
              value={draft.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ firstName: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="First name"
              autoComplete="section-sender given-name"
              aria-label="First name"
              {...fieldProps}
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
              id="sender-last-name"
              name="sender-last-name"
              value={draft.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ lastName: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="Last name"
              autoComplete="section-sender family-name"
              aria-label="Last name"
              {...fieldProps}
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
              id="sender-email"
              name="sender-email"
              value={draft.email}
              onChange={(e) => onChange({ email: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ email: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="you@example.com"
              autoComplete="section-sender email"
              aria-label="Email"
              {...fieldProps}
            />
          )}
        </FieldFrame>
      </FormSection>

      <FormSection step="4" title="MOBILE" className="mt-5">
        <AuMobileField
          locked={locked}
          value={draft.mobile}
          name="sender-mobile"
          autoComplete="section-sender tel-national"
          onAutoFillSync={flushFromDomSync}
          onAutoFill={flushFromDom}
          onChange={(mobile) => onChange({ mobile })}
        />
      </FormSection>

      {draft.businessName.trim() || !locked ? (
        <FormSection step="5" title="BUSINESS NAME" className="mt-5">
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
                autoComplete="section-sender organization"
                aria-label="Business name (optional)"
                {...fieldProps}
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
  const { bindForm, flushFromDom, flushFromDomSync } = useContactFormDomSync(
    locked,
    readReceiverContactFromForm,
    onChange,
  );
  const fieldProps = contactFieldInputProps(flushFromDom);

  return (
    <form
      data-chat-form
      ref={bindForm.ref}
      autoComplete="section-receiver on"
      onSubmit={(e) => e.preventDefault()}
      onInput={bindForm.onInput}
      onChange={bindForm.onChange}
      className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <FormSection step="1" title="FIRST NAME">
        <FieldFrame locked={locked} className="px-3.5 py-3">
          {locked ? (
            <LockedValue value={draft.firstName} />
          ) : (
            <input
              type="text"
              id="receiver-first-name"
              name="receiver-first-name"
              value={draft.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ firstName: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="First name"
              autoComplete="section-receiver given-name"
              aria-label="First name"
              {...fieldProps}
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
              id="receiver-last-name"
              name="receiver-last-name"
              value={draft.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ lastName: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="Last name"
              autoComplete="section-receiver family-name"
              aria-label="Last name"
              {...fieldProps}
            />
          )}
        </FieldFrame>
      </FormSection>

      <FormSection step="3" title="MOBILE" className="mt-5">
        <AuMobileField
          locked={locked}
          value={draft.mobile}
          name="receiver-mobile"
          autoComplete="section-receiver tel-national"
          onAutoFillSync={flushFromDomSync}
          onAutoFill={flushFromDom}
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
              id="receiver-email"
              name="receiver-email"
              value={draft.email}
              onChange={(e) => onChange({ email: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ email: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="them@example.com"
              autoComplete="section-receiver email"
              aria-label="Email"
              {...fieldProps}
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
              id="receiver-address"
              name="receiver-address"
              value={draft.address}
              onChange={(e) => onChange({ address: e.target.value })}
              onInput={(e) => applyInputValue(e, (v) => onChange({ address: v }))}
              className={`${FIELD_INPUT} w-full`}
              placeholder="Street, suburb, state"
              autoComplete="section-receiver street-address"
              aria-label="Delivery address"
              {...fieldProps}
            />
          )}
        </FieldFrame>
      </FormSection>

      {draft.businessName.trim() || !locked ? (
        <FormSection step="6" title="BUSINESS NAME" className="mt-5">
          <FieldFrame locked={locked} className="px-3.5 py-3">
            {locked ? (
              <LockedValue value={draft.businessName || "—"} />
            ) : (
              <input
                type="text"
                id="receiver-organization"
                name="receiver-organization"
                value={draft.businessName}
                onChange={(e) => onChange({ businessName: e.target.value })}
                onInput={(e) =>
                  applyInputValue(e, (v) => onChange({ businessName: v }))
                }
                className={`${FIELD_INPUT} w-full`}
                placeholder="Optional"
                autoComplete="section-receiver organization"
                aria-label="Business name (optional)"
                {...fieldProps}
              />
            )}
          </FieldFrame>
        </FormSection>
      ) : null}
    </form>
  );
}
