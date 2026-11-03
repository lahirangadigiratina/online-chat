"use client";

import { useState, type ReactNode } from "react";
import { ChatFlowHeader } from "./ChatFlowHeader";

const PGO_ORANGE = "#C44717";
const PGO_NAVY = "#0B1B32";

type PricePhase = "delivery" | "extras";
type DeliveryChoice = "door" | "parcelpoint";
type SignatureChoice = "yes" | "no";
type NotifyChoice = "text" | "email" | "none";

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] leading-snug text-white">
        {children}
      </div>
    </div>
  );
}

function BotBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-[1.25rem] rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-snug text-[#0B1B32] shadow-sm">
        {children}
      </div>
    </div>
  );
}

function CheckCircle() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C44717] text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function TagPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-medium text-[#0B1B32]">
      {children}
    </span>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v6c0 4.5-3.2 8.2-7 9-3.8-.8-7-4.5-7-9V6l7-3z"
        stroke="#2D7A4D"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="#2D7A4D"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <img
      src="/home-delivery-icon.png"
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 shrink-0 object-contain"
      aria-hidden
    />
  );
}

function MapPinIcon() {
  return (
    <img
      src="/parcelpoint-delivery-icon.png"
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 shrink-0 object-contain"
      aria-hidden
    />
  );
}

function SectionOption({
  selected,
  onClick,
  title,
  detail,
  price,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  detail?: string;
  price?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-start rounded-xl border px-3.5 py-3 text-left transition ${
        selected
          ? "border-[#C44717] bg-[#FFF8F4]"
          : "border-neutral-200 bg-white"
      }`}
    >
      <span className="text-[15px] font-bold text-[#0B1B32]">{title}</span>
      {detail ? (
        <span className="mt-0.5 text-xs text-neutral-500">{detail}</span>
      ) : null}
      {price ? (
        <span className="mt-1 text-sm font-semibold text-[#0B1B32]">{price}</span>
      ) : null}
    </button>
  );
}

interface Props {
  onBack: () => void;
  onContinue?: () => void;
}

export function ChatPriceScreen({ onBack, onContinue }: Props) {
  const [phase, setPhase] = useState<PricePhase>("delivery");
  const [input, setInput] = useState("");
  const [delivery, setDelivery] = useState<DeliveryChoice>("door");
  const [signature, setSignature] = useState<SignatureChoice>("yes");
  const [notify, setNotify] = useState<NotifyChoice>("text");

  const handleHeaderBack = () => {
    if (phase === "extras") setPhase("delivery");
    else onBack();
  };

  const confirmDelivery = () => {
    setPhase("extras");
  };

  const userDeliveryLine =
    delivery === "door" ? "Her door please." : "ParcelPoint near her please.";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep="Price"
        onBack={handleHeaderBack}
        accentOrange={PGO_ORANGE}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {phase === "delivery" ? (
            <>
              <BotBubble>
                A Medium is a flat rate anywhere in Australia. To her door, or to
                a ParcelPoint near her to collect?
              </BotBubble>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setDelivery("door")}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    delivery === "door"
                      ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                      : "border border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <HomeIcon />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-[#0B1B32]">
                        Deliver to Door
                      </span>
                      <span className="mt-0.5 block text-sm text-neutral-500">
                        Paddington 4064
                      </span>
                    </span>
                    <span className="text-[15px] font-bold text-[#0B1B32]">
                      $14.95
                    </span>
                    {delivery === "door" ? <CheckCircle /> : null}
                  </div>
                  {delivery === "door" ? (
                    <>
                      <p className="mt-3 rounded-xl bg-[#E8F0FA] px-3 py-2.5 text-[13px] leading-snug text-[#0B1B32]">
                        🏠 Straight to door · ATL or signature on delivery
                        available
                      </p>
                      <div className="mt-3 flex flex-col gap-1 border-t border-neutral-200/80 pt-3 text-[12px] leading-snug text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <span>18 Latrobe Tce, Paddington QLD 4064</span>
                        <span className="text-[#0B1B32]">
                          Delivered by{" "}
                          <span className="font-bold">Mon, 9 Nov</span>
                        </span>
                      </div>
                    </>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => setDelivery("parcelpoint")}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    delivery === "parcelpoint"
                      ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                      : "border border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MapPinIcon />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-[#0B1B32]">
                        Collect from PARCELPOINT
                      </span>
                      <span className="mt-0.5 block text-sm text-neutral-500">
                        She collects when she&apos;s ready
                      </span>
                    </span>
                    <span className="text-[15px] font-bold text-[#0B1B32]">
                      $9.95
                    </span>
                    {delivery === "parcelpoint" ? <CheckCircle /> : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <TagPill>✅ Held until collection</TagPill>
                    <TagPill>💰 Often lower cost</TagPill>
                    <TagPill>⏰ Hours that suit her</TagPill>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <UserBubble>{userDeliveryLine}</UserBubble>
              <BotBubble>
                Because the shoes are worth $180, they&apos;ll need Parcel
                Protection — <span className="font-bold">$4.95</span>.
              </BotBubble>

              <div className="flex items-center gap-3 rounded-2xl border-2 border-[#2D7A4D]/40 bg-[#F4FBF6] px-4 py-3.5">
                <ShieldIcon />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[#0B1B32]">
                    Parcel Protection · $180 cover
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-600">
                    Required for items over $100
                  </p>
                </div>
                <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                  $4.95
                </span>
              </div>

              <div>
                <p className="mb-2 text-[13px] font-semibold text-[#0B1B32]">
                  Signature on Delivery?
                </p>
                <div className="flex gap-2.5">
                  <SectionOption
                    selected={signature === "yes"}
                    onClick={() => setSignature("yes")}
                    title="Yes"
                    price="+$3.00"
                  />
                  <SectionOption
                    selected={signature === "no"}
                    onClick={() => setSignature("no")}
                    title="No"
                    detail="Leave safely"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-[13px] font-semibold text-[#0B1B32]">
                  Let Margaret know it&apos;s coming?
                </p>
                <div className="flex gap-2">
                  <SectionOption
                    selected={notify === "text"}
                    onClick={() => setNotify("text")}
                    title="Text"
                    detail="Free"
                  />
                  <SectionOption
                    selected={notify === "email"}
                    onClick={() => setNotify("email")}
                    title="Email"
                    detail="Free"
                  />
                  <SectionOption
                    selected={notify === "none"}
                    onClick={() => setNotify("none")}
                    title="No thanks"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
        <button
          type="button"
          onClick={() =>
            phase === "delivery" ? confirmDelivery() : onContinue?.()
          }
          className="mb-2.5 w-full rounded-full py-3.5 text-base font-bold text-white transition active:scale-[0.99]"
          style={{ backgroundColor: PGO_NAVY }}
        >
          Continue
        </button>
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              phase === "delivery"
                ? 'e.g. "her door please"'
                : 'e.g. "her door, with cover"'
            }
            aria-label="Message"
            className="min-w-0 flex-1 rounded-full bg-[#ECEEF2] px-5 py-3.5 text-[15px] text-[#0B1B32] outline-none placeholder:text-[#9CA3AF]"
          />
          <button
            type="button"
            aria-label="Voice input"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: PGO_ORANGE }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
              <path d="M19 11a7 7 0 0 1-14 0M12 18v3" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
