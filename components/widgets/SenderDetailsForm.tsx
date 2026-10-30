"use client";

import { useCallback, useState } from "react";
import type { PersonDetails } from "@/lib/types";
import { isValidEmail, normalizeAuMobile } from "@/lib/validation";
import { ContinueButton } from "./shared/ContinueButton";

interface Props {
  initial?: Partial<PersonDetails>;
  onSubmit: (sender: PersonDetails) => void;
}

export function SenderDetailsForm({ initial, onSubmit }: Props) {
  const [mobile, setMobile] = useState(initial?.mobile?.replace("+61", "4") ?? "");
  const [businessName, setBusinessName] = useState(initial?.businessName ?? "");
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  const runLookup = useCallback(async (phone: string) => {
    if (!normalizeAuMobile(phone)) return;
    setLooking(true);
    setLookupMsg(null);
    try {
      const res = await fetch(
        `/api/customer-lookup?mobile=${encodeURIComponent(phone)}`
      );
      if (res.ok) {
        const data = await res.json();
        const c = data.customer;
        setFirstName(c.firstName ?? "");
        setLastName(c.lastName ?? "");
        setBusinessName(c.businessName ?? "");
        setEmail(c.email ?? "");
        setLookupMsg("We found your saved details and filled them in.");
      }
    } catch {
      /* not found — leave blank */
    } finally {
      setLooking(false);
    }
  }, []);

  const valid =
    !!normalizeAuMobile(mobile) &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    isValidEmail(email);

  const handleContinue = () => {
    if (!valid) {
      setFieldError("Please complete all required fields correctly.");
      return;
    }
    setFieldError(null);
    onSubmit({
      mobile,
      businessName: businessName.trim() || undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-3">
      <label className="block text-xs font-medium text-neutral-600">
        Mobile *
        <div className="mt-1 flex gap-2">
          <span className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-sm text-neutral-500">
            +61
          </span>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 9))}
            onBlur={() => void runLookup(mobile)}
            placeholder="4XX XXX XXX"
            className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            title="Look up saved details"
            disabled={looking}
            onClick={() => void runLookup(mobile)}
            className="rounded-lg border border-neutral-200 px-3 text-sm hover:border-brand-orange"
          >
            🔍
          </button>
        </div>
      </label>
      {lookupMsg && (
        <p className="text-xs text-emerald-600">{lookupMsg}</p>
      )}
      <Field label="Business Name (optional)" optional>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Hubbed"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="First Name *">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Last Name *">
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </Field>
      </div>
      <Field label="Email *">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
      </Field>
      {fieldError && <p className="text-xs text-red-600">{fieldError}</p>}
      <ContinueButton disabled={!valid} onClick={handleContinue} />
    </div>
  );
}

function Field({
  label,
  children,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block text-xs font-medium text-neutral-600">
      {label}
      {optional && <span className="font-normal text-neutral-400"> (optional)</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}
