import { NextResponse } from "next/server";

function randomRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "PH";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST() {
  return NextResponse.json({ bookingRef: randomRef() });
}
