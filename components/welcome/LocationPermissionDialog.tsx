"use client";

interface Props {
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

function LocationServicesIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
      <path
        d="M28 4c-8.837 0-16 7.163-16 16 0 11.5 16 24 16 24s16-12.5 16-24c0-8.837-7.163-16-16-16z"
        fill="#007AFF"
        opacity="0.15"
      />
      <path d="M28 14a6 6 0 100 12 6 6 0 000-12z" fill="#007AFF" />
      <path
        d="M28 8v4M28 44v4M8 28h4M44 28h4"
        stroke="#007AFF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

const OPTIONS = [
  { id: "while", label: "While using the app" },
  { id: "once", label: "Only this time" },
  { id: "deny", label: "Don't allow" },
] as const;

export function LocationPermissionDialog({ open, onAllow, onDeny }: Props) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#5F6877]/85 p-6"
      role="presentation"
      onClick={onDeny}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="location-permission-title"
        className="w-full max-w-[17.5rem] overflow-hidden rounded-[1.35rem] bg-white text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pb-4 pt-6">
          <div className="flex justify-center">
            <LocationServicesIcon />
          </div>
          <h2
            id="location-permission-title"
            className="mt-3 text-[17px] font-semibold leading-snug text-[#0B1B32]"
          >
            Allow ParcelPoint GO to use your location?
          </h2>
          <p className="mt-2 text-[13px] leading-snug text-neutral-500">
            Used to find ParcelPoints near you while you book.
          </p>
        </div>
        <div className="border-t border-neutral-200">
          {OPTIONS.map((opt, index) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => (opt.id === "deny" ? onDeny() : onAllow())}
              className={`w-full py-3.5 text-[17px] font-normal text-[#007AFF] transition active:bg-neutral-50 ${
                index > 0 ? "border-t border-neutral-200" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
