"use client";

const WAVEFORM_HEIGHTS = [14, 22, 32, 18, 28, 36, 20, 30, 16, 26, 34, 18];

interface Props {
  onClose: () => void;
  onStop: () => void;
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5a8.5 8.5 0 01-8.5 8.5H8l-4.5 3v-6.5A8.5 8.5 0 1112.5 3h.5a8.5 8.5 0 018 8.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VoiceTalkScreen({ onClose, onStop }: Props) {
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
        <p className="min-w-0 flex-1 truncate text-center text-[15px] font-medium text-[#A8B8CC]">
          Talking with PGo
        </p>
        <button
          type="button"
          onClick={onStop}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#1A2D47] px-3.5 text-sm font-medium text-white/95 transition hover:bg-[#243956]"
        >
          <ChatIcon />
          Chat
        </button>
      </header>

      <div className="flex shrink-0 flex-col items-center px-6 pt-6">
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
          className="mt-6 flex h-10 items-end justify-center gap-1"
          aria-hidden
        >
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-[#E8C4A8]/90"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
        <p className="mt-3 text-[15px] text-[#8FA3BC]">Listening...</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center px-6 py-8">
        <p className="text-[1.35rem] font-bold leading-snug text-white sm:text-2xl">
          &ldquo;I want to send a pair of shoes to my mum in Brisbane.
          I&apos;ll drop it off somewhere near work in{" "}
          <span className="text-[#E8956A]">Parramatta...</span>
          &rdquo;
        </p>
      </div>

      <footer className="flex shrink-0 flex-col items-center pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop listening"
          className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-white shadow-lg transition active:scale-[0.98]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#C84711]" />
        </button>
        <p className="mt-4 text-center text-xs text-[#6B8299]">
          PGo replies out loud · captions on
        </p>
      </footer>
    </div>
  );
}
