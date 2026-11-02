import type { Booking, StepId } from "./types";

const HINTS: Record<StepId, string | ((b: Booking) => string)> = {
  ROUTE: "Where are you sending from?",
  PARCEL_SIZE: "What is the weight of your parcel?",
  PACKAGING: "Need packaging?",
  DELIVERY_METHOD: "How should it be delivered?",
  SENDER_MOBILE: "Your mobile number",
  SENDER_BUSINESS: "Business name (optional)",
  SENDER_FIRST_NAME: "Your first name",
  SENDER_LAST_NAME: "Your last name",
  SENDER_EMAIL: "Your email address",
  RECEIVER_NAME: "Receiver's name",
  RECEIVER_EMAIL: "Receiver's email",
  RECEIVER_MOBILE: "Receiver's mobile",
  RECEIVER_NOTIFY: "Tracking updates for receiver?",
  CONTENTS_CATEGORY: "What's inside the parcel?",
  CONTENTS_VALUE: "Parcel value ($)",
  CONFIRM: "Review your booking",
  PAYMENT_METHOD: "How would you like to pay?",
  PAYMENT: "Complete payment",
  DONE: "All done",
};

export function getStepSuggestionHint(step: StepId, booking: Booking): string {
  const h = HINTS[step];
  return typeof h === "function" ? h(booking) : h;
}
