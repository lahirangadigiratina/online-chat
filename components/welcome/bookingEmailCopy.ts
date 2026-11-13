export function bookingEmailFollowUp(
  email: string,
  paymentMethod: "card" | "store",
): string {
  const dest = email.trim() || "your email on file";
  if (paymentMethod === "card") {
    return `We've sent your booking confirmation and receipt to ${dest}. You'll get it even if you step away before handing your parcel over the counter.`;
  }
  return `We've sent your booking confirmation to ${dest} — whether or not you've paid yet, including if you step away before finishing at the counter.`;
}
