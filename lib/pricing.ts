import type { Booking } from "./types";

/** TODO: confirm with product — parcel protection rate */
export const PROTECTION_RATE = 0.025;
export const PACKAGING_FEE = 2;
export const SIGNATURE_FEE = 3.5;
export const GST_RATE = 0.1;

export interface PriceBreakdown {
  delivery: number;
  packaging: number;
  signature: number;
  protection: number;
  discount: number;
  subtotal: number;
  gst: number;
  total: number;
}

export function computeTotals(booking: Booking): PriceBreakdown {
  const delivery = booking.deliveryFee ?? booking.price ?? 0;
  const packaging = booking.packaging === true ? PACKAGING_FEE : 0;
  const signature =
    booking.contents?.signatureOnDelivery === true ? SIGNATURE_FEE : 0;
  const value = booking.contents?.value ?? 0;
  const protection =
    booking.contents?.parcelProtection === true
      ? Math.round(value * PROTECTION_RATE * 100) / 100
      : 0;
  const discount = booking.coupon?.discount ?? 0;

  const subtotal = Math.max(
    0,
    delivery + packaging + signature + protection - discount
  );
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;

  return {
    delivery,
    packaging,
    signature,
    protection,
    discount,
    subtotal,
    gst,
    total,
  };
}

export function protectionFeeForValue(value: number): number {
  return Math.round(value * PROTECTION_RATE * 100) / 100;
}
