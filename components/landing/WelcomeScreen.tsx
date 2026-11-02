"use client";

import { useChatStore } from "@/lib/store";
import { WelcomeHero } from "./WelcomeHero";

export function WelcomeScreen() {
  const enterLanding = useChatStore((s) => s.enterLanding);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] bg-white">
      <header className="shrink-0 px-6 pb-2 pt-10 sm:px-8 sm:pt-12">
        <h1 className="text-center text-[1.75rem] font-bold leading-[1.15] tracking-tight text-brand-black sm:text-[2.1rem]">
          Your <span className="text-[#e85c00]">Smart</span>
          <br />
          <span className="text-[#e85c00]">Assistant</span> for
          <br />
          Sending Parcels
        </h1>
      </header>

      <div className="flex min-h-0 items-center justify-center overflow-visible px-6 py-4 sm:py-6">
        <div className="w-full max-w-[260px] overflow-visible py-3 sm:max-w-[280px] sm:py-4">
          <WelcomeHero />
        </div>
      </div>

      <footer className="shrink-0 bg-white px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-8">
        <p className="mb-3 text-center text-sm leading-relaxed text-neutral-500 sm:mb-4 sm:text-[15px]">
          Tap below to send a parcel and manage your shipments.
        </p>
        <button
          type="button"
          onClick={() => enterLanding()}
          className="welcome-get-started touch-manipulation sm:min-h-[56px] sm:py-[18px] sm:text-[17px]"
        >
          Get Started
          <span aria-hidden style={{ marginLeft: "0.25rem", fontSize: "1.125rem" }}>
            →
          </span>
        </button>
      </footer>
    </div>
  );
}
