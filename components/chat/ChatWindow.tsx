"use client";

import { useEffect, useRef } from "react";
import { LandingScreen } from "@/components/landing/LandingScreen";
import { ParcelPointLogo } from "@/components/landing/ParcelPointLogo";
import { APP_ORANGE_GRADIENT_BG } from "@/lib/landing-ui";
import { useChatStore } from "@/lib/store";
import { InputBar } from "./InputBar";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export function ChatWindow() {
  const started = useChatStore((s) => s.started);
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const currentStep = useChatStore((s) => s.currentStep);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, currentStep]);

  if (!started) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <LandingScreen />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-center border-b border-neutral-200 bg-white px-4 py-2.5 sm:py-3">
        <ParcelPointLogo size="sm" />
      </header>

      <div
        className={`min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:py-4 ${APP_ORANGE_GRADIENT_BG}`}
      >
        <div className="mx-auto flex max-w-lg flex-col gap-3 sm:gap-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <InputBar />
    </div>
  );
}
