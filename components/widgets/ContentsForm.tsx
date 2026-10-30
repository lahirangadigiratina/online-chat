"use client";

import { useRef, useState } from "react";
import { PROTECTION_RATE, protectionFeeForValue, SIGNATURE_FEE } from "@/lib/pricing";
import { CONTENT_CATEGORIES, type ContentsDetails } from "@/lib/types";
import { MAX_PARCEL_VALUE } from "@/lib/validation";
import { ContinueButton } from "./shared/ContinueButton";

interface Props {
  initial?: Partial<ContentsDetails>;
  onSubmit: (contents: ContentsDetails) => void;
}

export function ContentsForm({ initial, onSubmit }: Props) {
  const [category, setCategory] = useState(initial?.category ?? "");
  const [value, setValue] = useState(
    initial?.value ? String(initial.value) : ""
  );
  const [photo, setPhoto] = useState<string | undefined>(initial?.photo);
  const [reference, setReference] = useState(initial?.reference ?? "");
  const [signature, setSignature] = useState(initial?.signatureOnDelivery ?? false);
  const [protection, setProtection] = useState(initial?.parcelProtection ?? false);
  const [showProhibited, setShowProhibited] = useState(false);
  const [valueError, setValueError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const numValue = parseFloat(value) || 0;
  const protFee = protectionFeeForValue(numValue);

  const valid = !!category && numValue > 0 && numValue <= MAX_PARCEL_VALUE;

  const handleContinue = () => {
    if (numValue <= 0) {
      setValueError("Parcel value must be greater than $0.");
      return;
    }
    if (numValue > MAX_PARCEL_VALUE) {
      setValueError(`Maximum parcel value is $${MAX_PARCEL_VALUE.toLocaleString()}.`);
      return;
    }
    setValueError(null);
    onSubmit({
      category,
      value: numValue,
      photo,
      reference: reference.trim() || undefined,
      signatureOnDelivery: signature,
      parcelProtection: protection,
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 p-3">
      <button
        type="button"
        onClick={() => setShowProhibited(true)}
        className="text-xs font-medium text-brand-orange underline"
      >
        Prohibited or dangerous goods?
      </button>

      <div>
        <p className="mb-1 text-xs font-medium text-neutral-600">Category *</p>
        <div className="max-h-36 space-y-1 overflow-y-auto">
          {CONTENT_CATEGORIES.map((c) => {
            const selected = category === c.label;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.label)}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${
                  selected
                    ? "border-brand-orange bg-orange-50"
                    : "border-neutral-200"
                }`}
              >
                <span>{c.emoji}</span>
                <span className="flex-1">{c.label}</span>
                {selected && <span className="text-brand-orange">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block text-xs font-medium text-neutral-600">
        Parcel Value ($) *
        <input
          type="number"
          min={0}
          max={MAX_PARCEL_VALUE}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        />
      </label>
      {valueError && <p className="text-xs text-red-600">{valueError}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => setPhoto(reader.result as string);
          reader.readAsDataURL(f);
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-4 text-xs text-neutral-500"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="mb-1 h-16 w-16 rounded object-cover" />
        ) : null}
        Take/upload photo (optional)
      </button>

      <input
        placeholder="Reference number (optional)"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      />

      <p className="text-xs text-neutral-500">
        Add-ons <span className="rounded bg-neutral-100 px-1.5 py-0.5">Optional</span>
      </p>

      <AddonCard
        selected={signature}
        onToggle={() => setSignature(!signature)}
        title={`Signature on Delivery +$${SIGNATURE_FEE.toFixed(2)}`}
        subtitle="Recipient must sign upon delivery"
      />
      <AddonCard
        selected={protection}
        onToggle={() => setProtection(!protection)}
        title={
          numValue > 0
            ? `Parcel Protection +$${protFee.toFixed(2)}`
            : "Parcel Protection — Included"
        }
        subtitle={
          numValue > 0
            ? `Cover your parcel valued at $${numValue.toFixed(2)} (${(PROTECTION_RATE * 100).toFixed(1)}%)`
            : "Cover your parcel valued at $0"
        }
        footerLink="Parcel Protection Conditions"
      />

      <ContinueButton disabled={!valid} onClick={handleContinue} />

      {showProhibited && (
        <Modal onClose={() => setShowProhibited(false)} title="Prohibited goods">
          <p className="text-sm text-neutral-600">
            Placeholder: explosives, flammables, weapons, perishable goods without
            approval, and other restricted items cannot be sent via PARCELPOINT.
          </p>
        </Modal>
      )}
    </div>
  );
}

function AddonCard({
  selected,
  onToggle,
  title,
  subtitle,
  footerLink,
}: {
  selected: boolean;
  onToggle: () => void;
  title: string;
  subtitle: string;
  footerLink?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-xl border p-3 text-left ${
        selected ? "border-brand-orange bg-orange-50" : "border-neutral-200"
      }`}
    >
      <div className="flex gap-2">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-brand-orange bg-brand-orange text-white" : "border-neutral-300"
          }`}
        >
          {selected ? "✓" : ""}
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-neutral-500">{subtitle}</p>
          {footerLink && (
            <span className="text-xs text-brand-orange underline">{footerLink}</span>
          )}
        </div>
      </div>
    </button>
  );
}

function Modal({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[80vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-neutral-500">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
