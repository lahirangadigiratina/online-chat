import { NextRequest, NextResponse } from "next/server";
import { MOCK_ADDRESSES } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").toLowerCase();
  const results = MOCK_ADDRESSES.filter((a) => a.toLowerCase().includes(q)).slice(
    0,
    10
  );
  return NextResponse.json({ addresses: results });
}
