"use client";

interface Props {
  active?: boolean;
  disabled?: boolean;
  embedded?: boolean;
  onClick: () => void;
}

export function MicButton({ active, disabled, embedded, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={active ? "Stop listening" : "Voice input"}
      aria-pressed={active}
      className={
        embedded
          ? `flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition sm:h-10 sm:w-10 ${
              active
                ? "bg-orange-50 text-brand-orange"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            } disabled:opacity-40`
          : `flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition sm:h-10 sm:w-10 ${
              active
                ? "border-brand-orange bg-orange-50 text-brand-orange ring-2 ring-brand-orange/30"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
            } disabled:opacity-40`
      }
    >
      <svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
        <path d="M19 11a7 7 0 0 1-14 0M12 18v3" />
      </svg>
    </button>
  );
}
