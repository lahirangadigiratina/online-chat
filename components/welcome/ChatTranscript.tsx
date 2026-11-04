"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ChatMessage } from "./chatThread";
import { ParcelPhotoBubble } from "./ParcelPhotoBubble";

export const BOT_REPLY_DELAY_MS = 2000;

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] leading-snug text-white">
        {children}
      </div>
    </div>
  );
}

export function BotBubble({
  bordered,
  children,
}: {
  bordered?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[92%] rounded-[1.25rem] rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-snug text-[#0B1B32] ${
          bordered ? "border border-neutral-200 shadow-none" : "shadow-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label="PGo is typing">
      <div className="flex items-center gap-1.5 rounded-[1.25rem] rounded-bl-md bg-white px-4 py-3.5 shadow-sm">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="typing-dot h-2 w-2 rounded-full bg-[#9CA3AF]"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function BotReply({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const typingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), BOT_REPLY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    typingRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [ready]);

  if (!ready) {
    return (
      <div ref={typingRef}>
        <TypingBubble />
      </div>
    );
  }

  return <>{children}</>;
}

export function ChatTranscript({
  messages,
  historyCount,
}: {
  messages: ChatMessage[];
  /** Bot messages at this index and after are new replies and type before they appear. */
  historyCount?: number;
}) {
  const revealedRef = useRef<Set<string> | null>(null);
  const [tick, setTick] = useState(0);
  const typingRef = useRef<HTMLDivElement>(null);

  if (revealedRef.current === null) {
    const cutoff = historyCount ?? messages.length;
    const revealed = new Set<string>();
    messages.forEach((message, index) => {
      if (message.role === "bot" && index < cutoff) revealed.add(message.id);
    });
    revealedRef.current = revealed;
  }

  const heldIds = messages
    .filter(
      (message) =>
        message.role === "bot" && !revealedRef.current!.has(message.id),
    )
    .map((message) => message.id);
  const heldKey = heldIds.join("|");

  useEffect(() => {
    if (!heldKey) return;
    const ids = heldKey.split("|");
    const timer = window.setTimeout(() => {
      ids.forEach((id) => revealedRef.current?.add(id));
      setTick((value) => value + 1);
    }, BOT_REPLY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [heldKey]);

  useEffect(() => {
    if (!heldKey) return;
    typingRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [heldKey, tick]);

  if (messages.length === 0) return null;

  let typingShown = false;
  return (
    <>
      {messages.map((message) => {
        if (message.kind === "parcel-photo") {
          return <ParcelPhotoBubble key={message.id} />;
        }
        if (message.role === "user") {
          return <UserBubble key={message.id}>{message.content}</UserBubble>;
        }
        if (!revealedRef.current!.has(message.id)) {
          if (typingShown) return null;
          typingShown = true;
          return (
            <div key={`typing-${message.id}`} ref={typingRef}>
              <TypingBubble />
            </div>
          );
        }
        return (
          <BotBubble key={message.id} bordered={message.bordered}>
            {message.content}
          </BotBubble>
        );
      })}
    </>
  );
}
