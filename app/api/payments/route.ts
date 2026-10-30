import { NextResponse } from "next/server";

/**
 * Mock payment — replace with Airwallex hosted/embedded element.
 * Never persist raw card numbers in production.
 */
export async function POST() {
  await new Promise((r) => setTimeout(r, 400));
  return NextResponse.json({ success: true, transactionId: "mock_tx_" + Date.now() });
}
