"use client";

const PGO_ORANGE = "#C44717";

export function PayConfirmCircleMark({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: PGO_ORANGE }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12l4 4 10-10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-neutral-300" />;
}

export function TermsAgreementCard({ locked }: { locked?: boolean }) {
  return (
    <div
      className={`flex w-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm ${
        locked ? "border-2 border-[#C44717]" : "border-neutral-200"
      }`}
    >
      <PayConfirmCircleMark selected={!!locked} />
      <span className="min-w-0 text-[15px] leading-snug text-[#0B1B32]">
        I agree to the{" "}
        <span className="font-semibold text-[#C44717] underline underline-offset-2">
          Terms &amp; Conditions
        </span>{" "}
        and{" "}
        <span className="font-semibold text-[#C44717] underline underline-offset-2">
          Privacy Policy
        </span>
        .
      </span>
    </div>
  );
}

export function TermsChoiceButtons({
  disabled,
  onAgree,
  onDecline,
}: {
  disabled?: boolean;
  onAgree: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        disabled={disabled}
        onClick={onAgree}
        className="rounded-full py-3 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:opacity-50"
        style={{ backgroundColor: PGO_ORANGE }}
      >
        I agree
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDecline}
        className="rounded-full border border-neutral-300 bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99] disabled:opacity-50"
      >
        I don&apos;t agree
      </button>
    </div>
  );
}

export function TermsDeclineRecoveryButtons({
  disabled,
  onAgreeNow,
  onCancel,
}: {
  disabled?: boolean;
  onAgreeNow: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-2.5">
      <button
        type="button"
        disabled={disabled}
        onClick={onAgreeNow}
        className="w-full rounded-full py-3 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:opacity-50"
        style={{ backgroundColor: PGO_ORANGE }}
      >
        I agree now
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onCancel}
        className="w-full rounded-full border border-neutral-300 bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99] disabled:opacity-50"
      >
        Cancel booking
      </button>
    </div>
  );
}

export function DangerousGoodsCard({
  selected,
  onToggle,
  disabled,
}: {
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition disabled:opacity-90 ${
        selected ? "border-2 border-[#C44717]" : "border-neutral-200"
      }`}
    >
      <PayConfirmCircleMark selected={selected} />
      <span className="min-w-0">
        <span className="block text-[15px] font-bold text-[#0B1B32]">No dangerous goods</span>
        <span className="mt-1 block text-sm leading-snug text-neutral-500">
          I confirm this parcel does not contain prohibited or dangerous goods.
        </span>
      </span>
    </button>
  );
}

export function DangerousGoodsLockedCard() {
  return (
    <div className="flex w-full items-start gap-3 rounded-2xl border-2 border-[#C44717] bg-white p-4 shadow-sm">
      <PayConfirmCircleMark selected />
      <span className="min-w-0">
        <span className="block text-[15px] font-bold text-[#0B1B32]">No dangerous goods</span>
        <span className="mt-1 block text-sm leading-snug text-neutral-500">
          I confirm this parcel does not contain prohibited or dangerous goods.
        </span>
      </span>
    </div>
  );
}

export function DangerousChoiceButtons({
  disabled,
  onConfirm,
  onContains,
}: {
  disabled?: boolean;
  onConfirm: () => void;
  onContains: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className="rounded-full py-3 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:opacity-50"
        style={{ backgroundColor: PGO_ORANGE }}
      >
        I confirm
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onContains}
        className="rounded-full border border-[#C44717] bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99] disabled:opacity-50"
      >
        It does contain some
      </button>
    </div>
  );
}

export function MarketingChoiceButtons({
  disabled,
  onYes,
  onNo,
}: {
  disabled?: boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        disabled={disabled}
        onClick={onYes}
        className="rounded-full py-3 text-[15px] font-bold text-white transition active:scale-[0.99] disabled:opacity-50"
        style={{ backgroundColor: PGO_ORANGE }}
      >
        Yes please
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onNo}
        className="rounded-full border border-neutral-300 bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99] disabled:opacity-50"
      >
        No thanks
      </button>
    </div>
  );
}
