import type { StepId } from "./types";

/** Steps answered via bottom chat input (no form widget). */
export const CHAT_INPUT_STEPS: StepId[] = [
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
];

export function isChatInputStep(step: StepId): boolean {
  return CHAT_INPUT_STEPS.includes(step);
}
