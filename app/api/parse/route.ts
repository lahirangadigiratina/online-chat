import { NextRequest, NextResponse } from "next/server";

/**
 * Phase 2: Anthropic API — JSON-only partial Booking fields.
 * Phase 1: not used; client uses lib/parse.ts stub.
 */
export async function POST(req: NextRequest) {
  const { text } = (await req.json()) as { text?: string };
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  // Stub for future LLM integration
  return NextResponse.json({
    fields: {},
    confidence: "llm",
    note: "Wire Anthropic here in phase 2",
  });
}
