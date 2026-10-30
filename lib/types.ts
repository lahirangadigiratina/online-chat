export type ParcelSize = "satchel" | "shoebox" | "briefcase" | "carry_on";

export type DeliveryMethod = "door" | "collect";

export type PaymentMethod = "online" | "instore";

export interface DropOffPoint {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  hours: string;
  open?: boolean;
}

export interface PersonDetails {
  mobile: string;
  businessName?: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Set when optional business-name prompt was answered (incl. Skip). */
  businessStepDone?: boolean;
}

export interface ReceiverDetails extends PersonDetails {
  noTrackingNotifications: boolean;
  notifyStepDone?: boolean;
}

export interface ContentsDetails {
  category: string;
  value: number;
  photo?: string;
  reference?: string;
  signatureOnDelivery: boolean;
  parcelProtection: boolean;
}

export interface Agreements {
  terms: boolean;
  noDangerousGoods: boolean;
  marketing: boolean;
}

export interface Coupon {
  code: string;
  discount: number;
}

export interface Booking {
  senderSuburb?: string;
  dropOffPoint?: DropOffPoint;
  parcelSize?: ParcelSize;
  packaging?: boolean;
  receiverAddress?: string;
  deliveryMethod?: DeliveryMethod;
  /** Delivery line item from quote */
  deliveryFee?: number;
  /** @deprecated use deliveryFee — kept for quote API compat */
  price?: number;
  estimatedDelivery?: string;
  sender?: PersonDetails;
  receiver?: ReceiverDetails;
  contents?: ContentsDetails;
  agreements?: Agreements;
  coupon?: Coupon;
  paymentMethod?: PaymentMethod;
  bookingRef?: string;
  paidOnline?: boolean;
}

export type StepId =
  | "SUBURB"
  | "DROP_OFF_POINT"
  | "PARCEL_SIZE"
  | "PACKAGING"
  | "RECEIVER_ADDRESS"
  | "DELIVERY_METHOD"
  | "SENDER_MOBILE"
  | "SENDER_NAME"
  | "SENDER_EMAIL"
  | "SENDER_BUSINESS"
  | "RECEIVER_NAME"
  | "RECEIVER_EMAIL"
  | "RECEIVER_MOBILE"
  | "RECEIVER_NOTIFY"
  | "CONTENTS"
  | "CONFIRM"
  | "PAYMENT_METHOD"
  | "PAYMENT"
  | "DONE";

export interface StepConfig {
  id: StepId;
  botMessage: string | ((booking: Booking) => string);
  bookingKey?: keyof Booking;
  invalidateKeys?: (keyof Booking)[];
}

export interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text?: string;
  stepId?: StepId;
  widgetSummary?: string;
  widgetActive?: boolean;
}

export interface FlowState {
  currentStep: StepId;
  booking: Booking;
  completedSteps: StepId[];
  messages: ChatMessage[];
  isTyping: boolean;
}

export interface QuoteRequest {
  parcelSize: ParcelSize;
  deliveryMethod: DeliveryMethod;
  from: string;
  to: string;
}

export interface QuoteResponse {
  price: number;
  estimatedDelivery: string;
}

export interface ParseResult {
  fields: Partial<Booking>;
  confidence?: "stub" | "llm";
}

/** Pending widget choice — confirmed with Send in the compose bar */
export interface WidgetDraft {
  stepId: StepId;
  value: unknown;
  summary: string;
}

export const CONTENT_CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: "electronics", label: "Electronics", emoji: "📱" },
  { id: "clothing", label: "Clothing & Fashion", emoji: "👕" },
  { id: "food", label: "Food & Perishables", emoji: "🍎" },
  { id: "fragile", label: "Fragile Items", emoji: "🫧" },
  { id: "sporting", label: "Sporting Goods", emoji: "⚽" },
  { id: "books", label: "Books & Media", emoji: "📚" },
  { id: "health", label: "Health & Beauty", emoji: "💄" },
  { id: "household", label: "Household Items", emoji: "🏠" },
  { id: "other", label: "Other", emoji: "📦" },
];
