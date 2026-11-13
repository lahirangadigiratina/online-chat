"use client";

import { useRef } from "react";

const PHOTO_TIPS = [
  "Whole parcel in the frame",
  "Good light, no blur",
  "Label side up if already packed",
] as const;

function GreenTipCheck() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-[#1F7A45]"
    >
      <path
        d="M5 12l4 4 10-10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-[#C44717]"
    >
      <path
        d="M4 8h4l2-2h4l2 2h4v11H4V8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function ParcelPhotoStepCard({
  accentOrange = "#C44717",
  disabled,
  onPhotoAdded,
  onSkip,
}: {
  accentOrange?: string;
  disabled?: boolean;
  onPhotoAdded: () => void;
  onSkip: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-neutral-200 bg-[#FAFBFC] px-4 py-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFEBE3]">
          <CameraIcon />
        </span>
        <p className="mt-3 text-center text-[15px] font-bold text-[#0B1B32]">
          Add parcel photo (optional)
        </p>
        <p className="mt-1 text-xs text-neutral-500">JPG or PNG, up to 10 MB</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={() => onPhotoAdded()}
      />
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={disabled}
          onClick={onPhotoAdded}
          className="rounded-full py-3 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:opacity-50"
          style={{ backgroundColor: accentOrange }}
        >
          Take photo
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full border border-neutral-200 bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99] disabled:opacity-50"
        >
          Upload
        </button>
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {PHOTO_TIPS.map((tip) => (
          <li key={tip} className="flex items-center gap-2.5 text-[14px] text-[#0B1B32]">
            <GreenTipCheck />
            {tip}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={disabled}
        onClick={onSkip}
        className="mt-4 w-full text-center text-[15px] font-semibold text-[#0B1B32] underline underline-offset-2 disabled:opacity-50"
      >
        Skip for now
      </button>
    </div>
  );
}
