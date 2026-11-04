"use client";

import { useMemo, useRef, useState } from "react";
import { ChatFlowFooter, ChatFlowHeader } from "./ChatFlowHeader";
import { ChatTranscript } from "./ChatTranscript";
import {
  buildParcelProgressMessages,
  buildParcelThreadAppend,
  PARCEL_PHOTO_SKIP_USER,
  parcelDescribePlaceholder,
  parcelPackagingUserLine,
  resolveParcelPackagingChoice,
  suggestParcelSizeId,
  suggestParcelSizeLabel,
  type ChatMessage,
  type ParcelSizeId,
} from "./chatThread";

const PGO_ORANGE = "#C44717";

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

type ParcelPhase = "contents" | "describe" | "size" | "photo" | "packaging";
type PackagingChoice = "add" | "packed";

const PHOTO_TIPS = [
  "Whole parcel in the frame",
  "Good light, no blur",
  "Label side up if already packed",
] as const;

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

function GreenTipCheck() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-[#1F7A45]"
    >
      <path
        d="M5 12l4 4 10-10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
  priorThread?: ChatMessage[];
  onContinue?: (append?: ChatMessage[]) => void;
}

export function ChatParcelScreen({
  onBack,
  priorThread = [],
  onContinue,
}: Props) {
  const [phase, setPhase] = useState<ParcelPhase>("contents");
  const [input, setInput] = useState("");
  const [categoryId, setCategoryId] = useState<
    (typeof CATEGORIES)[number]["id"] | null
  >(null);
  const [shortDescription, setShortDescription] = useState("");
  const [selectedId, setSelectedId] = useState<ParcelSizeId>("shoebox");
  const [packaging, setPackaging] = useState<PackagingChoice | null>(null);
  const [photoAdded, setPhotoAdded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHeaderBack = () => {
    if (phase === "size") setPhase("describe");
    else if (phase === "describe") {
      setCategoryId(null);
      setShortDescription("");
      setPhase("contents");
    } else if (phase === "photo") setPhase("size");
    else if (phase === "packaging") {
      setPhotoAdded(false);
      setPhase("photo");
    }
    else onBack();
  };

  const selectedCategory = categoryId
    ? CATEGORIES.find((c) => c.id === categoryId)
    : null;
  const selectedSize = SIZES.find((s) => s.id === selectedId)!;
  const sizeUserReply = `A ${selectedSize.label.toLowerCase()}`;
  const itemPhrase = /running shoe/i.test(shortDescription)
    ? "Running shoes"
    : shortDescription.trim() || "This";

  const sizeSuggestion = useMemo(
    () =>
      suggestParcelSizeId({
        categoryId: categoryId ?? undefined,
        shortDescription,
      }),
    [categoryId, shortDescription],
  );
  const suggestedSizeLabel = useMemo(
    () =>
      suggestParcelSizeLabel({
        categoryId: categoryId ?? undefined,
        shortDescription,
      }),
    [categoryId, shortDescription],
  );

  const sizeReplyLine = (label: string) => `A ${label.toLowerCase()}`;

  const selectSize = (id: ParcelSizeId) => {
    const size = SIZES.find((entry) => entry.id === id)!;
    setSelectedId(id);
    setInput(sizeReplyLine(size.label));
  };

  const submitSize = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const match = SIZES.find((size) => {
      const reply = sizeReplyLine(size.label);
      return (
        trimmed === reply ||
        trimmed.toLowerCase() === size.label.toLowerCase() ||
        trimmed.toLowerCase() === `a ${size.label.toLowerCase()}`
      );
    });
    if (match) setSelectedId(match.id);
    setInput("");
    setPhase("photo");
  };

  const parcelPointBoxLabel = `${selectedSize.label}-size box`;

  const handlePhotoAdded = () => {
    setPhotoAdded(true);
    setPhase("packaging");
  };

  const skipPhotoIntent = () => {
    setInput(PARCEL_PHOTO_SKIP_USER);
  };

  const submitPhotoStep = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const isSkip =
      trimmed === PARCEL_PHOTO_SKIP_USER ||
      /^skip(\s+for\s+now)?$/i.test(trimmed);
    if (!isSkip) return;
    setPhotoAdded(false);
    setInput("");
    setPhase("packaging");
  };

  const selectPackaging = (choice: PackagingChoice) => {
    setPackaging(choice);
    setInput(parcelPackagingUserLine(choice));
  };

  const submitPackaging = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const choice = resolveParcelPackagingChoice(trimmed, packaging);
    if (!choice) return;
    setInput("");
    onContinue?.(
      buildParcelThreadAppend({
        categoryId: categoryId ?? undefined,
        categoryLabel: selectedCategory?.label ?? "Contents",
        categoryIcon: selectedCategory?.icon,
        shortDescription,
        itemPhrase,
        selectedSizeLabel: selectedSize.label,
        sizeUserReply,
        photoAdded,
        skippedPhoto: !photoAdded,
        parcelPointBoxLabel,
        packagingUserReply: parcelPackagingUserLine(choice),
      }),
    );
  };

  const selectCategory = (cat: (typeof CATEGORIES)[number]) => {
    setCategoryId(cat.id);
    setInput(`${cat.icon} ${cat.label}`);
  };

  const submitContents = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!categoryId) {
      const match = CATEGORIES.find(
        (cat) =>
          trimmed === `${cat.icon} ${cat.label}` || trimmed === cat.label,
      );
      setCategoryId(match?.id ?? "other");
    }
    setInput("");
    setPhase("describe");
  };

  const submitDescription = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setShortDescription(trimmed);
    setSelectedId(
      suggestParcelSizeId({
        categoryId: categoryId ?? undefined,
        shortDescription: trimmed,
      }),
    );
    setInput("");
    setPhase("size");
  };

  const skipDescription = () => {
    setShortDescription("");
    setSelectedId(
      suggestParcelSizeId({
        categoryId: categoryId ?? undefined,
        shortDescription: "",
      }),
    );
    setInput("");
    setPhase("size");
  };

  const transcriptMessages = useMemo(() => {
    const parcelProgress = buildParcelProgressMessages(phase, {
      categoryId: categoryId ?? undefined,
      categoryLabel: selectedCategory?.label,
      categoryIcon: selectedCategory?.icon,
      shortDescription,
      itemPhrase,
      suggestedSizeLabel,
      selectedSizeLabel: selectedSize.label,
      sizeUserReply,
      photoAdded,
      parcelPointBoxLabel,
    });
    return [...priorThread, ...parcelProgress];
  }, [
    priorThread,
    phase,
    categoryId,
    selectedCategory,
    shortDescription,
    itemPhrase,
    suggestedSizeLabel,
    selectedSize.label,
    sizeUserReply,
    photoAdded,
    parcelPointBoxLabel,
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep="Parcel"
        onBack={handleHeaderBack}
        accentOrange={PGO_ORANGE}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <ChatTranscript
            messages={transcriptMessages}
            historyCount={
              priorThread.findIndex(
                (message) => message.id === "parcel-great-intro",
              ) >= 0
                ? priorThread.findIndex(
                    (message) => message.id === "parcel-great-intro",
                  )
                : priorThread.length
            }
          />

          {phase === "describe" ? (
            <button
              type="button"
              onClick={skipDescription}
              className="block text-left text-[15px] font-semibold text-[#0B1B32] underline underline-offset-2"
            >
              Skip
            </button>
          ) : null}

          {phase === "contents" ? (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[17px] font-bold text-[#0B1B32]">
                    What&apos;s inside?
                  </h2>
                  <button
                    type="button"
                    className="shrink-0 text-right text-[13px] font-semibold text-[#C44717] underline underline-offset-2"
                  >
                    Prohibited or dangerous goods?
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const selected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => selectCategory(cat)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] transition ${
                          selected
                            ? "border-2 border-[#C44717] bg-[#FFF8F4] font-bold text-[#0B1B32]"
                            : "border border-neutral-200 bg-white font-medium text-[#0B1B32]"
                        }`}
                      >
                        <span className="text-base leading-none" aria-hidden>
                          {cat.icon}
                        </span>
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
          ) : null}

          {phase === "size" && (
            <div className="grid grid-cols-2 gap-2.5">
              {SIZES.map((size) => {
                const selected = selectedId === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => selectSize(size.id)}
                    className={`relative flex flex-col items-center rounded-2xl border px-3 py-4 text-center shadow-sm transition ${
                      selected
                        ? "border-2 border-[#C44717] bg-[#FFF8F4]"
                        : "border border-neutral-200 bg-white"
                    }`}
                  >
                    {size.id === sizeSuggestion ? (
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

          {phase === "photo" && (
            <>
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-neutral-200 bg-[#FAFBFC] px-4 py-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFEBE3]">
                    <CameraIcon />
                  </span>
                  <p className="mt-3 text-center text-[15px] font-bold text-[#0B1B32]">
                    Add parcel photo (optional)
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
                <button
                  type="button"
                  onClick={skipPhotoIntent}
                  className="mt-4 w-full text-center text-[15px] font-semibold text-[#0B1B32] underline underline-offset-2"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}

          {phase === "packaging" && (
            <>
              <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFEBE3]">
                  <ParcelBoxIcon />
                </span>
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
                  onClick={() => selectPackaging("add")}
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
                  onClick={() => selectPackaging("packed")}
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

      <ChatFlowFooter
        input={input}
        onInputChange={setInput}
        placeholder={
          phase === "contents"
            ? "Clothing & Fashion"
            : phase === "describe"
              ? parcelDescribePlaceholder(categoryId ?? undefined)
              : phase === "packaging"
                ? parcelPackagingUserLine("add")
                : phase === "photo"
                  ? PARCEL_PHOTO_SKIP_USER
                  : phase === "size"
                    ? sizeReplyLine(suggestedSizeLabel)
                    : "Type or tap the mic..."
        }
        onSubmitMessage={
          phase === "contents"
            ? submitContents
            : phase === "describe"
              ? submitDescription
              : phase === "size"
                ? submitSize
                : phase === "photo"
                  ? submitPhotoStep
                  : phase === "packaging"
                    ? submitPackaging
                    : undefined
        }
        accentOrange={PGO_ORANGE}
      />
    </div>
  );
}
