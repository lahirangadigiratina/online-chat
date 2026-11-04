"use client";

import { useState, type ReactNode } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";
import { BotReply } from "./ChatTranscript";
import { LocationPermissionDialog } from "./LocationPermissionDialog";

interface Props {
  onBack: () => void;
  onContinue: () => void;
}

type LocationPhase = "ask" | "suburb" | "locationOff";

const SUBURB_SUGGESTIONS = [
  { id: "parramatta", label: "Parramatta NSW 2150", match: "Parram" },
  { id: "north", label: "North Parramatta NSW 2151", match: "Parram" },
  { id: "park", label: "Parramatta Park, NSW", match: "Parram" },
] as const;

const botBubbleClass =
  "max-w-[92%] rounded-[1.25rem] rounded-bl-md bg-white px-4 py-2.5 text-[15px] leading-snug text-[#0B1B32] shadow-sm";

function BotBubble({ children }: { children: ReactNode }) {
  return (
    <BotReply>
      <div className="flex justify-start">
        <div className={botBubbleClass}>{children}</div>
      </div>
    </BotReply>
  );
}

function MapPinIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke="#C44717"
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="2.5" fill="#C44717" />
    </svg>
  );
}

function ListPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke="#9CA3AF"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="10" r="2" stroke="#9CA3AF" strokeWidth="1.75" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CrosshairIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="#C44717" strokeWidth="1.75" />
      <path
        d="M12 2v4M12 18v4M2 12h4M18 12h4"
        stroke="#C44717"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function highlightMatch(label: string, match: string) {
  const index = label.toLowerCase().indexOf(match.toLowerCase());
  if (index < 0) return label;
  const before = label.slice(0, index);
  const hit = label.slice(index, index + match.length);
  const after = label.slice(index + match.length);
  return (
    <>
      {before}
      <span className="font-bold text-[#0B1B32]">{hit}</span>
      {after}
    </>
  );
}

function SuburbSuggestionsPanel({
  query,
  onSelect,
  onUseCurrentLocation,
}: {
  query: string;
  onSelect: () => void;
  onUseCurrentLocation: () => void;
}) {
  const filtered = SUBURB_SUGGESTIONS.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return s.label.toLowerCase().includes(q);
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {filtered.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={onSelect}
          className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] text-[#0B1B32] transition active:bg-neutral-50 ${
            index > 0 ? "border-t border-neutral-100" : ""
          }`}
        >
          <ListPinIcon />
          <span>
            {highlightMatch(item.label, query.trim() || item.match)}
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onUseCurrentLocation}
        className="flex w-full items-center gap-3 border-t border-neutral-100 px-4 py-3.5 text-left text-[15px] font-medium text-[#C44717] transition active:bg-neutral-50"
      >
        <CrosshairIcon />
        Use my current location
      </button>
    </div>
  );
}

function SuburbSearchFooter({
  input,
  onInputChange,
  accentOrange,
  onSelectSuggestion,
  onUseCurrentLocation,
}: {
  input: string;
  onInputChange: (v: string) => void;
  accentOrange: string;
  onSelectSuggestion: () => void;
  onUseCurrentLocation: () => void;
}) {
  return (
    <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
      <SuburbSuggestionsPanel
        query={input}
        onSelect={onSelectSuggestion}
        onUseCurrentLocation={onUseCurrentLocation}
      />
      <div className="mt-2.5 flex items-center gap-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          aria-label="Suburb or postcode"
          className="min-w-0 flex-1 rounded-full border-2 bg-white px-5 py-3.5 text-[15px] text-[#0B1B32] outline-none"
          style={{ borderColor: accentOrange }}
        />
        <button
          type="button"
          aria-label="Voice input"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: accentOrange }}
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
  );
}

export function ChatLocationScreen({ onBack, onContinue }: Props) {
  const accentOrange = "#E8651A";
  const [phase, setPhase] = useState<LocationPhase>("ask");
  const [input, setInput] = useState("");
  const [suburbQuery, setSuburbQuery] = useState("Parram");
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [showDeclineBubble, setShowDeclineBubble] = useState(false);
  const [locationOffInput, setLocationOffInput] = useState("");

  const displayUser =
    "Send shoes to my mum in Brisbane. I'll drop them off somewhere near me.";

  const enterSuburbSearch = (declined: boolean) => {
    setShowDeclineBubble(declined);
    setSuburbQuery(declined ? "Parram" : "");
    setPhase("suburb");
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep="Route"
        onBack={onBack}
        accentOrange={accentOrange}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {phase !== "locationOff" ? (
            <div className="flex justify-end">
              <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] leading-snug text-white">
                {displayUser}
              </div>
            </div>
          ) : null}

          {phase === "ask" ? (
            <>
              <BotBubble>
                Happy to! To find the ParcelPoints closest to you, can I use
                your location? I only use it while you&apos;re booking.
              </BotBubble>

              <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFEBE3]">
                  <MapPinIcon />
                </div>
                <h2 className="mt-4 text-[17px] font-bold leading-snug text-[#0B1B32]">
                  Find drop-off points near you
                </h2>
                <p className="mx-auto mt-2 max-w-[17rem] text-[13px] leading-relaxed text-neutral-500">
                  Your location is used only to show nearby ParcelPoints. It
                  isn&apos;t shared or tracked after you book.
                </p>
                <button
                  type="button"
                  onClick={() => setPermissionOpen(true)}
                  className="mt-5 w-full rounded-full bg-[#C44512] py-3.5 text-base font-bold text-white transition active:scale-[0.99]"
                >
                  Use my location
                </button>
                <button
                  type="button"
                  onClick={() => enterSuburbSearch(false)}
                  className="mt-2.5 w-full rounded-full border border-neutral-200 bg-white py-3.5 text-base font-semibold text-[#0B1B32] transition active:scale-[0.99]"
                >
                  I&apos;ll type a suburb instead
                </button>
              </div>
            </>
          ) : phase === "suburb" ? (
            <>
              {showDeclineBubble ? (
                <div className="flex justify-end">
                  <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] leading-snug text-white">
                    I&apos;d rather not share my location
                  </div>
                </div>
              ) : null}

              <BotBubble>
                No problem at all. Which suburb or postcode should I look near?
              </BotBubble>
            </>
          ) : (
            <>
              <div className="flex justify-end">
                <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] leading-snug text-white">
                  Somewhere near me
                </div>
              </div>

              <BotBubble>
                Location is switched off for ParcelPoint GO, so I can&apos;t
                see where you are. You can turn it on, or just tell me a
                suburb — either works.
              </BotBubble>

              <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-5 shadow-sm">
                <h2 className="text-[17px] font-bold leading-snug text-[#0B1B32]">
                  Turn on location in 3 taps
                </h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-snug text-[#0B1B32]">
                  <li>Tap &ldquo;Open Settings&rdquo; below</li>
                  <li>Choose Location</li>
                  <li>
                    Pick &ldquo;While using the app&rdquo;, then come back
                  </li>
                </ol>
                <button
                  type="button"
                  onClick={() => onContinue()}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#C44512] py-3.5 text-base font-bold text-white transition active:scale-[0.99]"
                >
                  <SettingsIcon />
                  Open Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuburbQuery("");
                    setPhase("suburb");
                  }}
                  className="mt-2.5 w-full rounded-full border border-neutral-200 bg-white py-3.5 text-base font-semibold text-[#0B1B32] transition active:scale-[0.99]"
                >
                  Type a suburb instead
                </button>
              </div>

              <BotBubble>
                Thanks! Finding ParcelPoints near you...
              </BotBubble>
            </>
          )}
        </div>
      </div>

      {phase === "ask" ? (
        <ChatFlowFooter
          input={input}
          onInputChange={setInput}
          placeholder='Say "yes" or a suburb...'
          accentOrange={accentOrange}
        />
      ) : phase === "suburb" ? (
        <SuburbSearchFooter
          input={suburbQuery}
          onInputChange={setSuburbQuery}
          accentOrange={accentOrange}
          onSelectSuggestion={onContinue}
          onUseCurrentLocation={() => setPhase("locationOff")}
        />
      ) : (
        <ChatFlowFooter
          input={locationOffInput}
          onInputChange={setLocationOffInput}
          placeholder="Or say a suburb or postcode..."
          accentOrange={accentOrange}
        />
      )}

      <LocationPermissionDialog
        open={permissionOpen}
        onAllow={() => {
          setPermissionOpen(false);
          onContinue();
        }}
        onDeny={() => {
          setPermissionOpen(false);
          if (phase === "ask") {
            enterSuburbSearch(true);
          }
        }}
      />
    </div>
  );
}
