import type { Booking, FlowState, ParseResult, ParcelSize } from "./types";
import { firstIncompleteStep, validateStep } from "./flow";
import { isValidEmail, normalizeAuMobile } from "./validation";

const SIZE_KEYWORDS: Record<string, ParcelSize> = {
  satchel: "satchel",
  shoebox: "shoebox",
  shoe: "shoebox",
  briefcase: "briefcase",
  carry: "carry_on",
  "carry-on": "carry_on",
  carry_on: "carry_on",
};

export function parseUserMessage(text: string, _state: FlowState): ParseResult {
  const lower = text.toLowerCase();
  const fields: Partial<Booking> = {};

  for (const [kw, size] of Object.entries(SIZE_KEYWORDS)) {
    if (lower.includes(kw)) {
      fields.parcelSize = size;
      break;
    }
  }

  if (lower.includes("bondi")) {
    fields.senderSuburb = "Bondi Junction NSW 2022";
  }

  const springMatch = text.match(/\d+\s+[\w\s]+(?:st|street|rd|road)/i);
  if (springMatch) {
    fields.receiverAddress = springMatch[0];
  } else if (lower.includes("spring st")) {
    fields.receiverAddress = "25 Spring St, Sydney NSW";
  }

  if (lower.includes("door")) fields.deliveryMethod = "door";
  if (lower.includes("collect")) fields.deliveryMethod = "collect";

  if (lower.includes("packaging")) fields.packaging = true;

  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (emailMatch && isValidEmail(emailMatch[0])) {
    fields.sender = {
      mobile: "",
      firstName: "",
      lastName: "",
      email: emailMatch[0],
    };
  }

  const phoneMatch = text.match(/(?:\+?61|0)?4\d{8}|\d{3}\s?\d{3}\s?\d{3}/);
  if (phoneMatch && normalizeAuMobile(phoneMatch[0])) {
    const mobile = phoneMatch[0];
    fields.sender = {
      ...(fields.sender ?? { firstName: "", lastName: "", email: "" }),
      mobile,
    };
  }

  const nameMatch = text.match(/(?:i'?m|name is)\s+([A-Za-z]+)\s+([A-Za-z]+)/i);
  if (nameMatch) {
    fields.sender = {
      mobile: fields.sender?.mobile ?? "",
      email: fields.sender?.email ?? "",
      firstName: nameMatch[1],
      lastName: nameMatch[2],
    };
  }

  return { fields, confidence: "stub" };
}

export async function applyParsedFields(
  fields: Partial<Booking>,
  booking: Booking,
  fetchQuote: (b: Booking) => Promise<{ price: number; estimatedDelivery: string }>
): Promise<{ booking: Booking; lastStep: ReturnType<typeof firstIncompleteStep> }> {
  let next = { ...booking };

  const tryApply = (stepId: Parameters<typeof validateStep>[0], value: unknown) => {
    const result = validateStep(stepId, value, next);
    if (result.ok) next = { ...next, ...result.patch };
  };

  if (fields.senderSuburb) tryApply("SUBURB", fields.senderSuburb);
  if (fields.dropOffPoint) tryApply("DROP_OFF_POINT", fields.dropOffPoint);
  if (fields.parcelSize) tryApply("PARCEL_SIZE", fields.parcelSize);
  if (fields.packaging !== undefined) tryApply("PACKAGING", fields.packaging);
  if (fields.receiverAddress) tryApply("RECEIVER_ADDRESS", fields.receiverAddress);
  if (fields.deliveryMethod) {
    tryApply("DELIVERY_METHOD", fields.deliveryMethod);
    if (
      next.deliveryMethod &&
      next.parcelSize &&
      next.senderSuburb &&
      next.receiverAddress
    ) {
      const quote = await fetchQuote(next);
      next = {
        ...next,
        deliveryFee: quote.price,
        price: quote.price,
        estimatedDelivery: quote.estimatedDelivery,
      };
    }
  }


  return { booking: next, lastStep: firstIncompleteStep(next) };
}
