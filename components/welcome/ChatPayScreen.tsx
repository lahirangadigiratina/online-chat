"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";
import { BotReply, ChatTranscript } from "./ChatTranscript";
import {
  buildPaySenderThreadAppend,
  lookupSenderByMobile,
  payNotifyLeadUserLine,
  paySenderSeedFromThread,
  type ChatMessage,
  type ParsedReceiverDetails,
} from "./chatThread";

const PGO_ORANGE = "#C44717";
const PGO_ORANGE_BTN = "#C44111";

type View = "confirm" | "edit";
type EditReason = "fix" | "manual";

function formatMobile(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return raw.trim();
}

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
  onReady,
  children,
}: {
  bordered?: boolean;
  immediate?: boolean;
  onReady?: () => void;
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
  return <BotReply onReady={onReady}>{bubble}</BotReply>;
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
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="shrink-0 text-[15px] text-neutral-500">{label}</span>
      <span className="max-w-[58%] text-right text-[15px] font-bold leading-snug text-[#0B1B32]">
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

  const [input, setInput] = useState("");
  const [view, setView] = useState<View>(
    openInEditMode ? "edit" : "confirm",
  );
  const [editReason, setEditReason] = useState<EditReason>(
    openInEditMode ? "fix" : "manual",
  );
  const [awaitingSenderDetails, setAwaitingSenderDetails] = useState(
    !senderSeed,
  );
  const [enteredMobile, setEnteredMobile] = useState(
    senderSeed?.parsed.mobile ?? "",
  );
  const [senderReplyMessage, setSenderReplyMessage] = useState(
    senderSeed?.line ?? "",
  );
  const [firstName, setFirstName] = useState(
    senderSeed?.parsed.firstName ?? "",
  );
  const [lastName, setLastName] = useState(senderSeed?.parsed.lastName ?? "");
  const [mobile, setMobile] = useState(senderSeed?.parsed.mobile ?? "");
  const [email, setEmail] = useState(senderSeed?.parsed.email ?? "");
  const [businessName, setBusinessName] = useState(
    senderSeed?.parsed.businessName ?? "",
  );
  const [manualFormReady, setManualFormReady] = useState(false);

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
    const known = lookupSenderByMobile(trimmed);
    const typedMobile = known?.mobile ?? formatMobile(trimmed);
    setEnteredMobile(typedMobile);
    setInput("");
    setAwaitingSenderDetails(false);
    if (known) {
      applyParsedSender(known);
      const line = [known.firstName, known.lastName, known.mobile, known.email]
        .filter(Boolean)
        .join(", ");
      setSenderReplyMessage(line);
      setView("confirm");
      return;
    }
    setFirstName("");
    setLastName("");
    setMobile(typedMobile);
    setEmail("");
    setBusinessName("");
    setSenderReplyMessage("");
    setEditReason("manual");
    setManualFormReady(false);
    setView("edit");
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
      if (editReason === "fix" && returnToReview) {
        onBack();
        return;
      }
      if (editReason === "manual") {
        setView("confirm");
        setAwaitingSenderDetails(true);
        setEnteredMobile("");
        return;
      }
      setView("confirm");
      return;
    }
    onBack();
  };

  const manualReady =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0;

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
                Will do. What&apos;s your mobile number?
              </BotBubble>
              {showFromConfirm ? (
                <>
                  <UserBubble>{enteredMobile}</UserBubble>
                  <BotReply>
                  <BotBubble immediate>
                    Here&apos;s what I&apos;ve got — look right?
                  </BotBubble>

                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
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
                          onClick={() => {
                            setEditReason("fix");
                            setView("edit");
                          }}
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
                        onClick={() => {
                          setEditReason("fix");
                          setView("edit");
                        }}
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
          ) : editReason === "manual" ? (
            <>
              <BotBubble>Will do. What&apos;s your mobile number?</BotBubble>
              <UserBubble>{enteredMobile}</UserBubble>
              <BotBubble bordered onReady={() => setManualFormReady(true)}>
                I don&apos;t have {enteredMobile} on file. Add your first name,
                last name and email.
              </BotBubble>

              {manualFormReady ? (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="space-y-4">
                  <FormField
                    label="First name"
                    value={firstName}
                    onChange={setFirstName}
                    highlighted={editReason === "manual" && !firstName.trim()}
                  />
                  <FormField
                    label="Last name"
                    value={lastName}
                    onChange={setLastName}
                    highlighted={editReason === "manual" && !lastName.trim()}
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
                    highlighted={editReason === "manual" && !email.trim()}
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
                  disabled={editReason === "manual" && !manualReady}
                  className="mt-6 w-full rounded-full py-3.5 text-base font-bold leading-none text-white transition active:scale-[0.99] disabled:opacity-45"
                  style={{ backgroundColor: PGO_ORANGE_BTN }}
                >
                  Save details
                </button>
              </div>
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
            : awaitingSenderDetails
              ? "Your mobile number..."
              : "Type or tap the mic..."
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
