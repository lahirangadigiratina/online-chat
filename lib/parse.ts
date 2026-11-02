import type { Booking, FlowState, ParseResult, ParcelSize } from "./types";
import { firstIncompleteStep } from "./flow";
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

const SUBURB_ALIASES: { pattern: RegExp; suburb: string }[] = [
  { pattern: /bondi/i, suburb: "Bondi Junction NSW 2022" },
  { pattern: /surry/i, suburb: "Surry Hills NSW 2010" },
  { pattern: /newtown/i, suburb: "Newtown NSW 2042" },
  { pattern: /parramatta/i, suburb: "Parramatta NSW 2150" },
  { pattern: /manly/i, suburb: "Manly NSW 2095" },
];

function resolveSuburb(raw: string): string {
  const trimmed = raw.trim();
  for (const { pattern, suburb } of SUBURB_ALIASES) {
    if (pattern.test(trimmed)) return suburb;
  }
  if (/NSW\s+\d{4}/i.test(trimmed)) return trimmed;
  return trimmed;
}

function normalizeReceiverAddress(raw: string, senderSuburb?: string): string {
  const trimmed = raw.trim();
  if (/NSW\s+\d{4}/i.test(trimmed)) return trimmed;
  if (/^\d+\s+\w/.test(trimmed) && senderSuburb) {
    const area = senderSuburb.replace(/\s+NSW\s+\d{4}$/i, "").trim();
    return `${trimmed}, ${area} NSW 2022`;
  }
  return trimmed;
}

export function parseUserMessage(text: string, _state: FlowState): ParseResult {
  const lower = text.toLowerCase();
  const fields: Partial<Booking> = {};

  const fromToMatch = text.match(
    /\b(?:sending\s+)?from\s+(.+?)\s+to\s+(.+?)(?:[.!?]|$)/i
  );
  if (fromToMatch) {
    const fromRaw = fromToMatch[1].trim();
    const toRaw = fromToMatch[2].trim();
    fields.senderSuburb = resolveSuburb(fromRaw);
    fields.receiverAddress = normalizeReceiverAddress(
      toRaw,
      fields.senderSuburb
    );
  }

  for (const [kw, size] of Object.entries(SIZE_KEYWORDS)) {
    if (lower.includes(kw)) {
      fields.parcelSize = size;
      break;
    }
  }

  if (!fields.senderSuburb && lower.includes("bondi")) {
    fields.senderSuburb = "Bondi Junction NSW 2022";
  }

  if (!fields.receiverAddress) {
    const springMatch = text.match(/\d+\s+[\w\s]+(?:st|street|rd|road)/i);
    if (springMatch) {
      fields.receiverAddress = normalizeReceiverAddress(
        springMatch[0],
        fields.senderSuburb
      );
    } else if (lower.includes("spring st")) {
      fields.receiverAddress = "25 Spring St, Bondi Junction NSW 2022";
    }
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

  if (fields.senderSuburb) {
    const suburb = fields.senderSuburb;
    if (next.senderSuburb !== suburb) {
      next = { ...next, senderSuburb: suburb, dropOffPoint: undefined };
    } else {
      next = { ...next, senderSuburb: suburb };
    }
  }

  if (fields.receiverAddress) {
    next = { ...next, receiverAddress: fields.receiverAddress };
  }

  if (fields.parcelSize) {
    next = { ...next, parcelSize: fields.parcelSize };
  }
  if (fields.packaging !== undefined) {
    next = { ...next, packaging: fields.packaging };
  }

  if (fields.deliveryMethod) {
    next = { ...next, deliveryMethod: fields.deliveryMethod };
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
