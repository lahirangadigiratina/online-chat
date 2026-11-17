/**
 * Post-booking email messaging in the confirmation UI.
 *
 * Product requirement — pre-booking email confirmation (pay in store):
 * - Send a booking confirmation email as soon as the booking is created (before
 *   payment at the counter).
 * - Do not imply the customer has paid; the receipt email is sent only after
 *   in-store payment completes.
 *
 * Pay online: confirmation and receipt in one email after payment.
 */
export function bookingEmailFollowUp(
  email: string,
  paymentMethod: "card" | "store",
): string {
  const dest = email.trim() || "your email on file";
  if (paymentMethod === "card") {
    return `We've sent your booking confirmation and receipt to ${dest}.`;
  }
  return `We've sent your booking confirmation to ${dest}. Your receipt will follow once you've paid at the counter.`;
}