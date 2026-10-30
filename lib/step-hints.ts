import type { Booking, StepId } from "./types";

const HINTS: Record<StepId, string | ((b: Booking) => string)> = {
  SUBURB: "Where are you sending from?",
  DROP_OFF_POINT: "Choose a drop-off point",
  PARCEL_SIZE: "What size is your parcel?",
  PACKAGING: "Need packaging?",
  RECEIVER_ADDRESS: "Where is it going?",
  DELIVERY_METHOD: "How should it be delivered?",
  SENDER_MOBILE: "Your mobile number",
  SENDER_NAME: "Your name",
  SENDER_EMAIL: "Your email",
  SENDER_BUSINESS: "Business name (optional)",
  RECEIVER_NAME: "Receiver's name",
  RECEIVER_EMAIL: "Receiver's email",
  RECEIVER_MOBILE: "Receiver's mobile",
  RECEIVER_NOTIFY: "Tracking updates for receiver?",
  CONTENTS: "What's inside the parcel?",
  CONFIRM: "Review your booking",
  PAYMENT_METHOD: "How would you like to pay?",
  PAYMENT: "Complete payment",
  DONE: "All done",
};

export function getStepSuggestionHint(step: StepId, booking: Booking): string {
  const h = HINTS[step];
  return typeof h === "function" ? h(booking) : h;
}
