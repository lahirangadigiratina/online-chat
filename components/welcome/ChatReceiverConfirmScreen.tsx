"use client";

import { useState, type ReactNode } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";
import {
  parseReceiverDetailsFromMessage,
  type ChatMessage,
  type ParsedReceiverDetails,
} from "./chatThread";
import { ChatTranscript } from "./ChatTranscript";

/** Mock palette for PGo chat screens */
const PGO_ORANGE = "#C44717";

interface Props {
  onBack: () => void;
  onLooksRight?: (receiverDetailsMessage: string) => void;
  /** After drop-off selection vs typed welcome send */
  entry?: "dropOff" | "welcome";
  /** Text sent from welcome composer (prototype still shows parsed demo TO) */
  userMessage?: string;
  priorThread?: ChatMessage[];
  /** Voice stop lands on the filled receiver card instead of an empty prompt. */
  confirmedDetailsMessage?: string;
}

function ToDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="shrink-0 text-[15px] text-neutral-500">{label}</span>
      <span className="max-w-[58%] text-right text-[15px] font-bold leading-snug text-[#0B1B32]">
        {value}
      </span>
    </div>
  );
}

type View = "confirm" | "edit";
type EditReason = "fix" | "addBusiness";

function PencilIcon() {
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

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
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
      <span className="mb-1.5 block text-[13px] font-semibold text-[#0B1B32]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] text-[#0B1B32] outline-none placeholder:text-neutral-400 ${
          highlighted
            ? "border-2 border-[#C44717]"
            : "border border-neutral-200 focus:border-[#C44717] focus:ring-2 focus:ring-[#C44717]/12"
        }`}
      />
    </label>
  );
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

export function ChatReceiverConfirmScreen({
  onBack,
  onLooksRight,
  entry = "dropOff",
  userMessage,
  priorThread = [],
  confirmedDetailsMessage,
}: Props) {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>("confirm");
  const [editReason, setEditReason] = useState<EditReason>("fix");

  const seededDetails = confirmedDetailsMessage?.trim() ?? "";
  const defaultReceiver = parseReceiverDetailsFromMessage(seededDetails);
  const [firstName, setFirstName] = useState(defaultReceiver.firstName);
  const [lastName, setLastName] = useState(defaultReceiver.lastName);
  const [fullName, setFullName] = useState(
    `${defaultReceiver.firstName} ${defaultReceiver.lastName}`.trim(),
  );
  const [mobile, setMobile] = useState(defaultReceiver.mobile);
  const [email, setEmail] = useState(defaultReceiver.email);
  const [street, setStreet] = useState("18 Latrobe Tce");
  const [suburb, setSuburb] = useState("Paddington");
  const [state, setState] = useState("QLD");
  const [postcode, setPostcode] = useState("4064");
  const [addressLine, setAddressLine] = useState(defaultReceiver.addressLine);
  const [businessName, setBusinessName] = useState(
    defaultReceiver.businessName,
  );
  const [receiverReplyMessage, setReceiverReplyMessage] = useState(seededDetails);
  const [awaitingReceiverDetails, setAwaitingReceiverDetails] = useState(
    entry === "welcome" && !seededDetails,
  );

  const applyParsedReceiver = (parsed: ParsedReceiverDetails) => {
    setFirstName(parsed.firstName);
    setLastName(parsed.lastName);
    setFullName(`${parsed.firstName} ${parsed.lastName}`.trim());
    setMobile(parsed.mobile);
    setEmail(parsed.email);
    setAddressLine(parsed.addressLine);
    setBusinessName(parsed.businessName);
  };

  const displayName =
    entry === "welcome"
      ? `${firstName} ${lastName}`.trim()
      : fullName;
  const welcomeInitialMessage = userMessage?.trim() ?? "";

  const openEdit = () => {
    setEditReason("fix");
    setView("edit");
  };
  const openAddBusiness = () => {
    setEditReason("addBusiness");
    setView("edit");
  };
  const saveDetails = () => {
    if (entry === "welcome") {
      const line = [
        firstName && lastName ? `${firstName} ${lastName}` : "",
        mobile,
        email,
        addressLine,
        businessName.trim(),
      ]
        .filter(Boolean)
        .join(", ");
      if (line) setReceiverReplyMessage(line);
    }
    setView("confirm");
  };

  const handleHeaderBack = () => {
    if (view === "edit") setView("confirm");
    else onBack();
  };

  const submitReceiverDetails = () => {
    const trimmed = input.trim();
    if (!trimmed || !awaitingReceiverDetails) return;
    setReceiverReplyMessage(trimmed);
    applyParsedReceiver(parseReceiverDetailsFromMessage(trimmed));
    setInput("");
    setAwaitingReceiverDetails(false);
  };

  const showConfirmedThread = entry !== "welcome" || !awaitingReceiverDetails;

  const receiverPromptInThread = priorThread.some(
    (message) =>
      message.id === "welcome-receiver-prompt" ||
      message.id === "route-receiver-prompt",
  );
  const welcomeUserInThread = priorThread.some(
    (message) => message.id === "welcome-user",
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep="Route"
        onBack={handleHeaderBack}
        accentOrange={PGO_ORANGE}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <ChatTranscript messages={priorThread} />
          {entry === "welcome" &&
          welcomeInitialMessage &&
          !welcomeUserInThread ? (
            <UserBubble>{welcomeInitialMessage}</UserBubble>
          ) : null}
          {!receiverPromptInThread ? (
            <BotBubble>
              {entry === "welcome"
                ? "Happy to help! Who\u2019s receiving it? Their first and last name, mobile, email and address. If it\u2019s going to a business, add the business name too."
                : "Church St Newsagent it is. Who\u2019s receiving it? Tell me their name, mobile and address."}
            </BotBubble>
          ) : null}

          {showConfirmedThread ? (
            <>
              <UserBubble>
                {entry === "welcome"
                  ? receiverReplyMessage
                  : "It's for my mum, Margaret Fernando, 0412 345 678, 18 Latrobe Terrace, Paddington in Brisbane"}
              </UserBubble>
              <BotBubble>
                Here&apos;s what I&apos;ve got — does it look right?
              </BotBubble>
            </>
          ) : null}

          {view === "confirm" && showConfirmedThread && entry === "welcome" ? (
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                    To
                  </p>
                  <div className="mt-2">
                    <ToDetailRow label="First name" value={firstName} />
                    <ToDetailRow label="Last name" value={lastName} />
                    <ToDetailRow label="Mobile" value={mobile} />
                    <ToDetailRow label="Email" value={email} />
                    <ToDetailRow label="Address" value={addressLine} />
                    {businessName.trim() ? (
                      <ToDetailRow label="Business name" value={businessName} />
                    ) : null}
                  </div>
                  {!businessName.trim() ? (
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
                      <p className="text-[15px] text-neutral-500">
                        Business name (optional)
                      </p>
                      <button
                        type="button"
                        onClick={openAddBusiness}
                        className="shrink-0 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-[13px] font-bold text-[#0B1B32]"
                      >
                        + Add
                      </button>
                    </div>
                  ) : null}
                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        onLooksRight?.(receiverReplyMessage)
                      }
                      className="rounded-full py-3.5 text-[15px] font-bold text-white"
                      style={{ backgroundColor: PGO_ORANGE }}
                    >
                      Looks right
                    </button>
                    <button
                      type="button"
                      onClick={openEdit}
                      className="rounded-full border border-neutral-200 bg-white py-3.5 text-[15px] font-bold text-[#0B1B32]"
                    >
                      Fix something
                    </button>
                  </div>
                </div>
              ) : null}

          {view === "confirm" && showConfirmedThread && entry !== "welcome" ? (
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECEEF2] text-sm font-bold text-[#0B1B32]">
                      M
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-[#0B1B32]">
                        {displayName}
                      </p>
                      <p className="mt-0.5 text-sm text-neutral-500">{mobile}</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Edit receiver"
                      onClick={openEdit}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600"
                    >
                      <PencilIcon />
                    </button>
                  </div>
                  <div className="mt-4 flex items-start gap-2.5 border-t border-neutral-100 pt-4">
                    <span className="mt-0.5 shrink-0 text-neutral-400">
                      <HomeIcon />
                    </span>
                    <p className="text-sm leading-snug text-[#0B1B32]">
                      {street}, {suburb} {state} {postcode}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        onLooksRight?.(
                          "It's for my mum, Margaret Fernando, 0412 345 678, 18 Latrobe Terrace, Paddington in Brisbane",
                        )
                      }
                      className="rounded-full py-2.5 text-sm font-bold text-white"
                      style={{ backgroundColor: PGO_ORANGE }}
                    >
                      Looks right
                    </button>
                    <button
                      type="button"
                      onClick={openEdit}
                      className="rounded-full border border-neutral-300 bg-white py-2.5 text-sm font-bold text-[#0B1B32]"
                    >
                      Fix something
                    </button>
                  </div>
                </div>
              ) : null}

          {view === "edit" ? (
            <>
              {editReason === "fix" ? (
                <>
                  <UserBubble>Fix something.</UserBubble>
                  <BotBubble bordered>
                    No worries — tap the bit that&apos;s wrong, or just tell me,
                    like &apos;the number is 0413...&apos;.
                  </BotBubble>
                </>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
                <div className="space-y-4">
                  {entry === "welcome" ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
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
                      </div>
                      <FormField
                        label="Mobile"
                        value={mobile}
                        onChange={setMobile}
                        highlighted
                      />
                      <FormField
                        label="Email"
                        value={email}
                        onChange={setEmail}
                      />
                      <FormField
                        label="Address"
                        value={addressLine}
                        onChange={setAddressLine}
                      />
                      <FormField
                        label="Business name (optional)"
                        value={businessName}
                        onChange={setBusinessName}
                        placeholder="e.g. Fernando Florist"
                      />
                    </>
                  ) : (
                    <>
                      <FormField
                        label="Full name"
                        value={fullName}
                        onChange={setFullName}
                      />
                      <FormField
                        label="Mobile"
                        value={mobile}
                        onChange={setMobile}
                        highlighted
                      />
                      <FormField
                        label="Street address"
                        value={street}
                        onChange={setStreet}
                      />
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <FormField
                          label="Suburb"
                          value={suburb}
                          onChange={setSuburb}
                        />
                        <FormField
                          label="State"
                          value={state}
                          onChange={setState}
                        />
                        <FormField
                          label="Postcode"
                          value={postcode}
                          onChange={setPostcode}
                        />
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={saveDetails}
                  className="mt-6 w-full rounded-full py-3.5 text-base font-bold leading-none text-white transition active:scale-[0.99]"
                  style={{ backgroundColor: PGO_ORANGE }}
                >
                  Save details
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <ChatFlowFooter
        input={input}
        onInputChange={setInput}
        placeholder={
          view === "edit"
            ? "Or tell PGo what to change..."
            : awaitingReceiverDetails && entry === "welcome"
              ? "Name, mobile, email and address..."
              : "Type or tap the mic..."
        }
        onSubmitMessage={
          view === "confirm" && awaitingReceiverDetails && entry === "welcome"
            ? submitReceiverDetails
            : undefined
        }
        accentOrange={PGO_ORANGE}
      />
    </div>
  );
}
