"use client";

import {
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

function renderableContent(content: ReactNode): ReactNode {
  if (
    content == null ||
    typeof content === "string" ||
    typeof content === "number" ||
    typeof content === "boolean"
  ) {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((item, index) => (
      <span key={index}>{renderableContent(item)}</span>
    ));
  }
  if (isValidElement(content)) return content;
  if (typeof content === "object") {
    const record = content as { content?: unknown; text?: unknown };
    if (typeof record.content === "string" || typeof record.content === "number") {
      return record.content;
    }
    if (typeof record.text === "string" || typeof record.text === "number") {
      return record.text;
    }
  }
  return null;
}

export function ChatScrollArea({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const pinToLatest = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        node.scrollTop = node.scrollHeight;
      });
    };

    pinToLatest();
    const observer = new MutationObserver(pinToLatest);
    observer.observe(node, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    const resize = new ResizeObserver(pinToLatest);
    if (node.firstElementChild) resize.observe(node.firstElementChild);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      {children}
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

type ReplyTurn = { token: number; onStart: () => void };

let nextReplyToken = 1;
let activeReplyToken: number | null = null;
const replyQueue: ReplyTurn[] = [];

function requestReplyTurn(onStart: () => void): number {
  const token = nextReplyToken++;
  if (activeReplyToken === null) {
    activeReplyToken = token;
    onStart();
  } else {
    replyQueue.push({ token, onStart });
  }
  return token;
}

function releaseReplyTurn(token: number) {
  const queuedIndex = replyQueue.findIndex((turn) => turn.token === token);
  if (queuedIndex >= 0) {
    replyQueue.splice(queuedIndex, 1);
    return;
  }
  if (activeReplyToken !== token) return;
  activeReplyToken = null;
  const next = replyQueue.shift();
  if (!next) return;
  activeReplyToken = next.token;
  next.onStart();
}

export function BotReply({
  children,
  onReady,
}: {
  children: ReactNode;
  onReady?: () => void;
}) {
  const [phase, setPhase] = useState<"waiting" | "typing" | "ready">("waiting");
  const onReadyRef = useRef(onReady);
  const typingRef = useRef<HTMLDivElement>(null);
  onReadyRef.current = onReady;

  useEffect(() => {
    let timer: number | null = null;
    let released = false;
    const finish = (token: number) => {
      if (released) return;
      released = true;
      releaseReplyTurn(token);
    };
    const token = requestReplyTurn(() => {
      setPhase("typing");
      timer = window.setTimeout(() => {
        setPhase("ready");
        onReadyRef.current?.();
        finish(token);
      }, BOT_REPLY_DELAY_MS);
    });
    return () => {
      if (timer) window.clearTimeout(timer);
      finish(token);
    };
  }, []);

  useEffect(() => {
    if (phase === "waiting") return;
    typingRef.current?.scrollIntoView({ block: "end" });
  }, [phase]);

  if (phase !== "ready") {
    if (phase !== "typing") return null;
    return (
      <div ref={typingRef}>
        <TypingBubble />
      </div>
    );
  }

  return <div ref={typingRef}>{children}</div>;
}

export function ChatTranscript({
  messages,
  historyCount,
  onBusyChange,
  insertBefore,
}: {
  messages: ChatMessage[];
  /** Bot messages at this index and after are new replies and type before they appear. */
  historyCount?: number;
  /** True while a new bot reply in this transcript is still waiting or typing. */
  onBusyChange?: (busy: boolean) => void;
  /** Rendered immediately above the message with this id. */
  insertBefore?: { id: string; node: ReactNode };
}) {
  const revealedRef = useRef<Set<string> | null>(null);
  const [tick, setTick] = useState(0);
  const [typingId, setTypingId] = useState<string | null>(null);
  const onBusyChangeRef = useRef(onBusyChange);
  const typingRef = useRef<HTMLDivElement>(null);
  onBusyChangeRef.current = onBusyChange;

  if (revealedRef.current === null) {
    const cutoff = historyCount ?? messages.length;
    const revealed = new Set<string>();
    messages.forEach((message, index) => {
      if (message.role === "bot" && index < cutoff) revealed.add(message.id);
    });
    revealedRef.current = revealed;
  }

  const firstHeld = messages.find(
    (message) =>
      message.role === "bot" && !revealedRef.current!.has(message.id),
  );
  const firstHeldId = firstHeld?.id ?? null;
  const messageStamp = messages.map((message) => message.id).join("\n");

  useEffect(() => {
    onBusyChangeRef.current?.(firstHeldId !== null);
  }, [firstHeldId, tick, messageStamp]);

  useEffect(() => {
    if (!firstHeldId) return;
    let timer: number | null = null;
    let released = false;
    const finish = (token: number) => {
      if (released) return;
      released = true;
      releaseReplyTurn(token);
    };
    let alive = true;
    const token = requestReplyTurn(() => {
      if (!alive) {
        finish(token);
        return;
      }
      setTypingId(firstHeldId);
      timer = window.setTimeout(() => {
        if (!alive) return;
        revealedRef.current?.add(firstHeldId);
        setTypingId((current) => (current === firstHeldId ? null : current));
        setTick((value) => value + 1);
        finish(token);
      }, BOT_REPLY_DELAY_MS);
    });
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
      finish(token);
    };
  }, [firstHeldId]);

  useEffect(() => {
    if (!typingId) return;
    typingRef.current?.scrollIntoView({ block: "end" });
  }, [typingId, tick]);

  if (messages.length === 0) return null;

  const firstHeldIndex = firstHeld
    ? messages.findIndex((message) => message.id === firstHeld.id)
    : -1;

  return (
    <>
      {messages.map((message, index) => {
        if (firstHeldIndex >= 0 && index > firstHeldIndex) return null;
        const lead =
          insertBefore?.id === message.id ? insertBefore.node : null;
        if (message.kind === "parcel-photo") {
          return (
            <Fragment key={message.id}>
              {lead}
              <ParcelPhotoBubble />
            </Fragment>
          );
        }
        const messageKey =
          typeof message.id === "string" && message.id
            ? `${message.id}-${index}`
            : `message-${index}`;
        const body = renderableContent(message.content);
        if (message.role === "user") {
          return (
            <Fragment key={messageKey}>
              {lead}
              <UserBubble>{body}</UserBubble>
            </Fragment>
          );
        }
        if (!revealedRef.current!.has(message.id)) {
          if (typingId !== message.id) {
            return lead ? (
              <Fragment key={`lead-${messageKey}`}>{lead}</Fragment>
            ) : null;
          }
          return (
            <Fragment key={`typing-${messageKey}`}>
              {lead}
              <div ref={typingRef}>
                <TypingBubble />
              </div>
            </Fragment>
          );
        }
        return (
          <Fragment key={messageKey}>
            {lead}
            <BotBubble bordered={message.bordered}>{body}</BotBubble>
          </Fragment>
        );
      })}
    </>
  );
}
