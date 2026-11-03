"use client";

import Image from "next/image";
import { useState } from "react";
import { ChatLocationScreen } from "./ChatLocationScreen";
import { ChatReceiverConfirmScreen } from "./ChatReceiverConfirmScreen";
import { ChatRouteScreen } from "./ChatRouteScreen";
import { VoiceTalkScreen } from "./VoiceTalkScreen";

type AppScreen = "welcome" | "voice" | "location" | "chat" | "receiver";

type ChatEntryPhase = "route" | "parcel";

function MicIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
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

function SendPlaneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9 22 2z" />
    </svg>
  );
}

export function WelcomeScreen() {
  const [text, setText] = useState("");
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [chatBackTarget, setChatBackTarget] = useState<"welcome" | "location">(
    "welcome",
  );
  const [chatEntryPhase, setChatEntryPhase] = useState<ChatEntryPhase>("route");
  const [chatMountKey, setChatMountKey] = useState(0);

  const openChat = (phase: ChatEntryPhase) => {
    setChatEntryPhase(phase);
    setChatMountKey((k) => k + 1);
    setScreen("chat");
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    setScreen("receiver");
  };

  if (screen === "voice") {
    return (
      <VoiceTalkScreen
        onClose={() => setScreen("welcome")}
        onStop={() => {
          setChatBackTarget("welcome");
          openChat("route");
        }}
      />
    );
  }

  if (screen === "location") {
    return (
      <ChatLocationScreen
        onBack={() => setScreen("welcome")}
        onContinue={() => {
          setChatBackTarget("location");
          openChat("route");
        }}
      />
    );
  }

  if (screen === "receiver") {
    return (
      <ChatReceiverConfirmScreen
        entry="welcome"
        onBack={() => setScreen("welcome")}
        onLooksRight={() => {
          setChatBackTarget("welcome");
          openChat("parcel");
        }}
      />
    );
  }

  if (screen === "chat") {
    return (
      <ChatRouteScreen
        key={chatMountKey}
        initialPhase={chatEntryPhase}
        onBack={() => setScreen(chatBackTarget)}
        onFinished={() => setScreen("welcome")}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <header className="shrink-0 px-6 pb-4 pt-10 sm:px-8 sm:pt-12">
        <div className="flex justify-start">
          <Image
            src="/parcelpoint-compose-brand-transparent.png"
            alt="ParcelPoint Go"
            width={1024}
            height={252}
            priority
            unoptimized
            className="h-[2.35rem] w-auto max-w-[min(17.5rem,88vw)] object-contain object-left"
          />
        </div>
        <p className="mt-5 text-[15px] leading-snug text-[#6B7280]">
          Hi, I&apos;m PGo — no sign-up needed
        </p>
        <h1 className="mt-2 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#0B1B32] sm:text-[2rem]">
          What are we sending today?
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-6">
        <button
          type="button"
          aria-label="Tap and talk"
          onClick={() => setScreen("voice")}
          className="relative flex h-[11.5rem] w-[11.5rem] items-center justify-center sm:h-[12.5rem] sm:w-[12.5rem]"
        >
          <div
            className="absolute inset-0 rounded-full bg-[#FFEBE3]"
            aria-hidden
          />
          <span className="relative z-[1] flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-full bg-[#F24E11] shadow-[0_8px_24px_rgba(242,78,17,0.35)] transition active:scale-[0.98]">
            <MicIcon />
          </span>
        </button>
        <p className="mt-8 text-lg font-bold text-[#0B1B32]">Tap and talk</p>
        <p className="mt-2 whitespace-nowrap text-center text-[15px] leading-snug text-[#6B7280]">
          &ldquo;Send a pair of shoes to Mum in Brisbane&rdquo;
        </p>
      </div>

      <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Or type here..."
            aria-label="Message"
            className="min-w-0 flex-1 rounded-full bg-[#ECEEF2] px-5 py-3.5 text-[15px] text-[#0B1B32] outline-none placeholder:text-[#9CA3AF]"
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!text.trim()}
            onClick={handleSend}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0B1B32] text-white transition enabled:active:scale-[0.98] disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            <SendPlaneIcon />
          </button>
        </div>
      </footer>
    </div>
  );
}
