import { NextResponse } from "next/server";

import { dayOf, record, visitorOf, type Hit } from "@/lib/analytics";
import { storeReady } from "@/lib/store";

/**
 * Receives the page's anonymous statistics (app/components/tracker.tsx),
 * sent with navigator.sendBeacon so a click that leaves the page still
 * arrives. Only known names are counted, so nothing a visitor sends can
 * flood the store with new keys.
 */

const PAGES: [RegExp, string][] = [
  [/^\/$/, "home"],
  [/^\/checkout\/pay/, "pay"],
  [/^\/checkout\/success/, "success"],
  [/^\/checkout/, "checkout"],
  [/^\/order\//, "order"],
  [/^\/(terms|privacy|pl\/)/, "legal"],
];

const SECTIONS = new Set([
  "hero", "atmosphere", "quote", "nights", "expect", "vip",
  "tickets", "rules", "worlds", "gallery", "faq", "final",
]);

const CLICKS = new Set([
  "buy_standard", "buy_vip", "to_tickets", "header_tickets", "map",
  "instagram", "tiktok", "telegram", "sound", "faq", "terms", "privacy",
]);

/* Where a visit came from: the ad tag (?utm_source=) if there is one,
   otherwise the referring site, folded into a few names. */
function sourceOf(referrer: string, utm: string, ownHost: string): string {
  const tag = utm.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24);
  if (tag) return tag;
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "direct";
  }
  if (!host) return "direct";
  /* A move from one page of this site to another is not a source. */
  if (host === ownHost.replace(/^www\./, "").split(":")[0]) return "";
  if (/instagram\.com$/.test(host)) return "instagram";
  if (/(facebook\.com|fb\.com|fb\.me)$/.test(host)) return "facebook";
  if (/tiktok\.com$/.test(host)) return "tiktok";
  if (/(t\.me|telegram\.org)$/.test(host)) return "telegram";
  if (/google\./.test(host)) return "google";
  if (/(bing\.com|duckduckgo\.com|yahoo\.)/.test(host)) return "search";
  if (/(t\.co|twitter\.com|x\.com)$/.test(host)) return "x";
  if (/wonderlandkrk\.club$/.test(host)) return "";
  return host.replace(/[^a-z0-9.-]/g, "").slice(0, 30) || "other";
}

interface Payload {
  t?: string;
  p?: string;
  r?: string;
  u?: string;
  phone?: boolean;
  s?: unknown;
  c?: unknown;
  d?: number;
  m?: number;
}

export async function POST(request: Request) {
  if (!storeReady()) return new NextResponse(null, { status: 204 });

  const day = dayOf();
  const visitor = visitorOf(request, day);
  if (!visitor) return new NextResponse(null, { status: 204 });

  let body: Payload;
  try {
    body = JSON.parse((await request.text()).slice(0, 4000)) as Payload;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const hit: Required<Hit> = { count: [], reached: [] };

  if (body.t === "view") {
    const page = PAGES.find(([pattern]) => pattern.test(String(body.p ?? "")))?.[1] ?? "other";
    hit.count.push(["pv", 1], [`pv:${page}`, 1]);
    hit.reached.push("visit", `page:${page}`);
    const device = body.phone ? "dev:phone" : "dev:desktop";
    hit.count.push([device, 1]);
    hit.reached.push(device);
    const ownHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
    const source = sourceOf(String(body.r ?? ""), String(body.u ?? ""), ownHost);
    if (source) {
      hit.count.push([`src:${source}`, 1]);
      hit.reached.push(`src:${source}`);
    }
  }

  if (body.t === "seen" || body.t === "leave") {
    for (const id of Array.isArray(body.s) ? body.s.slice(0, 20) : []) {
      if (typeof id === "string" && SECTIONS.has(id)) {
        hit.count.push([`sec:${id}`, 1]);
        hit.reached.push(`sec:${id}`);
      }
    }
    /* Seconds the page was actually in front of the visitor, capped so one
       forgotten tab cannot skew the average. */
    const seconds = Math.round(Number(body.d));
    if (seconds > 0) hit.count.push(["time", Math.min(seconds, 1800)]);
    const total = Math.round(Number(body.m));
    if (total >= 30) hit.reached.push("stay30");
    if (total >= 120) hit.reached.push("stay120");
  }

  if (body.t === "click") {
    for (const name of Array.isArray(body.c) ? body.c.slice(0, 3) : []) {
      if (typeof name === "string" && CLICKS.has(name)) {
        hit.count.push([`click:${name}`, 1]);
        if (name.startsWith("buy_")) hit.reached.push("click_buy");
      }
    }
  }

  if (hit.count.length || hit.reached.length) {
    try {
      await record(day, visitor, hit);
    } catch (error) {
      console.error("[analytics] could not record", error);
    }
  }
  return new NextResponse(null, { status: 204 });
}
