"use client";

import { useState, type ReactNode } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";

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
  onLooksRight?: () => void;
}

export function ChatPayScreen({ onBack, onLooksRight }: Props) {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>("confirm");

  const [firstName, setFirstName] = useState("Sam");
  const [lastName, setLastName] = useState("Perera");
  const [mobile, setMobile] = useState("0423 556 789");
  const [email, setEmail] = useState("sam.perera@example.com");
  const [businessName, setBusinessName] = useState("");

  const saveDetails = () => setView("confirm");

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader activeStep="Pay" onBack={onBack} accentOrange={PGO_ORANGE} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {view === "confirm" ? (
            <>
              <UserBubble>Text her please</UserBubble>
              <BotBubble>
                Will do. Last thing — who&apos;s it from? Your first and last
                name, mobile and email. Sending for a business? Add the business
                name too.
              </BotBubble>
              <UserBubble>
                Sam Perera, 0423 556 789, sam.perera@example.com
              </UserBubble>
              <BotBubble>Here&apos;s what I&apos;ve got — look right?</BotBubble>

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
                <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <span className="text-sm text-neutral-500">
                    Business name (optional)
                  </span>
                  {businessName ? (
                    <span className="text-sm font-bold text-[#0B1B32]">
                      {businessName}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setView("edit")}
                      className="text-sm font-bold text-[#C44717]"
                    >
                      + Add
                    </button>
                  )}
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
                    onClick={() => setView("edit")}
                    className="rounded-full border border-neutral-300 bg-white py-2.5 text-sm font-bold text-[#0B1B32]"
                  >
                    Fix something
                  </button>
                </div>
              </div>

              <p className="text-center text-xs leading-snug text-neutral-500">
                Used only for this booking — your receipt, label and delivery
                updates.
              </p>
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
        accentOrange={PGO_ORANGE}
      />
    </div>
  );
}
