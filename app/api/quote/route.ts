import { NextRequest, NextResponse } from "next/server";
import type { QuoteRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as QuoteRequest;
  if (!body.parcelSize || !body.deliveryMethod || !body.from || !body.to) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const days = body.deliveryMethod === "collect" ? 3 : 2;
  const d = new Date();
  d.setDate(d.getDate() + days);
  const estimatedDelivery = d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return NextResponse.json({
    price: 11.5,
    estimatedDelivery,
  });
}
