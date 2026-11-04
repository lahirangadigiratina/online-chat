import type { ReactNode } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: ReactNode;
  bordered?: boolean;
  kind?: "parcel-photo";
};

export type ParcelProgressPhase =
  | "contents"
  | "describe"
  | "size"
  | "photo"
  | "packaging";

const CATEGORY_DESCRIBE_EXAMPLES: Record<
  string,
  readonly [string, string]
> = {
  electronics: ["a phone charger", "wireless earbuds"],
  clothing: ["a pair of running shoes", "two T-shirts"],
  food: ["a jar of honey", "a pack of snacks"],
  fragile: ["a glass vase", "a ceramic mug"],
  sporting: ["a cricket ball", "a yoga mat"],
  books: ["three paperback novels", "a textbook"],
  other: ["a small gift", "a household item"],
};

function categoryDescribeExamples(categoryId?: string): readonly [string, string] {
  if (categoryId && categoryId in CATEGORY_DESCRIBE_EXAMPLES) {
    return CATEGORY_DESCRIBE_EXAMPLES[categoryId];
  }
  return CATEGORY_DESCRIBE_EXAMPLES.other;
}

export function parcelDescribePrompt(categoryId?: string): string {
  const examples = categoryDescribeExamples(categoryId);
  return `Nice. Can you describe it in a few words? Something like '${examples[0]}' or '${examples[1]}'.`;
}

export function parcelDescribePlaceholder(categoryId?: string): string {
  const example = categoryDescribeExamples(categoryId)[0];
  return example.charAt(0).toUpperCase() + example.slice(1);
}

export type ParcelSizeId = "satchel" | "shoebox" | "briefcase" | "carryon";

const PARCEL_SIZE_LABELS: Record<ParcelSizeId, string> = {
  satchel: "Satchel",
  shoebox: "Shoebox",
  briefcase: "Briefcase",
  carryon: "Carry On",
};

const CATEGORY_DEFAULT_SIZE: Record<string, ParcelSizeId> = {
  electronics: "satchel",
  clothing: "shoebox",
  food: "shoebox",
  fragile: "briefcase",
  sporting: "shoebox",
  books: "briefcase",
  other: "shoebox",
};

export function suggestParcelSizeId(options: {
  categoryId?: string;
  shortDescription?: string;
}): ParcelSizeId {
  const desc = (options.shortDescription ?? "").trim().toLowerCase();

  if (/\b(yoga mat|wetsuit|keyboard|laptop|tablet)\b/.test(desc)) {
    return "briefcase";
  }
  if (/\b(suitcase|carry.?on|large|bulky|duffel)\b/.test(desc)) {
    return "carryon";
  }
  if (
    /\b(charger|cable|earbuds|earphones|jewelry|watch|adapter|usb)\b/.test(
      desc,
    )
  ) {
    return "satchel";
  }
  if (/\b(t-shirt|shirt|socks|scarf|tie|cap|hat)\b/.test(desc)) {
    return "satchel";
  }
  if (/\b(running shoe|shoes|sneaker|boots|trainers)\b/.test(desc)) {
    return "shoebox";
  }
  if (/\b(textbook|textbooks|novels|books|magazines)\b/.test(desc)) {
    return "briefcase";
  }
  if (/\b(vase|glass|ceramic|frame|ornament)\b/.test(desc)) {
    return "briefcase";
  }
  if (/\b(cricket ball|football|rugby ball|tennis racket)\b/.test(desc)) {
    return "shoebox";
  }
  if (/\b(honey|jar|snacks|perishable)\b/.test(desc)) {
    return "shoebox";
  }

  if (options.categoryId && CATEGORY_DEFAULT_SIZE[options.categoryId]) {
    return CATEGORY_DEFAULT_SIZE[options.categoryId];
  }
  return "shoebox";
}

export function suggestParcelSizeLabel(options: {
  categoryId?: string;
  shortDescription?: string;
}): string {
  return PARCEL_SIZE_LABELS[suggestParcelSizeId(options)];
}

export const PARCEL_PHOTO_SKIP_USER = "Skip for now";

export type ParcelPackagingChoice = "add" | "packed";

export const PARCEL_PACKAGING_USER_LINES: Record<ParcelPackagingChoice, string> =
  {
    add: "Yes, add packaging · +$2.00",
    packed: "No, it's already packed · $0.00",
  };

export function parcelPackagingUserLine(choice: ParcelPackagingChoice): string {
  return PARCEL_PACKAGING_USER_LINES[choice];
}

export function resolveParcelPackagingChoice(
  text: string,
  fallback?: ParcelPackagingChoice | null,
): ParcelPackagingChoice | null {
  const trimmed = text.trim();
  if (
    trimmed === PARCEL_PACKAGING_USER_LINES.add ||
    /^yes,?\s*add packaging/i.test(trimmed)
  ) {
    return "add";
  }
  if (
    trimmed === PARCEL_PACKAGING_USER_LINES.packed ||
    /already packed/i.test(trimmed)
  ) {
    return "packed";
  }
  return fallback ?? null;
}

function parcelOptionalPhotoBot(selectedSizeLabel: string) {
  return `${selectedSizeLabel} it is. Want to add a photo of the parcel? It's optional, but it helps the PARCELPOINT match it at drop-off and supports any Parcel Protection claim.`;
}

export function parcelPhotoSkipBot(parcelPointBoxLabel: string) {
  return `No problem — we'll go without a photo. Is it already packed, or would you like packaging? We'll have a ${parcelPointBoxLabel} ready at the PARCELPOINT for $2.00.`;
}

export function buildParcelProgressMessages(
  phase: ParcelProgressPhase,
  options: {
    categoryId?: string;
    categoryLabel?: string;
    categoryIcon?: string;
    shortDescription: string;
    itemPhrase: string;
    suggestedSizeLabel: string;
    selectedSizeLabel: string;
    sizeUserReply: string;
    photoAdded: boolean;
    parcelPointBoxLabel: string;
  },
): ChatMessage[] {
  if (phase === "contents") return [];

  const items: ChatMessage[] = [];

  if (options.categoryLabel) {
    items.push({
      id: "parcel-category-user",
      role: "user",
      content: options.categoryIcon
        ? `${options.categoryIcon} ${options.categoryLabel}`
        : options.categoryLabel,
    });
  }

  items.push({
    id: "parcel-describe-bot",
    role: "bot",
    content: parcelDescribePrompt(options.categoryId),
  });

  if (phase === "describe") return items;

  const desc = options.shortDescription.trim();
  if (desc) {
    items.push({ id: "parcel-desc-user", role: "user", content: desc });
  }

  items.push({
    id: "parcel-size-bot",
    role: "bot",
    content: `Thanks! ${options.itemPhrase} in their box usually fit a ${options.suggestedSizeLabel}. Sound right?`,
  });

  if (phase === "size") return items;

  items.push({
    id: "parcel-size-user",
    role: "user",
    content: options.sizeUserReply,
  });
  items.push({
    id: "parcel-photo-bot",
    role: "bot",
    content: parcelOptionalPhotoBot(options.selectedSizeLabel),
  });

  if (phase === "photo") return items;

  if (options.photoAdded) {
    items.push({
      id: "parcel-photo-user",
      role: "user",
      content: "Parcel photo",
      kind: "parcel-photo",
    });
    items.push({
      id: "parcel-packaging-bot-photo",
      role: "bot",
      content: `Thanks, that's a clear photo. Is it already packed, or would you like packaging? We'll have a ${options.parcelPointBoxLabel} ready at the PARCELPOINT for $2.00.`,
    });
  } else {
    items.push({
      id: "parcel-photo-skip-user",
      role: "user",
      content: PARCEL_PHOTO_SKIP_USER,
    });
    items.push({
      id: "parcel-packaging-bot-skip",
      role: "bot",
      content: parcelPhotoSkipBot(options.parcelPointBoxLabel),
    });
  }

  return items;
}

export const WELCOME_DEMO_USER_MESSAGE =
  "It's for my mum, Margaret Fernando, 0412 345 678, margaret.f@example.com, 18 Latrobe Terrace, Paddington, Brisbane";

export type ParsedReceiverDetails = {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  addressLine: string;
  businessName: string;
};

const DEFAULT_PARSED_RECEIVER: ParsedReceiverDetails = {
  firstName: "Margaret",
  lastName: "Fernando",
  mobile: "0412 345 678",
  email: "margaret.f@example.com",
  addressLine: "18 Latrobe Tce, Paddington QLD 4064",
  businessName: "",
};

export function parseReceiverDetailsFromMessage(
  text: string,
): ParsedReceiverDetails {
  const trimmed = text.trim();
  if (!trimmed) return { ...DEFAULT_PARSED_RECEIVER };

  let remainder = trimmed;

  const emailMatch = remainder.match(/[\w.+-]+@[\w.-]+\.\w+/);
  const email = emailMatch?.[0] ?? DEFAULT_PARSED_RECEIVER.email;
  if (emailMatch) {
    remainder = remainder.replace(emailMatch[0], " ");
  }

  const mobileMatch = remainder.match(/\b0\d(?:[\d ]*){8,10}\b/);
  const mobile = mobileMatch
    ? mobileMatch[0].replace(/\s+/g, " ").trim()
    : DEFAULT_PARSED_RECEIVER.mobile;
  if (mobileMatch) {
    remainder = remainder.replace(mobileMatch[0], " ");
  }

  const nameMatch = remainder.match(/\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/);
  const firstName = nameMatch?.[1] ?? DEFAULT_PARSED_RECEIVER.firstName;
  const lastName = nameMatch?.[2] ?? DEFAULT_PARSED_RECEIVER.lastName;
  if (nameMatch) {
    remainder = remainder.replace(nameMatch[0], " ");
  }

  remainder = remainder
    .replace(/^it's for[^,.]*[,.]?/i, "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();

  let addressLine = remainder.replace(/^,+|,+$/g, "").trim();
  if (!addressLine || addressLine.length < 6) {
    addressLine = DEFAULT_PARSED_RECEIVER.addressLine;
  } else {
    addressLine = addressLine
      .replace(/\bLatrobe Terrace\b/i, "Latrobe Tce")
      .replace(/,\s*Brisbane\s*$/i, " QLD 4064")
      .replace(/\s+Brisbane\s*$/i, " QLD 4064");
    if (!/\b(QLD|NSW|VIC|SA|WA|TAS|ACT|NT)\b/i.test(addressLine)) {
      addressLine = addressLine.replace(
        /\bPaddington\b/i,
        "Paddington QLD 4064",
      );
    }
  }

  return {
    firstName,
    lastName,
    mobile,
    email,
    addressLine,
    businessName: "",
  };
}

const RECEIVER_DETAILS_MESSAGE_IDS = [
  "welcome-receiver-details",
  "route-receiver-details",
] as const;

const DEFAULT_SENDER_DETAILS: ParsedReceiverDetails = {
  firstName: "Sam",
  lastName: "Perera",
  mobile: "0423 556 789",
  email: "sam.perera@example.com",
  addressLine: "",
  businessName: "",
};

export function parseSenderDetailsFromMessage(
  text: string,
): ParsedReceiverDetails {
  const trimmed = text.trim();
  if (!trimmed) return { ...DEFAULT_SENDER_DETAILS };

  const parsed = parseReceiverDetailsFromMessage(trimmed);
  return {
    ...parsed,
    addressLine: "",
    businessName: parsed.businessName,
  };
}

/** Number already on file. Any other number is entered by hand. */
export const KNOWN_SENDER_MOBILE = DEFAULT_SENDER_DETAILS.mobile;

export function lookupSenderByMobile(
  input: string,
): ParsedReceiverDetails | null {
  const digits = input.replace(/\D/g, "");
  const known = KNOWN_SENDER_MOBILE.replace(/\D/g, "");
  if (!digits || digits !== known) return null;
  return { ...DEFAULT_SENDER_DETAILS };
}

export function payNotifyLeadUserLine(messages: ChatMessage[]): string | null {
  const notify = messages.find((message) => message.id === "price-notify-user");
  if (typeof notify?.content !== "string") return null;
  const value = notify.content.trim();
  if (value === NOTIFY_USER_DISPLAY.yes || /^yes\b/i.test(value)) {
    return "Text her please";
  }
  return null;
}

export function receiverFirstNameFromThread(messages: ChatMessage[]): string {
  for (const id of RECEIVER_DETAILS_MESSAGE_IDS) {
    const message = messages.find((entry) => entry.id === id);
    if (typeof message?.content === "string" && message.content.trim()) {
      return parseReceiverDetailsFromMessage(message.content).firstName;
    }
  }
  return DEFAULT_PARSED_RECEIVER.firstName;
}

const RECEIVER_PROMPT_WELCOME =
  "Happy to help! Who\u2019s receiving it? Their first and last name, mobile, email and address. If it\u2019s going to a business, add the business name too.";

const RECEIVER_CONFIRM_BOT = "Here\u2019s what I\u2019ve got — does it look right?";

export const PARCEL_INSIDE_PROMPT =
  "Great! Now, what's inside the parcel?";

export function withParcelIntro(messages: ChatMessage[]): ChatMessage[] {
  if (messages.some((message) => message.id === "parcel-great-intro")) {
    return messages;
  }
  return [
    ...messages,
    {
      id: "parcel-great-intro",
      role: "bot",
      content: PARCEL_INSIDE_PROMPT,
    },
  ];
}

export function buildWelcomeReceiverThread(
  welcomeInitial?: string,
  receiverDetailsMessage?: string,
): ChatMessage[] {
  const items: ChatMessage[] = [];
  const initial = welcomeInitial?.trim();
  if (initial) {
    items.push({ id: "welcome-user", role: "user", content: initial });
  }
  items.push({
    id: "welcome-receiver-prompt",
    role: "bot",
    content: RECEIVER_PROMPT_WELCOME,
  });
  const receiverReply =
    receiverDetailsMessage?.trim() || WELCOME_DEMO_USER_MESSAGE;
  items.push({
    id: "welcome-receiver-details",
    role: "user",
    content: receiverReply,
  });
  items.push({
    id: "welcome-receiver-confirm",
    role: "bot",
    content: RECEIVER_CONFIRM_BOT,
  });
  items.push({ id: "looks-right", role: "user", content: "Looks right" });
  return items;
}

export function buildRouteThreadThroughParcelPoints(): ChatMessage[] {
  return [
    {
      id: "route-user",
      role: "user",
      content:
        "Send a pair of shoes to my mum in Brisbane. I'll drop it off near work in Parramatta.",
    },
    {
      id: "route-parcelpoints",
      role: "bot",
      content:
        "Lovely — shoes off to your mum. These PARCELPOINTS are closest to Parramatta. Which one works?",
    },
  ];
}

export function buildRouteToParcelThread(): ChatMessage[] {
  return [
    ...buildRouteThreadThroughParcelPoints(),
    {
      id: "route-receiver-prompt",
      role: "bot",
      content:
        "Church St Newsagent it is. Who\u2019s receiving it? Tell me their name, mobile and address.",
    },
    {
      id: "route-receiver-details",
      role: "user",
      content:
        "It's for my mum, Margaret Fernando, 0412 345 678, 18 Latrobe Terrace, Paddington in Brisbane",
    },
    {
      id: "route-receiver-confirm",
      role: "bot",
      content: RECEIVER_CONFIRM_BOT,
    },
    { id: "looks-right", role: "user", content: "Looks right" },
  ];
}

export function buildParcelThreadAppend(options: {
  categoryId?: string;
  categoryLabel: string;
  categoryIcon?: string;
  shortDescription: string;
  itemPhrase: string;
  selectedSizeLabel: string;
  sizeUserReply: string;
  photoAdded: boolean;
  skippedPhoto: boolean;
  parcelPointBoxLabel: string;
  packagingUserReply: string;
}): ChatMessage[] {
  const suggestedSizeLabel = suggestParcelSizeLabel({
    categoryId: options.categoryId,
    shortDescription: options.shortDescription,
  });
  const items = buildParcelProgressMessages("packaging", {
    categoryId: options.categoryId,
    categoryLabel: options.categoryLabel,
    categoryIcon: options.categoryIcon,
    shortDescription: options.shortDescription,
    itemPhrase: options.itemPhrase,
    suggestedSizeLabel,
    selectedSizeLabel: options.selectedSizeLabel,
    sizeUserReply: options.sizeUserReply,
    photoAdded: options.photoAdded,
    parcelPointBoxLabel: options.parcelPointBoxLabel,
  });
  const reply = options.packagingUserReply.trim();
  if (reply) {
    items.push({
      id: "parcel-packaging-user",
      role: "user",
      content: reply,
    });
  }
  return items;
}

export type PriceDeliveryChoice = "door" | "parcelpoint";

export const PRICE_DELIVERY_USER_LINES: Record<PriceDeliveryChoice, string> = {
  door: "🏠 Deliver to Door · $14.95",
  parcelpoint: "📍 Collect from PARCELPOINT · $9.95",
};

export function priceDeliveryUserLine(choice: PriceDeliveryChoice): string {
  return PRICE_DELIVERY_USER_LINES[choice];
}

export function resolvePriceDeliveryChoice(
  text: string,
  fallback?: PriceDeliveryChoice | null,
): PriceDeliveryChoice | null {
  const trimmed = text.trim();
  if (
    trimmed === PRICE_DELIVERY_USER_LINES.parcelpoint ||
    /parcelpoint/i.test(trimmed)
  ) {
    return "parcelpoint";
  }
  if (
    trimmed === PRICE_DELIVERY_USER_LINES.door ||
    /deliver to door/i.test(trimmed) ||
    /\bdoor\b/i.test(trimmed)
  ) {
    return "door";
  }
  return fallback ?? null;
}

export const PRICE_DELIVERY_BOT =
  "A Shoebox is a flat rate anywhere in Australia. To her door, or to a PARCELPOINT near her to collect?";

export function formatItemWorthDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "$180";
  const digits = trimmed.replace(/[^0-9.]/g, "");
  if (!digits) {
    return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
  }
  const num = parseFloat(digits);
  if (Number.isNaN(num)) return "$180";
  const formatted = Number.isInteger(num)
    ? String(Math.round(num))
    : num.toFixed(2);
  return `$${formatted}`;
}

function worthQuestionPhrase(itemLabel: string): {
  subject: string;
  verb: "is" | "are";
} {
  const subject = itemLabel.trim() || "the item";
  const plural =
    /\b(shoes|boots|sneakers|trainers|socks|glasses|jeans|books|novels)\b/i.test(
      subject,
    ) || /^a pair of/i.test(subject);
  return { subject, verb: plural ? "are" : "is" };
}

export function itemWorthLabelFromThread(messages: ChatMessage[]): string {
  const descMsg = messages.find((message) => message.id === "parcel-desc-user");
  if (typeof descMsg?.content === "string" && descMsg.content.trim()) {
    const text = descMsg.content.trim();
    if (/^(a|an|the)\s/i.test(text) || /^pair of/i.test(text)) return text;
    return `the ${text}`;
  }

  const catMsg = messages.find((message) => message.id === "parcel-category-user");
  if (typeof catMsg?.content === "string") {
    const label = catMsg.content
      .replace(/^\s*[\p{Extended_Pictographic}\uFE0F\s]+/u, "")
      .trim();
    if (label) return `the ${label.toLowerCase()}`;
  }

  return "the item";
}

export function priceExtrasBot(
  itemWorthLine: string,
  itemLabel?: string,
): string {
  const worth = formatItemWorthDisplay(itemWorthLine);
  const { subject, verb } = worthQuestionPhrase(itemLabel ?? "the item");
  return `Because ${subject} ${verb} worth ${worth}, they'll need Parcel Protection — $4.95.`;
}

export const PRICE_RECEIVER_NAME = "Margaret";

export function priceSignaturePrompt(
  receiverName = PRICE_RECEIVER_NAME,
): string {
  return `Would you like ${receiverName} to sign when it's delivered?`;
}

export function priceNotifyPrompt(
  receiverName = PRICE_RECEIVER_NAME,
): string {
  return `Let ${receiverName} know it's coming?`;
}

export function priceSignatureDoneBot(
  signature: "yes" | "no",
  receiverName = PRICE_RECEIVER_NAME,
): string {
  if (signature === "yes") {
    return `Done — ${receiverName} will sign when it arrives. Shall I let ${receiverName} know it's coming?`;
  }
  return `Done — we'll leave it in a safe place. Shall I let ${receiverName} know it's coming?`;
}

export const SIGNATURE_USER_DISPLAY = {
  yes: "Yes, signature required",
  no: "No, leave it in a safe place",
} as const;

export const NOTIFY_USER_DISPLAY = {
  yes: "Yes",
  no: "No",
} as const;

export function priceWorthPrompt(
  choice: PriceDeliveryChoice,
  itemLabel?: string,
): string {
  const lead = choice === "door" ? "Door it is." : "PARCELPOINT it is.";
  const { subject, verb } = worthQuestionPhrase(itemLabel ?? "the item");
  return `${lead} What ${verb} ${subject} worth? I'll use it to work out Parcel Protection.`;
}

export type ParcelPointLocationOption = {
  id: string;
  name: string;
  detail: string;
  address: string;
  mapTop: string;
  mapLeft: string;
  hoursOpen: string;
};

export const PARCELPOINT_LOCATION_OPTIONS: ParcelPointLocationOption[] = [
  {
    id: "paddington-post",
    name: "Paddington Post & News",
    detail: "0.6 km from her · Open till 6 pm",
    address: "142 Latrobe Tce, Paddington QLD 4064",
    mapTop: "38%",
    mapLeft: "54%",
    hoursOpen: "Open till 6 pm",
  },
  {
    id: "given-pharmacy",
    name: "Given Tce Pharmacy",
    detail: "0.9 km from her · Open till 8 pm",
    address: "88 Given Tce, Paddington QLD 4064",
    mapTop: "48%",
    mapLeft: "30%",
    hoursOpen: "Open till 8 pm",
  },
  {
    id: "latrobe-news",
    name: "Latrobe Tce Newsagency",
    detail: "1.1 km from her · Open till 5:30 pm",
    address: "201 Latrobe Tce, Paddington QLD 4064",
    mapTop: "52%",
    mapLeft: "70%",
    hoursOpen: "Open till 5:30 pm",
  },
];

export function parcelPointDetailForReceiver(
  detail: string,
  receiverFirstName: string,
): string {
  return detail.replace(/\bher\b/i, receiverFirstName);
}

export function parcelPointDistanceLine(
  location: ParcelPointLocationOption,
  receiverFirstName: string,
): string {
  const distance = location.detail.split("·")[0]?.trim() ?? location.detail;
  return `${distance.replace(/\bher\b/i, receiverFirstName)} · `;
}

export const PARCELPOINT_MILTON_OPTIONS: ParcelPointLocationOption[] = [
  {
    id: "park-road-pharmacy",
    name: "Park Road Pharmacy",
    detail: "1.4 km from her · Open till 7 pm",
    address: "58 Park Rd, Milton QLD 4064",
    mapTop: "40%",
    mapLeft: "52%",
    hoursOpen: "Open till 7 pm",
  },
  {
    id: "milton-newsagency",
    name: "Milton Newsagency",
    detail: "1.8 km from her · Open till 6 pm",
    address: "12 Baroona Rd, Milton QLD 4064",
    mapTop: "50%",
    mapLeft: "34%",
    hoursOpen: "Open till 6 pm",
  },
];

export function priceParcelPointSuburbSearchBot(
  receiverFirstName: string,
): string {
  return `Sure — which suburb or postcode should I look in for ${receiverFirstName}?`;
}

export function parcelPointSuburbAreaLabel(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "Milton QLD 4064";
  const title = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  if (/\b\d{4}\b/.test(trimmed)) return trimmed;
  return `${title} QLD 4064`;
}

export function parcelPointLocationsForSuburbQuery(
  query: string,
): ParcelPointLocationOption[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.includes("milton") || normalized.length > 0) {
    return PARCELPOINT_MILTON_OPTIONS;
  }
  return PARCELPOINT_LOCATION_OPTIONS;
}

export function receiverAddressHintFromThread(messages: ChatMessage[]): string {
  for (const id of RECEIVER_DETAILS_MESSAGE_IDS) {
    const text = threadText(messages, id);
    if (text) {
      const parsed = parseReceiverDetailsFromMessage(text);
      const line = parsed.addressLine.trim();
      if (line) {
        return line.replace(/\s+QLD\s+\d{4}$/i, "").trim();
      }
    }
  }
  return "18 Latrobe Tce, Paddington";
}

export function priceParcelPointPickBot(addressHint: string): string {
  return `Good choice — she can collect when it suits her. These are closest to ${addressHint}. Which one?`;
}

export type PriceProgressPhase = "delivery" | "parcelpoint" | "worth" | "extras";

export function buildPriceProgressMessages(
  phase: PriceProgressPhase,
  options: {
    deliveryUserLine?: string;
    deliveryChoice?: PriceDeliveryChoice | null;
    itemWorthLine?: string;
    itemWorthLabel?: string;
  },
): ChatMessage[] {
  const items: ChatMessage[] = [
    { id: "price-delivery-bot", role: "bot", content: PRICE_DELIVERY_BOT },
  ];
  if (phase === "delivery") return items;

  const deliveryLine = options.deliveryUserLine?.trim();
  if (deliveryLine) {
    items.push({
      id: "price-delivery-user",
      role: "user",
      content: deliveryLine,
    });
  }

  if (phase === "parcelpoint") return items;

  const choice = options.deliveryChoice ?? "door";
  items.push({
    id: "price-worth-bot",
    role: "bot",
    content: priceWorthPrompt(choice, options.itemWorthLabel),
  });

  if (phase === "worth") return items;

  const worthLine = options.itemWorthLine?.trim();
  if (worthLine) {
    items.push({
      id: "price-worth-user",
      role: "user",
      content: worthLine,
    });
  }

  items.push({
    id: "price-extras-bot",
    role: "bot",
    content: priceExtrasBot(
      worthLine ?? "$180",
      options.itemWorthLabel,
    ),
  });
  return items;
}

export function buildPriceExtrasLiveMessages(options: {
  extrasStep: "signature" | "notify";
  deliveryChoice?: PriceDeliveryChoice | null;
  signatureChoice?: "yes" | "no" | null;
  signatureUserLine?: string;
  receiverFirstName?: string;
}): ChatMessage[] {
  const receiverName = options.receiverFirstName?.trim() || PRICE_RECEIVER_NAME;
  const items: ChatMessage[] = [];
  const showSignature =
    options.deliveryChoice !== "parcelpoint" &&
    (options.extrasStep === "signature" || options.extrasStep === "notify");

  if (showSignature) {
    items.push({
      id: "price-signature-bot",
      role: "bot",
      content: priceSignaturePrompt(receiverName),
    });
  } else if (options.extrasStep === "notify") {
    items.push({
      id: "price-notify-intro-bot",
      role: "bot",
      content: priceNotifyPrompt(receiverName),
    });
  }

  if (
    options.extrasStep === "notify" &&
    options.signatureUserLine?.trim() &&
    options.signatureChoice
  ) {
    items.push({
      id: "price-signature-user",
      role: "user",
      content: options.signatureUserLine.trim(),
    });
    items.push({
      id: "price-signature-done-bot",
      role: "bot",
      content: priceSignatureDoneBot(options.signatureChoice, receiverName),
    });
  }

  return items;
}

export function buildPriceThreadAppend(options: {
  deliveryUserLine: string;
  deliveryChoice: PriceDeliveryChoice;
  itemWorthLine: string;
  itemWorthLabel?: string;
  signatureChoice?: "yes" | "no";
  signatureUserLine?: string;
  notifyUserLine?: string;
  receiverFirstName?: string;
}): ChatMessage[] {
  const items = buildPriceProgressMessages("extras", {
    deliveryUserLine: options.deliveryUserLine,
    deliveryChoice: options.deliveryChoice,
    itemWorthLine: options.itemWorthLine,
    itemWorthLabel: options.itemWorthLabel,
  });

  items.push(
    ...buildPriceExtrasLiveMessages({
      extrasStep: "notify",
      deliveryChoice: options.deliveryChoice,
      signatureChoice: options.signatureChoice ?? null,
      signatureUserLine: options.signatureUserLine,
      receiverFirstName: options.receiverFirstName,
    }),
  );

  if (options.notifyUserLine?.trim()) {
    items.push({
      id: "price-notify-user",
      role: "user",
      content: options.notifyUserLine.trim(),
    });
  }

  return items;
}

function threadText(messages: ChatMessage[], id: string): string {
  const message = messages.find((entry) => entry.id === id);
  return typeof message?.content === "string" ? message.content.trim() : "";
}

function parcelShortDescriptionFromThread(messages: ChatMessage[]): string {
  const raw = threadText(messages, "parcel-desc-user");
  if (raw) {
    return raw
      .replace(/^(a|an|the)\s+/i, "")
      .replace(/^pair of\s+/i, "pair of ")
      .toLowerCase();
  }
  const cat = threadText(messages, "parcel-category-user");
  if (cat) {
    const label = cat
      .replace(/^\s*[\p{Extended_Pictographic}\uFE0F\s]+/u, "")
      .trim();
    if (label) return label.toLowerCase();
  }
  return "items";
}

function parcelSizeLabelFromThread(messages: ChatMessage[]): string {
  const sizeReply = threadText(messages, "parcel-size-user");
  if (sizeReply) {
    const match = sizeReply.match(/^A\s+(.+)$/i);
    if (match) {
      const name = match[1].trim();
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return sizeReply;
  }
  const desc = threadText(messages, "parcel-desc-user");
  return suggestParcelSizeLabel({ shortDescription: desc });
}

function worthNumberFromThread(messages: ChatMessage[]): number {
  const raw = threadText(messages, "price-worth-user");
  const digits = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(digits);
  return Number.isNaN(num) ? 180 : num;
}

function suburbFromReceiverAddress(addressLine: string): string {
  const trimmed = addressLine.trim();
  const commaMatch = trimmed.match(
    /,\s*([^,]+?)\s+(QLD|NSW|VIC|SA|WA|TAS|ACT|NT)\b/i,
  );
  if (commaMatch) return commaMatch[1].trim();
  const suburbOnly = trimmed.match(/\b(Paddington|Brisbane)\b/i);
  if (suburbOnly) return suburbOnly[1];
  return "Paddington";
}

export type BookingPriceLine = {
  label: string;
  amount: string;
  muted?: boolean;
};

export type BookingSummary = {
  fromLine: string;
  toLine: string;
  parcelLine: string;
  deliveryLine: string;
  priceLines: BookingPriceLine[];
  total: string;
};

function formatBookingMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function bookingTotalWithGst(subtotalExGst: number): {
  priceLines: BookingPriceLine[];
  total: string;
} {
  const gst = subtotalExGst * 0.1;
  const grandTotal = subtotalExGst + gst;
  return {
    priceLines: [
      { label: "GST (10%)", amount: formatBookingMoney(gst) },
    ],
    total: formatBookingMoney(grandTotal),
  };
}

const DEFAULT_BOOKING_SUMMARY: BookingSummary = {
  fromLine: "Sam Perera · 0423 556 789",
  toLine: "Margaret Fernando · door, Paddington QLD",
  parcelLine: "Shoebox · running shoes · $180",
  deliveryLine: "PARCELPOINT → Door · arrives 2–4 business days",
  priceLines: [
    { label: "Delivery", amount: "$14.95" },
    { label: "Packaging Fee", amount: "$2.00" },
    { label: "Parcel Protection", amount: "$4.95" },
    { label: "Signature on Delivery", amount: "$3.00" },
    { label: "GST (10%)", amount: "$2.49" },
  ],
  total: "$27.39",
};

export function buildPaySenderThreadAppend(senderLine: string): ChatMessage[] {
  const trimmed = senderLine.trim();
  if (!trimmed) return [];
  return [{ id: "pay-sender-user", role: "user", content: trimmed }];
}

export function paySenderSeedFromThread(
  messages: ChatMessage[],
): { line: string; parsed: ParsedReceiverDetails } | null {
  const line = threadText(messages, "pay-sender-user");
  if (!line) return null;
  return { line, parsed: parseSenderDetailsFromMessage(line) };
}

export function buildBookingSummaryFromThread(
  messages: ChatMessage[],
): BookingSummary {
  if (!messages.length) return { ...DEFAULT_BOOKING_SUMMARY };

  const senderText = threadText(messages, "pay-sender-user");
  const sender = senderText
    ? parseSenderDetailsFromMessage(senderText)
    : parseSenderDetailsFromMessage("");
  const fromLine =
    `${sender.firstName} ${sender.lastName} · ${sender.mobile}`.trim();

  let receiver = { ...DEFAULT_PARSED_RECEIVER };
  for (const id of RECEIVER_DETAILS_MESSAGE_IDS) {
    const text = threadText(messages, id);
    if (text) {
      receiver = parseReceiverDetailsFromMessage(text);
      break;
    }
  }

  const deliveryChoice =
    resolvePriceDeliveryChoice(
      threadText(messages, "price-delivery-user"),
      "door",
    ) ?? "door";
  const deliveryKind = deliveryChoice === "door" ? "door" : "PARCELPOINT";
  const suburb = suburbFromReceiverAddress(receiver.addressLine);
  const toLine = `${receiver.firstName} ${receiver.lastName} · ${deliveryKind}, ${suburb} QLD`;

  const sizeLabel = parcelSizeLabelFromThread(messages);
  const shortDesc = parcelShortDescriptionFromThread(messages);
  const worthDisplay = formatItemWorthDisplay(
    threadText(messages, "price-worth-user") || "180",
  );
  const parcelLine = `${sizeLabel} · ${shortDesc} · ${worthDisplay}`;

  const deliveryLine =
    deliveryChoice === "door"
      ? "PARCELPOINT → Door · arrives 2–4 business days"
      : "PARCELPOINT collection · ready when she's free";

  const deliveryAmount = deliveryChoice === "door" ? 14.95 : 9.95;

  const packagingUser = threadText(messages, "parcel-packaging-user");
  const packagingAmount = /add packaging/i.test(packagingUser) ? 2 : 0;

  const worthNum = worthNumberFromThread(messages);
  const protectionAmount = worthNum > 0 ? 4.95 : 0;

  const signatureUser = threadText(messages, "price-signature-user");
  const signatureAmount =
    signatureUser === SIGNATURE_USER_DISPLAY.yes ||
    /signature required/i.test(signatureUser)
      ? 3
      : 0;

  const subtotal =
    deliveryAmount + packagingAmount + protectionAmount + signatureAmount;

  const chargeLines: BookingPriceLine[] = [
    { label: "Delivery", amount: formatBookingMoney(deliveryAmount) },
    { label: "Packaging Fee", amount: formatBookingMoney(packagingAmount) },
    {
      label: "Parcel Protection",
      amount: formatBookingMoney(protectionAmount),
    },
    {
      label: "Signature on Delivery",
      amount: formatBookingMoney(signatureAmount),
    },
  ];

  const { priceLines: gstLines, total } = bookingTotalWithGst(subtotal);

  return {
    fromLine,
    toLine,
    parcelLine,
    deliveryLine,
    priceLines: [...chargeLines, ...gstLines],
    total,
  };
}

export type BookingConfirmedDetails = {
  total: string;
  statusBadge: string;
  badgeVariant: "cardPaid" | "storeBooked";
  bookedMessage: string;
  barcodeCaption: string;
  infoSectionTitle: string;
  infoPrimary: string;
  infoPrimaryAccent: boolean;
  infoSecondary: string;
  receiptEmail: string;
  primaryActionLabel: string;
};

function itemSubjectForBookedMessage(messages: ChatMessage[]): {
  subject: string;
  verb: "is" | "are";
} {
  const raw = threadText(messages, "parcel-desc-user");
  let subject = raw
    .trim()
    .replace(/^(a|an|the)\s+/i, "")
    .replace(/^pair of\s+/i, "pair of ");
  if (!subject) {
    subject = parcelShortDescriptionFromThread(messages);
  }
  if (!subject || subject === "items") subject = "parcel";
  const plural =
    /\b(shoes|boots|sneakers|trainers|socks|glasses|jeans|books|novels)\b/i.test(
      subject,
    ) ||
    /^pair of/i.test(subject) ||
    subject.endsWith("s");
  return { subject, verb: plural ? "are" : "is" };
}

export function buildBookingConfirmedDetails(
  messages: ChatMessage[],
  options?: { paymentMethod?: "card" | "store" },
): BookingConfirmedDetails {
  const summary = buildBookingSummaryFromThread(messages);
  const paymentMethod = options?.paymentMethod ?? "card";

  const receiverName = receiverFirstNameFromThread(messages);
  const { subject, verb } = itemSubjectForBookedMessage(messages);

  let receiver = { ...DEFAULT_PARSED_RECEIVER };
  for (const id of RECEIVER_DETAILS_MESSAGE_IDS) {
    const text = threadText(messages, id);
    if (text) {
      receiver = parseReceiverDetailsFromMessage(text);
      break;
    }
  }
  const suburb = suburbFromReceiverAddress(receiver.addressLine);
  const destinationLine = `To ${suburb}, Brisbane`;

  const sizeLabel = parcelSizeLabelFromThread(messages);
  const deliveryChoice =
    resolvePriceDeliveryChoice(
      threadText(messages, "price-delivery-user"),
      "door",
    ) ?? "door";
  const serviceLine =
    deliveryChoice === "door"
      ? `${sizeLabel} · PARCELPOINT — Door`
      : `${sizeLabel} · PARCELPOINT collection`;

  const senderText = threadText(messages, "pay-sender-user");
  const sender = senderText
    ? parseSenderDetailsFromMessage(senderText)
    : parseSenderDetailsFromMessage("");
  const receiptEmail = sender.email || DEFAULT_SENDER_DETAILS.email;

  if (paymentMethod === "store") {
    return {
      total: summary.total,
      statusBadge: `Booked · ${summary.total} to pay in store`,
      badgeVariant: "storeBooked",
      bookedMessage:
        "Booked! Take it to any PARCELPOINT by [cut-off time]. Show this barcode at the counter and pay",
      barcodeCaption: "[BOOKING REF]",
      infoSectionTitle: "Booking ref",
      infoPrimary: `${summary.total} due in store`,
      infoPrimaryAccent: true,
      infoSecondary: serviceLine,
      receiptEmail,
      primaryActionLabel: "Save barcode",
    };
  }

  return {
    total: summary.total,
    statusBadge: `✓ Paid ${summary.total} by card`,
    badgeVariant: "cardPaid",
    bookedMessage: `Booked! 🥳 The ${subject} ${verb} on their way to ${receiverName}. Drop it at any PARCELPOINT by [cut-off time] — just show this barcode at the counter, no printer needed.`,
    barcodeCaption: "[TRACKING ID]",
    infoSectionTitle: "Tracking",
    infoPrimary: destinationLine,
    infoPrimaryAccent: false,
    infoSecondary: serviceLine,
    receiptEmail,
    primaryActionLabel: "Label PDF",
  };
}
