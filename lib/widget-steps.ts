import type { StepId } from "./types";

export const STEPS_WITH_WIDGET_PANEL: StepId[] = [
  "DROP_OFF_POINT",
  "PARCEL_SIZE",
  "PACKAGING",
  "DELIVERY_METHOD",
  "CONTENTS",
  "CONFIRM",
  "PAYMENT_METHOD",
  "PAYMENT",
  "DONE",
];

/** Widget panel can be collapsed so the user can type in the compose bar instead */
export const DISMISSIBLE_WIDGET_STEPS: StepId[] = [
  "DROP_OFF_POINT",
  "PARCEL_SIZE",
  "PACKAGING",
  "DELIVERY_METHOD",
  "PAYMENT_METHOD",
];
