import { NextRequest, NextResponse } from "next/server";
import { BONDI_DROP_OFF_POINTS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const suburb = req.nextUrl.searchParams.get("suburb") ?? "";
  const points =
    suburb.toLowerCase().includes("bondi") || !suburb
      ? BONDI_DROP_OFF_POINTS
      : BONDI_DROP_OFF_POINTS.map((p) => ({ ...p, distanceKm: p.distanceKm + 2 }));
  return NextResponse.json({ points });
}
