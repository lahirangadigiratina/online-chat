# ParcelPoint Go — Chat Booking Assistant

Mobile-first Next.js chat UI for parcel booking. Flow is driven by a **deterministic state machine** in `lib/flow.ts`; amounts come from **`lib/pricing.ts`** (`computeTotals`).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Landing screen → chat flow through **DONE** (confirm, payment, barcode).

## Step order

`SUBURB` → `DROP_OFF_POINT` → `PARCEL_SIZE` → `PACKAGING` → `RECEIVER_ADDRESS` → `DELIVERY_METHOD` → `SENDER_DETAILS` → `RECEIVER_DETAILS` → `CONTENTS` → `CONFIRM` → `PAYMENT_METHOD` → `PAYMENT` → `DONE`

## Mock APIs

| Route | Purpose |
|-------|---------|
| `GET /api/suburbs?q=` | Suburb search |
| `GET /api/dropoff-points?suburb=` | Drop-off list |
| `GET /api/addresses?q=` | Address autocomplete |
| `POST /api/quote` | Delivery fee + ETA |
| `GET /api/customer-lookup?mobile=` | `0434 567 890` → Jane Smith mock |
| `POST /api/coupon` | `SAVE5` → $5 off |
| `POST /api/bookings` | Returns `bookingRef` |
| `POST /api/payments` | Mock success (replace with Airwallex) |

## Pricing

All totals use `computeTotals(booking)` — delivery from quote, packaging $2, signature $3.50, protection 2.5% of declared value (see `PROTECTION_RATE` TODO), GST 10% on subtotal.

## Payment integration

`PaymentForm.tsx` uses a **mock** card UI marked for **Airwallex** hosted/embedded replacement. Do not store PAN/CVC.

## Adding steps

1. Extend `Booking` in `lib/types.ts`.
2. Append `StepId` + `STEPS` / `validateStep` / `isStepSatisfied` in `lib/flow.ts`.
3. Widget in `components/widgets/` + case in `StepWidget.tsx`.

## Phase 2 — LLM

`POST /api/parse` + Anthropic JSON-only partial fields; state machine validates every step.
