"use client";

import { useState, type ReactNode } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";

/** Mock palette for PGo chat screens */
const PGO_ORANGE = "#C44717";
const PGO_ORANGE_BTN = "#C44111";

interface Props {
  onBack: () => void;
  onLooksRight?: () => void;
  /** After drop-off selection vs typed welcome send */
  entry?: "dropOff" | "welcome";
}

type View = "confirm" | "edit";

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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  highlighted?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[13px] font-medium text-neutral-600">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] text-[#0B1B32] outline-none ${
          highlighted
            ? "border-2 border-[#E8651A]"
            : "border border-neutral-200 focus:border-[#E8651A] focus:ring-2 focus:ring-[#E8651A]/12"
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
}: Props) {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>("confirm");

  const [fullName, setFullName] = useState("Margaret Fernando");
  const [mobile, setMobile] = useState("0412 345 678");
  const [street, setStreet] = useState("18 Latrobe Tce");
  const [suburb, setSuburb] = useState("Paddington");
  const [state, setState] = useState("QLD");
  const [postcode, setPostcode] = useState("4064");

  const openEdit = () => setView("edit");
  const saveDetails = () => setView("confirm");

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader activeStep="Route" onBack={onBack} accentOrange={PGO_ORANGE} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {view === "confirm" ? (
            <>
              <BotBubble>
                {entry === "welcome"
                  ? "Happy to help! Who\u2019s receiving it? Tell me their name, mobile and address."
                  : "Church St Newsagent it is. Who\u2019s receiving it? Tell me their name, mobile and address."}
              </BotBubble>
              <UserBubble>
                It&apos;s for my mum, Margaret Fernando, 0412 345 678, 18
                Latrobe Terrace, Paddington in Brisbane
              </UserBubble>
              <BotBubble>
                Here&apos;s what I&apos;ve got — does it look right?
              </BotBubble>

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECEEF2] text-sm font-bold text-[#0B1B32]"
                  >
                    M
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-[#0B1B32]">
                      {fullName}
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
                    onClick={onLooksRight}
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
            </>
          ) : (
            <>
              <UserBubble>Fix something.</UserBubble>
              <BotBubble bordered>
                No worries — tap the bit that&apos;s wrong, or just tell me,
                like &apos;the number is 0413...&apos;.
              </BotBubble>

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="space-y-4">
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
            : "Type or tap the mic..."
        }
        accentOrange={PGO_ORANGE}
      />
    </div>
  );
}
