import type { Booking, RouteStepValue } from "./types";

export function formatRouteSummary(
  booking: Pick<Booking, "senderSuburb" | "dropOffPoint" | "receiverAddress">
): string {
  const suburbLabel =
    booking.senderSuburb?.replace(/\s+NSW\s+\d{4}$/i, "").trim() ?? "";
  const from = booking.dropOffPoint
    ? `${booking.dropOffPoint.name}${suburbLabel ? `, ${suburbLabel}` : ""}`
    : suburbLabel || "—";
  const to = booking.receiverAddress?.trim();
  return to ? `From: ${from} -> To: ${to}` : `From: ${from}`;
}

export function formatRouteSummaryFromValue(value: RouteStepValue): string {
  return formatRouteSummary(value);
}
