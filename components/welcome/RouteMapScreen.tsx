"use client";

import { useState } from "react";

const PINS = [
  {
    id: 1,
    top: "36%",
    left: "54%",
    name: "Church St Newsagent",
    address: "112 Church St, Parramatta NSW 2150",
    distance: "0.3 km",
    hours: "Open till 8 pm",
  },
  {
    id: 2,
    top: "46%",
    left: "30%",
    name: "Station Pharmacy",
    address: "45 Station St, Parramatta NSW 2150",
    distance: "0.6 km",
    hours: "Open till 9 pm",
  },
  {
    id: 3,
    top: "50%",
    left: "70%",
    name: "George St Collect",
    address: "18 George St, Parramatta NSW 2150",
    distance: "0.8 km",
    hours: "Open till 7 pm",
  },
] as const;

interface Props {
  onBack: () => void;
  onDropOff: () => void;
}

function BackChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CrosshairIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="#2563EB" strokeWidth="2" />
      <path
        d="M12 2v4M12 18v4M2 12h4M18 12h4"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TeardropPin({
  number,
  selected,
}: {
  number: number;
  selected: boolean;
}) {
  const fill = selected ? "#E8651A" : "#0B1B32";
  return (
    <svg
      width="36"
      height="44"
      viewBox="0 0 36 44"
      fill="none"
      aria-hidden
      className="drop-shadow-md"
    >
      <path
        d="M18 0C27.941 0 36 8.059 36 18c0 13.5-18 26-18 26S0 31.5 0 18C0 8.059 8.059 0 18 0z"
        fill={fill}
      />
      <text
        x="18"
        y="21"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {number}
      </text>
    </svg>
  );
}

function MapPinMarker({
  number,
  selected,
  onClick,
  style,
}: {
  number: number;
  selected: boolean;
  onClick: () => void;
  style: { top: string; left: string };
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Location ${number}`}
      aria-pressed={selected}
      className="absolute z-[2] -translate-x-1/2 -translate-y-full touch-manipulation"
      style={style}
    >
      <TeardropPin number={number} selected={selected} />
    </button>
  );
}

export function RouteMapScreen({ onBack, onDropOff }: Props) {
  const [selectedId, setSelectedId] = useState<(typeof PINS)[number]["id"]>(1);
  const selected = PINS.find((p) => p.id === selectedId) ?? PINS[0];

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#DDE4EC]">
      <div className="relative isolate min-h-0 flex-1 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 520"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <rect width="400" height="520" fill="#E4EBF2" />
          <rect x="0" y="420" width="400" height="120" fill="#B8D4E8" />
          <path d="M0 420 Q200 380 400 420 L400 520 L0 520 Z" fill="#C5DCEF" />
          <rect
            x="240"
            y="180"
            width="90"
            height="70"
            rx="6"
            fill="#C8E6C9"
            opacity="0.85"
          />
          <g stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round">
            <path d="M40 120 L360 120" />
            <path d="M80 80 L80 440" />
            <path d="M200 60 L200 400" />
            <path d="M320 100 L320 460" />
            <path d="M40 280 L360 280" />
            <path d="M40 360 L280 360" />
            <path d="M120 120 L120 360" />
            <path d="M280 200 L360 320" />
          </g>
          <g stroke="#D1D9E0" strokeWidth="8" strokeLinecap="round">
            <path d="M60 200 L340 200" />
            <path d="M160 80 L160 320" />
          </g>
        </svg>

        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: "54%", left: "46%" }}
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              <span className="absolute h-8 w-8 rounded-full bg-blue-400/25" />
              <span className="relative h-3 w-3 rounded-full border-2 border-white bg-[#2563EB] shadow" />
            </span>
          </div>
        </div>

        <div className="absolute inset-0 z-[2] overflow-hidden">
          {PINS.map((pin) => (
            <MapPinMarker
              key={pin.id}
              number={pin.id}
              selected={selectedId === pin.id}
              onClick={() => setSelectedId(pin.id)}
              style={{ top: pin.top, left: pin.left }}
            />
          ))}
        </div>

        <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 flex items-center gap-2.5 sm:inset-x-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0B1B32] shadow-md"
          >
            <BackChevron />
          </button>
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-white pl-4 pr-5 shadow-md">
            <span className="flex shrink-0 items-center text-neutral-400">
              <SearchIcon />
            </span>
            <span className="truncate text-[15px] font-medium leading-none text-[#0B1B32]">
              Near you · Parramatta
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label="Recenter map"
          className="absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md"
        >
          <CrosshairIcon />
        </button>
      </div>

      <div className="relative z-30 shrink-0 rounded-t-[1.25rem] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8651A] text-sm font-bold leading-none text-white">
            {selected.id}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight text-[#0B1B32]">
              {selected.name}
            </h2>
            <p className="mt-1 text-sm leading-snug text-neutral-500">
              {selected.address}
            </p>
            <p className="mt-1.5 text-sm leading-snug text-neutral-600">
              {selected.distance} ·{" "}
              <span className="font-medium text-emerald-600">
                {selected.hours}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDropOff}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-[#E8651A] py-3.5 text-base font-bold leading-none text-white transition active:scale-[0.99]"
        >
          Drop off here
        </button>
        <p className="mt-4 text-center text-xs leading-snug text-neutral-400">
          Tap another pin to compare
        </p>
      </div>
    </div>
  );
}
