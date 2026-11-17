export const AI_SIZE_OPTIONS = [
  {
    id: "satchel",
    label: "Satchel",
    dims: "25×15×5 cm",
    limit: "500g",
    maxKg: 1,
  },
  {
    id: "shoebox",
    label: "Shoebox",
    dims: "30×25×15 cm",
    limit: "3kg",
    maxKg: 5,
  },
  {
    id: "briefcase",
    label: "Briefcase",
    dims: "40×30×15 cm",
    limit: "5kg",
    maxKg: 5,
  },
  {
    id: "carryon",
    label: "Carry On",
    dims: "55×40×20 cm",
    limit: "12kg",
    maxKg: 12,
  },
] as const;

export type AiSizeId = (typeof AI_SIZE_OPTIONS)[number]["id"];

export type AiRecommendation = {
  headline: string;
  detail: string;
  authorityToLeave: boolean;
  parcelProtection: boolean;
  signature: boolean;
  protectionIncluded: boolean;
};

const AI_DOOR_DELIVERY = 11.5;
export const AI_SIGNATURE_FEE = 2;

export function formatAiMoney(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function formatDeclaredParcelValue(valueDollars: number) {
  if (!Number.isFinite(valueDollars) || valueDollars <= 0) return "$0";
  const rounded = Math.round(valueDollars * 100) / 100;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-9) {
    return `$${Math.round(rounded).toLocaleString()}`;
  }
  return formatAiMoney(rounded);
}

export function protectionFeeForValue(valueDollars: number): number {
  if (valueDollars <= 100) return 0;
  return Math.round((valueDollars - 100) * 0.025 * 100) / 100;
}

/** Copy when offering optional Parcel Protection above $100 declared value. */
export function parcelProtectionOfferMessage(
  valueDollars: number,
  rec: AiRecommendation,
): string {
  const feeStr = formatAiMoney(protectionFeeForValue(valueDollars));
  const deliveryStr = formatAiMoney(
    buildAiSuggestedTotal(valueDollars, { ...rec, parcelProtection: false }),
  );
  const totalWithProtectionStr = formatAiMoney(
    buildAiSuggestedTotal(valueDollars, { ...rec, parcelProtection: true }),
  );
  return `Just a little heads-up! 😊 Since your parcel is valued at over $100, we'd recommend adding Parcel Protection for ${feeStr} — your total would be ${totalWithProtectionStr} (${deliveryStr} delivery + ${feeStr} Parcel Protection).`;
}

export function buildAiSuggestedTotal(
  valueDollars: number,
  rec: AiRecommendation,
): number {
  let total = AI_DOOR_DELIVERY;
  if (rec.parcelProtection && valueDollars > 100) {
    total += protectionFeeForValue(valueDollars);
  }
  if (rec.signature) {
    total += AI_SIGNATURE_FEE;
  }
  return Math.round(total * 100) / 100;
}

function aiDeliveryServiceName(
  sizeId: AiSizeId | null,
  valueDollars: number,
): string {
  const lightParcel =
    (sizeId === "satchel" || sizeId === "shoebox") && valueDollars <= 100;
  return lightParcel ? "Quick Delivery" : "Door delivery";
}

/** Narrative cost + protection copy shown in the recommend bot bubble after intake. */
export function buildAiRecommendBotText(
  sizeId: AiSizeId | null,
  valueDollars: number,
  deliverySuburb: string,
  rec: AiRecommendation,
): string {
  const suburb = deliverySuburb.trim() || "your receiver";
  const size =
    AI_SIZE_OPTIONS.find((option) => option.id === sizeId)?.label ?? "parcel";
  const sizePhrase = `${size.toLowerCase()}-sized`;
  const serviceName = aiDeliveryServiceName(sizeId, valueDollars);
  const totalStr = formatAiMoney(buildAiSuggestedTotal(valueDollars, rec));
  const valueStr = formatDeclaredParcelValue(valueDollars);

  const lead = `Sending your ${sizePhrase} parcel to ${suburb} with ${serviceName} will cost ${totalStr} (based on your ${valueStr} parcel value).`;

  if (valueDollars <= 100) {
    return lead;
  }

  return `${lead}\n\n${parcelProtectionOfferMessage(valueDollars, rec)}`;

}

/** Line-item quote from PPGo's suggested add-ons (shown right after intake). */
export function buildAiQuoteText(
  valueDollars: number,
  rec: AiRecommendation,
): string {
  const lines: string[] = ["What it costs (suggested):"];
  lines.push(`Door delivery — ${formatAiMoney(AI_DOOR_DELIVERY)}`);

  if (rec.signature) {
    lines.push(`Signature on delivery — ${formatAiMoney(AI_SIGNATURE_FEE)}`);
  }

  const total = buildAiSuggestedTotal(valueDollars, rec);
  lines.push(`Total — ${formatAiMoney(total)}`);
  return lines.join("\n");
}

const AI_PACKAGING_FEE = 2;
const AI_GST_RATE = 0.1;

export function buildAiPriceSummary(options: {
  valueDollars: number;
  parcelProtection: boolean;
  protectionIncluded: boolean;
  signature: boolean;
  packagingYes: boolean;
}): {
  lines: { label: string; amount: string }[];
  subtotal: number;
  gst: number;
  total: number;
} {
  const lines: { label: string; amount: string }[] = [];
  let subtotal = AI_DOOR_DELIVERY;
  lines.push({ label: "Delivery", amount: formatAiMoney(AI_DOOR_DELIVERY) });

  if (options.packagingYes) {
    subtotal += AI_PACKAGING_FEE;
    lines.push({ label: "Packaging Fee", amount: formatAiMoney(AI_PACKAGING_FEE) });
  }

  if (options.parcelProtection) {
    if (options.protectionIncluded && options.valueDollars <= 100) {
      lines.push({ label: "Parcel Protection", amount: formatAiMoney(0) });
    } else if (options.valueDollars > 100) {
      const fee = protectionFeeForValue(options.valueDollars);
      subtotal += fee;
      lines.push({ label: "Parcel Protection", amount: formatAiMoney(fee) });
    }
  }

  if (options.signature) {
    subtotal += AI_SIGNATURE_FEE;
    lines.push({
      label: "Signature on Delivery",
      amount: formatAiMoney(AI_SIGNATURE_FEE),
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const gst = Math.round(subtotal * AI_GST_RATE * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;
  lines.push({ label: "GST (10%)", amount: formatAiMoney(gst) });

  return { lines, subtotal, gst, total };
}

export function buildAiRecommendation(
  sizeId: AiSizeId | null,
  valueDollars: number,
  deliverySuburb: string,
): AiRecommendation {
  const suburb = deliverySuburb.trim() || "your receiver";
  const size =
    AI_SIZE_OPTIONS.find((option) => option.id === sizeId)?.label ?? "parcel";

  if (valueDollars >= 200) {
    return {
      headline: `Signature delivery for ${suburb}`,
      detail: `A ${size.toLowerCase()} worth $${valueDollars.toLocaleString()} — we'd book door delivery with signature. You can turn signature off if the customer prefers authority to leave.`,
      authorityToLeave: false,
      parcelProtection: true,
      signature: true,
      protectionIncluded: false,
    };
  }

  if (valueDollars > 100) {
    return {
      headline: `Delivery to ${suburb}`,
      detail: `For a declared value of $${valueDollars.toLocaleString()}, we'd suggest door delivery with authority to leave — unless the customer wants a signature on delivery.`,
      authorityToLeave: true,
      parcelProtection: true,
      signature: false,
      protectionIncluded: false,
    };
  }

  const lightParcel = (sizeId === "satchel" || sizeId === "shoebox") && valueDollars <= 100;

  return {
    headline: lightParcel
      ? `Quick delivery to ${suburb}`
      : `Door delivery to ${suburb}`,
    detail: lightParcel
      ? `${size} · $${valueDollars.toLocaleString()} — authority to leave keeps it simple.`
      : `We'll send your ${size.toLowerCase()} ($${valueDollars.toLocaleString()}) with authority to leave unless you opt out.`,
    authorityToLeave: true,
    parcelProtection: true,
    signature: false,
    protectionIncluded: valueDollars <= 100,
  };
}

export type AiBookingDemo = "gift80" | "dress400";

export type AiBookingStarter =
  | "cost"
  | "size"
  | "packaging"
  | "valueHelp";

const STARTER_PREFILL: Record<AiBookingStarter, string> = {
  cost: "How much will it cost to send a Satchel, gift, $80 from West End to Brisbane?",
  size: "Help me choose a size — small gift, $80 from West End to Brisbane",
  packaging: "I need store packaging for my parcel",
  valueHelp: "",
};

export function aiBookingStarterPrefill(starter: AiBookingStarter): string {
  return STARTER_PREFILL[starter];
}

export function buildIntakeComposerLine(draft: {
  sizeId: AiSizeId | null;
  valueText: string;
  suburb: string;
}): string {
  const value = Number(draft.valueText.replace(/[^\d.]/g, ""));
  const dest = draft.suburb.trim();
  const label = draft.sizeId
    ? (AI_SIZE_OPTIONS.find((s) => s.id === draft.sizeId)?.label ?? null)
    : null;

  if (label && value > 0 && dest) {
    return `${label}, $${value.toLocaleString()} to ${dest}`;
  }

  const parts: string[] = [];
  if (label) parts.push(label);
  if (value > 0) parts.push(`$${value.toLocaleString()}`);

  if (dest) {
    if (parts.length > 0) {
      return `${parts.join(", ")} to ${dest}`;
    }
    return dest;
  }

  return parts.join(", ");
}

function parcelSubjectFromIntake(intakeLine: string): { subject: string; verb: "is" | "are" } {
  const lower = intakeLine.toLowerCase();
  let subject = "parcel";
  if (lower.includes("gift")) subject = "gift";
  else if (lower.includes("dress")) subject = "dress";
  else if (/\bshoe|sneaker|running/i.test(lower)) subject = "shoes";
  const plural =
    subject === "shoes" ||
    /\b(shoes|boots|socks)\b/i.test(subject);
  return { subject, verb: plural ? "are" : "is" };
}

export function buildAiBookingConfirmedDetails(options: {
  total: number;
  paymentMethod: "card" | "store";
  receiverName: string;
  suburb: string;
  sizeLabel: string;
  senderEmail: string;
  intakeLine?: string;
}): {
  variant: "card" | "store";
  statusBadge: string;
  bookedMessage: string;
  barcodeCaption: string;
  infoSectionTitle: string;
  infoPrimary: string;
  infoPrimaryAccent: boolean;
  infoSecondary: string;
  receiptEmail: string;
} {
  const totalStr = formatAiMoney(options.total);
  const destinationLine = options.suburb
    ? `To ${options.suburb}`
    : "To delivery address";
  const serviceLine = `${options.sizeLabel} · PARCELPOINT — Door`;
  const email = options.senderEmail || "your email on file";
  if (options.paymentMethod === "store") {
    return {
      variant: "store" as const,
      statusBadge: `Booked · ${totalStr} to pay at counter`,
      bookedMessage: `Booked! Hand your parcel over the counter and show this barcode. Pay ${totalStr} by EFTPOS or cash when you're ready — we'll print and attach the label.`,
      barcodeCaption: "[BOOKING REF]",
      infoSectionTitle: "Booking ref",
      infoPrimary: `${totalStr} due in store`,
      infoPrimaryAccent: true,
      infoSecondary: serviceLine,
      receiptEmail: email,
    };
  }

  return {
    variant: "card" as const,
    statusBadge: `✓ Paid ${totalStr} by card`,
    bookedMessage: `Booked! 🎉 Payment's done. Show this barcode at the counter and hand your parcel over — we'll label it and send it to ${options.receiverName}.`,
    barcodeCaption: "[TRACKING ID]",
    infoSectionTitle: "Tracking",
    infoPrimary: destinationLine,
    infoPrimaryAccent: false,
    infoSecondary: serviceLine,
    receiptEmail: email,
  };
}

export function demoPreset(demo: AiBookingDemo): {
  sizeId: AiSizeId;
  value: string;
  suburb: string;
  contents: string;
} {
  if (demo === "dress400") {
    return {
      sizeId: "shoebox",
      value: "400",
      suburb: "Melbourne",
      contents: "dress",
    };
  }
  return {
    sizeId: "satchel",
    value: "80",
    suburb: "Brisbane",
    contents: "gift",
  };
}
