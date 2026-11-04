"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";
import { BotReply, ChatScrollArea, ChatTranscript } from "./ChatTranscript";
import {
  buildPriceExtrasLiveMessages,
  buildPriceProgressMessages,
  buildPriceThreadAppend,
  formatItemWorthDisplay,
  itemWorthLabelFromThread,
  NOTIFY_USER_DISPLAY,
  receiverFirstNameFromThread,
  priceDeliveryUserLine,
  resolvePriceDeliveryChoice,
  SIGNATURE_USER_DISPLAY,
  PARCELPOINT_LOCATION_OPTIONS,
  parcelPointDetailForReceiver,
  parcelPointLocationsForSuburbQuery,
  parcelPointSuburbAreaLabel,
  priceParcelPointPickBot,
  priceParcelPointSuburbSearchBot,
  receiverAddressHintFromThread,
  type ChatMessage,
  type ParcelPointLocationOption,
  type PriceDeliveryChoice,
} from "./chatThread";
import { ParcelPointPickMapScreen } from "./ParcelPointPickMapScreen";

const PGO_ORANGE = "#C44717";

type PricePhase = "delivery" | "parcelpoint" | "worth" | "extras";
type ParcelPointPickMode = "default" | "awaitSuburb" | "suburbResults";
type ExtrasStep = "signature" | "notify";
type DeliveryChoice = PriceDeliveryChoice;
type SignatureChoice = "yes" | "no";
type NotifyChoice = "yes" | "no";

const SIGNATURE_INPUT_LINES = {
  yes: "Yes, signature required · +$3.00",
  no: "No, leave it in a safe place · $0.00",
} as const;

const NOTIFY_INPUT_LINES = {
  yes: "Yes",
  no: "No",
} as const;

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

function BotBubble({
  children,
  onReady,
}: {
  children: ReactNode;
  onReady?: () => void;
}) {
  return (
    <BotReply onReady={onReady}>
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

function LocationPinIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke={active ? PGO_ORANGE : "#9CA3AF"}
        strokeWidth="1.75"
      />
      <circle
        cx="12"
        cy="10"
        r="2.5"
        fill={active ? PGO_ORANGE : "transparent"}
        stroke={active ? PGO_ORANGE : "#9CA3AF"}
        strokeWidth="1.75"
      />
    </svg>
  );
}

function RadioMark({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#C44717]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#C44717]" />
      </span>
    );
  }
  return (
    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-neutral-300" />
  );
}

interface Props {
  onBack: () => void;
  priorThread?: ChatMessage[];
  onContinue?: (append?: ChatMessage[]) => void;
}

export function ChatPriceScreen({
  onBack,
  priorThread = [],
  onContinue,
}: Props) {
  const [phase, setPhase] = useState<PricePhase>("delivery");
  const [input, setInput] = useState("");
  const [delivery, setDelivery] = useState<DeliveryChoice | null>(null);
  const [committedDeliveryLine, setCommittedDeliveryLine] = useState("");
  const [committedWorthLine, setCommittedWorthLine] = useState("");
  const [extrasStep, setExtrasStep] = useState<ExtrasStep>("signature");
  const [signature, setSignature] = useState<SignatureChoice | null>(null);
  const [committedSignatureLine, setCommittedSignatureLine] = useState("");
  const [notify, setNotify] = useState<NotifyChoice | null>(null);
  const [selectedParcelPointId, setSelectedParcelPointId] = useState(
    PARCELPOINT_LOCATION_OPTIONS[0].id,
  );
  const [parcelPointMapOpen, setParcelPointMapOpen] = useState(false);
  const [parcelPointPickMode, setParcelPointPickMode] =
    useState<ParcelPointPickMode>("default");
  const [suburbUserLine, setSuburbUserLine] = useState("");
  const [suburbAreaLabel, setSuburbAreaLabel] = useState("");
  const [replyPending, setReplyPending] = useState(true);
  const [assistReadyFor, setAssistReadyFor] = useState<string | null>(null);

  const handleHeaderBack = () => {
    if (phase === "extras") {
      if (extrasStep === "notify" && delivery !== "parcelpoint") {
        setExtrasStep("signature");
      } else {
        setPhase("worth");
      }
    } else if (phase === "worth") {
      setPhase(delivery === "parcelpoint" ? "parcelpoint" : "delivery");
    } else if (phase === "parcelpoint") {
      setParcelPointPickMode("default");
      setSuburbUserLine("");
      setSuburbAreaLabel("");
      setPhase("delivery");
    } else onBack();
  };

  const selectDelivery = (choice: DeliveryChoice) => {
    setDelivery(choice);
    setInput(priceDeliveryUserLine(choice));
  };

  const submitDelivery = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const choice = resolvePriceDeliveryChoice(trimmed, delivery);
    if (!choice) return;
    setDelivery(choice);
    setCommittedDeliveryLine(priceDeliveryUserLine(choice));
    setInput("");
    setReplyPending(true);
    if (choice === "parcelpoint") {
      setPhase("parcelpoint");
      setParcelPointPickMode("default");
      setSuburbUserLine("");
      setSuburbAreaLabel("");
      setSelectedParcelPointId(PARCELPOINT_LOCATION_OPTIONS[0].id);
      setInput("");
    } else {
      setPhase("worth");
    }
  };

  const activeParcelPointLocations = useMemo((): ParcelPointLocationOption[] => {
    if (parcelPointPickMode === "suburbResults") {
      return parcelPointLocationsForSuburbQuery(suburbUserLine);
    }
    return PARCELPOINT_LOCATION_OPTIONS;
  }, [parcelPointPickMode, suburbUserLine]);

  const submitParcelPointPick = () => {
    const trimmed = input.trim();
    if (parcelPointPickMode === "awaitSuburb") {
      if (!trimmed) return;
      const locations = parcelPointLocationsForSuburbQuery(trimmed);
      setSuburbUserLine(trimmed);
      setSuburbAreaLabel(parcelPointSuburbAreaLabel(trimmed));
      setParcelPointPickMode("suburbResults");
      setSelectedParcelPointId(locations[0]?.id ?? selectedParcelPointId);
      setInput(locations[0]?.name ?? "");
      return;
    }
    if (!selectedParcelPointId) return;
    setInput("");
    setReplyPending(true);
    setPhase("worth");
  };

  const selectParcelPoint = (id: string, locations = activeParcelPointLocations) => {
    setSelectedParcelPointId(id);
    const location = locations.find((entry) => entry.id === id);
    if (location) setInput(location.name);
  };

  const startSuburbSearch = () => {
    setParcelPointPickMode("awaitSuburb");
    setSuburbUserLine("");
    setSuburbAreaLabel("");
    setInput("");
  };

  const submitWorth = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setCommittedWorthLine(trimmed);
    setInput("");
    setReplyPending(true);
    setExtrasStep(delivery === "parcelpoint" ? "notify" : "signature");
    setPhase("extras");
  };

  const selectSignature = (choice: SignatureChoice) => {
    setSignature(choice);
    setInput(SIGNATURE_INPUT_LINES[choice]);
  };

  const selectNotify = (choice: NotifyChoice) => {
    setNotify(choice);
    setInput(NOTIFY_INPUT_LINES[choice]);
  };

  const submitSignatureStep = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    let choice = signature;
    if (
      trimmed === SIGNATURE_INPUT_LINES.yes ||
      /signature required/i.test(trimmed)
    ) {
      choice = "yes";
    } else if (
      trimmed === SIGNATURE_INPUT_LINES.no ||
      /safe place|authority to leave/i.test(trimmed)
    ) {
      choice = "no";
    }
    if (!choice) return;
    setSignature(choice);
    setCommittedSignatureLine(SIGNATURE_USER_DISPLAY[choice]);
    setInput("");
    setReplyPending(true);
    setExtrasStep("notify");
  };

  const submitExtras = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    let notifyChoice = notify;
    if (trimmed === NOTIFY_INPUT_LINES.yes || /^yes\b/i.test(trimmed)) {
      notifyChoice = "yes";
    } else if (
      trimmed === NOTIFY_INPUT_LINES.no ||
      /^no\b/i.test(trimmed)
    ) {
      notifyChoice = "no";
    }
    if (!notifyChoice) return;
    setNotify(notifyChoice);
    const deliveryLine =
      committedDeliveryLine || priceDeliveryUserLine("door");
    const worthLine = committedWorthLine || "$180";
    setInput("");
    onContinue?.(
      buildPriceThreadAppend({
        deliveryUserLine: deliveryLine,
        deliveryChoice: delivery ?? "door",
        itemWorthLine: worthLine,
        itemWorthLabel,
        signatureChoice: signature ?? undefined,
        signatureUserLine: committedSignatureLine || undefined,
        notifyUserLine: NOTIFY_USER_DISPLAY[notifyChoice],
        receiverFirstName,
      }),
    );
  };

  const deliveryUserLine =
    committedDeliveryLine || priceDeliveryUserLine("door");

  const itemWorthLabel = useMemo(
    () => itemWorthLabelFromThread(priorThread),
    [priorThread],
  );

  const receiverFirstName = useMemo(
    () => receiverFirstNameFromThread(priorThread),
    [priorThread],
  );

  const receiverAddressHint = useMemo(
    () => receiverAddressHintFromThread(priorThread),
    [priorThread],
  );

  const itemWorthDisplay = formatItemWorthDisplay(
    committedWorthLine || "$180",
  );

  const transcriptMessages = useMemo(() => {
    const base = [
      ...priorThread,
      ...buildPriceProgressMessages(
        phase === "parcelpoint" ? "parcelpoint" : phase,
        {
        deliveryUserLine:
          phase === "worth" || phase === "extras" || phase === "parcelpoint"
            ? deliveryUserLine
            : undefined,
        deliveryChoice: delivery,
        itemWorthLine:
          phase === "extras" ? committedWorthLine : undefined,
        itemWorthLabel,
      },
      ),
    ];
    if (phase !== "extras") return base;
    return [
      ...base,
      ...buildPriceExtrasLiveMessages({
        extrasStep: extrasStep,
        deliveryChoice: delivery,
        signatureChoice: signature,
        signatureUserLine: committedSignatureLine,
        receiverFirstName,
      }),
    ];
  }, [
    priorThread,
    phase,
    deliveryUserLine,
    delivery,
    committedWorthLine,
    itemWorthLabel,
    extrasStep,
    signature,
    committedSignatureLine,
    receiverFirstName,
  ]);

  const mapSearchLabel =
    parcelPointPickMode === "suburbResults" && suburbAreaLabel
      ? `Near ${suburbAreaLabel.replace(/\s+QLD\s+\d{4}$/i, ", Brisbane")}`
      : receiverAddressHint.includes("Paddington")
        ? "Near Paddington, Brisbane"
        : `Near ${receiverAddressHint.split(",").pop()?.trim() ?? "Paddington, Brisbane"}`;

  const renderParcelPointLocationList = (
    locations: ParcelPointLocationOption[],
  ) => (
    <div className="flex flex-col gap-2.5">
      {locations.map((location) => {
        const selected = selectedParcelPointId === location.id;
        return (
          <button
            key={location.id}
            type="button"
            onClick={() => selectParcelPoint(location.id, locations)}
            className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
              selected
                ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                : "border border-neutral-200 bg-white"
            }`}
          >
            <LocationPinIcon active={selected} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-[#0B1B32]">
                {location.name}
              </span>
              <span className="mt-0.5 block text-sm text-neutral-500">
                {parcelPointDetailForReceiver(
                  location.detail,
                  receiverFirstName,
                )}
              </span>
            </span>
            {selected ? <CheckCircle /> : <RadioMark selected={false} />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep="Price"
        onBack={handleHeaderBack}
        accentOrange={PGO_ORANGE}
      />

      <ChatScrollArea>
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <ChatTranscript
            messages={transcriptMessages}
            historyCount={priorThread.length}
            onBusyChange={setReplyPending}
            insertBefore={
              phase === "extras" && extrasStep === "signature"
                ? {
                    id: "price-signature-bot",
                    node: (
                      <div className="flex items-center gap-3 rounded-2xl border-2 border-[#2D7A4D]/40 bg-[#F4FBF6] px-4 py-3.5">
                        <ShieldIcon />
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-bold text-[#0B1B32]">
                            Parcel Protection · {itemWorthDisplay} declared
                          </p>
                          <p className="mt-0.5 text-sm text-neutral-600">
                            Required for items over $100
                          </p>
                        </div>
                        <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                          $4.95
                        </span>
                      </div>
                    ),
                  }
                : undefined
            }
          />
          {replyPending || phase === "worth" ? null : phase === "parcelpoint" ? (
            <>
              {parcelPointPickMode === "default" ? (
                <>
                  <BotBubble onReady={() => setAssistReadyFor("default")}>
                    {priceParcelPointPickBot(receiverAddressHint)}
                  </BotBubble>
                  {assistReadyFor === "default" ? (
                    <>
                      {renderParcelPointLocationList(PARCELPOINT_LOCATION_OPTIONS)}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setParcelPointMapOpen(true)}
                          className="rounded-full border border-[#C44717] bg-white py-3 text-[14px] font-bold text-[#C44717]"
                        >
                          Show on map
                        </button>
                        <button
                          type="button"
                          onClick={startSuburbSearch}
                          className="rounded-full border border-[#C44717] bg-white py-3 text-[14px] font-bold text-[#C44717]"
                        >
                          Search another suburb
                        </button>
                      </div>
                      <p className="text-center text-xs leading-snug text-neutral-500">
                        Same price — $9.95 — whichever you choose. We&apos;ll text{" "}
                        {receiverFirstName} when it&apos;s ready to collect.
                      </p>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <UserBubble>Search another suburb</UserBubble>
                  <BotBubble onReady={() => setAssistReadyFor("search")}>
                    {priceParcelPointSuburbSearchBot(receiverFirstName)}
                  </BotBubble>
                  {parcelPointPickMode === "suburbResults" ? (
                    <>
                      <UserBubble>{suburbUserLine}</UserBubble>
                      <BotBubble
                        onReady={() =>
                          setAssistReadyFor(`results:${suburbAreaLabel}`)
                        }
                      >
                        Here&apos;s what&apos;s near{" "}
                        <span className="font-bold">{suburbAreaLabel}</span>:
                      </BotBubble>
                      {assistReadyFor === `results:${suburbAreaLabel}` ? (
                        <>
                          {renderParcelPointLocationList(activeParcelPointLocations)}
                          <div className="grid grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => setParcelPointMapOpen(true)}
                              className="rounded-full border border-[#C44717] bg-white py-3 text-[14px] font-bold text-[#C44717]"
                            >
                              Show on map
                            </button>
                            <button
                              type="button"
                              onClick={startSuburbSearch}
                              className="rounded-full border border-[#C44717] bg-white py-3 text-[14px] font-bold text-[#C44717]"
                            >
                              Try another suburb
                            </button>
                          </div>
                          <p className="text-center text-xs leading-snug text-neutral-500">
                            Same price — $9.95 — whichever you choose. We&apos;ll text{" "}
                            {receiverFirstName} when it&apos;s ready to collect.
                          </p>
                        </>
                      ) : null}
                    </>
                  ) : null}
                </>
              )}
            </>
          ) : phase === "delivery" ? (
            <>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => selectDelivery("door")}
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
                </button>

                <button
                  type="button"
                  onClick={() => selectDelivery("parcelpoint")}
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
          ) : phase === "extras" ? (
            <>
              {extrasStep === "signature" && delivery !== "parcelpoint" ? (
                <>
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => selectSignature("yes")}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        signature === "yes"
                          ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                          : "border border-neutral-200 bg-white"
                      }`}
                    >
                      <RadioMark selected={signature === "yes"} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-bold text-[#0B1B32]">
                          Yes, signature required
                        </span>
                        <span className="mt-0.5 block text-sm text-neutral-500">
                          {receiverFirstName} signs on delivery
                        </span>
                      </span>
                      <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                        +$3.00
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => selectSignature("no")}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                        signature === "no"
                          ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                          : "border border-neutral-200 bg-white"
                      }`}
                    >
                      <RadioMark selected={signature === "no"} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-bold text-[#0B1B32]">
                          No, leave it in a safe place
                        </span>
                        <span className="mt-0.5 block text-sm text-neutral-500">
                          Authority to leave
                        </span>
                      </span>
                      <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                        $0.00
                      </span>
                    </button>
                  </div>
                </>
              ) : null}

              {extrasStep === "notify" ? (
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => selectNotify("yes")}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      notify === "yes"
                        ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                        : "border border-neutral-200 bg-white"
                    }`}
                  >
                    <RadioMark selected={notify === "yes"} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-[#0B1B32]">
                        Yes
                      </span>
                      <span className="mt-0.5 block text-sm text-neutral-500">
                        Updates by text and email
                      </span>
                    </span>
                    <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                      Free
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectNotify("no")}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      notify === "no"
                        ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                        : "border border-neutral-200 bg-white"
                    }`}
                  >
                    <RadioMark selected={notify === "no"} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold text-[#0B1B32]">
                        No
                      </span>
                      <span className="mt-0.5 block text-sm text-neutral-500">
                        {receiverFirstName} won&apos;t get updates from us
                      </span>
                    </span>
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </ChatScrollArea>

      <ChatFlowFooter
        input={input}
        onInputChange={setInput}
        placeholder={
          phase === "delivery"
            ? priceDeliveryUserLine("door")
            : phase === "parcelpoint"
              ? parcelPointPickMode === "awaitSuburb"
                ? "Suburb or postcode..."
                : activeParcelPointLocations[0]?.name ?? ""
              : phase === "worth"
                ? "$180"
                : phase === "extras" && extrasStep === "signature"
                  ? SIGNATURE_INPUT_LINES.yes
                  : phase === "extras"
                    ? NOTIFY_INPUT_LINES.yes
                    : "Type or tap the mic..."
        }
        onSubmitMessage={
          phase === "delivery"
            ? submitDelivery
            : phase === "parcelpoint"
              ? submitParcelPointPick
              : phase === "worth"
                ? submitWorth
                : phase === "extras" && extrasStep === "signature"
                  ? submitSignatureStep
                  : submitExtras
        }
        accentOrange={PGO_ORANGE}
      />

      {parcelPointMapOpen && phase === "parcelpoint" ? (
        <ParcelPointPickMapScreen
          selectedId={selectedParcelPointId}
          locations={activeParcelPointLocations}
          searchLabel={mapSearchLabel}
          receiverFirstName={receiverFirstName}
          onBack={() => setParcelPointMapOpen(false)}
          onCollectFromHere={(locationId) => {
            selectParcelPoint(locationId, activeParcelPointLocations);
            setParcelPointMapOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
