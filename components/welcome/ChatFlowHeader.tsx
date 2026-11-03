"use client";

const STEPS = ["Route", "Parcel", "Price", "Pay"] as const;

export type ChatFlowStep = (typeof STEPS)[number];

function BackChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
      <path d="M19 11a7 7 0 0 1-14 0M12 18v3" />
    </svg>
  );
}

interface HeaderProps {
  activeStep: ChatFlowStep;
  onBack: () => void;
  accentOrange?: string;
}

export function ChatFlowHeader({
  activeStep,
  onBack,
  accentOrange = "#E8651A",
}: HeaderProps) {
  return (
    <header className="shrink-0 border-b border-neutral-200/80 bg-white px-3 pb-0 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4">
      <div className="flex items-center gap-2.5 pb-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECEEF2] text-[#0B1B32]"
        >
          <BackChevron />
        </button>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: accentOrange }}
        >
          P
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight text-[#0B1B32]">
            PGo
          </p>
          <p className="text-xs font-medium text-[#2D7A4D]">
            Your shipping assistant
          </p>
        </div>
        <button
          type="button"
          aria-label="Voice"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECEEF2] text-[#0B1B32]"
        >
          <MicIcon />
        </button>
      </div>
      <nav
        className="flex gap-1 border-t border-neutral-100 pb-3 pt-2.5"
        aria-label="Booking progress"
      >
        {STEPS.map((step, index) => {
          const activeIndex = STEPS.indexOf(activeStep);
          const active = step === activeStep;
          const completed = index < activeIndex;
          const highlighted = completed || active;
          return (
            <div
              key={step}
              className="flex min-w-0 flex-1 flex-col items-start gap-1.5"
            >
              <span
                className={`block w-full rounded-full ${
                  highlighted ? "h-1" : "h-0.5 bg-[#E5E7EB]"
                }`}
                style={
                  highlighted ? { backgroundColor: accentOrange } : undefined
                }
                aria-hidden
              />
              <span
                className={`text-[13px] leading-none ${
                  active
                    ? "font-bold text-[#0B1B32]"
                    : completed
                      ? "font-normal text-[#0B1B32]"
                      : "font-normal text-[#6B7280]"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </nav>
    </header>
  );
}

export function ChatFlowFooter({
  input,
  onInputChange,
  placeholder,
  accentOrange = "#E8651A",
}: {
  input: string;
  onInputChange: (v: string) => void;
  placeholder: string;
  accentOrange?: string;
}) {
  return (
    <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Message"
          className="min-w-0 flex-1 rounded-full bg-[#ECEEF2] px-5 py-3.5 text-[15px] text-[#0B1B32] outline-none placeholder:text-[#9CA3AF]"
        />
        <button
          type="button"
          aria-label="Voice input"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: accentOrange }}
        >
          <MicIcon />
        </button>
      </div>
    </footer>
  );
}
