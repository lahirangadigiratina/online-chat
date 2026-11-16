import { AI_SIZE_OPTIONS, type AiSizeId } from "./ai-booking-recommendations";

function sizeIdFromLabel(fragment: string): AiSizeId | null {
  const needle = fragment.trim().toLowerCase();
  if (!needle) return null;
  const option = AI_SIZE_OPTIONS.find(
    (s) =>
      s.label.toLowerCase() === needle ||
      s.id === needle.replace(/\s+/g, ""),
  );
  return option?.id ?? null;
}

const EMPTY_INTAKE_DRAFT = {
  sizeId: null as AiSizeId | null,
  valueText: "",
  suburb: "",
};

function normalizeIntakeText(text: string): string {
  return text
    .trim()
    .replace(/^how much does it cost\??\s*/i, "")
    .replace(/^how much (will it )?cost (to )?send\s+(a\s+)?/i, "")
    .replace(/^help me choose a size\s*[—–-]\s*/i, "")
    .replace(/^i need (store )?packaging for my parcel\.?\s*/i, "")
    .trim();
}

/** Declared parcel value from an intake composer line (ignores weight hints like "1 kg"). */
export function parseDeclaredValueDollars(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const structured = trimmed.match(/,\s*\$?\s*(\d+(?:\.\d+)?)\s+to\s+/i);
  if (structured) return Number(structured[1]);

  const dollarMatches = [...trimmed.matchAll(/\$\s*(\d+(?:\.\d+)?)/g)];
  if (dollarMatches.length > 0) {
    return Number(dollarMatches[dollarMatches.length - 1][1]);
  }

  const valueBeforeTo = trimmed.match(/(?:^|[,\s])\$?\s*(\d+(?:\.\d+)?)\s+to\b/i);
  if (valueBeforeTo) return Number(valueBeforeTo[1]);

  const fallback = trimmed.match(/(\d+(?:\.\d+)?)/);
  return fallback ? Number(fallback[1]) : 0;
}

/** Default declared value when voice-style lines omit dollars (e.g. shoes to mum). */
export function inferConversationalDeclaredValue(text: string): number {
  const trimmed = text.trim();
  if (!trimmed || parseDeclaredValueDollars(trimmed) > 0) return 0;
  const lower = trimmed.toLowerCase();
  if (/\b(pair of )?shoes?\b/.test(lower)) return 80;
  if (/\bgift\b/.test(lower)) return 80;
  if (
    /\b(send|sending)\b/.test(lower) &&
    /\b(mum|mom|mother|dad|father|family)\b/.test(lower)
  ) {
    return 80;
  }
  return 0;
}

function parseStructuredOrDollarIntake(text: string): {
  sizeId: AiSizeId;
  value: number;
  suburb: string;
} | null {
  const trimmed = normalizeIntakeText(text);
  if (!trimmed) return null;

  const structured = trimmed.match(/^(.+?),\s*\$?\s*(\d+(?:\.\d+)?)\s+to\s+(.+)$/i);
  if (structured) {
    const value = Number(structured[2]);
    const suburb = structured[3].trim();
    if (value <= 0 || suburb.length < 2) return null;
    const lower = trimmed.toLowerCase();
    const sizeId = inferSizeIdFromText(lower, structured[1]);
    return { sizeId, value, suburb };
  }

  const value = parseDeclaredValueDollars(trimmed);
  if (value <= 0) return null;

  const lower = trimmed.toLowerCase();
  const sizeId = inferSizeIdFromText(lower);

  const fromToMatch = trimmed.match(
    /\bfrom\s+[A-Za-z][\w\s'-]{0,28}\s+to\s+([A-Za-z][A-Za-z\s]{2,24})(?:\s*[,.!?]|$)/i,
  );
  let suburb = fromToMatch?.[1]?.trim() ?? "";

  const cities = [
    "brisbane",
    "melbourne",
    "sydney",
    "perth",
    "adelaide",
    "hobart",
    "darwin",
    "canberra",
    "gold coast",
  ];
  if (!suburb) {
    for (const city of cities) {
      if (lower.includes(city)) {
        suburb = city.replace(/\b\w/g, (c) => c.toUpperCase());
        if (city === "gold coast") suburb = "Gold Coast";
        break;
      }
    }
  }
  if (!suburb) {
    const toMatch = trimmed.match(/\bto\s+([A-Za-z][A-Za-z\s]{2,24})(?:\s*[,.!?]|$)/i);
    suburb = toMatch?.[1]?.trim() ?? "";
  }

  if (!suburb) return null;
  return { sizeId, value, suburb };
}

export function parseConversationalIntakeMessage(text: string): {
  sizeId: AiSizeId;
  value: number;
  suburb: string;
} | null {
  const trimmed = normalizeIntakeText(text);
  if (!trimmed) return null;

  const draft = parseIntakeDraftFields(text);
  const declared = parseDeclaredValueDollars(trimmed);
  const value = declared > 0 ? declared : inferConversationalDeclaredValue(trimmed);
  if (value <= 0 || !draft.sizeId || draft.suburb.trim().length < 2) return null;

  return {
    sizeId: draft.sizeId,
    value,
    suburb: draft.suburb.trim(),
  };
}

/** Pick up drop-off / sender area from natural language (e.g. Parramatta). */
export function parseDropOffOriginHint(text: string): string | null {
  const trimmed = text.trim();
  const dropOff = trimmed.match(
    /\bdrop (?:it |them )?off\b[^.!?]*\bnear\b[^.!?]*\bin\s+([A-Za-z][\w\s'-]{2,28})(?:[.!?]|$)/i,
  );
  if (dropOff?.[1]?.trim()) return dropOff[1].trim();
  const fromArea = trimmed.match(
    /\bfrom\s+([A-Za-z][\w\s'-]{2,28})(?:\s+to\b|[.!?]|$)/i,
  );
  if (fromArea?.[1]?.trim()) return fromArea[1].trim();
  return null;
}

function inferSizeIdFromText(lower: string, labelHint?: string): AiSizeId {
  const fromLabel = labelHint ? sizeIdFromLabel(labelHint) : null;
  if (fromLabel) return fromLabel;
  if (lower.includes("shoe") || lower.includes("dress") || lower.includes("5kg")) {
    return "shoebox";
  }
  if (lower.includes("brief")) return "briefcase";
  if (lower.includes("carry")) return "carryon";
  if (lower.includes("satchel") || lower.includes("1kg") || lower.includes("1 kg")) {
    return "satchel";
  }
  return "satchel";
}

export function parseIntakeMessage(text: string): {
  sizeId: AiSizeId;
  value: number;
  suburb: string;
} | null {
  const structuredOrDollar = parseStructuredOrDollarIntake(text);
  if (structuredOrDollar) return structuredOrDollar;
  return parseConversationalIntakeMessage(text);
}

function parseSizeIdHint(lower: string): AiSizeId | undefined {
  if (/\bshoe\s*box\b|\bshoebox\b|\bshoe\b|\bdress\b|\b5\s*kg\b/i.test(lower)) {
    return "shoebox";
  }
  if (/\bbrief\s*case\b|\bbriefcase\b/i.test(lower)) return "briefcase";
  if (/\bcarry\s*on\b|\bcarryon\b/i.test(lower)) return "carryon";
  if (/\bsatchel\b|\b1\s*kg\b/i.test(lower)) return "satchel";
  return undefined;
}

function parseSuburbHint(trimmed: string, lower: string): string | undefined {
  const fromToMatch = trimmed.match(
    /\bfrom\s+[A-Za-z][\w\s'-]{0,40}\s+to\s+(.+)$/i,
  );
  if (fromToMatch?.[1]?.trim()) return fromToMatch[1].trim();

  const cities = [
    "brisbane",
    "melbourne",
    "sydney",
    "perth",
    "adelaide",
    "hobart",
    "darwin",
    "canberra",
    "gold coast",
  ];
  for (const city of cities) {
    if (lower.includes(city)) {
      return city === "gold coast"
        ? "Gold Coast"
        : city.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }

  const toRelativeInCity = trimmed.match(
    /\bto\s+(?:my\s+)?(?:mum|mom|mother|dad|father|parents?)\s+in\s+([A-Za-z][\w\s'-]{2,24})/i,
  );
  if (toRelativeInCity?.[1]?.trim()) {
    const place = toRelativeInCity[1].trim();
    for (const city of cities) {
      if (place.toLowerCase().startsWith(city)) {
        return city === "gold coast"
          ? "Gold Coast"
          : city.replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
    return place;
  }

  const inCity = trimmed.match(
    /\bin\s+(brisbane|melbourne|sydney|perth|adelaide|hobart|darwin|canberra|gold coast)\b/i,
  );
  if (inCity?.[1]) {
    const city = inCity[1].toLowerCase();
    return city === "gold coast"
      ? "Gold Coast"
      : city.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const toMatch = trimmed.match(/\bto\s+([A-Za-z][\w\s'-]{2,24})(?:[.!?]|$)/i);
  if (toMatch?.[1]?.trim()) return toMatch[1].trim();
  return undefined;
}

/** Maps the live composer line back onto the intake form fields. */
export function parseIntakeDraftFields(text: string): {
  sizeId: AiSizeId | null;
  valueText: string;
  suburb: string;
} {
  const trimmed = normalizeIntakeText(text.trim());
  if (!trimmed) return { ...EMPTY_INTAKE_DRAFT };

  const full = parseStructuredOrDollarIntake(text);
  if (full) {
    return {
      sizeId: full.sizeId,
      valueText: String(full.value),
      suburb: full.suburb,
    };
  }

  const structured = trimmed.match(
    /^(.+?),\s*\$?\s*(\d+(?:\.\d+)?)\s+to\s+(.+)$/i,
  );
  if (structured) {
    return {
      sizeId: sizeIdFromLabel(structured[1]) ?? parseSizeIdHint(structured[1].toLowerCase()) ?? null,
      valueText: structured[2],
      suburb: structured[3].trim(),
    };
  }

  const valueAndDest = trimmed.match(/^\$?\s*(\d+(?:\.\d+)?)\s+to\s+(.+)$/i);
  if (valueAndDest) {
    return {
      sizeId: null,
      valueText: valueAndDest[1],
      suburb: valueAndDest[2].trim(),
    };
  }

  const labelValue = trimmed.match(/^(.+?),\s*\$?\s*(\d+(?:\.\d+)?)\s*$/i);
  if (labelValue && sizeIdFromLabel(labelValue[1])) {
    return {
      sizeId: sizeIdFromLabel(labelValue[1]),
      valueText: labelValue[2],
      suburb: "",
    };
  }

  const lower = trimmed.toLowerCase();
  const declared = parseDeclaredValueDollars(trimmed);
  const valueText = declared > 0 ? String(declared) : !/\d/.test(trimmed) ? "" : "";

  const sizeFromLabel = sizeIdFromLabel(trimmed.split(",")[0] ?? "");
  const sizeId =
    sizeFromLabel ?? parseSizeIdHint(lower) ?? null;

  const suburbHint = parseSuburbHint(trimmed, lower);
  let suburb = "";
  if (suburbHint) {
    suburb = suburbHint;
  } else if (
    trimmed.length >= 2 &&
    declared <= 0 &&
    !sizeId &&
    !trimmed.includes("$")
  ) {
    suburb = trimmed;
  } else if (declared > 0 && /\bto\b/i.test(trimmed)) {
    const toTail = trimmed.match(/\bto\s+(.+)$/i);
    suburb = toTail?.[1]?.trim() ?? "";
  }

  if (declared > 0 && !suburb && /\$/.test(trimmed) === false && /^\d/.test(trimmed)) {
    return { sizeId: null, valueText, suburb: "" };
  }

  return { sizeId, valueText, suburb };
}

function looksLikeNameToken(token: string): boolean {
  const s = token.trim();
  if (!s || s.includes("@")) return false;
  if (/^\d+$/.test(s)) return false;
  if (/^[a-z]?\d{5,}$/i.test(s)) return false;
  return /^[a-zA-Z][a-zA-Z''.-]{0,30}$/.test(s);
}

function looksLikeNameSegment(segment: string): boolean {
  const tokens = segment.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => looksLikeNameToken(token));
}

export function contactDisplayFirstName(text: string): string {
  const { firstName, lastName } = parseContactLine(text);
  const first = firstName.trim();
  if (first && looksLikeNameToken(first)) return first;
  const last = lastName.trim().split(/\s+/)[0] ?? "";
  if (last && looksLikeNameToken(last)) return last;
  return "your receiver";
}

export function parseContactLine(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      addressHint: "",
      raw: "",
    };
  }

  const email = trimmed.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0] ?? "";
  const mobile =
    trimmed.match(/(?:\+?61\s*)?0?4[\d\s]{8,12}/)?.[0]?.replace(/\s+/g, " ").trim() ??
    trimmed.match(/\b0\d(?:[\d ]*){8,10}\b/)?.[0]?.replace(/\s+/g, " ").trim() ??
    "";

  const commaParts = trimmed.split(",").map((part) => part.trim()).filter(Boolean);
  let firstName = "";
  let lastName = "";
  const addressParts: string[] = [];

  const mobileCompact = mobile.replace(/\s/g, "");

  for (const part of commaParts) {
    if (part.includes("@")) continue;
    if (mobile && part.replace(/\s/g, "") === mobileCompact) continue;
    if (!firstName && looksLikeNameSegment(part)) {
      const nameTokens = part.split(/\s+/).filter(Boolean);
      firstName = nameTokens[0] ?? "";
      lastName = nameTokens.slice(1).join(" ");
      continue;
    }
    if (part !== email) addressParts.push(part);
  }

  if (!firstName) {
    let rest = trimmed;
    if (email) rest = rest.replace(email, "");
    if (mobile) rest = rest.replace(mobile, "");
    rest = rest.replace(/[,|]/g, " ").replace(/\s+/g, " ").trim();
    const tokens = rest.split(" ").filter(Boolean);
    const nameIndex = tokens.findIndex((token) => looksLikeNameToken(token));
    if (nameIndex >= 0) {
      firstName = tokens[nameIndex];
      lastName = tokens.slice(nameIndex + 1, nameIndex + 3).join(" ");
    }
  }

  return {
    firstName,
    lastName,
    email,
    mobile,
    addressHint: addressParts.join(", ").trim(),
    raw: trimmed,
  };
}

export type SenderContactDraft = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  businessName: string;
};

export type ReceiverContactDraft = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  businessName: string;
};

export const EMPTY_SENDER_CONTACT_DRAFT: SenderContactDraft = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  businessName: "",
};

export const EMPTY_RECEIVER_CONTACT_DRAFT: ReceiverContactDraft = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  address: "",
  businessName: "",
};

export function contactDraftFromLine(text: string): ReceiverContactDraft {
  const parsed = parseContactLine(text);
  return {
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    email: parsed.email,
    mobile: parsed.mobile,
    address: parsed.addressHint,
    businessName: "",
  };
}

export function senderDraftFromLine(text: string): SenderContactDraft {
  const parsed = parseContactLine(text);
  const hint = parsed.addressHint.trim();
  const businessName =
    hint && !/\d{2,}/.test(hint) && hint.length <= 80 ? hint : "";
  return {
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    email: parsed.email,
    mobile: parsed.mobile,
    businessName,
  };
}

function formFieldValue(form: HTMLFormElement, name: string): string {
  const el = form.querySelector<HTMLInputElement>(`[name="${CSS.escape(name)}"]`);
  if (!el) return "";
  return el.value.trim();
}

/** Read live input values (e.g. after browser autofill) into sender draft. */
export function readSenderContactFromForm(form: HTMLFormElement): SenderContactDraft {
  const mobileLocal = formFieldValue(form, "sender-mobile");
  return {
    firstName: formFieldValue(form, "sender-first-name"),
    lastName: formFieldValue(form, "sender-last-name"),
    email: formFieldValue(form, "sender-email"),
    mobile: buildAuMobileFromLocal(mobileLocal),
    businessName: formFieldValue(form, "sender-organization"),
  };
}

/** Read live input values (e.g. after browser autofill) into receiver draft. */
export function readReceiverContactFromForm(
  form: HTMLFormElement,
): ReceiverContactDraft {
  const mobileLocal = formFieldValue(form, "receiver-mobile");
  return {
    firstName: formFieldValue(form, "receiver-first-name"),
    lastName: formFieldValue(form, "receiver-last-name"),
    email: formFieldValue(form, "receiver-email"),
    mobile: buildAuMobileFromLocal(mobileLocal),
    address: formFieldValue(form, "receiver-address"),
    businessName: formFieldValue(form, "receiver-organization"),
  };
}

export function buildSenderContactLine(draft: SenderContactDraft): string {
  const name = [draft.firstName.trim(), draft.lastName.trim()]
    .filter(Boolean)
    .join(" ");
  return [name, draft.email.trim(), draft.mobile.trim(), draft.businessName.trim()]
    .filter(Boolean)
    .join(", ");
}

export function buildReceiverContactLine(draft: ReceiverContactDraft): string {
  const name = [draft.firstName.trim(), draft.lastName.trim()]
    .filter(Boolean)
    .join(" ");
  const address = draft.address.trim();
  const withBusiness = draft.businessName.trim()
    ? `${draft.businessName.trim()}, ${address}`
    : address;
  return [name, draft.mobile.trim(), draft.email.trim(), withBusiness]
    .filter(Boolean)
    .join(", ");
}

/** Digits after the leading 4 (AU mobile local part, up to 8 digits). */
export function auMobileLocalDigits(mobile: string): string {
  const d = mobile.replace(/\D/g, "");
  if (d.startsWith("614")) return d.slice(3, 11);
  if (d.startsWith("61") && d[2] === "4") return d.slice(3, 11);
  if (d.startsWith("04")) return d.slice(2, 10);
  if (d.startsWith("4")) return d.slice(1, 9);
  return d.slice(0, 8);
}

export function buildAuMobileFromLocal(local: string): string {
  const digits = local.replace(/\D/g, "").slice(0, 8);
  if (!digits.length) return "";
  const raw = `04${digits}`;
  if (raw.length <= 4) return raw;
  if (raw.length <= 7) return `${raw.slice(0, 4)} ${raw.slice(4)}`;
  return `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
}

export function formatAuMobileLocalDisplay(mobile: string): string {
  const digits = auMobileLocalDigits(mobile);
  if (!digits.length) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export function formatAuMobileLabel(mobile: string): string {
  const local = formatAuMobileLocalDisplay(mobile);
  if (!local.trim()) return "";
  return `+61 4 ${local}`;
}

function hasMinMobile(mobile: string) {
  return auMobileLocalDigits(mobile).length >= 8;
}

export function isSenderContactComplete(draft: SenderContactDraft): boolean {
  return (
    draft.firstName.trim().length > 0 &&
    draft.lastName.trim().length > 0 &&
    draft.email.includes("@") &&
    hasMinMobile(draft.mobile)
  );
}

export function isReceiverContactComplete(draft: ReceiverContactDraft): boolean {
  return (
    draft.firstName.trim().length > 0 &&
    draft.lastName.trim().length > 0 &&
    draft.email.includes("@") &&
    hasMinMobile(draft.mobile) &&
    draft.address.trim().length >= 6
  );
}

function formatMissingDetailList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function senderContactMissingLabels(draft: SenderContactDraft): string[] {
  const missing: string[] = [];
  if (!draft.firstName.trim()) missing.push("first name");
  if (!draft.lastName.trim()) missing.push("last name");
  if (!draft.email.includes("@")) missing.push("email");
  if (!hasMinMobile(draft.mobile)) missing.push("mobile number");
  return missing;
}

export function receiverContactMissingLabels(
  draft: ReceiverContactDraft,
): string[] {
  const missing: string[] = [];
  if (!draft.firstName.trim()) missing.push("first name");
  if (!draft.lastName.trim()) missing.push("last name");
  if (!draft.email.includes("@")) missing.push("email");
  if (!hasMinMobile(draft.mobile)) missing.push("mobile number");
  if (draft.address.trim().length < 6) missing.push("delivery address");
  return missing;
}

export function hasSenderContactProgress(draft: SenderContactDraft): boolean {
  return !!(
    draft.firstName.trim() ||
    draft.lastName.trim() ||
    draft.email.trim() ||
    draft.mobile.trim() ||
    draft.businessName.trim()
  );
}

export function hasReceiverContactProgress(draft: ReceiverContactDraft): boolean {
  return !!(
    draft.firstName.trim() ||
    draft.lastName.trim() ||
    draft.email.trim() ||
    draft.mobile.trim() ||
    draft.address.trim() ||
    draft.businessName.trim()
  );
}

export function buildContactDetailsFollowUpPrompt(
  role: "sender" | "receiver",
  missing: string[],
): string {
  const list = formatMissingDetailList(missing);
  if (role === "sender") {
    return `Thanks! 😊 I still need your ${list}. Add them in your next message or use the form below.`;
  }
  return `Thanks! 😊 I still need the receiver's ${list}. Add them in your next message or use the form below.`;
}

export function buildContactDetailsEmptyPrompt(role: "sender" | "receiver"): string {
  if (role === "sender") {
    return `Can you share your first name, last name, email and mobile? (Business name is optional.) Type them here or use the form below. 😊`;
  }
  return `Who should we send your parcel to? I'll need their first name, last name, mobile, email and delivery address — type them here or use the form below. 😊`;
}

export function mergeIntakeDraftFields(
  current: { sizeId: AiSizeId | null; valueText: string; suburb: string },
  text: string,
): { sizeId: AiSizeId | null; valueText: string; suburb: string } {
  const parsed = parseIntakeDraftFields(text);
  return {
    sizeId: parsed.sizeId ?? current.sizeId,
    valueText: parsed.valueText.trim() ? parsed.valueText : current.valueText,
    suburb: parsed.suburb.trim() ? parsed.suburb : current.suburb,
  };
}

export function intakeDraftMissingLabels(draft: {
  sizeId: AiSizeId | null;
  valueText: string;
  suburb: string;
}): string[] {
  const missing: string[] = [];
  if (!draft.sizeId) missing.push("parcel size");
  const value = Number(draft.valueText.replace(/[^\d.]/g, ""));
  if (value <= 0) missing.push("declared value");
  if (draft.suburb.trim().length < 2) missing.push("delivery suburb or city");
  return missing;
}

export function buildIntakeFollowUpPrompt(missing: string[]): string {
  const list = formatMissingDetailList(missing);
  return `Almost there! 😊 I still need your ${list}. Fill in the form below or add them in your next message, then send.`;
}

/** Prefer street/suburb from receiver details; fall back to intake destination. */
/** Prefer in-form draft; fill gaps from a comma-separated line if needed. */
export function mergeReceiverDraftWithLine(
  draft: ReceiverContactDraft,
  line: string,
): ReceiverContactDraft {
  const parsed = contactDraftFromLine(line);
  return {
    firstName: parsed.firstName.trim() || draft.firstName,
    lastName: parsed.lastName.trim() || draft.lastName,
    email: parsed.email.trim() || draft.email,
    mobile: parsed.mobile.trim() || draft.mobile,
    address: parsed.address.trim() || draft.address,
    businessName: parsed.businessName.trim() || draft.businessName,
  };
}

export function mergeSenderDraftWithLine(
  draft: SenderContactDraft,
  line: string,
): SenderContactDraft {
  const parsed = senderDraftFromLine(line);
  return {
    firstName: parsed.firstName.trim() || draft.firstName,
    lastName: parsed.lastName.trim() || draft.lastName,
    email: parsed.email.trim() || draft.email,
    mobile: parsed.mobile.trim() || draft.mobile,
    businessName: parsed.businessName.trim() || draft.businessName,
  };
}

export function deliveryDestinationLabel(
  receiverLine: string,
  intakeSuburb: string,
): string {
  const addr = contactDraftFromLine(receiverLine).address.trim();
  if (addr.length >= 3) return addr;
  const suburb = intakeSuburb.trim();
  return suburb.length >= 2 ? suburb : "delivery address";
}

export function isAffirmative(text: string) {
  const t = text.trim();
  if (/^yes,?\s*continue\b/i.test(t)) return true;
  return /^(yes|yep|yeah|ok|okay|looks good|proceed|continue|complete|confirm)/i.test(
    t,
  );
}

export function isProceedBooking(text: string) {
  return /proceed|looks good|let'?s go|book it|continue/i.test(text.trim());
}

export function parsePackaging(text: string): "yes" | "no" | null {
  const t = text.trim().toLowerCase();
  if (/yes|add packaging|add a box|add box/.test(t)) return "yes";
  if (/no,?\s*thanks|^(no|nope|skip|packed)\b/.test(t)) return "no";
  return null;
}

export function parsePayment(text: string): "online" | "instore" | null {
  const t = text.trim().toLowerCase();
  if (/online|link|card/.test(t)) return "online";
  if (/store|counter|cash/.test(t)) return "instore";
  return null;
}
