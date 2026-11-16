"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ChatLocationScreen } from "./ChatLocationScreen";
import { ChatReceiverConfirmScreen } from "./ChatReceiverConfirmScreen";
import {
  buildWelcomeReceiverThread,
  lookupSenderByMobile,
  type ChatMessage,
  WELCOME_DEMO_USER_MESSAGE,
  withParcelIntro,
} from "./chatThread";
import { ChatRouteScreen } from "./ChatRouteScreen";
import { VoiceTalkScreen, VOICE_DEMO_TRANSCRIPT } from "./VoiceTalkScreen";
import type { AiBookingDemo, AiBookingStarter } from "@/lib/ai-booking-recommendations";

/** Placeholder — marketing to supply final QR / first-visit hook. */
const WELCOME_PARCEL_INTRO =
  "You're in the right place to send a parcel. Tell us what you're sending and we'll walk you through the rest.";

type AppScreen =
  | "welcome"
  | "voice"
  | "manual"
  | "manualSender"
  | "manualReceiver"
  | "manualContents"
  | "manualPrice"
  | "manualBooked"
  | "location"
  | "chat"
  | "receiver";

type ChatEntryPhase = "route" | "parcel";

function MicIcon() {
  return (
    <svg
      width="22"
      height="22"
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
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PromptIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.2 17.8 5 20.2V7.2A2.2 2.2 0 0 1 7.2 5h9.6A2.2 2.2 0 0 1 19 7.2v6.2a2.2 2.2 0 0 1-2.2 2.2H7.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 9.2h7M8.5 12.2h4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OptionCard({
  title,
  detail,
  icon,
  tone,
  recommended,
  onClick,
}: {
  title: string;
  detail: string;
  icon: ReactNode;
  tone: "voice" | "prompt" | "manual";
  recommended?: boolean;
  onClick: () => void;
}) {
  const toneClass = {
    voice: "bg-[#E4571A] text-white",
    prompt: "bg-[#FDE8DC] text-[#0B1B32]",
    manual: "bg-[#0E1726] text-white",
  }[tone];
  const iconClass = {
    voice: "bg-white/20 text-white",
    prompt: "bg-[#F6D0BC] text-[#0B1B32]",
    manual: "bg-white/10 text-white",
  }[tone];
  const arrowClass = {
    voice: "bg-white text-[#0B1B32]",
    prompt: "bg-[#0B1B32] text-white",
    manual: "bg-white text-[#0B1B32]",
  }[tone];
  const detailClass = {
    voice: "text-white/90",
    prompt: "text-[#5C6570]",
    manual: "text-white/75",
  }[tone];
  const recommendedBadgeClass = {
    voice: "text-[#E4571A]",
    prompt: "text-[#0B1B32]",
    manual: "text-[#E4571A]",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-[1.75rem] px-5 pb-5 pt-5 text-left transition active:scale-[0.99] ${toneClass}`}
    >
      <span className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full ${iconClass}`}
        >
          {icon}
        </span>
        {recommended ? (
          <span
            className={`rounded-full bg-white px-3 py-1 text-[11px] font-bold tracking-[0.08em] ${recommendedBadgeClass}`}
          >
            RECOMMENDED
          </span>
        ) : null}
      </span>
      <span className="mt-8 block pr-14">
        <span className="block text-[1.65rem] font-bold leading-none tracking-tight">
          {title}
        </span>
        <span className={`mt-2 block text-[15px] leading-snug ${detailClass}`}>
          {detail}
        </span>
      </span>
      <span
        className={`absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full ${arrowClass}`}
      >
        <ArrowIcon />
      </span>
    </button>
  );
}

function SendPlaneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9 22 2z" />
    </svg>
  );
}

export function WelcomeScreen() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [chatBackTarget, setChatBackTarget] = useState<"welcome" | "location">(
    "welcome",
  );
  const [chatEntryPhase, setChatEntryPhase] = useState<ChatEntryPhase>("route");
  const [chatMountKey, setChatMountKey] = useState(0);
  const [lastSentMessage, setLastSentMessage] = useState("");
  const [chatInitialThread, setChatInitialThread] = useState<ChatMessage[]>(
    [],
  );
  const [receiverSeed, setReceiverSeed] = useState<"compose" | "voice">(
    "compose",
  );
  const [manualSize, setManualSize] = useState<string | null>(null);
  const [manualPackaging, setManualPackaging] = useState<"yes" | "no" | null>(
    null,
  );
  const [manualAddressQuery, setManualAddressQuery] = useState("");
  const [addressMenuOpen, setAddressMenuOpen] = useState(false);
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderBusiness, setSenderBusiness] = useState("");
  const [senderFirst, setSenderFirst] = useState("");
  const [senderLast, setSenderLast] = useState("");
  const [senderAutofilled, setSenderAutofilled] = useState(false);
  const [receiverBusiness, setReceiverBusiness] = useState("");
  const [receiverFirst, setReceiverFirst] = useState("");
  const [receiverLast, setReceiverLast] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [receiverSkipNotify, setReceiverSkipNotify] = useState(false);
  const [contentsCategory, setContentsCategory] = useState("clothing");
  const [contentsMenuOpen, setContentsMenuOpen] = useState(false);
  const [parcelValue, setParcelValue] = useState("");
  const [signatureOn, setSignatureOn] = useState(false);
  const [protectionOn, setProtectionOn] = useState(false);
  const [noDangerousGoods, setNoDangerousGoods] = useState(false);
  const [prohibitedOpen, setProhibitedOpen] = useState(false);
  const [protectionConditionsOpen, setProtectionConditionsOpen] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [trackingCopied, setTrackingCopied] = useState(false);
  const [manualDelivery, setManualDelivery] = useState<
    "door" | "parcelpoint" | null
  >(null);
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const [storeQuery, setStoreQuery] = useState("");
  const [storeRadius, setStoreRadius] = useState(2);
  const [savedStoreId, setSavedStoreId] = useState("westfield");
  const [collectionStoreId, setCollectionStoreId] = useState<string | null>(null);
  const openAiBooking = (opts?: {
    demo?: AiBookingDemo | null;
    starter?: AiBookingStarter;
  }) => {
    const params = new URLSearchParams();
    if (opts?.demo) params.set("demo", opts.demo);
    if (opts?.starter) params.set("starter", opts.starter);
    const query = params.toString();
    router.push(query ? `/ai-booking?${query}` : "/ai-booking");
  };

  const openChat = (
    phase: ChatEntryPhase,
    initialThread: ChatMessage[] = [],
  ) => {
    setChatEntryPhase(phase);
    setChatInitialThread(initialThread);
    setChatMountKey((k) => k + 1);
    setScreen("chat");
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLastSentMessage(trimmed);
    setReceiverSeed("compose");
    setText("");
    setScreen("receiver");
  };

  if (screen === "voice") {
    return (
      <VoiceTalkScreen
        onClose={() => setScreen("welcome")}
        onOpenChat={() => {
          setChatBackTarget("welcome");
          openChat("route");
        }}
        onStop={() => {
          const params = new URLSearchParams();
          params.set("message", VOICE_DEMO_TRANSCRIPT);
          router.push(`/ai-booking?${params.toString()}`);
        }}
      />
    );
  }

  if (screen === "location") {
    return (
      <ChatLocationScreen
        onBack={() => setScreen("welcome")}
        onContinue={() => {
          setChatBackTarget("location");
          openChat("route");
        }}
      />
    );
  }

  if (screen === "receiver") {
    const fromVoice = receiverSeed === "voice";
    return (
      <ChatReceiverConfirmScreen
        entry="welcome"
        userMessage={fromVoice ? undefined : lastSentMessage}
        confirmedDetailsMessage={
          fromVoice ? WELCOME_DEMO_USER_MESSAGE : undefined
        }
        priorThread={
          !fromVoice && lastSentMessage.trim()
            ? [
                {
                  id: "welcome-user",
                  role: "user",
                  content: lastSentMessage.trim(),
                },
              ]
            : []
        }
        onBack={() => setScreen(fromVoice ? "voice" : "welcome")}
        onLooksRight={(receiverDetailsMessage) => {
          setChatBackTarget("welcome");
          openChat(
            "parcel",
            withParcelIntro(
              buildWelcomeReceiverThread(
                lastSentMessage,
                receiverDetailsMessage,
              ),
            ),
          );
        }}
      />
    );
  }

  if (screen === "chat") {
    return (
      <ChatRouteScreen
        key={chatMountKey}
        initialPhase={chatEntryPhase}
        initialThread={chatInitialThread}
        onBack={() => setScreen(chatBackTarget)}
        onFinished={() => setScreen("welcome")}
      />
    );
  }

  if (screen === "manual") {
    const addressQuery = manualAddressQuery.trim().toLowerCase();
    const addressMatches = addressQuery
      ? MANUAL_ADDRESSES.filter((address) =>
          address.toLowerCase().includes(addressQuery),
        )
      : [];
    const collectionStore =
      COLLECT_STORES.find((store) => store.id === collectionStoreId) ?? null;

    return (
      <div className="relative flex h-full min-h-0 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B1B32] text-[13px] font-bold text-white">
              1
            </span>
            <h1 className="text-[22px] font-bold tracking-tight text-[#0B1B32]">
              Parcel Details
            </h1>
          </div>
          <p className="mt-2 text-[14px] leading-snug text-neutral-500">
            Size, packaging, receiver address, and door delivery.
          </p>

          <p className="mb-2.5 mt-5 text-[15px] font-bold text-[#0B1B32]">
            Size <span className="text-[#E4571A]">*</span>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {MANUAL_SIZES.map((size) => {
              const selected = manualSize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => {
                    setManualSize(size.id);
                    if (size.id === "carryon") setManualPackaging(null);
                  }}
                  className={`relative flex flex-col items-center rounded-xl border px-1 pb-3 pt-3 text-center transition ${
                    selected
                      ? "border-2 border-[#E4571A] bg-[#FFF3EC]"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  {selected ? (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E4571A] text-white">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M5 12.5 9.2 17 19 7"
                          stroke="currentColor"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : null}
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 ${
                      selected ? "bg-white" : "bg-[#F7F8FA]"
                    }`}
                  >
                    <SizeGlyph kind={size.icon} color={selected ? "#E4571A" : "#0B1B32"} />
                  </span>
                  <span className="mt-2 text-[13px] font-bold leading-tight text-[#0B1B32]">
                    {size.label}
                  </span>
                  <span className="mt-0.5 text-[11px] leading-tight text-neutral-400">
                    Up to <span className="font-bold text-[#4B5563]">{size.weight}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {manualSize === "carryon" ? null : (
            <>
              <p className="mb-2.5 mt-5 text-[15px] font-bold leading-snug text-[#0B1B32]">
                Does the customer need packaging?{" "}
                <span className="text-[#E4571A]">*</span>{" "}
                <span className="font-medium text-neutral-500">(Adds $2.00)</span>
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {(["yes", "no"] as const).map((choice) => {
                  const selected = manualPackaging === choice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setManualPackaging(choice)}
                      className={`rounded-xl border py-3 text-[15px] font-medium text-[#0B1B32] transition ${
                        selected
                          ? "border-2 border-[#E4571A] bg-[#FFF3EC]"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                      {choice === "yes" ? "Yes" : "No"}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <p className="mb-2.5 mt-5 text-[15px] font-bold text-[#0B1B32]">
            Receiver Address
          </p>
          <div className="relative">
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-3">
              <SearchIcon />
              <input
                type="text"
                value={manualAddressQuery}
                onChange={(event) => {
                  setManualAddressQuery(event.target.value);
                  setAddressMenuOpen(event.target.value.trim().length > 0);
                }}
                placeholder="Search address"
                aria-label="Search address"
                aria-expanded={addressMenuOpen}
                aria-autocomplete="list"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#0B1B32] outline-none placeholder:text-neutral-400"
              />
            </label>
            {addressMenuOpen ? (
              <div
                role="listbox"
                aria-label="Matching addresses"
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-52 overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
              >
                {addressMatches.length > 0 ? (
                  addressMatches.map((address) => (
                    <button
                      key={address}
                      type="button"
                      role="option"
                      onClick={() => {
                        setManualAddressQuery(address);
                        setAddressMenuOpen(false);
                      }}
                      className="block w-full px-3.5 py-2.5 text-left text-[15px] leading-snug text-[#0B1B32] hover:bg-[#F7F8FA]"
                    >
                      {address}
                    </button>
                  ))
                ) : (
                  <p className="px-3.5 py-2.5 text-[14px] text-neutral-500">
                    No matching addresses
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setManualDelivery("door")}
            className={`mt-3 w-full rounded-xl border p-3.5 text-left transition ${
              manualDelivery === "door"
                ? "border-2 border-[#E4571A] bg-[#FFF3EC]"
                : "border-neutral-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[22px] leading-none">
                <span aria-hidden>🏠</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-[#0B1B32]">
                  Deliver to Door
                </span>
                <span className="mt-0.5 block text-[13px] text-neutral-500">
                  Bondi Junction 2022
                </span>
              </span>
              <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                $11.50
              </span>
            </div>
            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${
                manualDelivery === "door"
                  ? "bg-white text-[#3F4A5A]"
                  : "bg-[#F3F4F6] text-neutral-600"
              }`}
            >
              <span className="text-[13px] leading-none" aria-hidden>
                🏠
              </span>
              Straight to door - ATL delivery
            </span>
            <div className="mt-3 flex items-start justify-between gap-3 text-[13px] leading-snug text-neutral-600">
              <span>25 Spring St, Bondi Junction NSW 2022</span>
              <span className="shrink-0 text-right text-[#0B1B32]">
                Delivered by <span className="font-bold">Mon, 12 Oct</span>
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setManualDelivery("parcelpoint");
              setStorePickerOpen(true);
            }}
            className={`mt-3 w-full rounded-xl border p-3.5 text-left transition ${
              manualDelivery === "parcelpoint"
                ? "border-2 border-[#E4571A] bg-[#FFF3EC]"
                : "border-neutral-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center bg-white text-[22px] leading-none ${
                  collectionStoreId
                    ? "rounded-full"
                    : "rounded-xl border border-neutral-200"
                }`}
              >
                <span aria-hidden>📍</span>
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="block text-[15px] font-bold text-[#0B1B32]">
                  Collect from PARCELPOINT
                </span>
                <span className="mt-0.5 block text-[13px] text-neutral-500">
                  They collect when they&apos;re ready
                </span>
              </span>
              <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                $9.95
              </span>
            </div>
            {collectionStore ? (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#FDE8DC] px-2.5 py-1 text-[12px] font-medium text-[#0B1B32]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#E4571A" aria-hidden>
                  <path d="M12 2.2a6.2 6.2 0 0 0-6.2 6.2c0 4.6 6.2 12.4 6.2 12.4s6.2-7.8 6.2-12.4A6.2 6.2 0 0 0 12 2.2Zm0 8.3a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Z" />
                </svg>
                {collectionStore.name} · {storeSuburb(collectionStore.address)}
              </span>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Held until collection",
                "Often lower cost",
                "Hours that suit them",
              ].map((label) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${
                    manualDelivery === "parcelpoint"
                      ? "border border-neutral-200 bg-white text-[#3F4A5A]"
                      : "bg-[#F3F4F6] text-neutral-600"
                  }`}
                >
                  {label === "Held until collection" ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-[#DCFCE7] text-[#16A34A]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M5 12.5 9.2 17 19 7"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : null}
                  {label === "Often lower cost" ? <span aria-hidden>💰</span> : null}
                  {label === "Hours that suit them" ? <span aria-hidden>⏰</span> : null}
                  {label}
                </span>
              ))}
            </div>
            {collectionStore ? (
              <>
                <div className="mt-3 flex items-start justify-between gap-3 text-[13px] leading-snug text-neutral-600">
                  <span>{collectionStore.address}</span>
                  <span className="shrink-0 text-right text-[#0B1B32]">
                    Delivered by <span className="font-bold">Thu, 19 Nov</span>
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-neutral-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M12 8v4.2l2.6 1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  {storeHoursLabel(collectionStore.hours)}
                  <span className="font-semibold text-[#16A34A]">Open now</span>
                </p>
              </>
            ) : null}
          </button>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setScreen("welcome")}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-[15px] font-medium text-[#0B1B32]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setScreen("manualSender")}
            className="rounded-lg bg-brand-black px-6 py-2.5 text-[15px] font-medium text-white"
          >
            Next
          </button>
        </footer>
        {storePickerOpen ? (
          <CollectStorePicker
            query={storeQuery}
            onQueryChange={setStoreQuery}
            radius={storeRadius}
            onRadiusChange={setStoreRadius}
            savedId={savedStoreId}
            onToggleSave={(id) =>
              setSavedStoreId((current) => (current === id ? "" : id))
            }
            initialStoreId={collectionStoreId}
            onConfirm={(id) => {
              setCollectionStoreId(id);
              setStorePickerOpen(false);
            }}
            onClose={() => setStorePickerOpen(false)}
          />
        ) : null}
      </div>
    );
  }

  if (screen === "manualSender") {
    const updateSenderPhone = (value: string) => {
      const rest = mobileRestDigits(value);
      setSenderPhone(formatMobileRest(rest));
      const normalized = `04${rest}`;
      const known = lookupSenderByMobile(normalized);
      if (known) {
        setSenderEmail(known.email);
        setSenderFirst(known.firstName);
        setSenderLast(known.lastName);
        setSenderAutofilled(true);
        return;
      }
      if (senderAutofilled) {
        setSenderEmail("");
        setSenderFirst("");
        setSenderLast("");
        setSenderAutofilled(false);
      }
    };

    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B1B32] text-[13px] font-bold text-white">
              2
            </span>
            <h1 className="text-[22px] font-bold tracking-tight text-[#0B1B32]">
              Sender Details
            </h1>
          </div>
          <p className="mt-2 border-b border-neutral-200 pb-4 text-[14px] leading-snug text-neutral-500">
            Enter the sender&apos;s mobile first. If we recognize the number,
            we&apos;ll fill in their details.
          </p>

          <div className="mt-5 space-y-5">
            <label className="block min-w-0">
              <span className="mb-2 block text-[15px] font-bold text-[#0B1B32]">
                Phone Number <span className="text-[#E4571A]">*</span>
              </span>
              <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-3 focus-within:border-[#0B1B32]">
                <span className="shrink-0 text-[15px] text-[#0B1B32]">+61 4</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={senderPhone}
                  onChange={(event) => updateSenderPhone(event.target.value)}
                  placeholder="12 345 678"
                  aria-label="Phone Number"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-[#0B1B32] outline-none placeholder:text-neutral-400"
                />
              </div>
            </label>
            <ManualInput
              label="Email"
              required
              value={senderEmail}
              onChange={setSenderEmail}
              placeholder="jane@example.com"
            />
            <ManualInput
              label="Business Name (optional)"
              value={senderBusiness}
              onChange={setSenderBusiness}
              placeholder="Hubbed"
            />
            <ManualInput
              label="First Name"
              required
              value={senderFirst}
              onChange={setSenderFirst}
              placeholder="Jane"
            />
            <ManualInput
              label="Last Name"
              required
              value={senderLast}
              onChange={setSenderLast}
              placeholder="Smith"
            />
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setScreen("manual")}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-[15px] font-medium text-[#0B1B32]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setScreen("manualReceiver")}
            className="rounded-lg bg-brand-black px-6 py-2.5 text-[15px] font-medium text-white"
          >
            Next
          </button>
        </footer>
      </div>
    );
  }

  if (screen === "manualReceiver") {
    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B1B32] text-[13px] font-bold text-white">
              3
            </span>
            <h1 className="text-[22px] font-bold tracking-tight text-[#0B1B32]">
              Receiver Details
            </h1>
          </div>
          <p className="mt-2 border-b border-neutral-200 pb-4 text-[14px] leading-snug text-neutral-500">
            Enter who will receive the parcel and how to reach them.
          </p>

          <div className="mt-5 space-y-5">
            <ManualInput
              label="Business Name (optional)"
              value={receiverBusiness}
              onChange={setReceiverBusiness}
              placeholder="Jane's Bookstore"
            />
            <ManualInput
              label="First Name"
              required
              value={receiverFirst}
              onChange={setReceiverFirst}
              placeholder="Jane"
            />
            <ManualInput
              label="Last Name"
              required
              value={receiverLast}
              onChange={setReceiverLast}
              placeholder="Smith"
            />
            <ManualInput
              label="Email"
              required
              value={receiverEmail}
              onChange={setReceiverEmail}
              placeholder="jane@ex.com"
            />
            <ManualInput
              label="Mobile"
              required
              value={receiverMobile}
              onChange={setReceiverMobile}
              placeholder="0412 345 678"
            />
            <label className="flex items-center gap-2.5 text-[14px] text-neutral-600">
              <input
                type="checkbox"
                checked={receiverSkipNotify}
                onChange={(event) => setReceiverSkipNotify(event.target.checked)}
                className="checkbox-orange h-4 w-4 rounded border-neutral-300"
              />
              Don&apos;t notify the receiver (sender&apos;s choice)
            </label>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setScreen("manualSender")}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-[15px] font-medium text-[#0B1B32]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setScreen("manualContents")}
            className="rounded-lg bg-brand-black px-6 py-2.5 text-[15px] font-medium text-white"
          >
            Next
          </button>
        </footer>
      </div>
    );
  }

  if (screen === "manualContents") {
    const addonsEnabled = Number(parcelValue) > 0;
    const selectedCategory =
      CONTENTS_CATEGORIES.find((category) => category.id === contentsCategory) ??
      CONTENTS_CATEGORIES[0];

    const updateParcelValue = (value: string) => {
      const cleaned = value.replace(/[^\d.]/g, "");
      const [whole, ...rest] = cleaned.split(".");
      const next =
        rest.length > 0 ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
      setParcelValue(next);
      const amount = Number(next);
      if (!(amount > 0)) {
        setSignatureOn(false);
        setProtectionOn(false);
      } else if (amount <= 100) {
        setProtectionOn(false);
      }
    };

    return (
      <div className="relative flex h-full min-h-0 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0B1B32] text-[13px] font-bold text-white">
              4
            </span>
            <h1 className="text-[22px] font-bold tracking-tight text-[#0B1B32]">
              Contents &amp; Add-ons
            </h1>
          </div>
          <p className="mt-2 border-b border-neutral-200 pb-4 text-[14px] leading-snug text-neutral-500">
            Describe what is inside the parcel and its value, offer optional
            add-ons, and confirm dangerous goods rules.
          </p>

          <div className="mt-5 space-y-5">
            <div className="block">
              <span className="mb-2 block text-[15px] font-bold text-[#0B1B32]">
                What&apos;s Inside?
              </span>
              <div className="relative">
                {contentsMenuOpen ? (
                  <button
                    type="button"
                    aria-label="Close contents list"
                    onClick={() => setContentsMenuOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                ) : null}
                <button
                  type="button"
                  aria-label="What's Inside?"
                  aria-expanded={contentsMenuOpen}
                  onClick={() => setContentsMenuOpen((open) => !open)}
                  className={`relative z-20 flex w-full items-center gap-2.5 rounded-xl border bg-white px-3.5 py-3 text-left text-[15px] font-medium text-[#0B1B32] ${
                    contentsMenuOpen
                      ? "border-[#8EA0FF] ring-2 ring-[#E6EAFF]"
                      : "border-neutral-200"
                  }`}
                >
                  <span className="flex w-5 shrink-0 items-center justify-center">
                    {selectedCategory.icon}
                  </span>
                  <span className="min-w-0 flex-1">{selectedCategory.label}</span>
                  <span
                    className={`text-neutral-500 transition ${contentsMenuOpen ? "rotate-180" : ""}`}
                  >
                    <ChevronDownIcon />
                  </span>
                </button>
                {contentsMenuOpen ? (
                  <div
                    role="listbox"
                    aria-label="What's Inside?"
                    className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
                  >
                    {CONTENTS_CATEGORIES.map((category) => {
                      const selected = category.id === contentsCategory;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            setContentsCategory(category.id);
                            setContentsMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[15px] text-[#0B1B32] ${
                            selected ? "bg-[#FFF1E8]" : "hover:bg-[#F7F8FA]"
                          }`}
                        >
                          <span className="flex w-5 shrink-0 items-center justify-center">
                            {category.icon}
                          </span>
                          <span className="min-w-0 flex-1">{category.label}</span>
                          {selected ? <CheckIcon /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-[15px] font-bold text-[#0B1B32]">
                Parcel Value ($) <span className="text-[#E4571A]">*</span>
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={parcelValue}
                onChange={(event) => updateParcelValue(event.target.value)}
                aria-label="Parcel Value ($)"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-[15px] text-[#0B1B32] outline-none focus:border-[#0B1B32]"
              />
            </label>

            <div className="space-y-3">
              {addonsEnabled ? (
                <SignatureCard
                  selected={signatureOn}
                  onToggle={() => setSignatureOn((on) => !on)}
                />
              ) : (
                <AddonCard
                  title="Signature on Delivery"
                  price="$3.50"
                  icon={<PenIcon />}
                  enabled={false}
                  selected={false}
                  onClick={() => {}}
                />
              )}
              {addonsEnabled && Number(parcelValue) <= 100 ? (
                <IncludedProtectionCard
                  value={parcelValue}
                  onConditions={() => setProtectionConditionsOpen(true)}
                />
              ) : addonsEnabled ? (
                <PaidProtectionCard
                  value={parcelValue}
                  selected={protectionOn}
                  onToggle={() => setProtectionOn((on) => !on)}
                  onConditions={() => setProtectionConditionsOpen(true)}
                />
              ) : (
                <AddonCard
                  title="Parcel Protection"
                  price="$4.95"
                  icon={<ShieldIcon />}
                  enabled={false}
                  selected={false}
                  onClick={() => {}}
                />
              )}
            </div>

            <div className="rounded-xl border border-neutral-200 px-3.5 py-3.5">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={noDangerousGoods}
                  onChange={(event) => setNoDangerousGoods(event.target.checked)}
                  className="checkbox-orange mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300"
                />
                <span className="text-[15px] font-bold leading-snug text-[#0B1B32]">
                  The sender confirms this parcel contains no dangerous or
                  prohibited goods <span className="text-[#E4571A]">*</span>
                </span>
              </label>
              <button
                type="button"
                onClick={() => setProhibitedOpen(true)}
                className="mt-2 pl-7 text-left text-[14px] font-semibold text-[#E4571A]"
              >
                See What Cannot Be Sent
              </button>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setScreen("manualReceiver")}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-[15px] font-medium text-[#0B1B32]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setScreen("manualPrice")}
            className="rounded-lg bg-brand-black px-6 py-2.5 text-[15px] font-medium text-white"
          >
            Next
          </button>
        </footer>
        {prohibitedOpen ? (
          <ProhibitedGoodsDialog onClose={() => setProhibitedOpen(false)} />
        ) : null}
        {protectionConditionsOpen ? (
          <ProtectionConditionsDialog
            onClose={() => setProtectionConditionsOpen(false)}
          />
        ) : null}
      </div>
    );
  }

  if (screen === "manualPrice") {
    const deliveryAmount = manualDelivery === "parcelpoint" ? 9.95 : 11.5;
    const signatureAmount = signatureOn ? 3.5 : 0;
    const declaredValue = Number(parcelValue);
    const protectionAmount =
      declaredValue > 100 && protectionOn
        ? Math.round((declaredValue - 100) * 0.025 * 100) / 100
        : 0;
    const totalAmount =
      Math.round((deliveryAmount + signatureAmount + protectionAmount) * 100) / 100;
    const totalLabel = formatManualMoney(totalAmount);

    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#0B1B32] text-[#0B1B32]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12.5 9.2 17 19 7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h1 className="text-[22px] font-bold tracking-tight text-[#0B1B32]">
              Price Breakdown
            </h1>
          </div>

          <div className="mt-6 space-y-3.5">
            <PriceLine label="Delivery" amount={formatManualMoney(deliveryAmount)} />
            <PriceLine
              label="Signature on Delivery"
              amount={formatManualMoney(signatureAmount)}
            />
            <PriceLine
              label="Parcel Protection"
              amount={formatManualMoney(protectionAmount)}
            />
            <div className="border-t border-neutral-200 pt-3.5">
              <PriceLine label="Total" amount={totalLabel} strong />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-neutral-200 px-4 py-4">
            <p className="text-[15px] font-bold text-[#0B1B32]">Payment required</p>
            <p className="mt-1.5 text-[13px] leading-snug text-neutral-500">
              Collect {totalLabel} from the customer through cash. This booking
              cannot be completed until payment is confirmed.
            </p>
            <label className="mt-3 flex items-center gap-2.5 rounded-lg bg-[#F7F8FA] px-3 py-3 text-[14px] font-semibold text-[#0B1B32]">
              <input
                type="checkbox"
                checked={paymentReceived}
                onChange={(event) => setPaymentReceived(event.target.checked)}
                className="checkbox-orange h-4 w-4 rounded border-neutral-300"
              />
              Payment of {totalLabel} received
            </label>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setScreen("manualContents")}
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-[15px] font-medium text-[#0B1B32]"
          >
            Back
          </button>
          <button
            type="button"
            disabled={!paymentReceived}
            onClick={() => setScreen("manualBooked")}
            className="rounded-lg bg-brand-black px-6 py-2.5 text-[15px] font-medium text-white disabled:bg-[#4B5563] disabled:opacity-45"
          >
            Complete
          </button>
        </footer>
      </div>
    );
  }

  if (screen === "manualBooked") {
    const deliveryAmount = manualDelivery === "parcelpoint" ? 9.95 : 11.5;
    const signatureAmount = signatureOn ? 3.5 : 0;
    const declaredValue = Number(parcelValue);
    const protectionAmount =
      declaredValue > 100 && protectionOn
        ? Math.round((declaredValue - 100) * 0.025 * 100) / 100
        : 0;
    const totalAmount =
      Math.round((deliveryAmount + signatureAmount + protectionAmount) * 100) / 100;
    const totalLabel = formatManualMoney(totalAmount);
    const collectionPoint =
      COLLECT_STORES.find((store) => store.id === collectionStoreId) ?? null;
    const dropoff =
      manualDelivery === "parcelpoint"
        ? collectionPoint
          ? `${storeSuburb(collectionPoint.address)} — ${collectionPoint.address.split(",")[0]}`
          : "Bondi Junction — 30 Oxford St"
        : "Bondi Junction — 25 Spring St";
    const bookedSize = MANUAL_SIZES.find((size) => size.id === manualSize);
    const sizeLine = bookedSize
      ? `${bookedSize.label} · ${bookedSize.limit.replace("Up to ", "")}`
      : null;

    const copyTracking = async () => {
      let copied = false;
      try {
        await navigator.clipboard.writeText(MANUAL_TRACKING);
        copied = true;
      } catch {
        const field = document.createElement("textarea");
        field.value = MANUAL_TRACKING;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.left = "-9999px";
        document.body.appendChild(field);
        field.select();
        copied = document.execCommand("copy");
        field.remove();
      }
      if (!copied) return;
      setTrackingCopied(true);
      window.setTimeout(() => setTrackingCopied(false), 1500);
    };

    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-10 text-center sm:px-5">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E] text-white">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 12.5 10 16.5 18 8"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h1 className="mt-4 text-[26px] font-bold tracking-tight text-[#0B1B32]">
            All Booked!
          </h1>
          <p className="mt-2 text-[14px] text-neutral-500">
            Payment received — shipment is booked
          </p>
          <p className="mt-1 text-[14px] text-neutral-500">
            Digital Receipt has been sent to the Customer
          </p>
          <p className="mt-4 text-[16px] font-bold text-[#0B1B32]">
            1 shipment confirmed · {totalLabel}
          </p>

          <div className="mt-4 rounded-xl border border-neutral-200 text-left">
            <div className="flex items-center gap-3 px-3.5 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF4EC] text-[#E4571A]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4.5 8.5 12 5l7.5 3.5L12 12 4.5 8.5Zm0 0V16L12 19.5 19.5 16V8.5M12 12v7.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-[#0B1B32]">
                  {dropoff}
                </span>
                {sizeLine ? (
                  <span className="mt-0.5 block text-[13px] text-neutral-500">
                    {sizeLine}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                {totalLabel}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-3.5 py-3 text-[14px]">
              <span className="text-neutral-500">Booking Ref</span>
              <span className="font-semibold text-[#0B1B32]">{MANUAL_BOOKING_REF}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-3.5 py-3 text-[14px]">
              <span className="text-neutral-500">Tracking</span>
              <span className="flex items-center gap-2 font-semibold text-[#0B1B32]">
                {MANUAL_TRACKING}
                <button
                  type="button"
                  aria-label={trackingCopied ? "Tracking copied" : "Copy tracking number"}
                  onClick={copyTracking}
                  className="text-neutral-500"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect
                      x="8"
                      y="8"
                      width="11"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </button>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-3 text-[15px] font-semibold text-[#0B1B32]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M7 8V3.5h10V8M7 17H5.5A1.5 1.5 0 0 1 4 15.5v-5A1.5 1.5 0 0 1 5.5 9h13A1.5 1.5 0 0 1 20 10.5v5a1.5 1.5 0 0 1-1.5 1.5H17"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M7 14h10v6.5H7V14Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
            Print Label
          </button>
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-[#E4571A] py-3.5 text-[16px] font-bold text-white"
          >
            Proceed to Dropoff
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <header className="shrink-0 px-6 pb-4 pt-10 sm:px-8 sm:pt-12">
        <div className="flex justify-start">
          <Image
            src="/parcelpoint-compose-brand-transparent.png"
            alt="PARCELPOINT Go"
            width={1024}
            height={252}
            priority
            unoptimized
            className="h-[2.35rem] w-auto max-w-[min(17.5rem,88vw)] object-contain object-left"
          />
        </div>
        <h1 className="mt-5 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#0B1B32] sm:text-[2rem]">
          Hi, I&apos;m PPGo
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-snug text-[#5C6570] sm:text-[16px]">
          {WELCOME_PARCEL_INTRO}
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-8 sm:px-5">
        <OptionCard
          tone="prompt"
          recommended
          title="Chat with me"
          detail="Tell me what you're sending — I'll help you"
          icon={<PromptIcon />}
          onClick={() => openAiBooking()}
        />
        <OptionCard
          tone="voice"
          title="Speak to me"
          detail="Let's figure out what we are sending"
          icon={<MicIcon />}
          onClick={() => setScreen("voice")}
        />

        <div className="mt-auto border-t border-neutral-200/90 pt-5">
          <p className="px-1 text-center text-[13px] leading-snug text-neutral-500">
            Prefer to type it all out?
          </p>
          <button
            type="button"
            onClick={() => setScreen("manual")}
            className="mt-2 flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-center shadow-sm transition active:scale-[0.99]"
          >
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-[#0B1B32]">
                Standard booking form
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-neutral-500">
                Step-by-step fields if you prefer not to chat or speak
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function mobileRestDigits(value: string): string {
  let text = value.trim();
  text = text.replace(/^\+?\s*61\s*4?/, "");
  return text.replace(/\D/g, "").slice(0, 8);
}

function formatMobileRest(digits: string): string {
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

const CONTENTS_CATEGORIES = [
  { id: "electronics", label: "Electronics", icon: <span aria-hidden>💻</span> },
  { id: "clothing", label: "Clothing & Fashion", icon: <ShirtIcon /> },
  { id: "food", label: "Food & Perishables", icon: <span aria-hidden>🍎</span> },
  { id: "fragile", label: "Fragile Items", icon: <span aria-hidden>⚠️</span> },
  { id: "sporting", label: "Sporting Goods", icon: <span aria-hidden>⚽</span> },
  { id: "books", label: "Books & Media", icon: <span aria-hidden>📚</span> },
  { id: "health", label: "Health & Beauty", icon: <span aria-hidden>💊</span> },
  { id: "household", label: "Household Items", icon: <span aria-hidden>🏠</span> },
  { id: "other", label: "Other", icon: <span aria-hidden>📦</span> },
];

function ShirtIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 5.5 4.5 7.5 6.5 11 8 10v8.5h8V10l1.5 1 2-3.5L16 5.5 14.5 7h-5L8 5.5Z"
        fill="#1F8A4C"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5 9.2 17 19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a1.8 1.8 0 0 0 0-2.5l-.5-.5a1.8 1.8 0 0 0-2.5 0L5 17v3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13 7.5 16.5 11" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 19 6.5v5.2c0 4.2-2.8 7.2-7 8.8-4.2-1.6-7-4.6-7-8.8V6.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function storeSuburb(address: string) {
  const locality = address.split(",")[1]?.trim() ?? "";
  return locality.replace(/\s+(NSW|QLD|VIC|SA|WA|TAS|NT|ACT)\s+\d{4}$/, "");
}

function storeHoursLabel(hours: string) {
  return hours.replace(/^Wed\s/, "");
}

const COLLECT_STORES = [
  { id: "oxford-lotto", name: "Oxford St Lotto & Parcel", address: "212 Oxford St, Bondi Junction NSW 2022", km: 0.4, hours: "Wed 7am – 9pm", top: "58%", left: "62%" },
  { id: "spring", name: "Spring St Metro Cool-Room", address: "55 Spring St, Bondi Junction NSW 2022", km: 0.6, hours: "Wed 6am – 11pm", top: "64%", left: "48%" },
  { id: "pharmacy", name: "Oxford St Pharmacy", address: "88 Oxford St, Bondi Junction NSW 2022", km: 0.8, hours: "Wed 8am – 8pm", top: "52%", left: "70%" },
  { id: "newsagent", name: "Bondi Junction Newsagent", address: "5 Bronte Rd, Bondi Junction NSW 2022", km: 1.2, hours: "Wed 6am – 8pm", top: "42%", left: "58%" },
  { id: "westfield", name: "Westfield Parcel Locker", address: "500 Oxford St, Bondi Junction NSW 2022", km: 1.3, hours: "Wed 24 hours", top: "48%", left: "54%" },
  { id: "centennial", name: "Centennial Park Kiosk", address: "Grand Dr, Centennial Park NSW 2021", km: 1.4, hours: "Wed 7am – 6pm", top: "72%", left: "36%" },
  { id: "edgecliff", name: "Edgecliff Collect", address: "203 New South Head Rd, Edgecliff NSW 2027", km: 1.5, hours: "Wed 8am – 7pm", top: "28%", left: "44%" },
  { id: "beach", name: "Bondi Beach News", address: "78 Campbell Pde, Bondi Beach NSW 2026", km: 1.6, hours: "Wed 7am – 9pm", top: "78%", left: "74%" },
  { id: "waverley", name: "Waverley Parcel Point", address: "99 Ebley St, Bondi Junction NSW 2022", km: 1.7, hours: "Wed 9am – 6pm", top: "36%", left: "76%" },
  { id: "bronte", name: "Bronte Post Shop", address: "113 Macpherson St, Bronte NSW 2024", km: 1.8, hours: "Wed 8am – 5pm", top: "70%", left: "80%" },
  { id: "paddington", name: "Paddington Locker", address: "12 Oxford St, Paddington NSW 2021", km: 1.9, hours: "Wed 24 hours", top: "24%", left: "22%" },
  { id: "randwick", name: "Randwick Collect", address: "130 Belmore Rd, Randwick NSW 2031", km: 3.4, hours: "Wed 8am – 6pm", top: "82%", left: "28%" },
  { id: "coogee", name: "Coogee Locker", address: "200 Coogee Bay Rd, Coogee NSW 2034", km: 7.2, hours: "Wed 24 hours", top: "86%", left: "62%" },
];

function CollectStorePicker({
  query,
  onQueryChange,
  radius,
  onRadiusChange,
  savedId,
  onToggleSave,
  initialStoreId,
  onConfirm,
  onClose,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  radius: number;
  onRadiusChange: (value: number) => void;
  savedId: string;
  onToggleSave: (id: string) => void;
  initialStoreId: string | null;
  onConfirm: (id: string) => void;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [radiusOpen, setRadiusOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialStoreId);
  const needle = query.trim().toLowerCase();
  const selectedStore = COLLECT_STORES.find((store) => store.id === selectedId) ?? null;
  const stores = COLLECT_STORES.filter((store) => {
    const matchesRadius = store.km <= radius;
    const matchesQuery =
      needle.length === 0 ||
      store.name.toLowerCase().includes(needle) ||
      store.address.toLowerCase().includes(needle);
    return matchesRadius && matchesQuery;
  });

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#F7F8FA]">
      <div className="shrink-0 bg-white px-4 pb-3 pt-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-neutral-400">
              COLLECT
            </p>
            <h2 className="mt-0.5 text-[22px] font-bold tracking-tight text-[#0B1B32]">
              Collect from PARCELPOINT
            </h2>
          </div>
        <button
          type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF3EC] text-[#E4571A]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-medium text-neutral-600">
          <span aria-hidden>📍</span>
          Bondi Junction 2022
        </span>
        <div className="mt-3 flex items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="#9CA3AF" strokeWidth="1.7" />
              <path d="M16 16.5 20 20.5" stroke="#9CA3AF" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search stores..."
              aria-label="Search stores"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-[#0B1B32] outline-none placeholder:text-neutral-400"
            />
          </label>
          <div className="relative shrink-0">
            {radiusOpen ? (
              <button
                type="button"
                aria-label="Close radius list"
                onClick={() => setRadiusOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
            ) : null}
            <button
              type="button"
              aria-label="Search radius"
              aria-expanded={radiusOpen}
              onClick={() => setRadiusOpen((open) => !open)}
              className="relative z-20 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white py-2 pl-3 pr-2.5 text-[14px] font-medium text-[#0B1B32]"
            >
              {radius} km
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="text-neutral-500">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            {radiusOpen ? (
              <div
                role="listbox"
                aria-label="Search radius"
                className="absolute right-0 top-[calc(100%+6px)] z-20 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
              >
                {[2, 5, 10].map((option) => {
                  const selected = option === radius;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onRadiusChange(option);
                        setRadiusOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-[14px] text-[#0B1B32] ${
                        selected ? "bg-[#FFF3EC]" : "hover:bg-[#F7F8FA]"
                      }`}
                    >
                      {option} km
                      {selected ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M5 12.5 9.2 17 19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative h-52 shrink-0 overflow-hidden border-y border-neutral-200 bg-[#E7EEF4]">
        <div
          className="absolute inset-0 origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg className="h-full w-full" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <rect width="400" height="240" fill="#E7EEF4" />
            <path d="M0 40 C80 20 120 90 0 120 Z" fill="#C5DCEF" />
            <path d="M0 150 C70 130 90 210 0 230 Z" fill="#B7D4C8" />
            <rect x="250" y="20" width="70" height="46" rx="8" fill="#C8E6C9" />
            <g stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round">
              <path d="M20 70 H380" />
              <path d="M70 16 V220" />
              <path d="M180 10 V220" />
              <path d="M280 16 V220" />
              <path d="M20 140 H380" />
            </g>
          </svg>
          <span className="absolute left-[18%] top-[18%] text-[11px] font-semibold text-[#6B7280]">Double Bay</span>
          <span className="absolute right-[8%] top-[8%] text-[11px] font-semibold text-[#6B7280]">Bellevue Hill</span>
          <span className="absolute left-[28%] top-[42%] text-[11px] text-[#6B7280]">Cooper Park</span>
          <span className="absolute bottom-[10%] left-[8%] text-[11px] text-[#6B7280]">Centennial Parklands</span>
          {stores.map((store) => {
            const selected = selectedId === store.id;
            return (
              <button
                key={store.id}
                type="button"
                aria-label={store.name}
                aria-pressed={selected}
                onClick={() => setSelectedId(store.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${
                  selected ? "z-10 h-6 w-6 bg-[#E4571A]" : "h-3.5 w-3.5 bg-[#0B1B32]"
                }`}
                style={{ top: store.top, left: store.left }}
              />
            );
          })}
        </div>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-[#0B1B32] shadow">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E4571A] text-[11px] text-white">
            {stores.length}
          </span>
          on map
        </span>
        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-lg bg-white shadow">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((value) => Math.min(1.6, value + 0.2))}
            className="px-2.5 py-1.5 text-[16px] font-semibold text-[#0B1B32]"
          >
            +
        </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((value) => Math.max(1, value - 0.2))}
            className="border-t border-neutral-200 px-2.5 py-1.5 text-[16px] font-semibold text-[#0B1B32]"
          >
            −
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-neutral-400">
            NEARBY STORES
          </p>
          <p className="text-[12px] text-neutral-500">{stores.length} available</p>
      </div>
        <div className="mt-2 space-y-2">
          {stores.length === 0 ? (
            <p className="py-6 text-center text-[14px] text-neutral-500">
              No stores in this area
            </p>
          ) : (
            stores.map((store) => {
              const selected = selectedId === store.id;
              const schedule = storeSchedule(store.hours);
              return (
                <div
                  key={store.id}
                  className={`relative rounded-xl border px-3 py-3 ${
                    selected
                      ? "border-2 border-[#E4571A] bg-[#FFF3EC]"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  {selected ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E4571A] text-white">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M5 12.5 9.2 17 19 7"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : null}
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedId(store.id)}
                      className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
                    >
                      <span className="mt-0.5 text-[16px] leading-none" aria-hidden>
                        📍
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-[14px] font-bold text-[#0B1B32]">{store.name}</span>
                          <span className="shrink-0 text-[12px] text-neutral-500">
                            {store.km.toFixed(1)} km
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[12px] text-neutral-500">{store.address}</span>
                        <span className="mt-1 flex items-center gap-1.5 text-[12px] text-neutral-500">
                          <span className="font-semibold text-[#16A34A]">OPEN</span>
                          <span aria-hidden>🕒</span>
                          {store.hours}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={savedId === store.id ? `Remove ${store.name}` : `Save ${store.name}`}
                      aria-pressed={savedId === store.id}
                      onClick={() => onToggleSave(store.id)}
                      className={savedId === store.id ? "text-[#E4571A]" : "text-neutral-400"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={savedId === store.id ? "currentColor" : "none"} aria-hidden>
                        <path
                          d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  {selected ? (
                    <div className="mt-3 rounded-lg bg-white px-3 py-2.5">
                      <p className="text-[11px] font-semibold tracking-[0.08em] text-neutral-400">
                        SCHEDULE
                      </p>
                      <div className="mt-2 flex gap-3">
                        <span className="w-1 shrink-0 rounded-full bg-[#E4571A]" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          {schedule.map((row) => (
                            <div
                              key={row.days}
                              className="flex items-center justify-between gap-3 text-[13px] text-[#0B1B32]"
                            >
                              <span>{row.days}</span>
                              <span className={row.hours === "Closed" ? "text-neutral-400" : ""}>
                                {row.hours}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
      {selectedStore ? (
        <div className="flex shrink-0 items-center gap-3 border-t border-neutral-200 bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-neutral-400">
              READY TO CONFIRM
            </p>
            <p className="truncate text-[15px] font-bold text-[#0B1B32]">{selectedStore.name}</p>
            <p className="truncate text-[12px] text-neutral-500">{selectedStore.address}</p>
          </div>
          <button
            type="button"
            onClick={() => onConfirm(selectedStore.id)}
            className="shrink-0 rounded-full bg-[#E4571A] px-4 py-2.5 text-[14px] font-bold text-white"
          >
            Confirm collection point
          </button>
        </div>
      ) : null}
    </div>
  );
}

function storeSchedule(hours: string) {
  if (hours.includes("24 hours")) {
    return [
      { days: "Mon–Fri", hours: "24 hours" },
      { days: "Sat", hours: "24 hours" },
      { days: "Sun", hours: "24 hours" },
    ];
  }
  const weekday = hours.replace(/^Wed\s/, "");
  return [
    { days: "Mon–Fri", hours: weekday },
    { days: "Sat", hours: "9am – 5pm" },
    { days: "Sun", hours: "Closed" },
  ];
}

function formatManualMoney(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function PriceLine({
  label,
  amount,
  strong,
}: {
  label: string;
  amount: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[15px] text-[#0B1B32]">
      <span className={strong ? "font-bold" : "text-neutral-700"}>{label}</span>
      <span className={strong ? "font-bold" : "font-medium"}>{amount}</span>
    </div>
  );
}

function coverAmountLabel(value: string) {
  const amount = Number(value);
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? `$${rounded}` : `$${rounded.toFixed(2)}`;
}

function IncludedProtectionCard({
  value,
  onConditions,
}: {
  value: string;
  onConditions: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E4571A] bg-[#FFF3EC] px-3.5 py-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#5C6570]">
        <ShieldIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-[#0B1B32]">
          Parcel Protection
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-neutral-500">
          Covers your parcel valued at {coverAmountLabel(value)}
        </span>
        <button
          type="button"
          onClick={onConditions}
          className="mt-1 text-left text-[13px] font-semibold text-[#E4571A] underline underline-offset-2"
        >
          Parcel Protection Conditions
        </button>
      </span>
      <span className="shrink-0 text-[16px] font-bold text-[#E4571A]">Included</span>
    </div>
  );
}

function SignatureCard({
  selected,
  onToggle,
}: {
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Signature on Delivery"
      aria-pressed={selected}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-3.5 py-3.5 text-left ${
        selected ? "border-[#E4571A]" : "border-neutral-200"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#5C6570]">
        <PenIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-[#0B1B32]">
          Signature on Delivery
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-neutral-500">
          Recipient must sign upon delivery
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2.5">
        <span className="text-[15px] font-bold text-[#0B1B32]">+$3.50</span>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
            selected ? "border-[#E4571A]" : "border-neutral-300"
          }`}
        >
          {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#E4571A]" /> : null}
        </span>
      </span>
    </div>
  );
}

function PaidProtectionCard({
  value,
  selected,
  onToggle,
  onConditions,
}: {
  value: string;
  selected: boolean;
  onToggle: () => void;
  onConditions: () => void;
}) {
  const fee = Math.max(0, (Number(value) - 100) * 0.025);
  const feeLabel = `+$${fee.toFixed(2)}`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-3.5 py-3.5 text-left ${
        selected ? "border-[#E4571A]" : "border-neutral-200"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#5C6570]">
        <ShieldIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-[#0B1B32]">
          Parcel Protection
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-neutral-500">
          Covers your parcel valued at {coverAmountLabel(value)}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onConditions();
          }}
          className="mt-1 text-left text-[13px] font-semibold text-[#E4571A] underline underline-offset-2"
        >
          Parcel Protection Conditions
        </button>
      </span>
      <span className="flex shrink-0 items-center gap-2.5">
        <span className="text-[15px] font-bold text-[#0B1B32]">{feeLabel}</span>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
            selected ? "border-[#E4571A]" : "border-neutral-300"
          }`}
        >
          {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#E4571A]" /> : null}
        </span>
      </span>
    </div>
  );
}

function AddonCard({
  title,
  price,
  icon,
  enabled,
  selected,
  onClick,
}: {
  title: string;
  price: string;
  icon: ReactNode;
  enabled: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  if (!enabled) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-[#F7F8FA] px-3.5 py-3.5 text-neutral-400">
        <span className="mt-0.5">{icon}</span>
        <span>
          <span className="block text-[15px] font-bold">{title}</span>
          <span className="mt-0.5 block text-[13px] italic leading-snug">
            Enter your parcel value above to enable add-ons.
          </span>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border bg-white px-3.5 py-3.5 text-left text-[#0B1B32] ${
        selected ? "border-2 border-[#0B1B32]" : "border-neutral-200"
      }`}
    >
      <span className="mt-0.5 text-neutral-500">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold">{title}</span>
        <span className="mt-0.5 block text-[13px] text-neutral-500">{price}</span>
      </span>
    </button>
  );
}

const PROTECTION_POINTS = [
  "Up to $100 of Parcel Protection is included at no extra cost, based on your declared parcel value.",
  "For declared values over $100 additional protection can be selected for a fee.",
  "Claims are assessed in accordance with the Terms and Conditions and require proof of value and evidence of loss or damage.",
  "Any additional Parcel Protection must be selected before completing your booking.",
];

function ProtectionConditionsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF3EC] text-[#E4571A]">
            <ShieldIcon />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-[18px] font-bold tracking-tight text-[#0B1B32]">
              Parcel Protection
            </h2>
            <p className="mt-0.5 text-[13px] leading-snug text-neutral-500">
              Free protection up to $100 against loss or damage during delivery.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-[#0B1B32]">
          Parcel Protection covers your parcel for loss or damage, up to a
          declared value of $100, at no extra cost. For parcels valued over
          $100, additional cover is available for a fee, based on your declared
          value.
        </p>

        <div className="mt-5 rounded-xl bg-[#F7F8FA] px-4 py-4">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-neutral-500">
            WHAT YOU NEED TO KNOW
          </p>
          <ul className="mt-3 space-y-3">
            {PROTECTION_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[#E4571A]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 12.5 9.2 17 19 7"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[14px] leading-snug text-[#3F4752]">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 text-[14px] text-neutral-600">
          Terms, claim timeframes and exclusions apply.
        </p>
        <p className="mt-2 text-[14px] text-[#0B1B32]">
          View{" "}
          <button
            type="button"
            className="font-semibold text-[#E4571A] underline underline-offset-2"
          >
            Terms &amp; Conditions
          </button>
          .
        </p>
        </div>
      <div className="shrink-0 px-4 pb-4 pt-2 sm:px-5">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-[#E4571A] py-3.5 text-[16px] font-bold text-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function ProhibitedGoodsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4 sm:px-5">
        <h2 className="text-[18px] font-bold tracking-tight text-[#0B1B32]">
          Dangerous &amp; prohibited goods
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5">
        <div className="grid grid-cols-2 gap-3">
          {PROHIBITED_GOODS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-neutral-200 px-3 py-3"
            >
              <span className="text-[#E4571A]">{item.icon}</span>
              <p className="mt-2 text-[14px] font-bold leading-snug text-[#0B1B32]">
                {item.title}
              </p>
              <p className="mt-1 text-[12px] leading-snug text-neutral-500">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProhibitedIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

const PROHIBITED_GOODS: { title: string; detail: string; icon: ReactNode }[] = [
  {
    title: "Illegal Goods",
    detail: "Illegal or stolen goods.",
    icon: (
      <ProhibitedIcon>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7 17 17 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </ProhibitedIcon>
    ),
  },
  {
    title: "Weapons & Explosives",
    detail: "Firearms, weapons, ammunition, explosives and fireworks",
    icon: (
      <ProhibitedIcon>
        <path
          d="M8 4.5 16.5 19M16 4.5 7.5 19"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M6.5 6.5h3M14.5 6.5h3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </ProhibitedIcon>
    ),
  },
  {
    title: "Hazardous Materials",
    detail:
      "Radioactive, corrosive, toxic, flammable, oxidising or otherwise hazardous substances",
    icon: (
      <ProhibitedIcon>
        <path
          d="M9 3.5h6M10 3.5v5L6.5 18a2 2 0 0 0 1.8 2.8h7.4A2 2 0 0 0 17.5 18L14 8.5v-5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M8.5 14h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </ProhibitedIcon>
    ),
  },
  {
    title: "Cash & Valuables",
    detail: "Cash, bullion, negotiable instruments, securities or similar valuables",
    icon: (
      <ProhibitedIcon>
        <rect x="3.5" y="6.5" width="17" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      </ProhibitedIcon>
    ),
  },
  {
    title: "Live Animals & Biological Materials",
    detail: "Live animals, human or animal remains and biological materials.",
    icon: (
      <ProhibitedIcon>
        <circle cx="8" cy="8" r="1.3" fill="currentColor" />
        <circle cx="12" cy="6.2" r="1.3" fill="currentColor" />
        <circle cx="16" cy="8" r="1.3" fill="currentColor" />
        <circle cx="6.4" cy="11.4" r="1.3" fill="currentColor" />
        <path
          d="M9.2 12.2c.6 2.6 2 4 2.8 4s2.2-1.4 2.8-4c.5 1.2 1.6 2.2 3 2.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </ProhibitedIcon>
    ),
  },
  {
    title: "Medicines",
    detail:
      "Prescription medicines, controlled drugs or pharmaceuticals unless accepted under the selected service.",
    icon: (
      <ProhibitedIcon>
        <rect
          x="8"
          y="3.5"
          width="8"
          height="17"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.7"
          transform="rotate(35 12 12)"
        />
        <path d="M9.2 12h5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </ProhibitedIcon>
    ),
  },
  {
    title: "Perishables",
    detail: "Perishable goods or goods requiring refrigeration or temperature control",
    icon: (
      <ProhibitedIcon>
        <path
          d="M12 3.5v17M12 12 6 8.5M12 12l6-3.5M12 12 6 15.5M12 12l6 3.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </ProhibitedIcon>
    ),
  },
  {
    title: "Specialist Handling",
    detail:
      "Any goods requiring specialist handling that are not expressly accepted through PARCELPOINT Go",
    icon: (
      <ProhibitedIcon>
        <path
          d="M4 8.5 12 4.5l8 4v8l-8 4-8-4v-8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M12 12.5 20 8.5M12 12.5v8M12 12.5 4 8.5" stroke="currentColor" strokeWidth="1.7" />
      </ProhibitedIcon>
    ),
  },
];

function ManualInput({
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[15px] font-bold text-[#0B1B32]">
        {label} {required ? <span className="text-[#E4571A]">*</span> : null}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-[15px] text-[#0B1B32] outline-none placeholder:text-neutral-400 focus:border-[#0B1B32]"
      />
    </label>
  );
}

const MANUAL_BOOKING_REF = "PPG-48213";
const MANUAL_TRACKING = "MP8031920017";

const MANUAL_ADDRESSES = [
  "25 Spring St, Bondi Junction NSW 2022",
  "30 Oxford St, Bondi Junction NSW 2022",
  "45 Oxford St, Bondi Junction NSW 2022",
  "12 Newland St, Bondi Junction NSW 2022",
  "18 Latrobe Tce, Paddington QLD 4064",
  "142 Latrobe Tce, Paddington QLD 4064",
  "88 Given Tce, Paddington QLD 4064",
  "201 Latrobe Tce, Paddington QLD 4064",
];

const MANUAL_SIZES = [
  { id: "satchel", label: "Satchel", limit: "Up to 500g", weight: "500g", icon: "satchel" as const },
  { id: "shoebox", label: "Shoebox", limit: "Up to 3kg", weight: "3kg", icon: "box" as const },
  { id: "briefcase", label: "Briefcase", limit: "Up to 5kg", weight: "5kg", icon: "case" as const },
  { id: "carryon", label: "Carry On", limit: "Up to 12kg", weight: "12kg", icon: "luggage" as const },
];

function SizeGlyph({
  kind,
  color,
}: {
  kind: (typeof MANUAL_SIZES)[number]["icon"];
  color: string;
}) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      {kind === "satchel" ? (
        <>
          <path
            d="M6.5 10.5 12 7l5.5 3.5V18.5H6.5V10.5Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M10.2 14.8c.9.7 2.7.7 3.6 0"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {kind === "box" ? (
        <>
          <path
            d="M4.5 8.5 12 5l7.5 3.5L12 12 4.5 8.5"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 8.5V16L12 19.5 19.5 16V8.5"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 5v7"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {kind === "case" ? (
        <>
          <rect
            x="6.25"
            y="11.25"
            width="11.5"
            height="6.75"
            rx="1.6"
            stroke={color}
            strokeWidth="1.75"
          />
          <path
            d="M10 11.25V9.6a2 2 0 0 1 4 0v1.65"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.4 14.4v3M14.6 14.4v3"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {kind === "luggage" ? (
        <>
          <path
            d="M3.5 15.25 5.75 13.75 8 15.25 5.75 16.75 3.5 15.25Z"
            stroke={color}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 15.25V17.75L5.75 19.25 8 17.75V15.25"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.75 13.75v3"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M11.5 15.25 13.75 13.75 16 15.25 13.75 16.75 11.5 15.25Z"
            stroke={color}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M11.5 15.25V17.75l2.25 1.5L16 17.75V15.25"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.75 13.75v3"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M7.5 9 9.75 7.5 12 9 9.75 10.5 7.5 9Z"
            stroke={color}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 9V11.5l2.25 1.5L12 11.5V9"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.75 7.5v3"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      ) : null}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="#9CA3AF" strokeWidth="1.75" />
      <path d="M16 16.5 20 20.5" stroke="#9CA3AF" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
