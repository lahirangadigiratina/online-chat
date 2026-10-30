"use client";

import { PARCEL_SIZE_INFO, summarizeStep } from "@/lib/flow";
import { useChatStore } from "@/lib/store";
import type {
  Booking,
  DeliveryMethod,
  DropOffPoint,
  ParcelSize,
  PaymentMethod,
  StepId,
  WidgetDraft,
} from "@/lib/types";
import { ConfirmStep } from "@/components/widgets/ConfirmStep";
import { ContentsForm } from "@/components/widgets/ContentsForm";
import { DeliveryOptions } from "@/components/widgets/DeliveryOptions";
import { DoneScreen } from "@/components/widgets/DoneScreen";
import { DropOffList } from "@/components/widgets/DropOffList";
import { PackagingPicker } from "@/components/widgets/PackagingPicker";
import { ParcelSizePicker } from "@/components/widgets/ParcelSizePicker";
import { PaymentForm } from "@/components/widgets/PaymentForm";
import { PaymentMethodPicker } from "@/components/widgets/PaymentMethodPicker";

import { STEPS_WITH_WIDGET_PANEL } from "@/lib/widget-steps";

export { STEPS_WITH_WIDGET_PANEL };

interface Props {
  stepId: StepId;
  booking: Booking;
  optionsPage?: number;
  onDropOffPageCount?: (totalPages: number) => void;
}

function draftForStep(draft: WidgetDraft | null, stepId: StepId): WidgetDraft | null {
  return draft?.stepId === stepId ? draft : null;
}

export function StepWidget({
  stepId,
  booking,
  optionsPage = 0,
  onDropOffPageCount,
}: Props) {
  const setWidgetDraft = useChatStore((s) => s.setWidgetDraft);
  const widgetDraft = useChatStore((s) => s.widgetDraft);
  const jumpToStep = useChatStore((s) => s.jumpToStep);
  const goBack = useChatStore((s) => s.goBack);
  const startOver = useChatStore((s) => s.startOver);

  switch (stepId) {
    case "DROP_OFF_POINT": {
      const draft = draftForStep(widgetDraft, "DROP_OFF_POINT");
      return (
        <DropOffList
          suburb={booking.senderSuburb ?? ""}
          page={optionsPage}
          onPageCount={onDropOffPageCount}
          selectedId={
            (draft?.value as DropOffPoint | undefined)?.id ??
            booking.dropOffPoint?.id
          }
          onSelect={(p: DropOffPoint) =>
            setWidgetDraft({
              stepId: "DROP_OFF_POINT",
              value: p,
              summary: p.name,
            })
          }
        />
      );
    }
    case "PARCEL_SIZE": {
      const draft = draftForStep(widgetDraft, "PARCEL_SIZE");
      return (
        <ParcelSizePicker
          selected={
            (draft?.value as ParcelSize | undefined) ?? booking.parcelSize
          }
          onSelect={(size: ParcelSize) => {
            const info = PARCEL_SIZE_INFO[size];
            setWidgetDraft({
              stepId: "PARCEL_SIZE",
              value: size,
              summary: `${info.label} ${info.maxWeight}`,
            });
          }}
        />
      );
    }
    case "PACKAGING": {
      const draft = draftForStep(widgetDraft, "PACKAGING");
      const selected =
        typeof draft?.value === "boolean"
          ? draft.value
          : booking.packaging;
      return (
        <PackagingPicker
          selected={selected}
          onSelect={(needs) =>
            setWidgetDraft({
              stepId: "PACKAGING",
              value: needs,
              summary: summarizeStep("PACKAGING", { packaging: needs }),
            })
          }
        />
      );
    }
    case "DELIVERY_METHOD": {
      const draft = draftForStep(widgetDraft, "DELIVERY_METHOD");
      return (
        <DeliveryOptions
          booking={booking}
          selectedMethod={
            (draft?.value as DeliveryMethod | undefined) ??
            booking.deliveryMethod
          }
          onSelect={(method, summary) =>
            setWidgetDraft({
              stepId: "DELIVERY_METHOD",
              value: method,
              summary,
            })
          }
        />
      );
    }
    case "CONTENTS":
      return (
        <ContentsForm
          initial={booking.contents}
          onSubmit={(contents) =>
            setWidgetDraft({
              stepId: "CONTENTS",
              value: contents,
              summary: summarizeStep("CONTENTS", { contents }),
            })
          }
        />
      );
    case "CONFIRM":
      return (
        <ConfirmStep
          booking={booking}
          onEdit={jumpToStep}
          onBack={goBack}
          onConfirm={(payload) =>
            setWidgetDraft({
              stepId: "CONFIRM",
              value: payload,
              summary: summarizeStep("CONFIRM", {}),
            })
          }
        />
      );
    case "PAYMENT_METHOD": {
      const draft = draftForStep(widgetDraft, "PAYMENT_METHOD");
      return (
        <PaymentMethodPicker
          booking={booking}
          selected={
            (draft?.value as PaymentMethod | undefined) ??
            booking.paymentMethod
          }
          onSelect={(method) =>
            setWidgetDraft({
              stepId: "PAYMENT_METHOD",
              value: method,
              summary: summarizeStep("PAYMENT_METHOD", { paymentMethod: method }),
            })
          }
        />
      );
    }
    case "PAYMENT":
      return (
        <PaymentForm
          booking={booking}
          onComplete={({ paidOnline }) =>
            setWidgetDraft({
              stepId: "PAYMENT",
              value: { paidOnline },
              summary: summarizeStep("PAYMENT", {
                ...booking,
                paidOnline,
              }),
            })
          }
        />
      );
    case "DONE":
      return <DoneScreen booking={booking} onBookAnother={startOver} />;
    default:
      return null;
  }
}
