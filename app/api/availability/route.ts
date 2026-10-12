import { NextResponse } from "next/server";

import { availability } from "@/lib/inventory";

/**
 * How many VIP zones are left, for the ticket cards on the (static) landing
 * page. Only counts, nothing about who bought them.
 */
export async function GET() {
  try {
    return NextResponse.json(await availability(), {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("[availability] could not count", error);
    return NextResponse.json({}, { status: 503 });
  }
}
