"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AiAssistedBookingFlow } from "@/components/welcome/AiAssistedBookingFlow";
import {
  type AiBookingDemo,
  type AiBookingStarter,
  aiBookingStarterPrefill,
} from "@/lib/ai-booking-recommendations";

function AiBookingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("demo");
  const initialDemo: AiBookingDemo | null =
    raw === "gift80" || raw === "dress400" ? raw : null;
  const starterRaw = params.get("starter");
  const initialStarter: AiBookingStarter | null =
    starterRaw === "cost" || starterRaw === "size" || starterRaw === "packaging"
      ? starterRaw
      : null;
  const starterPrefill = initialStarter
    ? aiBookingStarterPrefill(initialStarter)
    : null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <AiAssistedBookingFlow
        initialDemo={initialDemo}
        initialComposerPrefill={starterPrefill}
        onExit={() => router.push("/")}
      />
    </div>
  );
}

export default function AiBookingPage() {
  return (
    <main className="relative mx-auto flex h-[100dvh] w-full max-w-lg flex-col overflow-hidden bg-[#F7F8FA] md:my-4 md:h-[calc(100dvh-2rem)] md:rounded-2xl md:border md:border-neutral-200 md:shadow-xl">
      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense
          fallback={
            <div className="flex h-full min-h-[50vh] items-center justify-center text-[15px] text-neutral-400">
              Loading…
            </div>
          }
        >
          <AiBookingContent />
        </Suspense>
      </div>
    </main>
  );
}
