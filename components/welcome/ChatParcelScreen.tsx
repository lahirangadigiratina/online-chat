"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";

const PGO_ORANGE = "#C44717";
const PGO_NAVY = "#0B1B32";

const SIZES = [
  {
    id: "satchel",
    label: "Satchel",
    dims: "25x15x5cm",
    weight: "500g",
    icon: "satchel" as const,
  },
  {
    id: "shoebox",
    label: "Shoebox",
    dims: "30x25x15cm",
    weight: "3kg",
    icon: "shoebox" as const,
    pick: true,
  },
  {
    id: "briefcase",
    label: "Briefcase",
    dims: "40x30x15cm",
    weight: "5kg",
    icon: "briefcase" as const,
  },
  {
    id: "carryon",
    label: "Carry On",
    dims: "55x40x20cm",
    weight: "12kg",
    icon: "carryon" as const,
  },
] as const;

const CATEGORIES = [
  { id: "electronics", label: "Electronics", icon: "💻" },
  { id: "clothing", label: "Clothing & Fashion", icon: "👕" },
  { id: "food", label: "Food & Perishables", icon: "🍎" },
  { id: "fragile", label: "Fragile Items", icon: "⚠️" },
  { id: "sporting", label: "Sporting Goods", icon: "⚽" },
  { id: "books", label: "Books & Media", icon: "📚" },
  { id: "other", label: "Other", icon: "📦" },
] as const;

type ParcelPhase = "contents" | "size" | "photo" | "packaging";
type PackagingChoice = "add" | "packed";

const PHOTO_TIPS = [
  "Whole parcel in the frame",
  "Good light, no blur",
  "Label side up if already packed",
] as const;

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-[1.25rem] rounded-br-md bg-[#0B1B32] px-4 py-2.5 text-[15px] leading-snug text-white">
        {children}
      </div>
    </div>
  );
}

function PhotoAddedStatus() {
  return (
    <div className="flex justify-end">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#0B1B32] px-4 py-2 text-[14px] font-semibold text-white">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="shrink-0 opacity-90"
        >
          <path
            d="M4 8h4l2-2h4l2 2h4v11H4V8z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="13"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
        Photo added
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

function SizeLineIcon({
  type,
  active,
}: {
  type: (typeof SIZES)[number]["icon"];
  active?: boolean;
}) {
  const stroke = active ? "#C44717" : "#0B1B32";
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  if (type === "satchel") {
    return (
      <svg {...common}>
        <path
          d="M6 8h12v10H6V8zM8 8V6h8v2"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M6 12h12" stroke={stroke} strokeWidth="1.75" />
      </svg>
    );
  }
  if (type === "shoebox") {
    return (
      <svg {...common}>
        <path
          d="M5 9h14v9H5V9zM5 9l7 4 7-4"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === "briefcase") {
    return (
      <svg {...common}>
        <path
          d="M8 8V7a2 2 0 012-2h4a2 2 0 012 2v1M6 8h12v10H6V8z"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M6 12h12" stroke={stroke} strokeWidth="1.75" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        d="M9 8h6v11H9V8zM10 8V6h4v2M12 11v3"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ParcelBoxIcon({ size }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const scale = size
    ? { sm: 0.75, md: 0.9, lg: 1.05, xl: 1.2 }[size]
    : 0.9;
  return (
    <svg
      width={28}
      height={24}
      viewBox="0 0 28 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-[#C44717]"
      style={{ transform: `scale(${scale})`, transformOrigin: "left center" }}
    >
      <path
        d="M4 7h16v12H4V7z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M4 7l8 4 8-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function GreenTipCheck() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
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

function CameraIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-[#C44717]"
    >
      <path
        d="M4 8h4l2-2h4l2 2h4v11H4V8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.25" stroke="currentColor" strokeWidth="1.75" />
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
  onContinue?: () => void;
}

export function ChatParcelScreen({ onBack, onContinue }: Props) {
  const [phase, setPhase] = useState<ParcelPhase>("contents");
  const [input, setInput] = useState("");
  const [categoryId, setCategoryId] =
    useState<(typeof CATEGORIES)[number]["id"]>("clothing");
  const [shortDescription, setShortDescription] = useState(
    "A pair of running shoes",
  );
  const [selectedId, setSelectedId] =
    useState<(typeof SIZES)[number]["id"]>("shoebox");
  const [packaging, setPackaging] = useState<PackagingChoice>("add");
  const [photoAdded, setPhotoAdded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHeaderBack = () => {
    if (phase === "size") setPhase("contents");
    else if (phase === "photo") setPhase("size");
    else if (phase === "packaging") {
      setPhotoAdded(false);
      setPhase("photo");
    }
    else onBack();
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === categoryId)!;
  const selectedSize = SIZES.find((s) => s.id === selectedId)!;
  const sizeUserReply = `A ${selectedSize.label.toLowerCase()}.`;
  const itemPhrase = /running shoe/i.test(shortDescription)
    ? "Running shoes"
    : shortDescription.trim() || "This";

  const confirmSize = (id: (typeof SIZES)[number]["id"]) => {
    setSelectedId(id);
    setPhase("photo");
  };

  const parcelPointBoxLabel = `${selectedSize.label}-size box`;

  const handlePhotoAdded = () => {
    setPhotoAdded(true);
    setPhase("packaging");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep="Parcel"
        onBack={handleHeaderBack}
        accentOrange={PGO_ORANGE}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {phase === "contents" ? (
            <>
              <UserBubble>Looks right</UserBubble>
              <BotBubble>
                Great! Now, what&apos;s inside the parcel?
              </BotBubble>
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <h2 className="text-[17px] font-bold text-[#0B1B32]">
                  What&apos;s inside?
                </h2>
                <div className="mt-3 flex flex-col">
                  {CATEGORIES.map((cat, index) => {
                    const selected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`flex w-full items-center gap-3 py-3 text-left ${
                          index > 0 ? "border-t border-neutral-100" : ""
                        } ${selected ? "bg-[#FFF8F4]" : ""}`}
                      >
                        <span className="text-xl" aria-hidden>
                          {cat.icon}
                        </span>
                        <span className="min-w-0 flex-1 text-[15px] font-medium text-[#0B1B32]">
                          {cat.label}
                        </span>
                        {selected ? <CheckCircle /> : null}
                      </button>
                    );
                  })}
                </div>
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-[13px] font-medium text-neutral-600">
                    Short description (optional)
                  </span>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-[15px] text-[#0B1B32] outline-none focus:border-[#C44717] focus:ring-2 focus:ring-[#C44717]/12"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setPhase("size")}
                  className="mt-4 w-full rounded-full py-3.5 text-base font-bold text-white transition active:scale-[0.99]"
                  style={{ backgroundColor: PGO_NAVY }}
                >
                  Continue
                </button>
              </div>
            </>
          ) : null}

          {(phase === "size" || phase === "photo" || phase === "packaging") && (
            <>
              <UserBubble>
                {selectedCategory.label} —{" "}
                {shortDescription.trim().toLowerCase() ||
                  "a pair of running shoes"}
              </UserBubble>
              <BotBubble>
                Thanks! {itemPhrase} in their box usually fit a{" "}
                <span className="font-bold">Shoebox</span>. Sound right?
              </BotBubble>
            </>
          )}

          {phase === "size" && (
            <div className="grid grid-cols-2 gap-2.5">
              {SIZES.map((size) => {
                const selected = selectedId === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => confirmSize(size.id)}
                    className={`relative flex flex-col items-center rounded-2xl border px-3 py-4 text-center shadow-sm transition ${
                      selected
                        ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                        : "border border-neutral-200 bg-white"
                    }`}
                  >
                    {"pick" in size ? (
                      <span className="absolute right-2 top-2 rounded-full bg-[#C44717] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                        PGo&apos;s pick
                      </span>
                    ) : null}
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-100 bg-[#F3F4F6]">
                      <SizeLineIcon type={size.icon} active={selected} />
                    </span>
                    <span className="mt-2.5 text-[15px] font-bold text-[#0B1B32]">
                      {size.label}
                    </span>
                    <span className="mt-1 text-xs text-neutral-500">
                      {size.dims.replace(/x/g, "×")}
                    </span>
                    <span className="mt-0.5 text-xs text-neutral-500">
                      Up to{" "}
                      <span className="font-bold text-[#0B1B32]">
                        {size.weight}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {(phase === "photo" || phase === "packaging") && (
            <>
              <UserBubble>{sizeUserReply}</UserBubble>
              <BotBubble>
                {selectedSize.label} it is. Could you add a quick photo of the
                parcel? It helps the ParcelPoint match it at drop-off and
                supports any Parcel Protection claim.
              </BotBubble>
            </>
          )}

          {phase === "photo" && (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-neutral-200 bg-[#FAFBFC] px-4 py-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFEBE3]">
                    <CameraIcon />
                  </span>
                  <p className="mt-3 text-[15px] font-bold text-[#0B1B32]">
                    Add parcel photo
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    JPG or PNG, up to 10 MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoAdded}
                />
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handlePhotoAdded}
                    className="rounded-full py-3 text-[15px] font-bold text-white transition active:scale-[0.99]"
                    style={{ backgroundColor: PGO_ORANGE }}
                  >
                    Take photo
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border border-neutral-200 bg-white py-3 text-[15px] font-bold text-[#0B1B32] transition active:scale-[0.99]"
                  >
                    Upload
                  </button>
                </div>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {PHOTO_TIPS.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-center gap-2.5 text-[14px] text-[#0B1B32]"
                    >
                      <GreenTipCheck />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
          )}

          {phase === "packaging" && photoAdded && (
            <>
              <PhotoAddedStatus />
              <BotBubble>
                Thanks, that&apos;s a clear photo. Is it already packed, or
                would you like packaging? We&apos;ll have a {parcelPointBoxLabel}{" "}
                ready at the ParcelPoint for{" "}
                <span className="font-bold">$2.00</span>.
              </BotBubble>

              <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <ParcelBoxIcon />
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-[#0B1B32]">
                    ParcelPoint {parcelPointBoxLabel}
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    Collected and packed at drop-off
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setPackaging("add")}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    packaging === "add"
                      ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                      : "border border-neutral-200 bg-white"
                  }`}
                >
                  <RadioMark selected={packaging === "add"} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-[#0B1B32]">
                      Yes, add packaging
                    </span>
                    <span className="mt-0.5 block text-sm text-neutral-500">
                      Ready when you drop it off
                    </span>
                  </span>
                  <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                    +$2.00
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPackaging("packed")}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    packaging === "packed"
                      ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                      : "border border-neutral-200 bg-white"
                  }`}
                >
                  <RadioMark selected={packaging === "packed"} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-[#0B1B32]">
                      No, it&apos;s already packed
                    </span>
                    <span className="mt-0.5 block text-sm text-neutral-500">
                      I&apos;ll bring it sealed and ready
                    </span>
                  </span>
                  <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">
                    $0.00
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {phase === "contents" ? (
        <ChatFlowFooter
          input={input}
          onInputChange={setInput}
          placeholder="Type or tap the mic..."
          accentOrange={PGO_ORANGE}
        />
      ) : (
        <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
          {phase === "packaging" ? (
            <button
              type="button"
              onClick={onContinue}
              className="mb-2.5 w-full rounded-full py-3.5 text-base font-bold text-white transition active:scale-[0.99]"
              style={{ backgroundColor: PGO_NAVY }}
            >
              Continue
            </button>
          ) : null}
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                phase === "photo" || phase === "packaging"
                  ? 'e.g. "it\'s about 2 kilos"'
                  : 'e.g. "shoebox"'
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
      )}
    </div>
  );
}
