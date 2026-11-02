"use client";

import { useCallback, useEffect, useState } from "react";
import { formatRouteSummaryFromValue } from "@/lib/route-summary";
import { useChatStore } from "@/lib/store";
import type { Booking, DropOffPoint, RouteStepValue, WidgetDraft } from "@/lib/types";
import { DropOffList } from "./DropOffList";
import { SuburbSearch } from "./SuburbSearch";

interface Props {
  booking: Booking;
}

function suburbLabel(suburb: string): string {
  return suburb.replace(/\s+NSW\s+\d{4}$/i, "").trim() || suburb;
}

function pushRouteDraft(
  suburb: string,
  dropOff: DropOffPoint | undefined,
  booking: Booking,
  setWidgetDraft: (draft: WidgetDraft | null) => void
) {
  const trimmed = suburb.trim();
  if (!trimmed) {
    setWidgetDraft(null);
    return;
  }
  const receiverAddress = booking.receiverAddress?.trim() ?? "";
  if (!dropOff?.id) {
    setWidgetDraft({
      stepId: "ROUTE",
      value: {
        senderSuburb: trimmed,
        dropOffPoint: undefined,
        receiverAddress,
      },
      summary: suburbLabel(trimmed),
    });
    return;
  }
  const value: RouteStepValue = {
    senderSuburb: trimmed,
    dropOffPoint: dropOff,
    receiverAddress,
  };
  setWidgetDraft({
    stepId: "ROUTE",
    value,
    summary: formatRouteSummaryFromValue(value),
  });
}

function SectionHeader({
  title,
  complete,
}: {
  title: string;
  complete: boolean;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <h3 className="text-sm font-semibold text-brand-black">{title}</h3>
      {complete && (
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700"
          aria-label="Complete"
        >
          ✓
        </span>
      )}
    </div>
  );
}

export function RouteCard({ booking }: Props) {
  const setWidgetDraft = useChatStore((s) => s.setWidgetDraft);
  const [suburb, setSuburb] = useState(booking.senderSuburb ?? "");
  const [dropOff, setDropOff] = useState<DropOffPoint | undefined>(
    booking.dropOffPoint
  );

  useEffect(() => {
    setSuburb(booking.senderSuburb ?? "");
    setDropOff(booking.dropOffPoint);
  }, [booking.senderSuburb, booking.dropOffPoint]);

  const syncDraft = useCallback(
    (nextSuburb: string, nextDropOff: DropOffPoint | undefined) => {
      pushRouteDraft(nextSuburb, nextDropOff, booking, setWidgetDraft);
    },
    [booking, setWidgetDraft]
  );

  const onSuburbPick = useCallback(
    (s: string) => {
      setSuburb(s);
      setDropOff(undefined);
      syncDraft(s, undefined);
    },
    [syncDraft]
  );

  const onDropOffPick = useCallback(
    (point: DropOffPoint) => {
      setDropOff(point);
      syncDraft(suburb, point);
    },
    [suburb, syncDraft]
  );

  const sendingFromComplete = !!suburb.trim() && !!dropOff;

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-3">
      <section>
        <SectionHeader title="Sending from" complete={sendingFromComplete} />
        <SuburbSearch value={suburb} onSelect={onSuburbPick} />
        {suburb.trim() ? (
          <div className="mt-3">
            <DropOffList
              suburb={suburb}
              selectedId={dropOff?.id}
              onSelect={onDropOffPick}
              compactExpand
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
