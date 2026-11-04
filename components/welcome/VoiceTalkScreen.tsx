"use client";

const WAVEFORM_HEIGHTS = [10, 22, 32, 18, 28, 24, 14];

interface Props {
  onClose: () => void;
  onStop: () => void;
  onOpenChat?: () => void;
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 18.5 4 21.25V6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v8.5A2.75 2.75 0 0 1 17.25 18H7.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 9.25h8M8 12.75h5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VoiceTalkScreen({ onClose, onStop, onOpenChat }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0F1E33] text-white">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A2D47] text-white/90 transition hover:bg-[#243956]"
        >
          <CloseIcon />
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-[15px] font-medium text-white/85">
          Talking with PPGo
        </p>
        <button
          type="button"
          onClick={onOpenChat ?? onStop}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#1A2D47] px-3.5 text-sm font-medium text-white/95 transition hover:bg-[#243956]"
        >
          <ChatIcon />
          Chat
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
        <div className="flex flex-col items-center">
          <div className="relative flex h-[7.5rem] w-[7.5rem] items-center justify-center">
            <div
              className="absolute h-full w-full rounded-full bg-[#1E3352]/80"
              aria-hidden
            />
            <div
              className="absolute h-[5.5rem] w-[5.5rem] rounded-full bg-[#3D2918]/90 ring-2 ring-[#5C4030]/50"
              aria-hidden
            />
            <div className="relative z-[1] flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-[#C84711]">
              <span className="text-3xl font-bold leading-none text-white">P</span>
            </div>
          </div>

          <div
            className="mt-8 flex h-9 items-end justify-center gap-1.5"
            aria-hidden
          >
            {WAVEFORM_HEIGHTS.map((h, i) => (
              <span
                key={i}
                className="voice-wave-bar w-1.5 rounded-full bg-[#F08A5D]"
                style={{
                  height: `${h}px`,
                  animationDelay: `${i * 0.11}s`,
                  animationDuration: `${0.62 + (i % 3) * 0.14}s`,
                }}
              />
            ))}
          </div>
          <p className="mt-4 text-[15px] font-medium text-white">Listening...</p>
        </div>

        <p className="mt-10 text-[1.35rem] font-bold leading-snug text-white sm:mt-12 sm:text-2xl">
          &ldquo;I want to send a pair of shoes to my mum in{" "}
          <span className="text-[#F08A5D]">Brisbane...</span>&rdquo;
        </p>
      </div>

      <footer className="flex shrink-0 flex-col items-center pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop listening"
          className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-white shadow-lg transition active:scale-[0.98]"
        >
          <span className="h-7 w-7 rounded-md bg-[#C84711]" />
        </button>
      </footer>
    </div>
  );
}
