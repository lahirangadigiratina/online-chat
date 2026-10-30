import { NextRequest, NextResponse } from "next/server";
import { MOCK_SUBURBS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").toLowerCase();
  const results = MOCK_SUBURBS.filter((s) => s.toLowerCase().includes(q)).slice(
    0,
    10
  );
  return NextResponse.json({ suburbs: results });
}
