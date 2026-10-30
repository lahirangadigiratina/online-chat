import { NextRequest, NextResponse } from "next/server";
import { normalizeAuMobile } from "@/lib/validation";

const MOCK = {
  mobile: "+61434567890",
  firstName: "Jane",
  lastName: "Smith",
  businessName: "Hubbed",
  email: "jane@example.com",
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("mobile") ?? "";
  const normalized = normalizeAuMobile(raw);
  const mockNorm = normalizeAuMobile("0434 567 890");

  if (normalized && mockNorm && normalized === mockNorm) {
    return NextResponse.json({
      found: true,
      customer: {
        mobile: MOCK.mobile,
        firstName: MOCK.firstName,
        lastName: MOCK.lastName,
        businessName: MOCK.businessName,
        email: MOCK.email,
      },
    });
  }

  return NextResponse.json({ found: false }, { status: 404 });
}
