"use client";

function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function WalletIcon({ label }: { label: string }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[11px] font-bold text-neutral-500">
      {label}
    </span>
  );
}

function RadioMark({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#C44717]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#C44717]" />
      </span>
    );
  }
  return (
    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-neutral-300" />
  );
}

function ComingSoonBadge() {
  return (
    <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
      Coming up soon
    </span>
  );
}

export type OnlinePaySubMethod = "card" | "google" | "apple";

export function OnlinePaymentSubOptions({
  selected,
  disabled,
  onSelectCard,
  compact,
}: {
  selected: OnlinePaySubMethod;
  disabled?: boolean;
  onSelectCard: () => void;
  compact?: boolean;
}) {
  const rowPad = compact ? "p-3" : "p-3.5";

  return (
    <div
      className={`flex flex-col gap-2 ${compact ? "mt-2" : "mt-2.5 border-t border-neutral-100 pt-2.5"}`}
      role="group"
      aria-label="Pay online options"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onSelectCard}
        className={`flex w-full items-center gap-3 rounded-xl border bg-white text-left transition disabled:opacity-50 ${rowPad} ${
          selected === "card"
            ? "border-2 border-[#C44717] bg-[#FFF8F4]"
            : "border-neutral-200"
        }`}
      >
        <span
          className={selected === "card" ? "text-[#C44717]" : "text-neutral-400"}
        >
          <CardIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-[#0B1B32]">Card</span>
          <span className="mt-0.5 block text-xs text-neutral-500">
            Visa or Mastercard
          </span>
        </span>
        <RadioMark selected={selected === "card"} />
      </button>

      <div
        className={`flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 opacity-80 ${rowPad}`}
        aria-disabled
      >
        <WalletIcon label="G" />
        <span className="min-w-0 flex-1 text-[14px] font-bold text-neutral-500">
          Google Pay
        </span>
        <ComingSoonBadge />
      </div>

      <div
        className={`flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 opacity-80 ${rowPad}`}
        aria-disabled
      >
        <WalletIcon label="A" />
        <span className="min-w-0 flex-1 text-[14px] font-bold text-neutral-500">
          Apple Pay
        </span>
        <ComingSoonBadge />
      </div>
    </div>
  );
}
