import type { ReactNode } from "react";
import type { ChatMessage } from "./chatThread";
import { ParcelPhotoBubble } from "./ParcelPhotoBubble";

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
          bordered
            ? "border border-neutral-200 shadow-none"
            : "shadow-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function ChatTranscript({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) return null;
  return (
    <>
      {messages.map((message) => {
        if (message.kind === "parcel-photo") {
          return <ParcelPhotoBubble key={message.id} />;
        }
        return message.role === "user" ? (
          <UserBubble key={message.id}>{message.content}</UserBubble>
        ) : (
          <BotBubble key={message.id} bordered={message.bordered}>
            {message.content}
          </BotBubble>
        );
      })}
    </>
  );
}
