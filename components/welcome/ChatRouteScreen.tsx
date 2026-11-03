"use client";

import { useState } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";
import { ChatParcelScreen } from "./ChatParcelScreen";
import { BookingConfirmedInStoreScreen } from "./BookingConfirmedInStoreScreen";
import { BookingConfirmedScreen } from "./BookingConfirmedScreen";
import { ChatBookingReviewScreen } from "./ChatBookingReviewScreen";
import { ChatPayScreen } from "./ChatPayScreen";
import { ChatPriceScreen } from "./ChatPriceScreen";
import { ChatReceiverConfirmScreen } from "./ChatReceiverConfirmScreen";
import { RouteMapScreen } from "./RouteMapScreen";

type RoutePhase =
  | "route"
  | "map"
  | "receiver"
  | "parcel"
  | "price"
  | "pay"
  | "review"
  | "booked"
  | "bookedInStore";

interface Props {
  onBack: () => void;
  onFinished?: () => void;
  initialPhase?: RoutePhase;
}

const LOCATIONS = [
  {
    id: "church",
    name: "Church St Newsagent",
    detail: "0.3 km · Open till 8 pm",
  },
  {
    id: "station",
    name: "Station Pharmacy",
    detail: "0.6 km · Open till 9 pm",
  },
] as const;

function MapPin({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle
        cx="12"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function CheckCircle() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8651A] text-white">
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

export function ChatRouteScreen({
  onBack,
  onFinished,
  initialPhase = "route",
}: Props) {
  const [selectedId, setSelectedId] =
    useState<(typeof LOCATIONS)[number]["id"]>("church");
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<RoutePhase>(initialPhase);

  if (phase === "bookedInStore") {
    return (
      <BookingConfirmedInStoreScreen
        onClose={() => onFinished?.()}
        onSendAnother={() => onFinished?.()}
      />
    );
  }

  if (phase === "booked") {
    return (
      <BookingConfirmedScreen
        onClose={() => onFinished?.()}
        onSendAnother={() => onFinished?.()}
      />
    );
  }

  if (phase === "review") {
    return (
      <ChatBookingReviewScreen
        onBack={() => setPhase("pay")}
        onBooked={() => setPhase("booked")}
        onBookedInStore={() => setPhase("bookedInStore")}
      />
    );
  }

  if (phase === "pay") {
    return (
      <ChatPayScreen
        onBack={() => setPhase("price")}
        onLooksRight={() => setPhase("review")}
      />
    );
  }

  if (phase === "price") {
    return (
      <ChatPriceScreen
        onBack={() => setPhase("parcel")}
        onContinue={() => setPhase("pay")}
      />
    );
  }

  if (phase === "parcel") {
    return (
      <ChatParcelScreen
        onBack={() => setPhase("receiver")}
        onContinue={() => setPhase("price")}
      />
    );
  }

  if (phase === "receiver") {
    return (
      <ChatReceiverConfirmScreen
        onBack={() => setPhase("route")}
        onLooksRight={() => setPhase("parcel")}
      />
    );
  }

  if (phase === "map") {
    return (
      <RouteMapScreen
        onBack={() => setPhase("route")}
        onDropOff={() => setPhase("receiver")}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader activeStep="Route" onBack={onBack} accentOrange="#E8651A" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <div className="flex justify-end">
            <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] leading-snug text-white">
              Send a pair of shoes to my mum in Brisbane. I&apos;ll drop it off
              near work in Parramatta.
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[92%] rounded-[1.25rem] rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-snug text-[#0B1B32] shadow-sm">
              Lovely — shoes off to your mum. These ParcelPoints are closest to
              Parramatta. Which one works?
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {LOCATIONS.map((loc, index) => {
              const selected = selectedId === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedId(loc.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
                    index > 0 ? "border-t border-neutral-100" : ""
                  } ${selected ? "bg-[#FFF3EB]" : "bg-white"}`}
                >
                  <span
                    className={
                      selected ? "text-[#E8651A]" : "text-neutral-400"
                    }
                  >
                    <MapPin active={selected} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-[#0B1B32]">
                      {loc.name}
                    </span>
                    <span className="mt-0.5 block text-sm text-neutral-500">
                      {loc.detail}
                    </span>
                  </span>
                  {selected ? (
                    <CheckCircle />
                  ) : (
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border-2 border-neutral-300"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPhase("map")}
              className="rounded-full border border-[#E8651A] bg-white px-4 py-2 text-sm font-semibold text-[#E8651A]"
            >
              Show on map
            </button>
            <button
              type="button"
              className="rounded-full border border-[#E8651A] bg-white px-4 py-2 text-sm font-semibold text-[#E8651A]"
            >
              Search another area
            </button>
          </div>
        </div>
      </div>

      <ChatFlowFooter
        input={input}
        onInputChange={setInput}
        placeholder='Say "the first one"...'
        accentOrange="#E8651A"
      />
    </div>
  );
}
