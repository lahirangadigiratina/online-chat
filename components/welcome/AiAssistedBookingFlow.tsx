"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AI_SIZE_OPTIONS,
  AI_SIGNATURE_FEE,
  buildAiBookingConfirmedDetails,
  buildAiPriceSummary,
  buildAiRecommendation,
  buildAiSuggestedTotal,
  buildIntakeComposerLine,
  formatAiMoney,
  formatDeclaredParcelValue,
  demoPreset,
  aiBookingStarterPrefill,
  type AiBookingDemo,
  type AiRecommendation,
  type AiSizeId,
} from "@/lib/ai-booking-recommendations";
import {
  isAffirmative,
  isProceedBooking,
  buildReceiverContactLine,
  buildSenderContactLine,
  contactDisplayFirstName,
  contactDraftFromLine,
  deliveryDestinationLabel,
  EMPTY_RECEIVER_CONTACT_DRAFT,
  EMPTY_SENDER_CONTACT_DRAFT,
  isReceiverContactComplete,
  isSenderContactComplete,
  buildContactDetailsEmptyPrompt,
  buildContactDetailsFollowUpPrompt,
  buildIntakeFollowUpPrompt,
  hasReceiverContactProgress,
  hasSenderContactProgress,
  intakeDraftMissingLabels,
  mergeIntakeDraftFields,
  mergeReceiverDraftWithLine,
  mergeSenderDraftWithLine,
  receiverContactMissingLabels,
  senderContactMissingLabels,
  senderDraftFromLine,
  parseContactLine,
  parseIntakeMessage,
  parseIntakeDraftFields,
  formatAuMobileLabel,
  parsePackaging,
  parsePayment,
  type ReceiverContactDraft,
  type SenderContactDraft,
} from "@/lib/ai-booking-parse";
import { ChatFlowFooter, ChatFlowHeader, type ChatFlowStep } from "./ChatFlowHeader";
import type { ChatMessage } from "./chatThread";
import {
  BotReply,
  BotBubble,
  ChatScrollArea,
  UserBubble,
} from "./ChatTranscript";
import { ParcelPhotoBubble } from "./ParcelPhotoBubble";
import { ParcelPhotoStepCard } from "./ParcelPhotoStepCard";
import {
  AiBookingSummaryWidget,
  type AiBookingSummaryLines,
} from "./AiBookingSummaryWidget";
import {
  DangerousChoiceButtons,
  DangerousGoodsCard,
  DangerousGoodsLockedCard,
  MarketingChoiceButtons,
  TermsAgreementCard,
  TermsChoiceButtons,
  TermsDeclineRecoveryButtons,
} from "./PayConfirmChatWidgets";
import { AiPaymentMethodChatWidget } from "./AiPaymentMethodChatWidget";
import { AiBookingConfirmedPanel } from "./AiBookingConfirmedPanel";
import { AiIntakeFormWidget } from "./AiIntakeFormWidget";
import {
  AiReceiverContactFormWidget,
  AiSenderContactFormWidget,
} from "./AiContactFormWidget";
import { PARCEL_PHOTO_SKIP_USER } from "./chatThread";
import { StartOverConfirmDialog } from "./StartOverConfirmDialog";

const PGO_ORANGE = "#C44717";

const SENDER_STEP_INTRO = `Let's move on to the next step. I'll just need a few details from you to get your parcel ready. 🚚

Can you share your details with me? 😊`;

const SIGNATURE_ADDED_CONFIRMATION = `Perfect! 😊 Signature on Delivery has been added. You're all set with the extra options!

${SENDER_STEP_INTRO}`;

const SIGNATURE_DECLINED_CONFIRMATION = `No worries! We'll leave your parcel in a safe place. 😊

${SENDER_STEP_INTRO}`;

const SENDER_MARKETING_PROMPT =
  "Awesome, got your details! Would you like to hear about special offers, updates, and promotions from us? 😊";

const RECEIVER_INTRO_PROMPT =
  "No worries at all! 😊 Let's move on to the next step. Who should we send your parcel to?";

const RECEIVER_INTRO_AFTER_MARKETING_OPT_IN =
  "Perfect! 😊 We'll keep you updated on any special offers. Now, let's get the receiver's details so we can get your parcel on its way!";

const RECEIVER_DELIVERY_UPDATES_PROMPT =
  "Awesome, we've got the receiver's details too! 😊 Would they like to receive updates and notifications about the parcel's delivery?";

const PACKAGING_STEP_PROMPT =
  "Would you like us to provide packaging for your parcel? It's just $2 extra! 😊";

const CONFIRM_PARTIES_INTRO_WITH_UPDATES = `Perfect! 😊 Everything looks good! We'll keep you updated with notifications about your parcel every step of the way.

Here's everything we've got so far! 😊`;

const CONFIRM_PARTIES_INTRO_NO_UPDATES = `No worries! 😊 We won't send you any delivery notifications. Your parcel is still good to go!

Here's everything we've got so far! 😊`;

const CONFIRM_PARTIES_INTRO_DEFAULT =
  "Here's what I've got — does it look right?";

const CONFIRM_PARTIES_UPDATED_INTRO =
  "Here's your updated summary — does it look right? 😊";

const CONFIRM_PARTIES_CHANGE_CHIP = "Change something";

const CONFIRM_PARTIES_EDIT_PROMPT =
  "What would you like to change — sender or receiver details? Tap Sender or Receiver below, or type in the box. 😊";

const CONFIRM_PARTIES_EDIT_SENDER_PROMPT =
  "Share your updated sender details — first name, last name, email and mobile. Business name is optional. Type them in the box below. 😊";

const CONFIRM_PARTIES_EDIT_RECEIVER_PROMPT =
  "Share your updated receiver details — name, mobile, email and delivery address. Type them in the box below. 😊";

type ConfirmPartiesEditStep = null | "choose" | "sender" | "receiver";

const INTAKE_OPENING_MESSAGE = (
  <>
    Hi! I&apos;m PPGo. What are you sending today? Tell me what you&apos;re sending, what
    it&apos;s worth and where it&apos;s going — I&apos;ll recommend the best way to send it.
  </>
);

const PHASE_ORDER = [
  "intake",
  "recommend",
  "sender",
  "senderMarketing",
  "receiver",
  "receiverDeliveryUpdates",
  "confirmParties",
  "packaging",
  "photo",
  "notify",
  "review",
  "confirmTerms",
  "confirmDangerous",
  "confirmMarketing",
  "payment",
  "booked",
] as const;

type Phase = (typeof PHASE_ORDER)[number];

type EditableContact = "sender" | "receiver";

type AiMessage = ChatMessage & {
  anchor?: Phase;
  editableContact?: EditableContact;
};

function phaseIndex(phase: Phase) {
  return PHASE_ORDER.indexOf(phase);
}

type ReviewEditTarget = null | "from" | "to" | "parcel" | "delivery";

function emptySendNudgeForPhase(
  phase: Phase,
  options?: {
    confirmPartiesEditStep?: ConfirmPartiesEditStep;
    reviewEditTarget?: ReviewEditTarget;
  },
): string {
  switch (phase) {
    case "intake":
      return buildIntakeFollowUpPrompt([
        "parcel size",
        "declared value",
        "delivery suburb or city",
      ]);
    case "recommend":
      return "Let me know with Yes please, No thanks, or Start over — or type your choice. 😊";
    case "senderMarketing":
      return "Would you like to hear about special offers from us? Tap Yes, sounds good! or No, thanks. — or type your reply. 😊";
    case "receiverDeliveryUpdates":
      return "Should we notify the receiver about delivery? Tap Yes, keep me updated! or No, thanks. — or type your reply. 😊";
    case "confirmParties":
      if (options?.confirmPartiesEditStep === "choose") {
        return "Tap Sender or Receiver above, type your choice, or use Start over. 😊";
      }
      if (options?.confirmPartiesEditStep === "sender") {
        return "Type your updated sender details in the box below — name, email, mobile and optional business. 😊";
      }
      if (options?.confirmPartiesEditStep === "receiver") {
        return "Type your updated receiver details in the box below — name, mobile, email and address. 😊";
      }
      return `Does everything look right? Tap Looks good, ${CONFIRM_PARTIES_CHANGE_CHIP}, or Start over — or type your reply. 😊`;
    case "packaging":
      return "Would you like packaging? Tap Yes, add packaging or No, thanks — or type your reply. 😊";
    case "photo":
      return "Add a parcel photo above, or send Skip for now to continue. 😊";
    case "notify":
      return "Should we notify your receiver by text? Reply yes or no. 😊";
    case "review":
      if (options?.reviewEditTarget) {
        return "Update the text in the box below and send when you're ready. 😊";
      }
      return "Tap Show price summary or type it in chat, then continue to payment when you're ready. 😊";
    case "confirmTerms":
      return "Please tap I agree or I don't agree above — or type your choice. 😊";
    case "confirmDangerous":
      return "Confirm your parcel doesn't contain dangerous goods, or let us know if it does. 😊";
    case "confirmMarketing":
      return "Would you like marketing updates? Reply yes or no. 😊";
    case "payment":
      return "Choose Pay online or Pay in store above — or type your preference. 😊";
    default:
      return "Type a reply or use the quick options above when you're ready. 😊";
  }
}

function BotTurn({
  children,
  animate,
  bordered,
  onReady,
}: {
  children: ReactNode;
  animate: boolean;
  bordered?: boolean;
  onReady?: () => void;
}) {
  if (!animate) {
    return <BotBubble bordered={bordered}>{children}</BotBubble>;
  }
  return (
    <BotReply onReady={onReady}>
      <BotBubble bordered={bordered}>{children}</BotBubble>
    </BotReply>
  );
}

function QuickChip({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-[14px] font-semibold text-[#0B1B32] shadow-sm transition active:scale-[0.99] disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function NotifyRadioMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? "border-[#C44717]" : "border-neutral-300"
      }`}
    >
      {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#C44717]" /> : null}
    </span>
  );
}

function NotifyReceiverOption({
  title,
  detail,
  badge,
  selected,
  disabled,
  onClick,
}: {
  title: string;
  detail: string;
  badge?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition disabled:opacity-90 ${
        selected ? "border-2 border-[#C44717] bg-[#FFF8F4]" : "border-neutral-200"
      }`}
    >
      <NotifyRadioMark selected={!!selected} />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-[#0B1B32]">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-neutral-500">{detail}</span>
      </span>
      {badge ? (
        <span className="shrink-0 text-[15px] font-bold text-[#0B1B32]">{badge}</span>
      ) : null}
    </button>
  );
}

function AiRecommendAfterProtectionYesMessage() {
  const signatureFee = formatDeclaredParcelValue(AI_SIGNATURE_FEE);

  return (
    <span className="block space-y-3">
      <span className="block">
        Great! Now your parcel is extra protected with Parcel Protection.
      </span>
      <span className="block">
        Additionally, For extra peace of mind, you can also add{" "}
        <span className="font-semibold">
          Signature on Delivery for just {signatureFee}
        </span>
        . This means the receiver will need to sign when the parcel is
        delivered, giving you extra confirmation that it has arrived safely.
      </span>
      <span className="block">Would you like to add it? 😊</span>
    </span>
  );
}

function AiRecommendHighValueNoProtectionSignatureMessage() {
  const signatureFee = formatDeclaredParcelValue(AI_SIGNATURE_FEE);

  return (
    <span className="block space-y-3">
      <span className="block">
        No worries! 😊 Since your parcel is quite valuable, we&apos;d recommend
        adding{" "}
        <span className="font-semibold">
          Signature on Delivery for just {signatureFee}
        </span>
        . This way, the receiver will need to sign when it arrives, giving you
        extra peace of mind!
      </span>
      <span className="block">Would you like to add it? 😊</span>
    </span>
  );
}

function AiRecommendSignatureUpsellMessage({
  additionally = false,
}: {
  additionally?: boolean;
}) {
  const signatureFee = formatDeclaredParcelValue(AI_SIGNATURE_FEE);

  return (
    <span className="block space-y-3">
      <span className="block">
        {additionally ? "Additionally, " : ""}
        For extra peace of mind, you can also add{" "}
        <span className="font-semibold">
          Signature on Delivery for just {signatureFee}
        </span>
        . This means the receiver will need to sign when the parcel is
        delivered, giving you extra confirmation that it has arrived safely.
      </span>
      <span className="block">Would you like to add it? 😊</span>
    </span>
  );
}

function AiRecommendUnder100Message({
  sizeId,
  valueDollars,
  suburb,
  rec,
}: {
  sizeId: AiSizeId;
  valueDollars: number;
  suburb: string;
  rec: AiRecommendation;
}) {
  const destination = suburb.trim() || "your receiver";
  const size =
    AI_SIZE_OPTIONS.find((option) => option.id === sizeId)?.label ?? "parcel";
  const sizePhrase = `${size.toLowerCase()}-sized`;
  const serviceName = aiDeliveryServiceNameForMessage(sizeId, valueDollars);
  const quoteRec = { ...rec, signature: false };
  const totalStr = formatAiMoney(buildAiSuggestedTotal(valueDollars, quoteRec));
  const valueStr = formatDeclaredParcelValue(valueDollars);

  return (
    <span className="block space-y-3">
      <span className="block">
        Sending your {sizePhrase} parcel to {destination} with {serviceName}{" "}
        will cost <span className="font-semibold">{totalStr}</span> (based on
        your {valueStr} parcel value).
      </span>
      <span className="block">
        Good news! 🎉 Parcel Protection is already included at no extra cost.
      </span>
      <AiRecommendSignatureUpsellMessage />
    </span>
  );
}

function AiRecommendOver100Message({
  sizeId,
  valueDollars,
  suburb,
  rec,
}: {
  sizeId: AiSizeId;
  valueDollars: number;
  suburb: string;
  rec: AiRecommendation;
}) {
  const destination = suburb.trim() || "your receiver";
  const size =
    AI_SIZE_OPTIONS.find((option) => option.id === sizeId)?.label ?? "parcel";
  const sizePhrase = `${size.toLowerCase()}-sized`;
  const serviceName = aiDeliveryServiceNameForMessage(sizeId, valueDollars);
  const quoteRec = { ...rec, parcelProtection: false };
  const totalStr = formatAiMoney(buildAiSuggestedTotal(valueDollars, quoteRec));

  return (
    <span className="block space-y-3">
      <span className="block">
        Sending your {sizePhrase} parcel to {destination} with {serviceName}{" "}
        will cost <span className="font-semibold">{totalStr}</span>.
      </span>
      <span className="block">
        Just a little heads-up! 😊 Since your parcel is valued at over $100,
        we&apos;d recommend adding Parcel Protection to give you extra peace of
        mind.
      </span>
      <span className="block">Would you like to add it? 😊</span>
    </span>
  );
}

function aiDeliveryServiceNameForMessage(
  sizeId: AiSizeId,
  valueDollars: number,
): string {
  const lightParcel =
    (sizeId === "satchel" || sizeId === "shoebox") && valueDollars <= 100;
  return lightParcel ? "Quick Delivery" : "Door delivery";
}

function recommendBotContent(
  sizeId: AiSizeId,
  valueDollars: number,
  suburb: string,
  rec: AiRecommendation,
): ReactNode {
  if (valueDollars <= 100) {
    return (
      <AiRecommendUnder100Message
        sizeId={sizeId}
        valueDollars={valueDollars}
        suburb={suburb}
        rec={rec}
      />
    );
  }
  return (
    <AiRecommendOver100Message
      sizeId={sizeId}
      valueDollars={valueDollars}
      suburb={suburb}
      rec={rec}
    />
  );
}

function intakeLine(
  sizeId: AiSizeId,
  value: number,
  suburb: string,
  contents?: string,
) {
  const label = AI_SIZE_OPTIONS.find((s) => s.id === sizeId)?.label ?? "Parcel";
  const valuePart = `$${value.toLocaleString()}`;
  const route = `from West End to ${suburb}`;
  if (contents?.trim()) {
    return `${label}, ${contents.trim()}, ${valuePart} ${route}`;
  }
  return `${label}, ${valuePart} ${route}`;
}

function SummaryEditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConfirmPartyDetailRow({
  label,
  value,
  onEdit,
  editLabel,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  editLabel?: string;
}) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="shrink-0 text-[14px] text-neutral-500">{label}</span>
      <span className="min-w-0 flex-1 text-right text-[14px] leading-snug text-[#0B1B32]">
        {trimmed}
      </span>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          aria-label={editLabel ?? `Edit ${label.replace(/:$/, "")}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-600"
        >
          <SummaryEditIcon />
        </button>
      ) : null}
    </div>
  );
}

function ConfirmPartyBlock({
  heading,
  rows,
}: {
  heading: string;
  rows: { label: string; value: string }[];
}) {
  const visible = rows.some((row) => row.value.trim());
  if (!visible) return null;
  return (
    <section className="mt-3 first:mt-2">
      <span className="text-[13px] font-bold uppercase tracking-wide text-neutral-500">
        {heading}
      </span>
      <div className="mt-1.5">
        {rows.map((row) => (
          <ConfirmPartyDetailRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </section>
  );
}

function ReviewBookingDetailsContent({
  summary,
  onEditFrom,
  onEditTo,
  onEditParcel,
  onEditDelivery,
}: {
  summary: AiBookingSummaryLines;
  onEditFrom?: () => void;
  onEditTo?: () => void;
  onEditParcel?: () => void;
  onEditDelivery?: () => void;
}) {
  return (
    <div className="mt-1">
      <ConfirmPartyDetailRow
        label="From:"
        value={summary.fromLine}
        onEdit={onEditFrom}
        editLabel="Edit sender"
      />
      <ConfirmPartyDetailRow
        label="To:"
        value={summary.toLine}
        onEdit={onEditTo}
        editLabel="Edit receiver"
      />
      <ConfirmPartyDetailRow
        label="Parcel:"
        value={summary.parcelLine}
        onEdit={onEditParcel}
        editLabel="Edit parcel"
      />
      <ConfirmPartyDetailRow
        label="Delivery:"
        value={summary.deliveryLine}
        onEdit={onEditDelivery}
        editLabel="Edit delivery options"
      />
    </div>
  );
}

function ConfirmPartiesContent({
  senderLine,
  receiverLine,
  receiverDraft,
}: {
  senderLine: string;
  receiverLine: string;
  receiverDraft?: ReceiverContactDraft;
}) {
  const sender = senderDraftFromLine(senderLine);
  const receiver = receiverDraft ?? contactDraftFromLine(receiverLine);
  const senderName = [sender.firstName, sender.lastName].filter(Boolean).join(" ");
  const receiverName = [receiver.firstName, receiver.lastName].filter(Boolean).join(" ");

  return (
    <div className="mt-2">
      <ConfirmPartyBlock
        heading="From"
        rows={[
          { label: "Name:", value: senderName },
          { label: "Email:", value: sender.email },
          { label: "Mobile:", value: formatAuMobileLabel(sender.mobile) || sender.mobile },
          ...(sender.businessName.trim()
            ? [{ label: "Business:", value: sender.businessName }]
            : []),
        ]}
      />
      <ConfirmPartyBlock
        heading="To"
        rows={[
          { label: "Name:", value: receiverName },
          { label: "Mobile:", value: formatAuMobileLabel(receiver.mobile) || receiver.mobile },
          { label: "Email:", value: receiver.email },
          { label: "Address:", value: receiver.address },
          ...(receiver.businessName.trim()
            ? [{ label: "Business:", value: receiver.businessName }]
            : []),
        ]}
      />
    </div>
  );
}

interface Props {
  onExit: () => void;
  initialDemo?: AiBookingDemo | null;
  initialComposerPrefill?: string | null;
}

export function AiAssistedBookingFlow({
  onExit,
  initialDemo = null,
  initialComposerPrefill = null,
}: Props) {
  const demoLine = useMemo(() => {
    if (!initialDemo) return null;
    const demo = demoPreset(initialDemo);
    return intakeLine(
      demo.sizeId,
      Number(demo.value),
      demo.suburb,
      demo.contents,
    );
  }, [initialDemo]);

  const [phase, setPhase] = useState<Phase>("intake");
  const [stackDepth, setStackDepth] = useState(0);
  const [thread, setThread] = useState<AiMessage[]>([]);
  const [composer, setComposer] = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const threadBooted = useRef(false);
  const reviewSummaryCardIdRef = useRef<string | null>(null);
  const threadMessageSeq = useRef(0);
  const nextThreadMessageId = (prefix: string) => {
    threadMessageSeq.current += 1;
    return `${prefix}-${threadMessageSeq.current}`;
  };
  const [intakeDraft, setIntakeDraft] = useState<{
    sizeId: AiSizeId | null;
    valueText: string;
    suburb: string;
  }>({ sizeId: null, valueText: "", suburb: "" });

  const [lastTypedBotId, setLastTypedBotId] = useState<string | null>(null);

  const [sizeId, setSizeId] = useState<AiSizeId | null>(null);
  const [valueNum, setValueNum] = useState(0);
  const [suburb, setSuburb] = useState("");

  const [authorityToLeave, setAuthorityToLeave] = useState(true);
  const [parcelProtection, setParcelProtection] = useState(true);
  const [signature, setSignature] = useState(false);

  const [senderLine, setSenderLine] = useState("");
  const [receiverLine, setReceiverLine] = useState("");
  const [senderDraft, setSenderDraft] = useState<SenderContactDraft>(
    EMPTY_SENDER_CONTACT_DRAFT,
  );
  const [receiverDraft, setReceiverDraft] = useState<ReceiverContactDraft>(
    EMPTY_RECEIVER_CONTACT_DRAFT,
  );
  const [packaging, setPackaging] = useState<"yes" | "no" | null>(null);
  const [notifyReceiver, setNotifyReceiver] = useState<boolean | null>(null);
  const [intakeUserLine, setIntakeUserLine] = useState("");
  const [termsDeclined, setTermsDeclined] = useState(false);
  const [dangerousContains, setDangerousContains] = useState(false);
  const [noDangerousHighlight, setNoDangerousHighlight] = useState(false);
  const [payment, setPayment] = useState<"online" | "instore" | null>(null);
  const [demoSent, setDemoSent] = useState(false);
  const [reviewShowsPricing, setReviewShowsPricing] = useState(false);
  const [reviewEditTarget, setReviewEditTarget] =
    useState<ReviewEditTarget>(null);
  const [intakePendingQuote, setIntakePendingQuote] = useState<{
    sizeId: AiSizeId;
    value: number;
    suburb: string;
    userLine: string;
    kind: "packaging" | "cost" | "valueHelp";
  } | null>(null);
  const [recommendAddonsPending, setRecommendAddonsPending] = useState(false);
  const [recommendPromptStep, setRecommendPromptStep] = useState<
    "protection" | "signature" | null
  >(null);
  const [startOverConfirmOpen, setStartOverConfirmOpen] = useState(false);
  const [confirmPartiesEditStep, setConfirmPartiesEditStep] =
    useState<ConfirmPartiesEditStep>(null);
  const [confirmPartiesEditResume, setConfirmPartiesEditResume] = useState<
    null | "sender" | "receiver" | "parcel" | "delivery" | "notifications"
  >(null);

  const recommendation = useMemo(
    () => buildAiRecommendation(sizeId, valueNum, suburb),
    [sizeId, valueNum, suburb],
  );

  const receiverFirstName = useMemo(
    () => contactDisplayFirstName(receiverLine),
    [receiverLine],
  );

  const protectionIncluded =
    recommendation.protectionIncluded && parcelProtection && valueNum <= 100;

  const priceSummary = useMemo(
    () =>
      buildAiPriceSummary({
        valueDollars: valueNum,
        parcelProtection,
        protectionIncluded,
        signature,
        packagingYes: packaging === "yes",
      }),
    [
      valueNum,
      parcelProtection,
      protectionIncluded,
      signature,
      packaging,
    ],
  );

  const total = priceSummary.total;

  const bookingSummary = useMemo((): AiBookingSummaryLines => {
    const sender = senderDraftFromLine(senderLine);
    const receiver = parseContactLine(receiverLine);
    const senderName = [sender.firstName, sender.lastName].filter(Boolean).join(" ");
    const senderMobile =
      formatAuMobileLabel(sender.mobile) || sender.mobile.trim();
    const fromParts = [senderName, senderMobile, sender.businessName.trim()].filter(
      Boolean,
    );
    const fromLine =
      fromParts.length > 0 ? fromParts.join(" · ") : senderLine || "—";
    const recvName = [receiver.firstName, receiver.lastName].filter(Boolean).join(" ");
    const displayName = recvName || contactDisplayFirstName(receiverLine);
    const destination = deliveryDestinationLabel(receiverLine, suburb);
    const toLine = `${displayName} · door, ${destination}`;
    const parcelSizeLabel =
      AI_SIZE_OPTIONS.find((s) => s.id === sizeId)?.label ?? "Parcel";
    const parcelLine =
      intakeUserLine.trim() ||
      `${parcelSizeLabel} · $${valueNum.toLocaleString()} to ${suburb}`;
    const deliveryParts = ["Door"];
    if (signature) deliveryParts.push("signature on delivery");
    else if (authorityToLeave) deliveryParts.push("authority to leave");
    if (notifyReceiver) deliveryParts.push("receiver updates on");
    const deliveryLine = `${deliveryParts.join(" · ")} · ${destination}`;
    return {
      fromLine,
      toLine,
      parcelLine,
      deliveryLine,
      priceLines: priceSummary.lines,
      total: formatAiMoney(total),
    };
  }, [
    senderLine,
    receiverLine,
    suburb,
    intakeUserLine,
    sizeId,
    valueNum,
    signature,
    authorityToLeave,
    notifyReceiver,
    priceSummary.lines,
    total,
  ]);

  const headerStep: ChatFlowStep =
    phase === "review" ||
    phase === "confirmTerms" ||
    phase === "confirmDangerous" ||
    phase === "confirmMarketing" ||
    phase === "payment" ||
    phase === "booked"
      ? "Pay"
      : "Parcel";

  const lastAnchorMessageIndex = (anchor: Phase) => {
    for (let i = thread.length - 1; i >= 0; i -= 1) {
      if (thread[i].anchor === anchor) return i;
    }
    return -1;
  };

  const isLiveWidgetTurn = (anchor: Phase, messageIndex: number) =>
    phase === anchor &&
    messageIndex === lastAnchorMessageIndex(anchor);

  const pushUser = (
    content: string,
    editableContact?: EditableContact,
    kind?: AiMessage["kind"],
  ) => {
    setThread((current) => [
      ...current,
      {
        id: nextThreadMessageId(
          `ai-user-${editableContact ?? "msg"}`,
        ),
        role: "user",
        content,
        editableContact,
        kind,
      },
    ]);
  };

  const sizeLabel =
    AI_SIZE_OPTIONS.find((s) => s.id === sizeId)?.label ?? "Parcel";

  const photoBotMessage = () =>
    `${sizeLabel} it is. Want to add a photo of the parcel? It's optional, but it helps the PARCELPOINT match it at drop-off and supports any Parcel Protection claim.`;

  const notifyBotMessage = () => {
    const name = receiverFirstName;
    if (signature) {
      return `Done — ${name} will sign when it arrives. Shall I let ${name} know it's coming?`;
    }
    return `Shall I let ${name} know it's coming?`;
  };

  const goToNotifyPrompt = () => {
    if (notifyReceiver !== null) {
      goToReviewPrompt();
      return;
    }
    pushBot(notifyBotMessage(), "notify");
    goToPhase("notify");
    setComposer("");
  };

  const goToReviewPrompt = () => {
    setReviewShowsPricing(false);
    setReviewEditTarget(null);
    pushBot(
      "Here's a quick summary of your parcel! 😊 You can tap any detail to make changes, or just let me know what you'd like to update.",
      "review",
    );
    const summaryCardId = nextThreadMessageId("ai-bot-review-summary");
    reviewSummaryCardIdRef.current = summaryCardId;
    pushBot(
      <ReviewBookingDetailsContent
        summary={bookingSummary}
        onEditFrom={editSummaryFrom}
        onEditTo={editSummaryTo}
        onEditParcel={editSummaryParcel}
        onEditDelivery={editSummaryDelivery}
      />,
      "review",
      true,
      { id: summaryCardId },
    );
    pushBot(
      "When you're happy with the details, say Show price summary to see pricing.",
      "review",
    );
    goToPhase("review");
    setComposer("");
  };

  const confirmedDetails = useMemo(() => {
    if (!payment) return null;
    const sender = parseContactLine(senderLine);
    const parcelSizeLabel =
      AI_SIZE_OPTIONS.find((s) => s.id === sizeId)?.label ?? "Parcel";
    return buildAiBookingConfirmedDetails({
      total,
      paymentMethod: payment === "online" ? "card" : "store",
      receiverName: receiverFirstName,
      suburb,
      sizeLabel: parcelSizeLabel,
      senderEmail: sender.email,
      intakeLine: intakeUserLine,
    });
  }, [
    payment,
    total,
    senderLine,
    sizeId,
    suburb,
    receiverFirstName,
    intakeUserLine,
  ]);

  const finalizeBooking = (method: "online" | "instore") => {
    setPayment(method);
    goToPhase("booked");
    setComposer("");
  };

  const beginPayConfirmations = () => {
    pushBot(
      "Before you pay, a few quick confirmations. First — do you agree to our terms?",
      "confirmTerms",
    );
    goToPhase("confirmTerms");
    setComposer("");
  };

  const completeReviewStep = () => {
    pushUser("Continue to payment");
    beginPayConfirmations();
  };

  const agreeToTerms = () => {
    setTermsDeclined(false);
    pushUser("✓ I agree");
    pushBot(
      "Thanks! Next — can you confirm there's nothing dangerous inside?",
      "confirmDangerous",
    );
    goToPhase("confirmDangerous");
    setComposer("");
  };

  const declineToTerms = () => {
    setTermsDeclined(true);
    pushUser("I don't agree");
    pushBot(
      "No problem — but I can't complete the booking without your agreement to the Terms & Conditions and Privacy Policy.",
      "confirmTerms",
    );
    setComposer("");
  };

  const confirmNoDangerous = () => {
    setDangerousContains(false);
    pushUser("✓ I confirm");
    pushBot(
      "Last one, and it's optional — would you like marketing and promotional updates from PARCELPOINT?",
      "confirmMarketing",
    );
    goToPhase("confirmMarketing");
    setComposer("");
  };

  const reportDangerousGoods = () => {
    setDangerousContains(true);
    pushUser("It does contain some");
    pushBot(
      "We can't send dangerous or prohibited goods through PARCELPOINT — tap back to change what's in the parcel, or tell me what you're sending.",
      "confirmDangerous",
    );
    setComposer("");
  };

  const goToPaymentPrompt = () => {
    const totalLabel = formatAiMoney(total);
    pushBot(
      <>
        <span className="block text-sm text-neutral-500">Total to pay</span>
        <span className="mt-0.5 block text-[1.75rem] font-bold leading-tight text-[#0B1B32]">
          {totalLabel}
        </span>
        <span className="mt-3 block whitespace-pre-line">
          How would you like to pay?
        </span>
      </>,
      "payment",
      true,
    );
    goToPhase("payment");
    setComposer("");
  };

  const completeMarketing = (yes: boolean) => {
    pushUser(yes ? "Yes please" : "No thanks");
    goToPaymentPrompt();
  };

  const completeNotifyStep = (notify: boolean, userLine?: string) => {
    setNotifyReceiver(notify);
    const line = userLine?.trim() || (notify ? "Yes" : "No");
    pushUser(line);
    goToReviewPrompt();
  };

  const prefillReviewEdit = (
    target: Exclude<ReviewEditTarget, null>,
    text: string,
  ) => {
    setReviewEditTarget(target);
    setComposer(text);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  };

  const editSummaryFrom = () => {
    const line =
      senderLine.trim() || buildSenderContactLine(senderDraft);
    prefillReviewEdit("from", line.trim() ? line : bookingSummary.fromLine);
  };

  const editSummaryTo = () => {
    const line =
      receiverLine.trim() || buildReceiverContactLine(receiverDraft);
    prefillReviewEdit("to", line.trim() ? line : bookingSummary.toLine);
  };

  const editSummaryParcel = () => {
    const line =
      (sizeId &&
        valueNum > 0 &&
        suburb.trim() &&
        buildIntakeComposerLine({
          sizeId,
          valueText: String(valueNum),
          suburb,
        })) ||
      intakeUserLine.trim() ||
      (sizeId && valueNum > 0 && suburb.trim()
        ? intakeLine(sizeId, valueNum, suburb)
        : bookingSummary.parcelLine);
    prefillReviewEdit("parcel", line);
  };

  const editSummaryDelivery = () => {
    prefillReviewEdit("delivery", bookingSummary.deliveryLine);
  };

  const reviewSummaryCardContent = () => (
    <ReviewBookingDetailsContent
      summary={bookingSummary}
      onEditFrom={editSummaryFrom}
      onEditTo={editSummaryTo}
      onEditParcel={editSummaryParcel}
      onEditDelivery={editSummaryDelivery}
    />
  );

  const syncReviewSummaryCardInThread = () => {
    setThread((current) => {
      let targetId = reviewSummaryCardIdRef.current;
      if (!targetId) {
        for (let i = current.length - 1; i >= 0; i -= 1) {
          const message = current[i];
          if (
            message.role === "bot" &&
            message.anchor === "review" &&
            message.bordered
          ) {
            targetId = message.id;
            reviewSummaryCardIdRef.current = message.id;
            break;
          }
        }
      }
      if (!targetId) return current;
      const content = reviewSummaryCardContent();
      return current.map((message) =>
        message.id === targetId ? { ...message, content } : message,
      );
    });
  };

  const applyReviewEditFromComposer = (text: string) => {
    const target = reviewEditTarget;
    if (!target) return false;

    if (target === "from") {
      const base =
        senderLine.trim().length > 0
          ? senderDraftFromLine(senderLine)
          : senderDraft;
      const draft = mergeSenderDraftWithLine(base, text);
      if (!isSenderContactComplete(draft)) {
        setSenderDraft(draft);
        if (text.trim()) pushUser(text);
        pushBot(
          buildContactDetailsFollowUpPrompt(
            "sender",
            senderContactMissingLabels(draft),
          ),
          "review",
        );
        setComposer("");
        return true;
      }
      const line = buildSenderContactLine(draft);
      setSenderLine(line);
      setSenderDraft(draft);
    } else if (target === "to") {
      const base =
        receiverLine.trim().length > 0
          ? {
              ...contactDraftFromLine(receiverLine),
              businessName: receiverDraft.businessName,
            }
          : receiverDraft;
      const draft = mergeReceiverDraftWithLine(base, text);
      if (!isReceiverContactComplete(draft)) {
        setReceiverDraft(draft);
        if (text.trim()) pushUser(text);
        pushBot(
          buildContactDetailsFollowUpPrompt(
            "receiver",
            receiverContactMissingLabels(draft),
          ),
          "review",
        );
        setComposer("");
        return true;
      }
      const line = buildReceiverContactLine(draft);
      setReceiverLine(line);
      setReceiverDraft(draft);
    } else if (target === "parcel") {
      const parsed = parseIntakeMessage(text);
      if (parsed) {
        applyParcelFields(parsed);
        setIntakeUserLine(text);
      } else {
        const fields = mergeIntakeDraftFields(
          {
            sizeId,
            valueText: valueNum > 0 ? String(valueNum) : intakeDraft.valueText,
            suburb: suburb || intakeDraft.suburb,
          },
          text,
        );
        setIntakeDraft(fields);
        const value = Number(fields.valueText.replace(/[^\d.]/g, ""));
        const dest = fields.suburb.trim();
        if (!fields.sizeId || value <= 0 || dest.length < 2) {
          if (text.trim()) pushUser(text);
          pushBot(
            buildIntakeFollowUpPrompt(intakeDraftMissingLabels(fields)),
            "review",
          );
          setComposer(buildIntakeComposerLine(fields));
          return true;
        }
        applyParcelFields({
          sizeId: fields.sizeId,
          value,
          suburb: dest,
        });
        setIntakeUserLine(text);
      }
    } else if (target === "delivery") {
      pushUser(text);
      setReviewEditTarget(null);
      setComposer("");
      const idx = thread.findIndex((m) => m.anchor === "recommend");
      if (idx >= 0) {
        setThread((current) => current.slice(0, idx + 1));
        setRecommendAddonsPending(true);
        setRecommendPromptStep(valueNum > 100 ? "protection" : "signature");
        setStackDepth(phaseIndex("recommend"));
        setPhase("recommend");
      }
      return true;
    }

    if (text.trim()) pushUser(text);
    setReviewEditTarget(null);
    setComposer("");
    return true;
  };

  const beginConfirmPartiesEdit = () => {
    pushUser(CONFIRM_PARTIES_CHANGE_CHIP);
    pushBot(CONFIRM_PARTIES_EDIT_PROMPT, "confirmParties");
    setConfirmPartiesEditStep("choose");
    setComposer("");
  };

  const applySenderUpdateFromConfirm = (text: string) => {
    const draft = mergeSenderDraftWithLine(senderDraft, text);
    setSenderDraft(draft);

    if (!hasSenderContactProgress(draft)) {
      if (text.trim()) pushUser(text);
      pushBot(buildContactDetailsEmptyPrompt("sender"), "confirmParties");
      setComposer("");
      return;
    }

    if (!isSenderContactComplete(draft)) {
      if (text.trim()) pushUser(text);
      pushBot(
        buildContactDetailsFollowUpPrompt(
          "sender",
          senderContactMissingLabels(draft),
        ),
        "confirmParties",
      );
      setComposer("");
      return;
    }

    const line = buildSenderContactLine(draft);
    if (text.trim()) pushUser(text);
    setSenderLine(line);
    setConfirmPartiesEditStep(null);
    resumeConfirmPartiesAfterEdit();
    setComposer("");
  };

  const applyReceiverUpdateFromConfirm = (text: string) => {
    const draft = mergeReceiverDraftWithLine(receiverDraft, text);
    setReceiverDraft(draft);

    if (!hasReceiverContactProgress(draft)) {
      if (text.trim()) pushUser(text);
      pushBot(buildContactDetailsEmptyPrompt("receiver"), "confirmParties");
      setComposer("");
      return;
    }

    if (!isReceiverContactComplete(draft)) {
      if (text.trim()) pushUser(text);
      pushBot(
        buildContactDetailsFollowUpPrompt(
          "receiver",
          receiverContactMissingLabels(draft),
        ),
        "confirmParties",
      );
      setComposer("");
      return;
    }

    const line = buildReceiverContactLine(draft);
    if (text.trim()) pushUser(text);
    setReceiverLine(line);
    setConfirmPartiesEditStep(null);
    resumeConfirmPartiesAfterEdit({ line, draft });
    setComposer("");
  };

  const resumeConfirmPartiesAfterEdit = (receiverOverride?: {
    line: string;
    draft: ReceiverContactDraft;
  }) => {
    const line = receiverOverride?.line ?? receiverLine;
    const draft =
      receiverOverride?.draft ??
      (line.trim()
        ? {
            ...contactDraftFromLine(line),
            businessName: receiverDraft.businessName,
          }
        : receiverDraft);
    const optIn = notifyReceiver;
    showConfirmParties(line, draft, optIn === null ? undefined : optIn, {
      updated: true,
    });
  };

  const answerConfirmPartiesEditTarget = (answer: string) => {
    const t = answer.trim().toLowerCase();
    pushUser(answer);

    if (
      /^sender\b|sender details|my details|who.?s sending|^from\b/i.test(t)
    ) {
      setConfirmPartiesEditStep("sender");
      setSenderDraft(senderDraftFromLine(senderLine));
      pushBot(CONFIRM_PARTIES_EDIT_SENDER_PROMPT, "confirmParties");
      setComposer("");
      return;
    }
    if (
      /^receiver\b|receiver details|who.?s receiving|recipient|^to\b/i.test(t)
    ) {
      setConfirmPartiesEditStep("receiver");
      setReceiverDraft({
        ...contactDraftFromLine(receiverLine),
        businessName: receiverDraft.businessName,
      });
      pushBot(CONFIRM_PARTIES_EDIT_RECEIVER_PROMPT, "confirmParties");
      setComposer("");
      return;
    }

    pushBot(
      "I can only update sender or receiver details here. Type sender or receiver to continue. 😊",
      "confirmParties",
    );
    setComposer("");
  };

  const completePhotoStep = (added: boolean) => {
    if (added) {
      pushUser("Parcel photo", undefined, "parcel-photo");
    } else {
      pushUser(PARCEL_PHOTO_SKIP_USER);
    }
    goToNotifyPrompt();
  };

  const startEditContact = (
    messageId: string,
    kind: EditableContact,
    text: string,
  ) => {
    setThread((current) => {
      const idx = current.findIndex((m) => m.id === messageId);
      if (idx < 0) return current;
      return current.slice(0, idx);
    });
    setComposer(text);
    if (kind === "sender") {
      setSenderLine("");
      setReceiverLine("");
      setSenderDraft(senderDraftFromLine(text));
      setReceiverDraft(EMPTY_RECEIVER_CONTACT_DRAFT);
    } else {
      setReceiverLine("");
      setReceiverDraft(contactDraftFromLine(text));
    }
    const nextPhase: Phase = kind === "sender" ? "sender" : "receiver";
    setStackDepth(phaseIndex(nextPhase));
    setPhase(nextPhase);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  };

  const requestStartOver = () => {
    setStartOverConfirmOpen(true);
  };

  const performBookingStartOver = () => {
    setStartOverConfirmOpen(false);
    setRecommendAddonsPending(false);
    setRecommendPromptStep(null);
    setIntakePendingQuote(null);
    setSizeId(null);
    setValueNum(0);
    setSuburb("");
    setIntakeDraft({ sizeId: null, valueText: "", suburb: "" });
    setAuthorityToLeave(true);
    setParcelProtection(true);
    setSignature(false);
    setSenderLine("");
    setReceiverLine("");
    setSenderDraft(EMPTY_SENDER_CONTACT_DRAFT);
    setReceiverDraft(EMPTY_RECEIVER_CONTACT_DRAFT);
    setPackaging(null);
    setNotifyReceiver(null);
    setIntakeUserLine("");
    setTermsDeclined(false);
    setDangerousContains(false);
    setNoDangerousHighlight(false);
    setPayment(null);
    setReviewShowsPricing(false);
    setReviewEditTarget(null);
    reviewSummaryCardIdRef.current = null;
    setDemoSent(false);
    setConfirmPartiesEditStep(null);
    setConfirmPartiesEditResume(null);
    setStackDepth(phaseIndex("intake"));
    setPhase("intake");
    const userId = nextThreadMessageId("ai-user-msg");
    const botId = nextThreadMessageId("ai-bot-intake");
    setThread([
      { id: userId, role: "user", content: "Yes, start over" },
      {
        id: botId,
        role: "bot",
        content: INTAKE_OPENING_MESSAGE,
        anchor: "intake",
      },
    ]);
    setLastTypedBotId(botId);
    setComposer("");
  };

  const pushBot = (
    content: ReactNode,
    anchor: Phase,
    bordered?: boolean,
    options?: { id?: string },
  ) => {
    const id = options?.id ?? nextThreadMessageId(`ai-bot-${anchor}`);
    setThread((current) => [
      ...current,
      { id, role: "bot", content, anchor, bordered },
    ]);
    setLastTypedBotId(id);
  };

  const goToPhase = (next: Phase) => {
    const nextDepth = phaseIndex(next);
    setStackDepth((depth) => Math.max(depth, nextDepth));
    setPhase(next);
  };

  const showPhase = (step: Phase) => phaseIndex(step) <= stackDepth;

  const isActive = (step: Phase) => phase === step;

  const mergeIntakeDraftFromComposer = (text: string) => {
    setIntakeDraft(parseIntakeDraftFields(text));
  };

  const patchIntakeDraft = (patch: Partial<typeof intakeDraft>) => {
    setIntakeDraft((prev) => {
      const next = { ...prev, ...patch };
      setComposer(buildIntakeComposerLine(next));
      return next;
    });
  };

  const patchSenderDraft = (patch: Partial<SenderContactDraft>) => {
    setSenderDraft((prev) => ({ ...prev, ...patch }));
  };

  const patchReceiverDraft = (patch: Partial<ReceiverContactDraft>) => {
    setReceiverDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleComposerChange = (value: string) => {
    setComposer(value);
    if (phase === "intake") {
      mergeIntakeDraftFromComposer(value);
    }
  };

  const fillDraft = (text: string) => {
    setComposer(text);
    if (phase === "intake") {
      mergeIntakeDraftFromComposer(text);
    }
    const method = parsePayment(text);
    if (method) setPayment(method);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  };

  const intakeValueFromDraft = (
    parsed: { sizeId: AiSizeId; value: number; suburb: string },
  ) => {
    const draftValue = Number(intakeDraft.valueText.replace(/[^\d.]/g, ""));
    const dest = intakeDraft.suburb.trim();
    if (
      draftValue > 0 &&
      intakeDraft.sizeId === parsed.sizeId &&
      dest.length >= 2 &&
      dest.toLowerCase() === parsed.suburb.trim().toLowerCase()
    ) {
      return draftValue;
    }
    return parsed.value;
  };

  const applyParcelFields = (intake: {
    sizeId: AiSizeId;
    value: number;
    suburb: string;
  }) => {
    setSizeId(intake.sizeId);
    setValueNum(intake.value);
    setSuburb(intake.suburb);
    const rec = buildAiRecommendation(intake.sizeId, intake.value, intake.suburb);
    setAuthorityToLeave(rec.authorityToLeave);
    if (intake.value > 100) {
      setParcelProtection(false);
      setSignature(rec.signature);
    } else {
      setParcelProtection(rec.parcelProtection);
      setSignature(false);
    }
  };

  const deliverIntakeQuote = (parsed: {
    sizeId: AiSizeId;
    value: number;
    suburb: string;
  }) => {
    const value = intakeValueFromDraft(parsed);
    const intake = { ...parsed, value };
    applyParcelFields(intake);
    const rec = buildAiRecommendation(intake.sizeId, intake.value, intake.suburb);
    pushBot(
      recommendBotContent(intake.sizeId, intake.value, intake.suburb, rec),
      "recommend",
    );
    setRecommendAddonsPending(true);
    setRecommendPromptStep(intake.value > 100 ? "protection" : "signature");
    goToPhase("recommend");
    setComposer("");
  };

  const applyParcelEditFromConfirm = (
    parsed: { sizeId: AiSizeId; value: number; suburb: string },
    userLine: string,
  ) => {
    const value = intakeValueFromDraft(parsed);
    const intake = { ...parsed, value };
    setIntakeUserLine(userLine);
    pushUser(userLine);
    applyParcelFields(intake);
    resumeConfirmPartiesAfterEdit();
  };

  const applyIntake = (
    parsed: {
      sizeId: AiSizeId;
      value: number;
      suburb: string;
    },
    userLine: string,
    options?: { botBeforeQuote?: string },
  ) => {
    setIntakeUserLine(userLine);
    pushUser(userLine);
    if (options?.botBeforeQuote) {
      pushBot(options.botBeforeQuote, "recommend");
    }
    deliverIntakeQuote(parsed);
  };

  const continueAfterIntakePreview = (pending: NonNullable<typeof intakePendingQuote>) => {
    const parsed = {
      sizeId: pending.sizeId,
      value: pending.value,
      suburb: pending.suburb,
    };
    setSizeId(parsed.sizeId);
    setValueNum(parsed.value);
    setSuburb(parsed.suburb);
    const rec = buildAiRecommendation(parsed.sizeId, parsed.value, parsed.suburb);
    setAuthorityToLeave(rec.authorityToLeave);
    if (parsed.value > 100) {
      setParcelProtection(false);
      setSignature(rec.signature);
    } else {
      setParcelProtection(rec.parcelProtection);
      setSignature(false);
    }

    if (pending.kind === "cost" || pending.kind === "valueHelp") {
      pushBot(
        recommendBotContent(parsed.sizeId, parsed.value, parsed.suburb, rec),
        "recommend",
      );
      setRecommendAddonsPending(true);
      setRecommendPromptStep(parsed.value > 100 ? "protection" : "signature");
    } else {
      deliverIntakeQuote(parsed);
      return;
    }
    goToPhase("recommend");
    setComposer("");
  };

  const advanceFromRecommendChoices = () => {
    setRecommendAddonsPending(false);
    setRecommendPromptStep(null);
    setSenderDraft(EMPTY_SENDER_CONTACT_DRAFT);
    setReceiverDraft(EMPTY_RECEIVER_CONTACT_DRAFT);
    pushBot(SENDER_STEP_INTRO, "sender");
    goToPhase("sender");
    setComposer("");
  };

  const answerRecommendProtectionPrompt = (text: string) => {
    const t = text.trim();

    const finishSignatureChoice = (wantSignature: boolean) => {
      if (wantSignature) {
        setSignature(true);
        setAuthorityToLeave(false);
      } else {
        setSignature(false);
        setAuthorityToLeave(recommendation.authorityToLeave);
      }
      if (valueNum <= 100) {
        setParcelProtection(recommendation.parcelProtection);
      }
      setRecommendAddonsPending(false);
      setRecommendPromptStep(null);
      if (confirmPartiesEditResume === "delivery") {
        resumeConfirmPartiesAfterEdit();
        setComposer("");
        return;
      }
      setSenderDraft(EMPTY_SENDER_CONTACT_DRAFT);
      setReceiverDraft(EMPTY_RECEIVER_CONTACT_DRAFT);
      pushBot(
        wantSignature
          ? SIGNATURE_ADDED_CONFIRMATION
          : SIGNATURE_DECLINED_CONFIRMATION,
        "sender",
      );
      goToPhase("sender");
      setComposer("");
    };

    if (valueNum > 100 && recommendPromptStep === "protection") {
      if (/^yes\s*please\b/i.test(t) || /^yes\b/i.test(t)) {
        pushUser(t);
        setParcelProtection(true);
        setSignature(false);
        setRecommendPromptStep("signature");
        pushBot(<AiRecommendAfterProtectionYesMessage />, "recommend");
        setComposer("");
        return true;
      }
      if (/^no\s*thanks\b/i.test(t)) {
        pushUser(t);
        setParcelProtection(false);
        setSignature(false);
        setAuthorityToLeave(recommendation.authorityToLeave);
        setRecommendPromptStep("signature");
        pushBot(<AiRecommendHighValueNoProtectionSignatureMessage />, "recommend");
        setComposer("");
        return true;
      }
      return false;
    }

    if (/^yes\s*please\b/i.test(t) || /^yes\b/i.test(t)) {
      pushUser(t);
      finishSignatureChoice(true);
      return true;
    }
    if (/^no\s*thanks\b/i.test(t)) {
      pushUser(t);
      finishSignatureChoice(false);
      return true;
    }
    return false;
  };

  const confirmIntakePendingQuote = (answer: string) => {
    if (!intakePendingQuote) return;
    if (isAffirmative(answer) || isProceedBooking(answer)) {
      pushUser(answer);
      setIntakeUserLine(intakePendingQuote.userLine);

      if (intakePendingQuote.kind === "valueHelp") {
        const draft = getCompleteIntakeDraft();
        if (!draft) {
          pushBot(
            "Add size, declared value and delivering to in the form — then send or tap How much does it cost?",
            "intake",
          );
          setIntakePendingQuote(null);
          setComposer("");
          return;
        }
        continueAfterIntakePreview({
          ...intakePendingQuote,
          sizeId: draft.sizeId,
          value: draft.value,
          suburb: draft.suburb,
          kind: "valueHelp",
        });
      } else {
        continueAfterIntakePreview(intakePendingQuote);
      }

      setIntakePendingQuote(null);
      setComposer("");
      return;
    }
    if (/^no\b|not yet/i.test(answer)) {
      pushUser(answer);
      pushBot(
        "No worries — update your parcel details or tap a quick reply when you're ready.",
        "intake",
      );
      setIntakePendingQuote(null);
      setComposer("");
    }
  };

  const getCompleteIntakeDraft = () => {
    const value = Number(intakeDraft.valueText.replace(/[^\d.]/g, ""));
    const dest = intakeDraft.suburb.trim();
    if (!intakeDraft.sizeId || value <= 0 || dest.length < 2) return null;
    return {
      sizeId: intakeDraft.sizeId,
      value,
      suburb: dest,
    };
  };

  const tryApplyIntakeFromDraft = (): boolean => {
    const draft = getCompleteIntakeDraft();
    if (!draft) return false;
    const userLine =
      composer.trim() || intakeLine(draft.sizeId, draft.value, draft.suburb);
    if (confirmPartiesEditResume === "parcel") {
      applyParcelEditFromConfirm(
        { sizeId: draft.sizeId, value: draft.value, suburb: draft.suburb },
        userLine,
      );
      return true;
    }
    applyIntake(
      { sizeId: draft.sizeId, value: draft.value, suburb: draft.suburb },
      userLine,
    );
    return true;
  };

  const handleCostQuickChip = () => {
    const draft = getCompleteIntakeDraft();
    if (!draft) {
      fillDraft(aiBookingStarterPrefill("cost"));
      return;
    }

    const baseLine =
      composer.trim() ||
      buildIntakeComposerLine(intakeDraft) ||
      intakeLine(draft.sizeId, draft.value, draft.suburb);
    const userLine = `How much does it cost? ${baseLine}`;

    setIntakeUserLine(userLine);
    pushUser(userLine);
    const rec = buildAiRecommendation(
      draft.sizeId,
      draft.value,
      draft.suburb,
    );
    pushBot(
      recommendBotContent(draft.sizeId, draft.value, draft.suburb, rec),
      "intake",
    );
    pushBot("Do you wish to continue?", "intake");
    setIntakePendingQuote({
      sizeId: draft.sizeId,
      value: draft.value,
      suburb: draft.suburb,
      userLine,
      kind: "cost",
    });
    setComposer("");
  };

  const handleUnknownParcelValueQuickChip = () => {
    const userLine = "I'm not sure what my parcel is worth";
    setIntakeUserLine(userLine);
    pushUser(userLine);
    pushBot(
      `No problem — here's how declared value works:

Parcel Protection is included when your declared value is $100 or below. That covers loss or damage up to the amount you declare.

Above $100, Parcel Protection is 2.5% on the value over $100 (e.g. $200 declared → $2.50 protection).

What affects the value you declare:
· Replacement cost if you had to buy it again new
· Gifts — use a fair replacement figure, not sentimental worth alone
· Used items — typical resale or replace cost
· Contents — electronics, jewellery and similar items often need a higher declared value

Pop a number under VALUE, or add it to your message (e.g. $80), when you're ready.`,
      "intake",
    );
    pushBot("Do you wish to continue?", "intake");
    const draft = getCompleteIntakeDraft();
    setIntakePendingQuote({
      sizeId: draft?.sizeId ?? intakeDraft.sizeId ?? "satchel",
      value:
        draft?.value ??
        (Number(intakeDraft.valueText.replace(/[^\d.]/g, "")) || 0),
      suburb: draft?.suburb ?? (intakeDraft.suburb.trim() || ""),
      userLine,
      kind: "valueHelp",
    });
    setComposer("");
  };

  const handlePackagingQuickChip = () => {
    const draft = getCompleteIntakeDraft();
    if (!draft) {
      fillDraft(aiBookingStarterPrefill("packaging"));
      return;
    }

    const baseLine =
      composer.trim() ||
      buildIntakeComposerLine(intakeDraft) ||
      intakeLine(draft.sizeId, draft.value, draft.suburb);

    if (draft.sizeId === "carryon") {
      const userLine = baseLine;
      setIntakeUserLine(userLine);
      pushUser(userLine);
      pushBot(
        "Store packaging isn't available for Carry On — pack your items securely for transit.",
        "intake",
      );
      pushBot("Do you wish to continue?", "intake");
      setPackaging("no");
      setIntakePendingQuote({
        sizeId: draft.sizeId,
        value: draft.value,
        suburb: draft.suburb,
        userLine,
        kind: "packaging",
      });
      setComposer("");
      return;
    }

    setPackaging("yes");
    const userLine = `${baseLine} — I need store packaging`;
    setIntakeUserLine(userLine);
    pushUser(userLine);
    pushBot(
      "Got it — store packaging (+$2) is noted. You'll see it in your price summary at checkout.",
      "intake",
    );
    pushBot("Do you wish to continue?", "intake");
    setIntakePendingQuote({
      sizeId: draft.sizeId,
      value: draft.value,
      suburb: draft.suburb,
      userLine,
      kind: "packaging",
    });
    setComposer("");
  };

  const showConfirmParties = (
    line: string,
    lineDraft: ReceiverContactDraft,
    deliveryUpdatesOptIn?: boolean,
    options?: { updated?: boolean },
  ) => {
    const intro = options?.updated
      ? CONFIRM_PARTIES_UPDATED_INTRO
      : deliveryUpdatesOptIn === true
        ? CONFIRM_PARTIES_INTRO_WITH_UPDATES
        : deliveryUpdatesOptIn === false
          ? CONFIRM_PARTIES_INTRO_NO_UPDATES
          : CONFIRM_PARTIES_INTRO_DEFAULT;
    setConfirmPartiesEditStep(null);
    setConfirmPartiesEditResume(null);
    setReceiverLine(line);
    const addr = lineDraft.address.trim();
    if (addr.length >= 2 && suburb.trim().length < 2) {
      const tail = addr.split(",").pop()?.trim() ?? addr;
      setSuburb(tail.replace(/\s+QLD\s*\d{4}$/i, "").trim() || tail);
    }
    pushBot(
      <>
        <span className="block whitespace-pre-line">{intro}</span>
        <ConfirmPartiesContent
          senderLine={senderLine}
          receiverLine={line}
          receiverDraft={lineDraft}
        />
      </>,
      "confirmParties",
      true,
    );
    goToPhase("confirmParties");
    setComposer("");
  };

  const completeReceiverDeliveryUpdates = (optIn: boolean) => {
    pushUser(optIn ? "Yes, keep me updated!" : "No, thanks.");
    setNotifyReceiver(optIn);
    showConfirmParties(receiverLine, receiverDraft, optIn);
  };

  const submitSenderDetails = (text: string) => {
    const draft = mergeSenderDraftWithLine(senderDraft, text);
    setSenderDraft(draft);

    if (!hasSenderContactProgress(draft)) {
      pushBot(buildContactDetailsEmptyPrompt("sender"), "sender");
      setComposer("");
      return;
    }

    if (!isSenderContactComplete(draft)) {
      const userLine = text.trim() || buildSenderContactLine(draft);
      if (userLine) pushUser(userLine, "sender");
      pushBot(
        buildContactDetailsFollowUpPrompt(
          "sender",
          senderContactMissingLabels(draft),
        ),
        "sender",
      );
      setComposer("");
      return;
    }

    const line = buildSenderContactLine(draft);
    pushUser(line, "sender");
    setSenderLine(line);
    if (confirmPartiesEditResume === "sender") {
      resumeConfirmPartiesAfterEdit();
      setComposer("");
      return;
    }
    setReceiverDraft(EMPTY_RECEIVER_CONTACT_DRAFT);
    pushBot(SENDER_MARKETING_PROMPT, "senderMarketing");
    goToPhase("senderMarketing");
    setComposer("");
  };

  const completeSenderMarketing = (optIn: boolean) => {
    pushUser(optIn ? "Yes, sounds good!" : "No, thanks.");
    pushBot(
      optIn ? RECEIVER_INTRO_AFTER_MARKETING_OPT_IN : RECEIVER_INTRO_PROMPT,
      "receiver",
    );
    goToPhase("receiver");
    setComposer("");
  };

  const submitReceiverDetails = (text: string) => {
    const draft = mergeReceiverDraftWithLine(receiverDraft, text);
    setReceiverDraft(draft);

    if (!hasReceiverContactProgress(draft)) {
      pushBot(buildContactDetailsEmptyPrompt("receiver"), "receiver");
      setComposer("");
      return;
    }

    if (!isReceiverContactComplete(draft)) {
      const userLine = text.trim() || buildReceiverContactLine(draft);
      if (userLine) pushUser(userLine, "receiver");
      pushBot(
        buildContactDetailsFollowUpPrompt(
          "receiver",
          receiverContactMissingLabels(draft),
        ),
        "receiver",
      );
      setComposer("");
      return;
    }

    const line = buildReceiverContactLine(draft);
    pushUser(line, "receiver");
    setReceiverLine(line);
    if (confirmPartiesEditResume === "receiver") {
      resumeConfirmPartiesAfterEdit({ line, draft });
      setComposer("");
      return;
    }
    pushBot(RECEIVER_DELIVERY_UPDATES_PROMPT, "receiverDeliveryUpdates");
    goToPhase("receiverDeliveryUpdates");
    setComposer("");
  };

  const proceedAfterPartiesConfirmed = () => {
    if (sizeId === "carryon" || packaging === "yes") {
      if (sizeId === "carryon") setPackaging("no");
      pushBot(photoBotMessage(), "photo");
      goToPhase("photo");
    } else {
      pushBot(PACKAGING_STEP_PROMPT, "packaging");
      goToPhase("packaging");
    }
    setComposer("");
  };

  const answerConfirmParties = (answer: string) => {
    if (confirmPartiesEditStep === "choose") {
      answerConfirmPartiesEditTarget(answer);
      return;
    }
    if (confirmPartiesEditStep === "sender") {
      applySenderUpdateFromConfirm(answer);
      return;
    }
    if (confirmPartiesEditStep === "receiver") {
      applyReceiverUpdateFromConfirm(answer);
      return;
    }
    if (
      /^edit\b/i.test(answer.trim()) ||
      /\bedit\b/i.test(answer) ||
      /change something/i.test(answer)
    ) {
      pushUser(answer);
      pushBot(CONFIRM_PARTIES_EDIT_PROMPT, "confirmParties");
      setConfirmPartiesEditStep("choose");
      setComposer("");
      return;
    }
    if (/fix/i.test(answer)) {
      pushUser(answer);
      pushBot(CONFIRM_PARTIES_EDIT_PROMPT, "confirmParties");
      setConfirmPartiesEditStep("choose");
      setComposer("");
      return;
    }
    if (!isAffirmative(answer)) return;
    pushUser(answer);
    setConfirmPartiesEditStep(null);
    proceedAfterPartiesConfirmed();
  };

  const answerPackaging = (answer: string) => {
    if (sizeId === "carryon") {
      setPackaging("no");
      pushBot(photoBotMessage(), "photo");
      goToPhase("photo");
      setComposer("");
      return;
    }
    const choice = parsePackaging(answer);
    if (!choice) return;
    setPackaging(choice);
    pushUser(answer);
    pushBot(photoBotMessage(), "photo");
    goToPhase("photo");
    setComposer("");
  };

  const handleSubmit = () => {
    const text = composer.trim();

    if (text && /start\s*over/i.test(text)) {
      requestStartOver();
      setComposer("");
      return;
    }

    if (phase === "intake") {
      if (intakePendingQuote) {
        if (!text) {
          pushBot(
            "Ready to continue? Tap Yes, continue or Not yet — or type your reply. 😊",
            "intake",
          );
          setComposer("");
          return;
        }
        confirmIntakePendingQuote(text);
        return;
      }
      if (text) {
        const parsed = parseIntakeMessage(text);
        if (parsed) {
          if (confirmPartiesEditResume === "parcel") {
            applyParcelEditFromConfirm(parsed, text);
            return;
          }
          applyIntake(parsed, text);
          return;
        }
        const draft = parseIntakeDraftFields(text);
        const value = Number(draft.valueText.replace(/[^\d.]/g, ""));
        const dest = draft.suburb.trim();
        if (draft.sizeId && value > 0 && dest.length >= 2) {
          const intake = { sizeId: draft.sizeId, value, suburb: dest };
          if (confirmPartiesEditResume === "parcel") {
            applyParcelEditFromConfirm(intake, text);
            return;
          }
          applyIntake(intake, text);
          return;
        }
        const merged = mergeIntakeDraftFields(intakeDraft, text);
        setIntakeDraft(merged);
        setComposer(buildIntakeComposerLine(merged));
        pushUser(text);
        const missing = intakeDraftMissingLabels(merged);
        if (missing.length) {
          pushBot(buildIntakeFollowUpPrompt(missing), "intake");
        }
        return;
      }
      if (tryApplyIntakeFromDraft()) return;
      const missing = intakeDraftMissingLabels(intakeDraft);
      pushBot(
        missing.length
          ? buildIntakeFollowUpPrompt(missing)
          : emptySendNudgeForPhase("intake"),
        "intake",
      );
      setComposer("");
      return;
    }

    if (!text) {
      if (phase === "sender") {
        submitSenderDetails("");
        return;
      }
      if (phase === "receiver") {
        submitReceiverDetails("");
        return;
      }
      pushBot(
        emptySendNudgeForPhase(phase, {
          confirmPartiesEditStep,
          reviewEditTarget,
        }),
        phase,
      );
      setComposer("");
      return;
    }

    if (phase === "recommend") {
      if (!text) return;
      if (answerRecommendProtectionPrompt(text)) return;
      return;
    }

    if (phase === "sender") {
      submitSenderDetails(text);
      return;
    }

    if (phase === "senderMarketing") {
      if (!text) return;
      if (
        /yes.*sounds good/i.test(text) ||
        /^yes,\s*sounds good/i.test(text) ||
        /^yes\b/i.test(text)
      ) {
        completeSenderMarketing(true);
        return;
      }
      if (/no,?\s*thanks/i.test(text) || /^no\b/i.test(text)) {
        completeSenderMarketing(false);
        return;
      }
      return;
    }

    if (phase === "receiver") {
      submitReceiverDetails(text);
      return;
    }

    if (phase === "receiverDeliveryUpdates") {
      if (!text) return;
      if (/yes.*keep me updated|keep me updated/i.test(text) || /^yes\b/i.test(text)) {
        completeReceiverDeliveryUpdates(true);
        return;
      }
      if (/no,?\s*thanks/i.test(text) || /^no\b/i.test(text)) {
        completeReceiverDeliveryUpdates(false);
        return;
      }
      return;
    }

    if (phase === "confirmParties") {
      answerConfirmParties(text);
      return;
    }

    if (phase === "packaging") {
      if (!text) return;
      answerPackaging(text);
      return;
    }

    if (phase === "photo") {
      if (
        text === PARCEL_PHOTO_SKIP_USER ||
        /^skip(\s+for\s+now)?$/i.test(text)
      ) {
        completePhotoStep(false);
        return;
      }
      return;
    }

    if (phase === "notify") {
      if (!text) return;
      if (/^yes\b/i.test(text)) {
        completeNotifyStep(true, text);
        return;
      }
      if (/^no\b/i.test(text)) {
        completeNotifyStep(false, text);
        return;
      }
      return;
    }

    if (phase === "review") {
      if (reviewEditTarget && text && applyReviewEditFromComposer(text)) {
        return;
      }
      if (
        !reviewShowsPricing &&
        /show\s*price(\s*summary)?|price\s*summary/i.test(text)
      ) {
        pushUser(text);
        setReviewShowsPricing(true);
        pushBot("Here's your price summary.", "review");
        setComposer("");
        return;
      }
      if (reviewShowsPricing && /continue|payment/i.test(text)) {
        pushUser(text);
        beginPayConfirmations();
        return;
      }
      return;
    }

    if (phase === "confirmTerms") {
      if (/^i agree/i.test(text) && !/don'?t/i.test(text)) {
        agreeToTerms();
        return;
      }
      if (/don'?t agree/i.test(text)) {
        declineToTerms();
        return;
      }
      return;
    }

    if (phase === "confirmDangerous") {
      if (dangerousContains) return;
      if (/^i confirm/i.test(text)) {
        confirmNoDangerous();
        return;
      }
      if (/contain/i.test(text)) {
        reportDangerousGoods();
        return;
      }
      return;
    }

    if (phase === "confirmMarketing") {
      if (/^yes/i.test(text)) {
        completeMarketing(true);
        return;
      }
      if (/^no/i.test(text)) {
        completeMarketing(false);
        return;
      }
      return;
    }

    if (phase === "payment") {
      if (/complete|confirm|book/i.test(text)) {
        if (!payment) return;
        pushUser(text);
        finalizeBooking(payment);
        return;
      }
      const method = parsePayment(text);
      if (!method) return;
      pushUser(method === "online" ? "Pay online" : "Pay in store");
      finalizeBooking(method);
      return;
    }

    if (phase === "booked" && (isAffirmative(text) || /^done$/i.test(text))) {
      pushUser(text);
      onExit();
    }
  };

  useEffect(() => {
    if (threadBooted.current) return;
    threadBooted.current = true;
    const id = nextThreadMessageId("ai-bot-intake");
    setThread([
      {
        id,
        role: "bot",
        content: INTAKE_OPENING_MESSAGE,
        anchor: "intake",
      },
    ]);
    setLastTypedBotId(id);
  }, []);

  useEffect(() => {
    if (phase !== "review" || reviewShowsPricing) return;
    syncReviewSummaryCardInThread();
  }, [phase, reviewShowsPricing, bookingSummary]);

  const paymentHighlight = parsePayment(composer) ?? payment;
  const widgetsLive = (step: Phase) => isActive(step);

  const showStepStartOver = (step: Phase) =>
    widgetsLive(step) &&
    phase !== "intake" &&
    phase !== "booked" &&
    !(phase === "recommend" && recommendAddonsPending);

  const ActiveStepChips = ({
    step,
    children,
    className,
  }: {
    step: Phase;
    children?: ReactNode;
    className?: string;
  }) => (
    <div
      className={["flex flex-wrap items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
      {showStepStartOver(step) ? (
        <QuickChip label="Start over" onClick={requestStartOver} />
      ) : null}
    </div>
  );

  const botTypingDone = (id: string) => {
    setLastTypedBotId((current) => (current === id ? null : current));
  };

  const renderWidgets = (anchor: Phase) => {
    if (!showPhase(anchor)) return null;

    if (anchor === "intake") {
      const formLocked = !widgetsLive("intake");
      return (
        <>
          {intakePendingQuote ? (
            <div className="flex flex-wrap gap-2">
              <QuickChip
                label="Yes, continue"
                onClick={() => fillDraft("Yes, continue")}
              />
              <QuickChip
                label="Not yet"
                onClick={() => fillDraft("Not yet")}
              />
            </div>
          ) : (
            <AiIntakeFormWidget
              locked={formLocked}
              sizeId={intakeDraft.sizeId}
              valueText={intakeDraft.valueText}
              suburb={intakeDraft.suburb}
              lockedSizeId={formLocked ? sizeId : null}
              lockedValue={formLocked && valueNum > 0 ? valueNum : undefined}
              lockedSuburb={formLocked ? suburb : undefined}
              onSizeIdChange={(id) => patchIntakeDraft({ sizeId: id })}
              onValueTextChange={(valueText) => patchIntakeDraft({ valueText })}
              onSuburbChange={(suburb) => patchIntakeDraft({ suburb })}
            />
          )}
          {!intakePendingQuote && !formLocked ? (
            <div className="flex flex-wrap gap-2">
              <QuickChip
                label="I need packaging"
                onClick={handlePackagingQuickChip}
              />
              <QuickChip
                label="How much does it cost?"
                onClick={handleCostQuickChip}
              />
              <QuickChip
                label="I don't know the parcel value"
                onClick={handleUnknownParcelValueQuickChip}
              />
            </div>
          ) : null}
        </>
      );
    }


    if (anchor === "recommend" && sizeId && recommendAddonsPending) {
      return (
        <div className="flex flex-wrap gap-2">
          <QuickChip
            label="Yes please"
            disabled={!widgetsLive("recommend")}
            onClick={() => {
              if (widgetsLive("recommend")) fillDraft("Yes please");
            }}
          />
          <QuickChip
            label="No thanks"
            disabled={!widgetsLive("recommend")}
            onClick={() => {
              if (widgetsLive("recommend")) fillDraft("No thanks");
            }}
          />
          <QuickChip
            label="Start over"
            disabled={!widgetsLive("recommend")}
            onClick={() => {
              if (widgetsLive("recommend")) requestStartOver();
            }}
          />
        </div>
      );
    }

    if (anchor === "sender") {
      if (widgetsLive("sender") && !senderLine) {
        return null;
      }
      if (widgetsLive("sender")) {
        return (
          <>
            <AiSenderContactFormWidget
              draft={senderDraft}
              onChange={patchSenderDraft}
            />
            <ActiveStepChips step="sender" className="mt-2" />
          </>
        );
      }
      if (senderLine) {
        return (
          <AiSenderContactFormWidget
            locked
            draft={senderDraftFromLine(senderLine)}
            onChange={() => {}}
          />
        );
      }
    }

    if (anchor === "senderMarketing") {
      return (
        <ActiveStepChips step="senderMarketing">
          <QuickChip
            label="Yes, sounds good!"
            disabled={!widgetsLive("senderMarketing")}
            onClick={() => {
              if (widgetsLive("senderMarketing")) fillDraft("Yes, sounds good!");
            }}
          />
          <QuickChip
            label="No, thanks."
            disabled={!widgetsLive("senderMarketing")}
            onClick={() => {
              if (widgetsLive("senderMarketing")) fillDraft("No, thanks.");
            }}
          />
        </ActiveStepChips>
      );
    }

    if (anchor === "receiverDeliveryUpdates") {
      return (
        <ActiveStepChips step="receiverDeliveryUpdates">
          <QuickChip
            label="Yes, keep me updated!"
            disabled={!widgetsLive("receiverDeliveryUpdates")}
            onClick={() => {
              if (widgetsLive("receiverDeliveryUpdates")) {
                fillDraft("Yes, keep me updated!");
              }
            }}
          />
          <QuickChip
            label="No, thanks."
            disabled={!widgetsLive("receiverDeliveryUpdates")}
            onClick={() => {
              if (widgetsLive("receiverDeliveryUpdates")) {
                fillDraft("No, thanks.");
              }
            }}
          />
        </ActiveStepChips>
      );
    }

    if (anchor === "receiver") {
      if (widgetsLive("receiver")) {
        return (
          <>
            <AiReceiverContactFormWidget
              draft={receiverDraft}
              onChange={patchReceiverDraft}
            />
            <ActiveStepChips step="receiver" className="mt-2" />
          </>
        );
      }
      if (receiverLine) {
        const lockedDraft = {
          ...contactDraftFromLine(receiverLine),
          businessName: receiverDraft.businessName,
        };
        return (
          <AiReceiverContactFormWidget
            locked
            draft={lockedDraft}
            onChange={() => {}}
          />
        );
      }
    }

    if (anchor === "confirmParties" && senderLine && receiverLine) {
      if (confirmPartiesEditStep === "choose") {
        return (
          <ActiveStepChips step="confirmParties">
            <QuickChip
              label="Sender"
              disabled={!widgetsLive("confirmParties")}
              onClick={() => {
                if (widgetsLive("confirmParties")) fillDraft("Sender");
              }}
            />
            <QuickChip
              label="Receiver"
              disabled={!widgetsLive("confirmParties")}
              onClick={() => {
                if (widgetsLive("confirmParties")) fillDraft("Receiver");
              }}
            />
          </ActiveStepChips>
        );
      }
      if (confirmPartiesEditStep === "sender" || confirmPartiesEditStep === "receiver") {
        return <ActiveStepChips step="confirmParties" />;
      }
      return (
        <ActiveStepChips step="confirmParties">
          <QuickChip
            label="Looks good"
            disabled={!widgetsLive("confirmParties")}
            onClick={() => {
              if (widgetsLive("confirmParties")) fillDraft("Looks good");
            }}
          />
          <QuickChip
            label={CONFIRM_PARTIES_CHANGE_CHIP}
            disabled={!widgetsLive("confirmParties")}
            onClick={() => {
              if (widgetsLive("confirmParties")) beginConfirmPartiesEdit();
            }}
          />
        </ActiveStepChips>
      );
    }

    if (anchor === "packaging") {
      return (
        <ActiveStepChips step="packaging">
          <QuickChip
            label="Yes, add packaging"
            disabled={!widgetsLive("packaging")}
            onClick={() => {
              if (widgetsLive("packaging")) fillDraft("Yes, add packaging");
            }}
          />
          <QuickChip
            label="No, thanks"
            disabled={!widgetsLive("packaging")}
            onClick={() => {
              if (widgetsLive("packaging")) fillDraft("No, thanks");
            }}
          />
        </ActiveStepChips>
      );
    }

    if (anchor === "photo") {
      return (
        <>
          <ParcelPhotoStepCard
            accentOrange={PGO_ORANGE}
            disabled={!widgetsLive("photo")}
            onPhotoAdded={() => {
              if (widgetsLive("photo")) completePhotoStep(true);
            }}
            onSkip={() => {
              if (widgetsLive("photo")) completePhotoStep(false);
            }}
          />
          <ActiveStepChips step="photo" className="mt-2" />
        </>
      );
    }

    if (anchor === "notify") {
      const name = receiverFirstName;
      const noDetail =
        name === "your receiver"
          ? "They won't get updates from us"
          : `${name} won't get updates from us`;
      const notifyChoice = composer.trim();
      return (
        <>
          <div className="space-y-2">
            <NotifyReceiverOption
              title="Yes"
              detail="Updates by text and email"
              badge="Free"
              selected={/^yes\b/i.test(notifyChoice)}
              disabled={!widgetsLive("notify")}
              onClick={() => {
                if (widgetsLive("notify")) fillDraft("Yes");
              }}
            />
            <NotifyReceiverOption
              title="No"
              detail={noDetail}
              selected={/^no\b/i.test(notifyChoice)}
              disabled={!widgetsLive("notify")}
              onClick={() => {
                if (widgetsLive("notify")) fillDraft("No");
              }}
            />
          </div>
          <ActiveStepChips step="notify" className="mt-2" />
        </>
      );
    }

    if (anchor === "review" && widgetsLive("review")) {
      if (!reviewShowsPricing) {
        return (
          <ActiveStepChips step="review">
            <QuickChip
              label="Show price summary"
              onClick={() => fillDraft("Show price summary")}
            />
          </ActiveStepChips>
        );
      }
      return (
        <>
          <AiBookingSummaryWidget
            summary={bookingSummary}
            priceOnly
            disabled={!widgetsLive("review")}
          />
          <ActiveStepChips step="review" className="mt-2">
            <QuickChip
              label="Continue to payment"
              onClick={() => fillDraft("Continue to payment")}
            />
          </ActiveStepChips>
        </>
      );
    }

    if (anchor === "confirmTerms") {
      if (termsDeclined) {
        return (
          <TermsDeclineRecoveryButtons
            disabled={!widgetsLive("confirmTerms")}
            onAgreeNow={() => {
              if (widgetsLive("confirmTerms")) agreeToTerms();
            }}
            onCancel={onExit}
          />
        );
      }
      return (
        <>
          <div className="space-y-2.5">
            <TermsAgreementCard />
            <TermsChoiceButtons
              disabled={!widgetsLive("confirmTerms")}
              onAgree={() => {
                if (widgetsLive("confirmTerms")) agreeToTerms();
              }}
              onDecline={() => {
                if (widgetsLive("confirmTerms")) declineToTerms();
              }}
            />
          </div>
          <ActiveStepChips step="confirmTerms" className="mt-2" />
        </>
      );
    }

    if (anchor === "confirmDangerous") {
      if (dangerousContains) return null;
      return (
        <>
          <div className="space-y-2.5">
            <DangerousGoodsCard
              selected={noDangerousHighlight}
              disabled={!widgetsLive("confirmDangerous")}
              onToggle={() => setNoDangerousHighlight((v) => !v)}
            />
            <DangerousChoiceButtons
              disabled={!widgetsLive("confirmDangerous")}
              onConfirm={() => {
                if (widgetsLive("confirmDangerous")) confirmNoDangerous();
              }}
              onContains={() => {
                if (widgetsLive("confirmDangerous")) reportDangerousGoods();
              }}
            />
          </div>
          <ActiveStepChips step="confirmDangerous" className="mt-2" />
        </>
      );
    }

    if (anchor === "confirmMarketing") {
      return (
        <>
          <MarketingChoiceButtons
            disabled={!widgetsLive("confirmMarketing")}
            onYes={() => {
              if (widgetsLive("confirmMarketing")) completeMarketing(true);
            }}
            onNo={() => {
              if (widgetsLive("confirmMarketing")) completeMarketing(false);
            }}
          />
          <ActiveStepChips step="confirmMarketing" className="mt-2" />
        </>
      );
    }

    if (anchor === "payment" && widgetsLive("payment")) {
      return (
        <>
          <AiPaymentMethodChatWidget
            total={formatAiMoney(total)}
            selected={paymentHighlight}
            disabled={!widgetsLive("payment")}
            onSelectOnline={() => fillDraft("Pay online")}
            onSelectInStore={() => fillDraft("Pay in store")}
          />
          <ActiveStepChips step="payment" className="mt-2" />
        </>
      );
    }

    if (anchor === "booked") {
      if (payment) return null;
      return (
        <QuickChip
          label="Done"
          disabled={!widgetsLive("booked")}
          onClick={() => fillDraft("Done")}
        />
      );
    }

    return null;
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F7F8FA]">
      <ChatFlowHeader
        activeStep={headerStep}
        onBack={onExit}
        accentOrange={PGO_ORANGE}
        assistantTagline={
          phase === "booked" && payment
            ? "Conversation ended"
            : "Your shipping assistant"
        }
        assistantTaglineClassName={
          phase === "booked" && payment
            ? "text-neutral-500"
            : "text-[#2D7A4D]"
        }
        hideProgress
      />

      <ChatScrollArea
        scrollKey={`${thread.length}-${lastTypedBotId ?? "idle"}`}
      >
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          {thread.map((message, index) => {
            const isLast = index === thread.length - 1;
            const animateBot =
              message.role === "bot" && isLast && message.id === lastTypedBotId;

            const senderDetailsCombined =
              message.role === "bot" &&
              message.anchor === "sender" &&
              phase === "sender" &&
              !senderLine &&
              typeof message.content === "string" &&
              isLiveWidgetTurn("sender", index);

            const showSenderFormInBubble =
              senderDetailsCombined && lastTypedBotId !== message.id;

            return (
              <Fragment key={message.id}>
                {message.role === "user" ? (
                  message.kind === "parcel-photo" ? (
                    <ParcelPhotoBubble />
                  ) : (
                    <UserBubble
                      onEdit={
                        message.editableContact &&
                        typeof message.content === "string"
                          ? () =>
                              startEditContact(
                                message.id,
                                message.editableContact!,
                                message.content as string,
                              )
                          : undefined
                      }
                      editLabel={
                        message.editableContact === "sender"
                          ? "Edit sender details"
                          : message.editableContact === "receiver"
                            ? "Edit receiver details"
                            : "Edit message"
                      }
                    >
                      {message.content}
                    </UserBubble>
                  )
                ) : senderDetailsCombined ? (
                  <BotTurn
                    animate={showSenderFormInBubble ? false : animateBot}
                    bordered={message.bordered}
                    onReady={() => botTypingDone(message.id)}
                  >
                    <span className="whitespace-pre-line">{message.content}</span>
                    {showSenderFormInBubble ? (
                      <>
                        <AiSenderContactFormWidget
                          embedded
                          draft={senderDraft}
                          onChange={patchSenderDraft}
                        />
                        <ActiveStepChips step="sender" className="mt-3" />
                      </>
                    ) : null}
                  </BotTurn>
                ) : (
                  <BotTurn
                    animate={animateBot}
                    bordered={message.bordered}
                    onReady={() => botTypingDone(message.id)}
                  >
                    {typeof message.content === "string" ? (
                      <span className="whitespace-pre-line">{message.content}</span>
                    ) : (
                      message.content
                    )}
                  </BotTurn>
                )}
                {message.role === "bot" &&
                message.anchor === "confirmDangerous" &&
                lastTypedBotId !== message.id &&
                phaseIndex(phase) > phaseIndex("confirmDangerous") &&
                !dangerousContains ? (
                  <DangerousGoodsLockedCard />
                ) : null}
                {message.role === "bot" &&
                message.anchor === "confirmTerms" &&
                lastTypedBotId !== message.id &&
                phaseIndex(phase) > phaseIndex("confirmTerms") &&
                !termsDeclined ? (
                  <TermsAgreementCard locked />
                ) : null}
                {message.role === "bot" &&
                message.anchor === "intake" &&
                lastTypedBotId !== message.id &&
                showPhase("intake") &&
                isLiveWidgetTurn("intake", index)
                  ? renderWidgets("intake")
                  : null}
                {message.role === "bot" &&
                message.anchor &&
                message.anchor !== "intake" &&
                !(message.anchor === "sender" && senderDetailsCombined) &&
                lastTypedBotId !== message.id &&
                isLiveWidgetTurn(message.anchor, index)
                  ? renderWidgets(message.anchor)
                  : null}
              </Fragment>
            );
          })}
          {phase === "booked" && payment && confirmedDetails ? (
            <AiBookingConfirmedPanel
              details={confirmedDetails}
              onSendAnother={onExit}
            />
          ) : null}
        </div>
      </ChatScrollArea>

      <StartOverConfirmDialog
        open={startOverConfirmOpen}
        accentOrange={PGO_ORANGE}
        onConfirm={performBookingStartOver}
        onCancel={() => setStartOverConfirmOpen(false)}
      />

      {phase === "booked" && payment ? (
        <footer className="shrink-0 border-t border-neutral-200/80 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
          <p className="mb-3 text-center text-xs text-neutral-500">
            ✓ Booking complete — this conversation has ended
          </p>
          <button
            type="button"
            onClick={onExit}
            className="w-full rounded-full py-3.5 text-[15px] font-bold text-white transition active:scale-[0.99] bg-[#0B1B32]"
          >
            Send another parcel
          </button>
        </footer>
      ) : (
        <ChatFlowFooter
          input={composer}
          inputRef={composerRef}
          onInputChange={handleComposerChange}
          accentOrange={PGO_ORANGE}
          onSubmitMessage={handleSubmit}
          submitEnabled
        />
      )}
    </div>
  );
}
