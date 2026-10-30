"use client";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

interface Props {
  hint: string;
  pageLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  onClose?: () => void;
  showClose?: boolean;
}

export function WidgetPanelNav({
  hint,
  pageLabel,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
  onClose,
  showClose,
}: Props) {
  return (
    <div className="mb-2 flex shrink-0 items-center gap-1.5 sm:gap-2">
      <p className="min-w-0 flex-1 truncate text-left text-xs font-medium text-brand-black">
        {hint}
      </p>
      <div className="flex shrink-0 items-center gap-0.5 text-neutral-500">
        <button
          type="button"
          onClick={onPrevious}
          disabled={previousDisabled}
          aria-label="Previous"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronIcon direction="left" />
        </button>
        {pageLabel ? (
          <span className="min-w-[2.75rem] shrink-0 text-center text-sm tabular-nums text-neutral-500">
            {pageLabel}
          </span>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          aria-label="Next"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
      {showClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close options"
          className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 transition hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
        >
          <CloseIcon />
        </button>
      ) : (
        <span className="h-8 w-8 shrink-0" aria-hidden />
      )}
    </div>
  );
}
