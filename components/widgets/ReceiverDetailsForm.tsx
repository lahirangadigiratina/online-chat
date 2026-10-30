"use client";

import { useState } from "react";
import type { ReceiverDetails } from "@/lib/types";
import { isValidEmail, normalizeAuMobile } from "@/lib/validation";
import { ContinueButton } from "./shared/ContinueButton";

interface Props {
  initial?: Partial<ReceiverDetails>;
  onSubmit: (receiver: ReceiverDetails) => void;
}

export function ReceiverDetailsForm({ initial, onSubmit }: Props) {
  const [mobile, setMobile] = useState(initial?.mobile ?? "");
  const [businessName, setBusinessName] = useState(initial?.businessName ?? "");
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [noTracking, setNoTracking] = useState(
    initial?.noTrackingNotifications ?? false
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

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
      noTrackingNotifications: noTracking,
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-3">
      <input
        placeholder="Business Name (optional)"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="First Name *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
        <input
          placeholder="Last Name *"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>
      <input
        type="email"
        placeholder="Email *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <span className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-sm">
          +61
        </span>
        <input
          placeholder="Mobile *"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-neutral-600">
        <input
          type="checkbox"
          checked={noTracking}
          onChange={(e) => setNoTracking(e.target.checked)}
          className="mt-0.5"
        />
        Don&apos;t send tracking notifications to the receiver
      </label>
      {fieldError && <p className="text-xs text-red-600">{fieldError}</p>}
      <ContinueButton disabled={!valid} onClick={handleContinue} />
    </div>
  );
}
