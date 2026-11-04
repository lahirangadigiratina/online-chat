"use client";

import { useMemo, useState } from "react";
import {
  PARCELPOINT_LOCATION_OPTIONS,
  parcelPointDistanceLine,
  type ParcelPointLocationOption,
} from "./chatThread";

const PGO_ORANGE = "#C44717";

interface Props {
  onBack: () => void;
  onCollectFromHere: (locationId: string) => void;
  selectedId: string;
  searchLabel?: string;
  receiverFirstName?: string;
  locations?: ParcelPointLocationOption[];
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

function TeardropPin({
  number,
  selected,
}: {
  number: number;
  selected: boolean;
}) {
  const fill = selected ? PGO_ORANGE : "#0B1B32";
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

function ReceiverHomeMarker({
  name,
  style,
}: {
  name: string;
  style: { top: string; left: string };
}) {
  return (
    <div
      className="absolute z-[2] flex -translate-x-1/2 flex-col items-center"
      style={{ ...style, transform: "translate(-50%, -50%)" }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1B32] text-white shadow-md">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="mt-1 text-[11px] font-bold text-[#0B1B32]">{name}</span>
    </div>
  );
}

export function ParcelPointPickMapScreen({
  onBack,
  onCollectFromHere,
  selectedId,
  searchLabel = "Near Paddington, Brisbane",
  receiverFirstName = "Margaret",
  locations = PARCELPOINT_LOCATION_OPTIONS,
}: Props) {
  const [activeId, setActiveId] = useState(selectedId);
  const selected =
    locations.find((entry) => entry.id === activeId) ?? locations[0];
  const selectedIndex = useMemo(
    () =>
      Math.max(
        0,
        locations.findIndex((entry) => entry.id === activeId),
      ),
    [activeId, locations],
  );

  const distancePrefix = parcelPointDistanceLine(selected, receiverFirstName);

  return (
    <div className="absolute inset-0 z-50 flex h-full min-h-0 flex-col bg-[#DDE4EC]">
      <div className="relative isolate min-h-0 flex-1 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 520"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <rect width="400" height="520" fill="#E4EBF2" />
          <rect x="0" y="400" width="400" height="120" fill="#B8D4E8" />
          <path d="M0 400 Q220 360 400 400 L400 520 L0 520 Z" fill="#C5DCEF" />
          <rect
            x="220"
            y="160"
            width="100"
            height="80"
            rx="6"
            fill="#C8E6C9"
            opacity="0.85"
          />
          <g stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round">
            <path d="M40 100 L360 100" />
            <path d="M100 70 L100 420" />
            <path d="M220 50 L220 380" />
            <path d="M320 90 L320 440" />
            <path d="M40 260 L360 260" />
            <path d="M40 340 L300 340" />
            <path d="M140 100 L140 340" />
          </g>
        </svg>

        <div className="absolute inset-0 z-[2] overflow-hidden">
          <ReceiverHomeMarker
            name={receiverFirstName}
            style={{ top: "58%", left: "46%" }}
          />
          {locations.map((pin, index) => (
            <MapPinMarker
              key={pin.id}
              number={index + 1}
              selected={activeId === pin.id}
              onClick={() => setActiveId(pin.id)}
              style={{ top: pin.mapTop, left: pin.mapLeft }}
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
              {searchLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-30 shrink-0 rounded-t-[1.25rem] bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
        <div
          className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-neutral-300"
          aria-hidden
        />
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold leading-none text-white"
            style={{ backgroundColor: PGO_ORANGE }}
          >
            {selectedIndex + 1}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight text-[#0B1B32]">
              {selected.name}
            </h2>
            <p className="mt-1 text-sm leading-snug text-neutral-500">
              {selected.address}
            </p>
            <p className="mt-1.5 text-sm leading-snug text-neutral-600">
              {distancePrefix}
              <span className="font-medium text-emerald-600">
                {selected.hoursOpen}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onCollectFromHere(selected.id)}
          className="mt-6 flex w-full items-center justify-center rounded-full py-3.5 text-base font-bold leading-none text-white transition active:scale-[0.99]"
          style={{ backgroundColor: PGO_ORANGE }}
        >
          Collect from here
        </button>
        <p className="mt-4 text-center text-xs leading-snug text-neutral-400">
          Tap another pin to compare
        </p>
      </div>
    </div>
  );
}
