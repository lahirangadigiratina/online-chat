"use client";

import { create } from "zustand";
import {
  clearFromStep,
  getNextStep,
  getPreviousStep,
  PARCEL_SIZE_INFO,
  resolveBotMessage,
  STEP_ORDER,
  summarizeStep,
  validateStep,
} from "./flow";
import { computeTotals } from "./pricing";
import { applyParsedFields, parseUserMessage } from "./parse";
import { saveRecentReceiverAddress } from "./recent-bookings";
import { isChatInputStep } from "./chat-input-steps";
import { SUGGESTION_ACTION } from "./suggestions";
import type { Booking, ChatMessage, FlowState, StepId, WidgetDraft } from "./types";
import { STEPS_WITH_WIDGET_PANEL } from "./widget-steps";

const TYPING_MS = 600;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function fetchQuote(booking: Booking) {
  const res = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parcelSize: booking.parcelSize,
      deliveryMethod: booking.deliveryMethod,
      from: booking.senderSuburb,
      to: booking.receiverAddress,
    }),
  });
  if (!res.ok) throw new Error("Quote failed");
  return res.json() as Promise<{ price: number; estimatedDelivery: string }>;
}

interface ChatStore {
  started: boolean;
  booking: Booking;
  currentStep: StepId;
  completedSteps: StepId[];
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
  widgetDraft: WidgetDraft | null;
  setWidgetDraft: (draft: WidgetDraft | null) => void;
  beginChat: (openingText: string) => Promise<void>;
  goBack: () => void;
  startOver: () => void;
  jumpToStep: (stepId: StepId) => void;
  submitStep: (stepId: StepId, value: unknown, summary: string) => Promise<void>;
  pushBotForStep: (stepId: StepId) => Promise<void>;
  handleFreeText: (text: string) => Promise<void>;
  sendPill: (label: string, value: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  started: false,
  booking: {},
  currentStep: "SUBURB",
  completedSteps: [],
  messages: [],
  isTyping: false,
  error: null,
  widgetDraft: null,

  setWidgetDraft: (draft) => set({ widgetDraft: draft, error: null }),

  beginChat: async (openingText: string) => {
    const trimmed = openingText.trim();
    if (!trimmed) return;

    set({
      started: true,
      booking: {},
      currentStep: "SUBURB",
      completedSteps: [],
      messages: [{ id: uid(), role: "user", text: trimmed }],
      isTyping: false,
      error: null,
      widgetDraft: null,
    });

    await get().pushBotForStep("SUBURB");
    await applyParsedOpening(trimmed, get);
  },

  pushBotForStep: async (stepId: StepId) => {
    set({ isTyping: true, error: null });
    await new Promise((r) => setTimeout(r, TYPING_MS));
    const booking = get().booking;
    const text = resolveBotMessage(stepId, booking);
    const msg: ChatMessage = {
      id: uid(),
      role: "bot",
      text,
      stepId,
      widgetActive: STEPS_WITH_WIDGET_PANEL.includes(stepId),
    };
    set((s) => ({
      isTyping: false,
      currentStep: stepId,
      messages: [...s.messages, msg],
    }));
  },

  submitStep: async (stepId, value, summary) => {
    const { booking } = get();
    const result = validateStep(stepId, value, booking);
    if (!result.ok) {
      set({ error: result.error });
      return;
    }

    let nextBooking: Booking = { ...booking, ...result.patch };
    let senderLookupFilled = false;

    if (stepId === "SENDER_MOBILE") {
      try {
        const mobile = nextBooking.sender?.mobile ?? "";
        const res = await fetch(
          `/api/customer-lookup?mobile=${encodeURIComponent(mobile)}`
        );
        if (res.ok) {
          const data = await res.json();
          const c = data.customer;
          nextBooking = {
            ...nextBooking,
            sender: {
              mobile: c.mobile ?? mobile,
              firstName: c.firstName,
              lastName: c.lastName,
              email: c.email,
              businessName: c.businessName,
              businessStepDone: true,
            },
          };
          senderLookupFilled = true;
        }
      } catch {
        /* continue one question at a time */
      }
    }

    if (stepId === "DELIVERY_METHOD") {
      try {
        const quote = await fetchQuote(nextBooking);
        nextBooking = {
          ...nextBooking,
          deliveryFee: quote.price,
          price: quote.price,
          estimatedDelivery: quote.estimatedDelivery,
        };
      } catch {
        set({ error: "Could not get a quote. Try again." });
        return;
      }
    }

    if (stepId === "PAYMENT") {
      try {
        const paidOnline = (value as { paidOnline?: boolean }).paidOnline ?? false;
        const res = await fetch("/api/bookings", { method: "POST" });
        if (!res.ok) throw new Error("Booking failed");
        const { bookingRef } = (await res.json()) as { bookingRef: string };
        nextBooking = { ...nextBooking, bookingRef, paidOnline };
        if (nextBooking.receiverAddress) {
          saveRecentReceiverAddress(nextBooking.receiverAddress);
        }
      } catch {
        set({ error: "Could not create booking. Try again." });
        return;
      }
    }

    set((s) => {
      const messages = s.messages.map((m) =>
        m.stepId === stepId && m.role === "bot"
          ? { ...m, widgetActive: false }
          : m
      );
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        text: summary,
        stepId,
        widgetSummary: summary,
      };
      const skipFromLookup: StepId[] = senderLookupFilled
        ? ["SENDER_NAME", "SENDER_EMAIL", "SENDER_BUSINESS"]
        : [];
      const completed = [...s.completedSteps];
      if (!completed.includes(stepId)) completed.push(stepId);
      for (const id of skipFromLookup) {
        if (!completed.includes(id)) completed.push(id);
      }

      const lookupNote: ChatMessage[] = senderLookupFilled
        ? [
            {
              id: uid(),
              role: "bot",
              text: "We found your saved details and filled them in.",
            },
          ]
        : [];

      return {
        booking: nextBooking,
        messages:
          stepId === "DONE"
            ? messages
            : [...messages, userMsg, ...lookupNote],
        completedSteps: completed,
        error: null,
        widgetDraft: null,
      };
    });

    let next = getNextStep(stepId);
    if (stepId === "SENDER_MOBILE" && senderLookupFilled) {
      next = "RECEIVER_NAME";
    } else if (
      stepId === "SENDER_EMAIL" &&
      !nextBooking.sender?.businessStepDone
    ) {
      next = "SENDER_BUSINESS";
    }

    if (next) await get().pushBotForStep(next);
  },

  goBack: () => {
    const { currentStep } = get();
    const prev = getPreviousStep(currentStep);
    if (!prev) return;
    get().jumpToStep(prev);
  },

  jumpToStep: (stepId: StepId) => {
    const booking = clearFromStep(get().booking, stepId);
    const stepIndex = STEP_ORDER.indexOf(stepId);
    const completedSteps = get().completedSteps.filter(
      (id) => STEP_ORDER.indexOf(id) < stepIndex
    );

    set((s) => ({
      booking,
      completedSteps,
      messages: s.messages.filter(
        (m) => !m.stepId || STEP_ORDER.indexOf(m.stepId) < stepIndex
      ),
      error: null,
      widgetDraft: null,
    }));

    void get().pushBotForStep(stepId);
  },

  startOver: () => {
    set({
      started: false,
      booking: {},
      currentStep: "SUBURB",
      completedSteps: [],
      messages: [],
      isTyping: false,
      error: null,
      widgetDraft: null,
    });
  },

  handleFreeText: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const flowState: FlowState = {
      currentStep: get().currentStep,
      booking: get().booking,
      completedSteps: get().completedSteps,
      messages: get().messages,
      isTyping: get().isTyping,
    };

    const parsed = parseUserMessage(trimmed, flowState);
    set((s) => ({
      messages: [
        ...s.messages,
        { id: uid(), role: "user", text: trimmed },
      ],
      error:
        Object.keys(parsed.fields).length === 0
          ? "Try the options above, or mention suburb, size, or address."
          : null,
    }));

    if (Object.keys(parsed.fields).length === 0) return;

    const { booking: merged } = await applyParsedFields(
      parsed.fields,
      get().booking,
      fetchQuote
    );

    await autoSubmitParsedSteps(get, merged);
  },

  sendPill: async (label: string, value: string) => {
    const { currentStep } = get();

    if (value === SUGGESTION_ACTION.startOver) {
      get().startOver();
      return;
    }
    if (value === SUGGESTION_ACTION.back) {
      get().goBack();
      return;
    }
    if (value === SUGGESTION_ACTION.bookAnother) {
      get().startOver();
      return;
    }
    if (value === SUGGESTION_ACTION.trackParcel) {
      await get().beginChat("Track a parcel");
      return;
    }
    if (value === SUGGESTION_ACTION.editDetails) {
      get().jumpToStep("DROP_OFF_POINT");
      return;
    }
    if (value === SUGGESTION_ACTION.applyCoupon) {
      set({
        error: null,
        messages: [
          ...get().messages,
          { id: uid(), role: "user", text: label },
        ],
      });
      set({
        error: 'Try coupon code SAVE5 in the field above, then tap Apply.',
      });
      return;
    }
    if (value === SUGGESTION_ACTION.packagingYes) {
      await get().submitStep(
        "PACKAGING",
        true,
        summarizeStep("PACKAGING", { packaging: true })
      );
      return;
    }
    if (value === SUGGESTION_ACTION.packagingNo) {
      await get().submitStep(
        "PACKAGING",
        false,
        summarizeStep("PACKAGING", { packaging: false })
      );
      return;
    }
    if (value === SUGGESTION_ACTION.useLastReceiver) {
      const { getRecentReceiverAddresses } = await import("./recent-bookings");
      const recent = getRecentReceiverAddresses();
      if (recent[0]) {
        await get().submitStep("RECEIVER_ADDRESS", recent[0], recent[0]);
      }
      return;
    }

    if (isChatInputStep(currentStep)) {
      await get().submitStep(currentStep, value, label);
      return;
    }

    set((s) => ({
      messages: [...s.messages, { id: uid(), role: "user", text: label }],
      error: null,
    }));

    const flowState: FlowState = {
      currentStep: get().currentStep,
      booking: get().booking,
      completedSteps: get().completedSteps,
      messages: get().messages,
      isTyping: get().isTyping,
    };
    const parsed = parseUserMessage(value, flowState);
    if (Object.keys(parsed.fields).length === 0) {
      set({ error: "We couldn't use that suggestion on this step." });
      return;
    }
    const { booking: merged } = await applyParsedFields(
      parsed.fields,
      get().booking,
      fetchQuote
    );
    await autoSubmitParsedSteps(get, merged);
  },
}));

async function applyParsedOpening(
  trimmed: string,
  get: () => ChatStore
) {
  const flowState: FlowState = {
    currentStep: get().currentStep,
    booking: get().booking,
    completedSteps: get().completedSteps,
    messages: get().messages,
    isTyping: get().isTyping,
  };
  const parsed = parseUserMessage(trimmed, flowState);
  if (Object.keys(parsed.fields).length === 0) return;

  const { booking: merged } = await applyParsedFields(
    parsed.fields,
    get().booking,
    fetchQuote
  );
  await autoSubmitParsedSteps(get, merged);
}

async function autoSubmitParsedSteps(
  get: () => ChatStore,
  merged: Booking
) {
  const order: StepId[] = [
    "SUBURB",
    "PARCEL_SIZE",
    "PACKAGING",
    "RECEIVER_ADDRESS",
    "DELIVERY_METHOD",
  ];

  for (const stepId of order) {
    const current = get().booking;
    if (isStepAnswered(stepId, merged) && !isStepAnswered(stepId, current)) {
      const { value, summary } = stepPayload(stepId, merged);
      if (value !== undefined) {
        await get().submitStep(stepId, value, summary);
      }
    }
  }
}

function isStepAnswered(stepId: StepId, booking: Booking): boolean {
  switch (stepId) {
    case "SUBURB":
      return !!booking.senderSuburb;
    case "PARCEL_SIZE":
      return !!booking.parcelSize;
    case "PACKAGING":
      return booking.packaging !== undefined;
    case "RECEIVER_ADDRESS":
      return !!booking.receiverAddress;
    case "DELIVERY_METHOD":
      return !!booking.deliveryMethod;
    default:
      return false;
  }
}

function stepPayload(
  stepId: StepId,
  booking: Booking
): { value: unknown; summary: string } {
  switch (stepId) {
    case "SUBURB":
      return { value: booking.senderSuburb, summary: booking.senderSuburb ?? "" };
    case "PARCEL_SIZE": {
      const info = booking.parcelSize
        ? PARCEL_SIZE_INFO[booking.parcelSize]
        : null;
      return {
        value: booking.parcelSize,
        summary: info ? `${info.label} ${info.maxWeight}` : "",
      };
    }
    case "PACKAGING":
      return {
        value: booking.packaging,
        summary: summarizeStep("PACKAGING", booking),
      };
    case "RECEIVER_ADDRESS":
      return {
        value: booking.receiverAddress,
        summary: booking.receiverAddress ?? "",
      };
    case "DELIVERY_METHOD": {
      const totals = computeTotals(booking);
      return {
        value: booking.deliveryMethod,
        summary:
          booking.deliveryMethod === "door"
            ? `Deliver to Door · $${totals.delivery.toFixed(2)} · Est. ${booking.estimatedDelivery ?? ""}`
            : `Collect · $${totals.delivery.toFixed(2)} · Est. ${booking.estimatedDelivery ?? ""}`,
      };
    }
    default:
      return { value: undefined, summary: "" };
  }
}
