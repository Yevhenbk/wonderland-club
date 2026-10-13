import { NextResponse } from "next/server";

import { soldOffline } from "@/app/content";
import { stripeSales } from "@/lib/stripe";

/**
 * How many tickets are sold for the night: the ones sold directly (a number
 * in app/content.ts, updated by hand) plus every ticket paid on the site
 * (read from Stripe). Counted once a minute at most, so a busy page does not
 * ask Stripe on every view.
 */

let cached: { at: number; sold: number } | null = null;

export async function GET() {
  if (!cached || Date.now() - cached.at > 60_000) {
    try {
      const online = (await stripeSales())?.tickets ?? 0;
      cached = { at: Date.now(), sold: soldOffline + online };
    } catch (error) {
      console.error("[sold] could not count online sales", error);
      return NextResponse.json({ sold: cached?.sold ?? soldOffline });
    }
  }
  return NextResponse.json(
    { sold: cached.sold },
    { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
