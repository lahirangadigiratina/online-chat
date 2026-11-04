"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";
import { BotReply, ChatTranscript } from "./ChatTranscript";
import {
  buildPaySenderThreadAppend,
  parseSenderDetailsFromMessage,
  payNotifyLeadUserLine,
  paySenderSeedFromThread,
  type ChatMessage,
  type ParsedReceiverDetails,
} from "./chatThread";

const PGO_ORANGE = "#C44717";
const PGO_ORANGE_BTN = "#C44111";

type View = "confirm" | "edit";

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] leading-snug text-white">
        {children}
      </div>
    </div>
  );
}

function BotBubble({
  bordered,
  immediate,
  children,
}: {
  bordered?: boolean;
  immediate?: boolean;
  children: ReactNode;
}) {
  const bubble = (
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
  if (immediate) return bubble;
  return <BotReply>{bubble}</BotReply>;
}

function FormField({
  label,
  value,
  onChange,
  highlighted,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  highlighted?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[13px] font-medium text-neutral-600">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] text-[#0B1B32] outline-none placeholder:text-neutral-400 ${
          highlighted
            ? "border-2 border-[#E8651A]"
            : "border border-neutral-200 focus:border-[#E8651A] focus:ring-2 focus:ring-[#E8651A]/12"
        }`}
      />
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-neutral-100 py-2.5 last:border-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-right text-[15px] font-bold text-[#0B1B32]">
        {value}
      </span>
    </div>
  );
}

interface Props {
  onBack: () => void;
  onLooksRight?: (append?: ChatMessage[]) => void;
  priorThread?: ChatMessage[];
  /** Opens the sender form (Fix something) instead of the confirm card */
  openInEditMode?: boolean;
  /** Back from confirm returns to booking review instead of price */
  returnToReview?: boolean;
}

export function ChatPayScreen({
  onBack,
  onLooksRight,
  priorThread = [],
  openInEditMode = false,
  returnToReview = false,
}: Props) {
  const senderSeed = paySenderSeedFromThread(priorThread);
  const defaultSender = parseSenderDetailsFromMessage("");

  const [input, setInput] = useState("");
  const [view, setView] = useState<View>(
    openInEditMode ? "edit" : "confirm",
  );
  const [awaitingSenderDetails, setAwaitingSenderDetails] = useState(
    !senderSeed,
  );
  const [senderReplyMessage, setSenderReplyMessage] = useState(
    senderSeed?.line ?? "",
  );
  const [firstName, setFirstName] = useState(
    senderSeed?.parsed.firstName ?? defaultSender.firstName,
  );
  const [lastName, setLastName] = useState(
    senderSeed?.parsed.lastName ?? defaultSender.lastName,
  );
  const [mobile, setMobile] = useState(
    senderSeed?.parsed.mobile ?? defaultSender.mobile,
  );
  const [email, setEmail] = useState(
    senderSeed?.parsed.email ?? defaultSender.email,
  );
  const [businessName, setBusinessName] = useState(
    senderSeed?.parsed.businessName ?? defaultSender.businessName,
  );

  const notifyLeadLine = useMemo(
    () => payNotifyLeadUserLine(priorThread),
    [priorThread],
  );

  const applyParsedSender = (parsed: ParsedReceiverDetails) => {
    setFirstName(parsed.firstName);
    setLastName(parsed.lastName);
    setMobile(parsed.mobile);
    setEmail(parsed.email);
    setBusinessName(parsed.businessName);
  };

  const submitSenderDetails = () => {
    const trimmed = input.trim();
    if (!trimmed || !awaitingSenderDetails) return;
    setSenderReplyMessage(trimmed);
    applyParsedSender(parseSenderDetailsFromMessage(trimmed));
    setInput("");
    setAwaitingSenderDetails(false);
  };

  const saveDetails = () => {
    const line = [
      firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName,
      mobile,
      email,
      businessName.trim(),
    ]
      .filter(Boolean)
      .join(", ");
    if (line) setSenderReplyMessage(line);
    setView("confirm");
  };

  const handleHeaderBack = () => {
    if (view === "edit") {
      if (returnToReview) onBack();
      else setView("confirm");
    } else onBack();
  };

  const showFromConfirm = !awaitingSenderDetails;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader activeStep="Pay" onBack={handleHeaderBack} accentOrange={PGO_ORANGE} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <ChatTranscript messages={priorThread} />
          {view === "confirm" ? (
            <>
              {notifyLeadLine ? (
                <UserBubble>{notifyLeadLine}</UserBubble>
              ) : null}
              <BotBubble>
                Will do. Last thing — who&apos;s it from? Your first and last
                name, mobile and email. Sending for a business? Add the business
                name too.
              </BotBubble>
              {showFromConfirm ? (
                <>
                  <UserBubble>{senderReplyMessage}</UserBubble>
                  <BotReply>
                  <BotBubble immediate>
                    Here&apos;s what I&apos;ve got — look right?
                  </BotBubble>

                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#0B1B32]">
                      From
                    </p>
                    <div className="mt-2">
                      <DetailRow label="First name" value={firstName} />
                      <DetailRow label="Last name" value={lastName} />
                      <DetailRow label="Mobile" value={mobile} />
                      <DetailRow label="Email" value={email} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
                      <span className="text-[15px] text-neutral-500">
                        Business name (optional)
                      </span>
                      {businessName.trim() ? (
                        <span className="text-sm font-bold text-[#0B1B32]">
                          {businessName}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setView("edit")}
                          className="shrink-0 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[13px] font-bold text-[#0B1B32]"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const line =
                            senderReplyMessage.trim() ||
                            [
                              firstName && lastName
                                ? `${firstName} ${lastName}`
                                : firstName || lastName,
                              mobile,
                              email,
                            ]
                              .filter(Boolean)
                              .join(", ");
                          onLooksRight?.(buildPaySenderThreadAppend(line));
                        }}
                        className="rounded-full py-2.5 text-sm font-bold text-white"
                        style={{ backgroundColor: PGO_ORANGE }}
                      >
                        Looks right
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("edit")}
                        className="rounded-full border border-neutral-300 bg-white py-2.5 text-sm font-bold text-[#0B1B32]"
                      >
                        Fix something
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-xs leading-snug text-neutral-500">
                    Used only for this booking — your receipt, label and
                    delivery updates.
                  </p>
                  </BotReply>
                </>
              ) : null}
            </>
          ) : (
            <>
              <UserBubble>Fix something.</UserBubble>
              <BotBubble bordered>
                No problem — change anything below, or just tell me, like
                &apos;my email is sam@...&apos;.
              </BotBubble>

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="space-y-4">
                  <FormField
                    label="First name"
                    value={firstName}
                    onChange={setFirstName}
                  />
                  <FormField
                    label="Last name"
                    value={lastName}
                    onChange={setLastName}
                  />
                  <FormField
                    label="Mobile"
                    value={mobile}
                    onChange={setMobile}
                  />
                  <FormField
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    highlighted
                  />
                  <FormField
                    label="Business name (optional)"
                    value={businessName}
                    onChange={setBusinessName}
                    placeholder="e.g. Sam's Sneakers"
                  />
                </div>
                <button
                  type="button"
                  onClick={saveDetails}
                  className="mt-6 w-full rounded-full py-3.5 text-base font-bold leading-none text-white transition active:scale-[0.99]"
                  style={{ backgroundColor: PGO_ORANGE_BTN }}
                >
                  Save details
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ChatFlowFooter
        input={input}
        onInputChange={setInput}
        placeholder={
          view === "edit"
            ? "Or tell PGo what to change..."
            : "Your name, mobile and email..."
        }
        onSubmitMessage={
          view === "confirm" && awaitingSenderDetails
            ? submitSenderDetails
            : undefined
        }
        accentOrange={PGO_ORANGE}
      />
    </div>
  );
}
