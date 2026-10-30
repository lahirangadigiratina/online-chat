import type { StepId } from "./types";

/** Steps answered via bottom chat input (no form widget). */
export const CHAT_INPUT_STEPS: StepId[] = [
  "SUBURB",
  "RECEIVER_ADDRESS",
  "SENDER_MOBILE",
  "SENDER_NAME",
  "SENDER_EMAIL",
  "SENDER_BUSINESS",
  "RECEIVER_NAME",
  "RECEIVER_EMAIL",
  "RECEIVER_MOBILE",
  "RECEIVER_NOTIFY",
];

export function isChatInputStep(step: StepId): boolean {
  return CHAT_INPUT_STEPS.includes(step);
}
