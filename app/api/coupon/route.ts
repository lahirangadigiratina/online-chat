import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = (await req.json()) as { code?: string };
  const normalized = (code ?? "").trim().toUpperCase();

  if (normalized === "SAVE5") {
    return NextResponse.json({ valid: true, discount: 5, code: normalized });
  }

  return NextResponse.json(
    { valid: false, error: "Invalid or expired coupon code." },
    { status: 400 }
  );
}
