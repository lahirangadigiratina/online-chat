import { computeTotals } from "./pricing";
import type { Booking, StepConfig, StepId } from "./types";
import {
  isValidEmail,
  MAX_PARCEL_VALUE,
  normalizeAuMobile,
} from "./validation";

const DOWNSTREAM_FROM_DELIVERY: (keyof Booking)[] = [
  "deliveryMethod",
  "deliveryFee",
  "price",
  "estimatedDelivery",
  "sender",
  "receiver",
  "contents",
  "agreements",
  "coupon",
  "paymentMethod",
  "bookingRef",
  "paidOnline",
];

export const STEP_ORDER: StepId[] = [
  "PARCEL_SIZE",
  "ROUTE",
  "PACKAGING",
  "DELIVERY_METHOD",
  "SENDER_MOBILE",
  "SENDER_BUSINESS",
  "SENDER_FIRST_NAME",
  "SENDER_LAST_NAME",
  "SENDER_EMAIL",
  "RECEIVER_NAME",
  "RECEIVER_EMAIL",
  "RECEIVER_MOBILE",
  "RECEIVER_NOTIFY",
  "CONTENTS_CATEGORY",
  "CONTENTS_VALUE",
  "CONFIRM",
  "PAYMENT_METHOD",
  "PAYMENT",
  "DONE",
];

export const STEPS: Record<StepId, StepConfig> = {
  ROUTE: {
    id: "ROUTE",
    botMessage: "Where are you sending from?",
    invalidateKeys: [
      "deliveryMethod",
      "deliveryFee",
      "price",
      "estimatedDelivery",
      "sender",
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  PARCEL_SIZE: {
    id: "PARCEL_SIZE",
    botMessage: "What is the weight of your parcel?",
    bookingKey: "parcelSize",
    invalidateKeys: [
      "parcelSize",
      "packaging",
      "deliveryMethod",
      "deliveryFee",
      "price",
      "estimatedDelivery",
      "sender",
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  PACKAGING: {
    id: "PACKAGING",
    botMessage: "Do you need packaging?",
    bookingKey: "packaging",
    invalidateKeys: [
      "packaging",
      "deliveryMethod",
      "deliveryFee",
      "price",
      "estimatedDelivery",
      "sender",
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  DELIVERY_METHOD: {
    id: "DELIVERY_METHOD",
    botMessage: "How would you like it to be received?",
    bookingKey: "deliveryMethod",
    invalidateKeys: [...DOWNSTREAM_FROM_DELIVERY],
  },
  SENDER_MOBILE: {
    id: "SENDER_MOBILE",
    botMessage: "Now your sender details. What's your mobile number?",
    bookingKey: "sender",
    invalidateKeys: [
      "sender",
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  SENDER_BUSINESS: {
    id: "SENDER_BUSINESS",
    botMessage: "Business name (optional — type Skip to continue)",
    invalidateKeys: [
      "sender",
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  SENDER_FIRST_NAME: {
    id: "SENDER_FIRST_NAME",
    botMessage: "What's your first name?",
    invalidateKeys: [
      "sender",
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  SENDER_LAST_NAME: {
    id: "SENDER_LAST_NAME",
    botMessage: "What's your last name?",
    invalidateKeys: [
      "sender",
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  SENDER_EMAIL: {
    id: "SENDER_EMAIL",
    botMessage: "What's your email address?",
    invalidateKeys: [
      "sender",
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  RECEIVER_NAME: {
    id: "RECEIVER_NAME",
    botMessage: "Who is this going to? What's their first and last name?",
    bookingKey: "receiver",
    invalidateKeys: [
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  RECEIVER_EMAIL: {
    id: "RECEIVER_EMAIL",
    botMessage: "What's the receiver's email?",
    invalidateKeys: [
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  RECEIVER_MOBILE: {
    id: "RECEIVER_MOBILE",
    botMessage: "What's the receiver's mobile number?",
    invalidateKeys: [
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  RECEIVER_NOTIFY: {
    id: "RECEIVER_NOTIFY",
    botMessage: "Should we send tracking updates to the receiver?",
    invalidateKeys: [
      "receiver",
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  CONTENTS_CATEGORY: {
    id: "CONTENTS_CATEGORY",
    botMessage: "What's inside your parcel?",
    invalidateKeys: [
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  CONTENTS_VALUE: {
    id: "CONTENTS_VALUE",
    botMessage: "What's the parcel value?",
    invalidateKeys: [
      "contents",
      "agreements",
      "coupon",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  CONFIRM: {
    id: "CONFIRM",
    botMessage:
      "Almost done! Here's your booking. Please review and accept.",
    bookingKey: "agreements",
    invalidateKeys: [
      "agreements",
      "paymentMethod",
      "bookingRef",
      "paidOnline",
    ],
  },
  PAYMENT_METHOD: {
    id: "PAYMENT_METHOD",
    botMessage: (b) =>
      `Choose how you'd like to pay $${computeTotals(b).total.toFixed(2)} for this booking.`,
    bookingKey: "paymentMethod",
    invalidateKeys: ["paymentMethod", "bookingRef", "paidOnline"],
  },
  PAYMENT: {
    id: "PAYMENT",
    botMessage: (b) =>
      b.paymentMethod === "instore"
        ? "Confirm your booking — you'll pay when you drop off."
        : "Complete your secure card payment.",
    bookingKey: "bookingRef",
    invalidateKeys: ["bookingRef", "paidOnline"],
  },
  DONE: {
    id: "DONE",
    botMessage: "Your booking is complete.",
  },
};

export function resolveBotMessage(stepId: StepId, booking: Booking): string {
  const cfg = STEPS[stepId];
  const msg = cfg.botMessage;
  if (typeof msg === "function") return msg(booking);
  return msg;
}

export function getStepIndex(stepId: StepId): number {
  return STEP_ORDER.indexOf(stepId);
}

/** Carry-on size includes packaging — no separate packaging step. */
export function skipsPackagingStep(booking: Booking): boolean {
  return booking.parcelSize === "carry_on";
}

export function getNextStep(
  current: StepId,
  booking?: Booking
): StepId | null {
  let i = getStepIndex(current);
  if (i < 0) return null;
  while (i < STEP_ORDER.length - 1) {
    i += 1;
    const candidate = STEP_ORDER[i];
    if (candidate === "PACKAGING" && booking && skipsPackagingStep(booking)) {
      continue;
    }
    return candidate;
  }
  return null;
}

export function getPreviousStep(
  current: StepId,
  booking?: Booking
): StepId | null {
  let i = getStepIndex(current);
  if (i <= 0) return null;
  while (i > 0) {
    i -= 1;
    const candidate = STEP_ORDER[i];
    if (candidate === "PACKAGING" && booking && skipsPackagingStep(booking)) {
      continue;
    }
    return candidate;
  }
  return null;
}

export function clearFromStep(booking: Booking, fromStep: StepId): Booking {
  const next = { ...booking };
  const cfg = STEPS[fromStep];
  const keys = cfg.invalidateKeys ?? (cfg.bookingKey ? [cfg.bookingKey] : []);
  for (const key of keys) {
    delete next[key];
  }
  return next;
}

function baseSender(booking: Booking) {
  return {
    mobile: booking.sender?.mobile ?? "",
    firstName: booking.sender?.firstName ?? "",
    lastName: booking.sender?.lastName ?? "",
    email: booking.sender?.email ?? "",
    businessName: booking.sender?.businessName,
    businessStepDone: booking.sender?.businessStepDone,
  };
}

function baseReceiver(booking: Booking) {
  return {
    mobile: booking.receiver?.mobile ?? "",
    firstName: booking.receiver?.firstName ?? "",
    lastName: booking.receiver?.lastName ?? "",
    email: booking.receiver?.email ?? "",
    businessName: booking.receiver?.businessName,
    noTrackingNotifications: booking.receiver?.noTrackingNotifications ?? false,
    notifyStepDone: booking.receiver?.notifyStepDone,
  };
}

function parseFullName(text: string): { firstName: string; lastName: string } | null {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function validateStep(
  stepId: StepId,
  value: unknown,
  booking: Booking
): { ok: true; patch: Partial<Booking> } | { ok: false; error: string } {
  switch (stepId) {
    case "ROUTE": {
      const v = value as {
        senderSuburb: string;
        dropOffPoint: Booking["dropOffPoint"];
        receiverAddress: string;
      };
      const suburb = String(v?.senderSuburb ?? "").trim();
      const address = String(v?.receiverAddress ?? "").trim();
      if (!suburb) return { ok: false, error: "Please enter a sending suburb." };
      if (!v?.dropOffPoint?.id) {
        return { ok: false, error: "Please select a drop-off point." };
      }
      return {
        ok: true,
        patch: {
          senderSuburb: suburb,
          dropOffPoint: v.dropOffPoint,
          ...(address ? { receiverAddress: address } : {}),
        },
      };
    }
    case "PARCEL_SIZE": {
      const sizes = ["satchel", "shoebox", "briefcase", "carry_on"] as const;
      if (!sizes.includes(value as (typeof sizes)[number])) {
        return { ok: false, error: "Please choose a parcel size." };
      }
      return { ok: true, patch: { parcelSize: value as Booking["parcelSize"] } };
    }
    case "PACKAGING": {
      if (typeof value !== "boolean") {
        return { ok: false, error: "Please choose Yes or No." };
      }
      return { ok: true, patch: { packaging: value } };
    }
    case "DELIVERY_METHOD": {
      const m = value as Booking["deliveryMethod"];
      if (m !== "door" && m !== "collect") {
        return { ok: false, error: "Please choose a delivery method." };
      }
      if (!booking.parcelSize || !booking.senderSuburb) {
        return { ok: false, error: "Complete earlier steps first." };
      }
      return { ok: true, patch: { deliveryMethod: m } };
    }
    case "SENDER_MOBILE": {
      const mobile = normalizeAuMobile(String(value ?? ""));
      if (!mobile) {
        return { ok: false, error: "Enter a valid AU mobile (+61 4XX XXX XXX)." };
      }
      return {
        ok: true,
        patch: {
          sender: { ...baseSender(booking), mobile: `+${mobile}` },
        },
      };
    }
    case "SENDER_FIRST_NAME": {
      const firstName = String(value ?? "").trim();
      if (!firstName) {
        return { ok: false, error: "Please enter your first name." };
      }
      return {
        ok: true,
        patch: {
          sender: { ...baseSender(booking), firstName },
        },
      };
    }
    case "SENDER_LAST_NAME": {
      const lastName = String(value ?? "").trim();
      if (!lastName) {
        return { ok: false, error: "Please enter your last name." };
      }
      return {
        ok: true,
        patch: {
          sender: { ...baseSender(booking), lastName },
        },
      };
    }
    case "SENDER_EMAIL": {
      const email = String(value ?? "").trim();
      if (!isValidEmail(email)) {
        return { ok: false, error: "Enter a valid email address." };
      }
      return {
        ok: true,
        patch: { sender: { ...baseSender(booking), email } },
      };
    }
    case "SENDER_BUSINESS": {
      const raw = String(value ?? "").trim();
      const skip = raw.toLowerCase() === "skip" || raw === "";
      return {
        ok: true,
        patch: {
          sender: {
            ...baseSender(booking),
            businessName: skip ? undefined : raw,
            businessStepDone: true,
          },
        },
      };
    }
    case "RECEIVER_NAME": {
      const parsed = parseFullName(String(value ?? ""));
      if (!parsed) {
        return { ok: false, error: "Please enter first and last name." };
      }
      return {
        ok: true,
        patch: {
          receiver: { ...baseReceiver(booking), ...parsed },
        },
      };
    }
    case "RECEIVER_EMAIL": {
      const email = String(value ?? "").trim();
      if (!isValidEmail(email)) {
        return { ok: false, error: "Enter a valid email address." };
      }
      return {
        ok: true,
        patch: { receiver: { ...baseReceiver(booking), email } },
      };
    }
    case "RECEIVER_MOBILE": {
      const mobile = normalizeAuMobile(String(value ?? ""));
      if (!mobile) {
        return { ok: false, error: "Enter a valid AU mobile (+61 4XX XXX XXX)." };
      }
      return {
        ok: true,
        patch: {
          receiver: { ...baseReceiver(booking), mobile: `+${mobile}` },
        },
      };
    }
    case "RECEIVER_NOTIFY": {
      const raw = String(value ?? "").trim().toLowerCase();
      let noTracking = false;
      if (raw === "no" || raw === "n" || raw.includes("don't") || raw.includes("do not")) {
        noTracking = true;
      } else if (raw === "yes" || raw === "y") {
        noTracking = false;
      } else {
        return { ok: false, error: 'Reply "Yes" or "No".' };
      }
      return {
        ok: true,
        patch: {
          receiver: {
            ...baseReceiver(booking),
            noTrackingNotifications: noTracking,
            notifyStepDone: true,
          },
        },
      };
    }
    case "CONTENTS_CATEGORY": {
      const category = String(value ?? "").trim();
      if (!category) {
        return { ok: false, error: "Select or describe what's inside." };
      }
      return {
        ok: true,
        patch: {
          contents: {
            category,
            value: booking.contents?.value ?? 0,
            signatureOnDelivery:
              booking.contents?.signatureOnDelivery ?? false,
            parcelProtection: booking.contents?.parcelProtection ?? false,
            photo: booking.contents?.photo,
            reference: booking.contents?.reference,
          },
        },
      };
    }
    case "CONTENTS_VALUE": {
      const num =
        typeof value === "number" ? value : parseFloat(String(value ?? ""));
      if (!booking.contents?.category) {
        return { ok: false, error: "Choose what's inside first." };
      }
      if (!num || num <= 0) {
        return { ok: false, error: "Parcel value must be greater than $0." };
      }
      if (num > MAX_PARCEL_VALUE) {
        return {
          ok: false,
          error: `Maximum parcel value is $${MAX_PARCEL_VALUE.toLocaleString()}.`,
        };
      }
      return {
        ok: true,
        patch: {
          contents: {
            category: booking.contents.category,
            value: num,
            signatureOnDelivery:
              booking.contents?.signatureOnDelivery ?? false,
            parcelProtection: booking.contents?.parcelProtection ?? false,
            photo: booking.contents?.photo,
            reference: booking.contents?.reference,
          },
        },
      };
    }
    case "CONFIRM": {
      const payload = value as {
        agreements: Booking["agreements"];
        coupon?: Booking["coupon"];
      };
      if (!payload.agreements?.terms || !payload.agreements?.noDangerousGoods) {
        return { ok: false, error: "Please accept the required agreements." };
      }
      return {
        ok: true,
        patch: {
          agreements: payload.agreements,
          coupon: payload.coupon ?? booking.coupon,
        },
      };
    }
    case "PAYMENT_METHOD": {
      const pm = value as Booking["paymentMethod"];
      if (pm !== "online" && pm !== "instore") {
        return { ok: false, error: "Choose a payment method." };
      }
      return { ok: true, patch: { paymentMethod: pm } };
    }
    case "PAYMENT": {
      return { ok: true, patch: {} };
    }
    case "DONE":
      return { ok: true, patch: {} };
    default:
      return { ok: false, error: "Unknown step." };
  }
}

export function isStepSatisfied(stepId: StepId, booking: Booking): boolean {
  switch (stepId) {
    case "ROUTE":
      return !!booking.senderSuburb && !!booking.dropOffPoint;
    case "PARCEL_SIZE":
      return !!booking.parcelSize;
    case "PACKAGING":
      return booking.packaging !== undefined || skipsPackagingStep(booking);
    case "DELIVERY_METHOD":
      return !!booking.deliveryMethod && booking.deliveryFee != null;
    case "SENDER_MOBILE":
      return !!normalizeAuMobile(booking.sender?.mobile ?? "");
    case "SENDER_BUSINESS":
      return booking.sender?.businessStepDone === true;
    case "SENDER_FIRST_NAME":
      return !!booking.sender?.firstName?.trim();
    case "SENDER_LAST_NAME":
      return !!booking.sender?.lastName?.trim();
    case "SENDER_EMAIL":
      return !!booking.sender?.email && isValidEmail(booking.sender.email);
    case "RECEIVER_NAME":
      return !!(booking.receiver?.firstName && booking.receiver?.lastName);
    case "RECEIVER_EMAIL":
      return !!booking.receiver?.email && isValidEmail(booking.receiver.email);
    case "RECEIVER_MOBILE":
      return !!normalizeAuMobile(booking.receiver?.mobile ?? "");
    case "RECEIVER_NOTIFY":
      return booking.receiver?.notifyStepDone === true;
    case "CONTENTS_CATEGORY":
      return !!booking.contents?.category;
    case "CONTENTS_VALUE":
      return (
        !!booking.contents?.category &&
        !!booking.contents.value &&
        booking.contents.value > 0
      );
    case "CONFIRM":
      return (
        !!booking.agreements?.terms && !!booking.agreements?.noDangerousGoods
      );
    case "PAYMENT_METHOD":
      return !!booking.paymentMethod;
    case "PAYMENT":
      return !!booking.bookingRef;
    case "DONE":
      return !!booking.bookingRef;
    default:
      return false;
  }
}

export function firstIncompleteStep(booking: Booking): StepId {
  for (const id of STEP_ORDER) {
    if (id === "DONE") continue;
    if (!isStepSatisfied(id, booking)) return id;
  }
  return "DONE";
}

export function summarizeStep(stepId: StepId, booking: Booking): string {
  switch (stepId) {
    case "PACKAGING":
      return booking.packaging
        ? "Yes, need packaging (+$2.00)"
        : "No packaging needed";
    case "RECEIVER_NOTIFY":
      return booking.receiver?.noTrackingNotifications
        ? "No tracking notifications to receiver"
        : "Send tracking updates to receiver";
    case "CONTENTS_CATEGORY":
      return booking.contents?.category ?? "";
    case "CONTENTS_VALUE": {
      const c = booking.contents;
      if (!c) return "";
      const parts = [c.category, `$${c.value}`];
      if (c.signatureOnDelivery) parts.push("Signature");
      if (c.parcelProtection) parts.push("Protection");
      return parts.join(" · ");
    }
    case "CONFIRM":
      return "Reviewed and accepted";
    case "PAYMENT_METHOD":
      return booking.paymentMethod === "online" ? "Pay Online" : "Pay Instore";
    case "PAYMENT":
      return booking.paidOnline ? "Paid online" : "Pay at counter when dropping off";
    default:
      return "";
  }
}

export const PARCEL_SIZE_INFO: Record<
  NonNullable<Booking["parcelSize"]>,
  { label: string; dimensions: string; maxWeight: string; icon: string }
> = {
  satchel: {
    label: "Satchel",
    dimensions: "25×15×5 cm",
    maxWeight: "Up to 500g",
    icon: "📨",
  },
  shoebox: {
    label: "Shoebox",
    dimensions: "30×25×15 cm",
    maxWeight: "Up to 3kg",
    icon: "👟",
  },
  briefcase: {
    label: "Briefcase",
    dimensions: "40×30×15 cm",
    maxWeight: "Up to 5kg",
    icon: "💼",
  },
  carry_on: {
    label: "Carry-on",
    dimensions: "55×40×20 cm",
    maxWeight: "Up to 12kg",
    icon: "🧳",
  },
};
