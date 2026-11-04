"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  buildBookingSummaryFromThread,
  type ChatMessage,
} from "./chatThread";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";
import { BotReply, ChatTranscript } from "./ChatTranscript";
import { PaymentMethodSheet } from "./PaymentMethodSheet";

const PGO_ORANGE = "#C44717";

function BotBubble({ children }: { children: ReactNode }) {
  return (
    <BotReply>
      <div className="flex justify-start">
        <div className="max-w-[92%] rounded-[1.25rem] rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-snug text-[#0B1B32] shadow-sm">
          {children}
        </div>
      </div>
    </BotReply>
  );
}

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] font-bold leading-snug text-white">
        {children}
      </div>
    </div>
  );
}

function CircleMark({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: PGO_ORANGE }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12l4 4 10-10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-neutral-300" />
  );
}

interface Props {
  onBack: () => void;
  onBooked?: () => void;
  onBookedInStore?: () => void;
  priorThread?: ChatMessage[];
}

export function ChatPayConfirmScreen({
  onBack,
  onBooked,
  onBookedInStore,
  priorThread = [],
}: Props) {
  const [input, setInput] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const total = useMemo(
    () => buildBookingSummaryFromThread(priorThread).total,
    [priorThread],
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsStep, setTermsStep] = useState<"pending" | "agreed" | "declined">(
    "pending",
  );
  const [noDangerousAccepted, setNoDangerousAccepted] = useState(false);
  const [dangerousStep, setDangerousStep] = useState<
    "pending" | "confirmed" | "contains"
  >("pending");
  const [marketingStep, setMarketingStep] = useState<
    "pending" | "yes" | "no"
  >("pending");

  const showDangerousStep = termsStep === "agreed";
  const showMarketingStep =
    dangerousStep === "confirmed" && marketingStep === "pending";

  const dangerousGoodsCard = (locked: boolean) => (
    <div
      className={`flex w-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm ${
        locked ? "border-2 border-[#C44717]" : ""
      }`}
    >
      <CircleMark selected={locked || noDangerousAccepted} />
      <span className="min-w-0">
        <span className="block text-[15px] font-bold text-[#0B1B32]">
          No dangerous goods
        </span>
        <span className="mt-1 block text-sm leading-snug text-neutral-500">
          I confirm this parcel does not contain prohibited or dangerous goods.
        </span>
      </span>
    </div>
  );

  const completeMarketing = (choice: "yes" | "no") => {
    setMarketingStep(choice);
    setPaymentOpen(true);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader activeStep="Pay" onBack={onBack} accentOrange={PGO_ORANGE} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <ChatTranscript messages={priorThread} />
          <BotBubble>
            Before you pay, a few quick confirmations. First — do you agree to
            our terms?
          </BotBubble>

          {termsStep === "pending" ? (
            <button
              type="button"
              onClick={() => {
                setTermsAccepted((value) => !value);
              }}
              className={`flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                termsAccepted
                  ? "border-2 border-[#C44717]"
                  : "border border-neutral-200"
              }`}
            >
              <CircleMark selected={termsAccepted} />
              <span className="min-w-0 text-[15px] leading-snug text-[#0B1B32]">
                I agree to the{" "}
                <a
                  href="#terms"
                  className="font-semibold text-[#C44717] underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms &amp; Conditions
                </a>{" "}
                and{" "}
                <a
                  href="#privacy"
                  className="font-semibold text-[#C44717] underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
                .
              </span>
            </button>
          ) : (
            <div className="flex w-full items-start gap-3 rounded-2xl border-2 border-[#C44717] bg-white p-4 shadow-sm">
              <CircleMark selected />
              <span className="min-w-0 text-[15px] leading-snug text-[#0B1B32]">
                I agree to the{" "}
                <span className="font-semibold text-[#C44717] underline underline-offset-2">
                  Terms &amp; Conditions
                </span>{" "}
                and{" "}
                <span className="font-semibold text-[#C44717] underline underline-offset-2">
                  Privacy Policy
                </span>
                .
              </span>
            </div>
          )}

          {termsStep === "pending" ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={!termsAccepted}
                onClick={() => {
                  setTermsStep("agreed");
                  setTermsAccepted(true);
                }}
                className="rounded-full py-3 text-[15px] font-bold text-white transition enabled:active:scale-[0.99] disabled:opacity-45"
                style={{ backgroundColor: PGO_ORANGE }}
              >
                I agree
              </button>
              <button
                type="button"
                onClick={() => {
                  setTermsStep("declined");
                  setTermsAccepted(false);
                }}
                className="rounded-full border border-neutral-300 bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99]"
              >
                I don&apos;t agree
              </button>
            </div>
          ) : null}

          {termsStep === "declined" ? (
            <BotBubble>
              No problem — tap back if you want to review your booking, or tell
              me what&apos;s not right.
            </BotBubble>
          ) : null}

          {showDangerousStep ? (
            <>
              <UserBubble>✓ I agree</UserBubble>
              <BotBubble>
                Thanks! Next — can you confirm there&apos;s nothing dangerous
                inside?
              </BotBubble>

              {dangerousStep === "pending" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setNoDangerousAccepted((value) => !value)}
                    className={`flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                      noDangerousAccepted
                        ? "border-2 border-[#C44717]"
                        : "border border-neutral-200"
                    }`}
                  >
                    <CircleMark selected={noDangerousAccepted} />
                    <span className="min-w-0">
                      <span className="block text-[15px] font-bold text-[#0B1B32]">
                        No dangerous goods
                      </span>
                      <span className="mt-1 block text-sm leading-snug text-neutral-500">
                        I confirm this parcel does not contain prohibited or
                        dangerous goods.
                      </span>
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={!noDangerousAccepted}
                      onClick={() => {
                        setDangerousStep("confirmed");
                        setNoDangerousAccepted(true);
                      }}
                      className="rounded-full py-3 text-[15px] font-bold text-white transition enabled:active:scale-[0.99] disabled:opacity-45"
                      style={{ backgroundColor: PGO_ORANGE }}
                    >
                      I confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDangerousStep("contains");
                        setNoDangerousAccepted(false);
                      }}
                      className="rounded-full border border-[#C44717] bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99]"
                    >
                      It does contain some
                    </button>
                  </div>
                </>
              ) : null}

              {dangerousStep === "confirmed" ? (
                <>
                  {dangerousGoodsCard(true)}
                  <UserBubble>✓ I confirm</UserBubble>
                  <BotBubble>
                    Last one, and it&apos;s optional — would you like marketing
                    and promotional updates from PARCELPOINT?
                  </BotBubble>
                  {showMarketingStep ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => completeMarketing("yes")}
                        className="rounded-full py-3 text-[15px] font-bold text-white transition active:scale-[0.99]"
                        style={{ backgroundColor: PGO_ORANGE }}
                      >
                        Yes please
                      </button>
                      <button
                        type="button"
                        onClick={() => completeMarketing("no")}
                        className="rounded-full border border-neutral-300 bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99]"
                      >
                        No thanks
                      </button>
                    </div>
                  ) : null}
                  {marketingStep === "yes" ? (
                    <UserBubble>Yes please</UserBubble>
                  ) : null}
                  {marketingStep === "no" ? (
                    <UserBubble>No thanks</UserBubble>
                  ) : null}
                </>
              ) : null}

              {dangerousStep === "contains" ? (
                <BotBubble>
                  We can&apos;t send dangerous or prohibited goods through
                  ParcelPoint — tap back to change what&apos;s in the parcel, or
                  tell me what you&apos;re sending.
                </BotBubble>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <ChatFlowFooter
        input={input}
        onInputChange={setInput}
        placeholder="Type or tap the mic..."
        accentOrange={PGO_ORANGE}
      />

      <PaymentMethodSheet
        open={paymentOpen}
        total={total}
        onClose={() => setPaymentOpen(false)}
        onConfirm={(method) => {
          setPaymentOpen(false);
          if (method === "card") onBooked?.();
          else onBookedInStore?.();
        }}
      />
    </div>
  );
}
