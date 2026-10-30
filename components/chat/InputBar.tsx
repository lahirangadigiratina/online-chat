"use client";

import { useEffect, useRef, useState } from "react";
import { isChatInputStep } from "@/lib/chat-input-steps";
import { useChatStore } from "@/lib/store";
import {
  getRecentReceiverAddresses,
} from "@/lib/recent-bookings";
import {
  isImmediateSuggestionAction,
  SUGGESTION_ACTION,
} from "@/lib/suggestions";
import type { StepId } from "@/lib/types";
import { getStepSuggestionHint } from "@/lib/step-hints";
import {
  DISMISSIBLE_WIDGET_STEPS,
  STEPS_WITH_WIDGET_PANEL,
} from "@/lib/widget-steps";
import { StepWidget } from "./StepWidget";
import { WidgetPanelNav } from "./WidgetPanelNav";
import { MicButton } from "./MicButton";
import { SendArrowIcon } from "./SendArrowIcon";
import { SuggestionStrip } from "./SuggestionStrip";

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult:
    | ((event: {
        results: { [index: number]: { [index: number]: { transcript: string } } };
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionCtor = new () => BrowserSpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const PLACEHOLDER: Record<StepId, string> = {
  SUBURB: "e.g. Bondi Junction",
  DROP_OFF_POINT: "Or describe which location you prefer…",
  PARCEL_SIZE: 'Or type size, e.g. "shoebox"…',
  PACKAGING: 'Type "yes" or "no" for packaging…',
  RECEIVER_ADDRESS: "Street address",
  DELIVERY_METHOD: 'Or type "door" or "collect"…',
  SENDER_MOBILE: "e.g. 0434 567 890",
  SENDER_NAME: "First and last name",
  SENDER_EMAIL: "you@example.com",
  SENDER_BUSINESS: "Business name or Skip",
  RECEIVER_NAME: "Receiver first and last name",
  RECEIVER_EMAIL: "Receiver email",
  RECEIVER_MOBILE: "Receiver mobile",
  RECEIVER_NOTIFY: "Yes or No",
  CONTENTS: "Describe contents…",
  CONFIRM: "Questions about your booking…",
  PAYMENT_METHOD: "Type online or instore…",
  PAYMENT: "Payment help…",
  DONE: "Book another parcel from the menu…",
};

const GEO_FALLBACK_SUBURB = "Bondi Junction NSW 2022";

export function InputBar() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [typingPreferred, setTypingPreferred] = useState(false);
  const [widgetPanelCollapsed, setWidgetPanelCollapsed] = useState(false);
  const [optionsPage, setOptionsPage] = useState(0);
  const [optionsPageCount, setOptionsPageCount] = useState(1);
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const store = useChatStore();
  const setWidgetDraft = useChatStore((s) => s.setWidgetDraft);
  const goBack = useChatStore((s) => s.goBack);
  const { currentStep, booking, isTyping, error, submitStep, sendPill, widgetDraft } =
    store;

  useEffect(() => {
    setText("");
    setSuggestions([]);
    setSuggestionsOpen(false);
    setTypingPreferred(false);
    recognitionRef.current?.stop();
    setListening(false);
    setWidgetDraft(null);
    setWidgetPanelCollapsed(false);
    setOptionsPage(0);
    setOptionsPageCount(1);
  }, [currentStep, setWidgetDraft]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleMic = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      useChatStore.setState({
        error: "Voice input isn't supported in this browser. Try Chrome or Safari.",
      });
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "en-AU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setText(transcript);
        setTypingPreferred(true);
        useChatStore.setState({ error: null });
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    useChatStore.setState({ error: null });
    recognition.start();
  };

  useEffect(() => {
    const autocompleteSteps: StepId[] = ["SUBURB", "RECEIVER_ADDRESS"];
    if (!autocompleteSteps.includes(currentStep) || text.length < 2) {
      setSuggestions([]);
      return;
    }
    const endpoint =
      currentStep === "SUBURB"
        ? `/api/suburbs?q=${encodeURIComponent(text)}`
        : `/api/addresses?q=${encodeURIComponent(text)}`;
    const key = currentStep === "SUBURB" ? "suburbs" : "addresses";

    const t = setTimeout(async () => {
      const res = await fetch(endpoint);
      const data = await res.json();
      setSuggestions(data[key] ?? []);
      setSuggestionsOpen(true);
    }, 200);
    return () => clearTimeout(t);
  }, [text, currentStep]);

  const submitComposeValue = async (value: string) => {
    const trimmed = value.trim();
    const draft =
      widgetDraft?.stepId === currentStep ? widgetDraft : null;
    if ((!trimmed && !draft) || busy) return;
    setBusy(true);
    try {
      if (draft && (!trimmed || !isChatInputStep(currentStep))) {
        await submitStep(draft.stepId, draft.value, draft.summary);
      } else if (isChatInputStep(currentStep)) {
        await submitStep(currentStep, trimmed, trimmed);
      } else {
        await store.handleFreeText(trimmed);
      }
      setText("");
      setSuggestionsOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const handleSend = () => void submitComposeValue(text);

  const pickSuggestion = (value: string) => {
    setText(value);
    setWidgetDraft({
      stepId: currentStep,
      value,
      summary: value,
    });
    setSuggestionsOpen(false);
  };

  const handlePillPress = async (pill: { label: string; value: string }) => {
    if (busy || isTyping) return;
    if (pill.value === SUGGESTION_ACTION.typeManual) {
      setTypingPreferred(true);
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    if (isImmediateSuggestionAction(pill.value)) {
      setBusy(true);
      try {
        await sendPill(pill.label, pill.value);
      } finally {
        setBusy(false);
      }
      return;
    }
    if (pill.value === SUGGESTION_ACTION.geolocation) {
      setBusy(true);
      try {
        await resolveGeolocationPill(setWidgetDraft, currentStep);
      } finally {
        setBusy(false);
      }
      return;
    }
    if (pill.value === SUGGESTION_ACTION.useLastReceiver) {
      const recent = getRecentReceiverAddresses();
      if (recent[0]) {
        setWidgetDraft({
          stepId: currentStep,
          value: recent[0],
          summary: recent[0],
        });
      }
      return;
    }
    setWidgetDraft({
      stepId: currentStep,
      value: pill.value,
      summary: pill.label,
    });
  };

  const canBack = currentStep !== "SUBURB";
  const stepHasWidgetPanel =
    !isTyping && STEPS_WITH_WIDGET_PANEL.includes(currentStep);
  const widgetPanelDismissible =
    stepHasWidgetPanel && DISMISSIBLE_WIDGET_STEPS.includes(currentStep);
  const showWidgetPanelExpanded =
    stepHasWidgetPanel && !widgetPanelCollapsed;
  const showWidgetPanelCollapsedBar =
    stepHasWidgetPanel && widgetPanelCollapsed && widgetPanelDismissible;
  const inputEmpty = text.trim().length === 0;
  const showPillStrip = inputEmpty && !isTyping && !typingPreferred;
  const showComposeInput = !isTyping && currentStep !== "DONE";
  const hasWidgetDraft = widgetDraft?.stepId === currentStep;
  const canSendCompose = !!text.trim() || hasWidgetDraft;
  const pillSelectedValue =
    hasWidgetDraft && typeof widgetDraft?.value === "string"
      ? widgetDraft.value
      : undefined;
  const stepPromptHint = getStepSuggestionHint(currentStep, booking);
  const hintOnWidgetPanel = showWidgetPanelExpanded;
  const hintOnSuggestionStrip = showPillStrip && !hintOnWidgetPanel;

  const paginatedOptions =
    currentStep === "DROP_OFF_POINT" && optionsPageCount > 1;
  const pageLabel = paginatedOptions
    ? `${optionsPage + 1} of ${optionsPageCount}`
    : undefined;

  const handleNavPrevious = () => {
    if (paginatedOptions && optionsPage > 0) {
      setOptionsPage((p) => p - 1);
      return;
    }
    if (canBack) goBack();
  };

  const handleNavNext = () => {
    if (paginatedOptions && optionsPage < optionsPageCount - 1) {
      setOptionsPage((p) => p + 1);
    }
  };

  const navPrevDisabled =
    busy ||
    isTyping ||
    (paginatedOptions ? optionsPage === 0 && !canBack : !canBack);
  const navNextDisabled =
    busy ||
    isTyping ||
    (paginatedOptions
      ? optionsPage >= optionsPageCount - 1
      : true);

  return (
    <div
      className={`flex shrink-0 flex-col border-t border-neutral-200 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.06)] ${
        showWidgetPanelExpanded
          ? "max-h-[min(52vh,420px)] min-h-0 overflow-hidden"
          : ""
      }`}
    >
      {showWidgetPanelExpanded && (
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-2 pt-2 sm:pb-3 sm:pt-3">
          <WidgetPanelNav
            hint={stepPromptHint}
            pageLabel={pageLabel}
            onPrevious={handleNavPrevious}
            onNext={handleNavNext}
            previousDisabled={navPrevDisabled}
            nextDisabled={navNextDisabled}
            showClose={widgetPanelDismissible}
            onClose={() => setWidgetPanelCollapsed(true)}
          />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-ms-overflow-style:none] [scrollbar-width:thin]">
            <StepWidget
              stepId={currentStep}
              booking={booking}
              optionsPage={optionsPage}
              onDropOffPageCount={setOptionsPageCount}
            />
          </div>
        </div>
      )}

      {showWidgetPanelCollapsedBar && (
        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 px-3 py-2">
          <button
            type="button"
            onClick={() => setWidgetPanelCollapsed(false)}
            className="text-sm font-medium text-brand-orange hover:underline"
          >
            Show options
          </button>
          <span className="text-xs text-neutral-400">Type your answer below</span>
        </div>
      )}

      {isTyping && (
        <div className="px-3 py-3 text-xs text-neutral-400">Assistant is typing…</div>
      )}

      {showPillStrip && (
        <SuggestionStrip
          step={currentStep}
          booking={booking}
          canBack={canBack && !showWidgetPanelExpanded}
          visible
          busy={busy}
          promptHint={hintOnSuggestionStrip ? stepPromptHint : undefined}
          selectedValue={pillSelectedValue}
          onDismiss={() => {
            setTypingPreferred(true);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          onPillPress={(pill) => void handlePillPress(pill)}
        />
      )}

      {showComposeInput && (
        <div
          className={`px-3 pb-[max(0.375rem,env(safe-area-inset-bottom))] sm:pb-[max(0.5rem,env(safe-area-inset-bottom))] ${
            showPillStrip ? "pt-2" : "border-t border-neutral-100 pt-3"
          }`}
        >
          <div className="relative rounded-2xl border border-neutral-200/90 bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            {suggestionsOpen && suggestions.length > 0 && inputEmpty && (
              <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
                <div className="flex items-center justify-end border-b border-neutral-100 px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() => setSuggestionsOpen(false)}
                    aria-label="Close suggestions"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
                  >
                    <span className="text-xl leading-none" aria-hidden>
                      ×
                    </span>
                  </button>
                </div>
                <ul className="max-h-40 overflow-auto">
                  {suggestions.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
                        onClick={() => pickSuggestion(item)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex min-h-[44px] items-center gap-0.5 sm:min-h-[48px]">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => suggestions.length && setSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && void handleSend()}
                placeholder={PLACEHOLDER[currentStep]}
                className="min-w-0 flex-1 bg-transparent py-2 pl-2.5 pr-1 text-sm outline-none placeholder:text-neutral-400 sm:pl-3"
              />
              <MicButton
                embedded
                active={listening}
                disabled={busy || isTyping}
                onClick={toggleMic}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSendCompose || busy || listening}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white transition enabled:hover:bg-[#d45a16] disabled:bg-neutral-200 disabled:text-neutral-400 sm:h-10 sm:w-10"
              >
                <SendArrowIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === "DONE" && (
        <div className="pb-[max(0.375rem,env(safe-area-inset-bottom))]" />
      )}

      {error && <p className="px-3 pb-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

async function resolveGeolocationPill(
  setWidgetDraft: (draft: {
    stepId: StepId;
    value: unknown;
    summary: string;
  } | null) => void,
  stepId: StepId
) {
  const setSuburbDraft = (suburb: string) =>
    setWidgetDraft({ stepId, value: suburb, summary: suburb });

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    setSuburbDraft(GEO_FALLBACK_SUBURB);
    return;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000,
        maximumAge: 60_000,
      });
    });
    const { latitude, longitude } = position.coords;
    const suburb = await reverseGeocodeSuburb(latitude, longitude);
    setSuburbDraft(suburb);
  } catch {
    setSuburbDraft(GEO_FALLBACK_SUBURB);
  }
}

async function reverseGeocodeSuburb(
  lat: number,
  lon: number
): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { Accept: "application/json" } }
    );
    const data = (await res.json()) as {
      address?: { suburb?: string; town?: string; city?: string; state?: string; postcode?: string };
    };
    const a = data.address;
    const name = a?.suburb ?? a?.town ?? a?.city ?? "Bondi Junction";
    const state = a?.state?.includes("South Wales") ? "NSW" : a?.state ?? "NSW";
    const pc = a?.postcode ?? "";
    return pc ? `${name} ${state} ${pc}` : `${name} ${state}`;
  } catch {
    return GEO_FALLBACK_SUBURB;
  }
}
