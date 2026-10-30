import type { Booking, StepId } from "./types";
import { getRecentReceiverAddresses, hasPreviousBookings } from "./recent-bookings";

export type SuggestionIconName =
  | "MapPin"
  | "Package"
  | "Search"
  | "Clock"
  | "Pencil"
  | "Ticket"
  | "Truck"
  | "ChevronLeft"
  | "Keyboard";

export interface Suggestion {
  label: string;
  icon?: SuggestionIconName;
  value: string;
  /** Muted pill (Start over, Back) */
  muted?: boolean;
}

/** Contextual pills hidden — only Start over (+ Back) shown */
export const WIDGET_SUGGESTION_MINIMAL_STEPS: StepId[] = [
  "DROP_OFF_POINT",
  "PARCEL_SIZE",
  "PACKAGING",
  "DELIVERY_METHOD",
  "CONTENTS",
  "PAYMENT_METHOD",
];

export const SUGGESTION_ACTION = {
  startOver: "action:start_over",
  back: "action:back",
  geolocation: "action:geolocation",
  packagingYes: "action:packaging:yes",
  packagingNo: "action:packaging:no",
  editDetails: "action:edit_details",
  applyCoupon: "action:apply_coupon",
  bookAnother: "action:book_another",
  trackParcel: "action:track_parcel",
  useLastReceiver: "action:use_last_receiver",
  typeManual: "action:type_manual",
} as const;

/** Pills that run immediately (navigation / focus), not select-then-send */
export function isImmediateSuggestionAction(value: string): boolean {
  return (
    value === SUGGESTION_ACTION.startOver ||
    value === SUGGESTION_ACTION.back ||
    value === SUGGESTION_ACTION.typeManual ||
    value === SUGGESTION_ACTION.bookAnother ||
    value === SUGGESTION_ACTION.trackParcel ||
    value === SUGGESTION_ACTION.editDetails ||
    value === SUGGESTION_ACTION.applyCoupon
  );
}

const SUBURB_PILLS: Suggestion[] = [
  { label: "Bondi Junction", icon: "MapPin", value: "Bondi Junction NSW 2022" },
  { label: "Surry Hills", icon: "MapPin", value: "Surry Hills NSW 2010" },
  { label: "Newtown", icon: "MapPin", value: "Newtown NSW 2042" },
  { label: "Parramatta", icon: "MapPin", value: "Parramatta NSW 2150" },
  { label: "Manly", icon: "MapPin", value: "Manly NSW 2095" },
  {
    label: "Use my location",
    icon: "Search",
    value: SUGGESTION_ACTION.geolocation,
  },
];

export const STEP_SUGGESTIONS: Partial<Record<StepId, Suggestion[]>> = {
  SUBURB: SUBURB_PILLS,
  SENDER_BUSINESS: [
    { label: "Skip", value: "Skip", muted: true },
  ],
  RECEIVER_NOTIFY: [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
  ],
  CONFIRM: [
    { label: "Edit details", icon: "Pencil", value: SUGGESTION_ACTION.editDetails },
    { label: "Apply coupon", icon: "Ticket", value: SUGGESTION_ACTION.applyCoupon },
  ],
  DONE: [
    { label: "Book another parcel", icon: "Package", value: SUGGESTION_ACTION.bookAnother },
    { label: "Track a parcel", icon: "Truck", value: SUGGESTION_ACTION.trackParcel },
  ],
};

function receiverAddressPills(booking: Booking): Suggestion[] {
  const pills: Suggestion[] = [];
  if (hasPreviousBookings()) {
    pills.push({
      label: "Same as last time",
      icon: "Clock",
      value: SUGGESTION_ACTION.useLastReceiver,
    });
  }
  const recent = getRecentReceiverAddresses().filter(
    (a) => a !== booking.receiverAddress
  );
  for (const addr of recent.slice(0, 3)) {
    pills.push({
      label: addr.length > 28 ? `${addr.slice(0, 26)}…` : addr,
      icon: "MapPin",
      value: addr,
    });
  }
  return pills;
}

export function getSuggestionsForStep(
  step: StepId,
  booking: Booking,
  options: { canBack: boolean }
): Suggestion[] {
  if (step === "SUBURB" && booking.senderSuburb) return trailingActions(options);

  if (WIDGET_SUGGESTION_MINIMAL_STEPS.includes(step)) {
    return trailingActions(options);
  }

  let contextual: Suggestion[] = [];

  if (step === "RECEIVER_ADDRESS" && !booking.receiverAddress) {
    contextual = receiverAddressPills(booking);
  } else if (STEP_SUGGESTIONS[step]) {
    contextual = [...(STEP_SUGGESTIONS[step] ?? [])];
  }

  const typeManual: Suggestion[] =
    contextual.length > 0
      ? [
          {
            label: "Type your answer instead",
            icon: "Keyboard",
            value: SUGGESTION_ACTION.typeManual,
          },
        ]
      : [];

  return [...contextual, ...typeManual, ...trailingActions(options)];
}

function trailingActions(options: { canBack: boolean }): Suggestion[] {
  const tail: Suggestion[] = [];
  if (options.canBack) {
    tail.push({
      label: "Back",
      icon: "ChevronLeft",
      value: SUGGESTION_ACTION.back,
      muted: true,
    });
  }
  tail.push({
    label: "Start over",
    value: SUGGESTION_ACTION.startOver,
    muted: true,
  });
  return tail;
}
