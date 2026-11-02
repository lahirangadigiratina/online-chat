import type { StepId } from "./types";

export type ComposeOption = {
  label: string;
  step: StepId;
  /** Bot bubble text (defaults to label). */
  botMessage?: string;
};

/** Compose landing options — bot asks the question in chat. */
export const COMPOSE_OPTIONS: ComposeOption[] = [
  { label: "What is the weight of your parcel?", step: "PARCEL_SIZE" },
  { label: "Where are you sending from?", step: "ROUTE" },
  {
    label: "Where do you want to send to?",
    step: "ROUTE",
    botMessage: "Where do you want to send to?",
  },
  { label: "How would you like to send it?", step: "DELIVERY_METHOD" },
];

export const COMPOSE_INPUT_PLACEHOLDER =
  "I want to send a 2kg parcel to Melbourne";
