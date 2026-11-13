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
import { PpGoMark } from "./PpGoMark";

export const BOT_REPLY_DELAY_MS = 2000;

function UserBubbleEditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PpGoChatAvatar() {
  return <PpGoMark size={32} className="mb-0.5" />;
}

export function UserBubble({
  children,
  onEdit,
  editLabel = "Edit message",
}: {
  children: ReactNode;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <div className="flex justify-end items-end gap-2">
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          aria-label={editLabel}
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F6D0BC] bg-[#FFF8F4] text-[#C44717] shadow-sm transition hover:border-[#E4571A] hover:bg-[#FFF3EC] active:scale-[0.98]"
        >
          <UserBubbleEditIcon />
        </button>
      ) : null}
      <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] leading-snug text-white">
        {children}
      </div>
    </div>
  );
}

export function BotBubble({
  bordered,
  children,
  showAvatar = true,
}: {
  bordered?: boolean;
  children: ReactNode;
  showAvatar?: boolean;
}) {
  return (
    <div className="flex items-end justify-start gap-2">
      {showAvatar ? <PpGoChatAvatar /> : null}
      <div
        className={`min-w-0 max-w-[calc(100%-2.5rem)] rounded-[1.25rem] rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-snug text-[#0B1B32] ${
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

function shouldHoldChatScroll(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement
  ) {
    return true;
  }
  return Boolean(active.closest("[contenteditable='true'], [data-chat-form]"));
}

export function ChatScrollArea({
  children,
  scrollKey,
}: {
  children: ReactNode;
  /** Bump when a new message should scroll into view (e.g. thread length). */
  scrollKey?: string | number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const pinToLatest = (force = false) => {
    const node = ref.current;
    if (!node) return;
    if (!force && shouldHoldChatScroll()) return;
    node.scrollTop = node.scrollHeight;
  };

  useEffect(() => {
    if (scrollKey === undefined) return;
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    frame = window.requestAnimationFrame(() => pinToLatest(false));
    return () => window.cancelAnimationFrame(frame);
  }, [scrollKey]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const schedulePin = (force = false) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => pinToLatest(force));
    };

    schedulePin(true);
    const observer = new MutationObserver(() => schedulePin(false));
    observer.observe(node, {
      childList: true,
      subtree: true,
    });
    const resize = new ResizeObserver(() => schedulePin(false));
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
    <div
      className="flex items-end justify-start gap-2"
      aria-live="polite"
      aria-label="PGo is typing"
    >
      <PpGoChatAvatar />
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
