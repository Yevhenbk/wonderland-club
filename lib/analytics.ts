import { createHash } from "node:crypto";

import { store, type StoreOp } from "./store";
import { verify } from "./tokens";

/**
 * Anonymous visit statistics for /dashboard, kept in the same store as the
 * door check-ins (Upstash Redis in production).
 *
 * No cookies and nothing stored in the visitor's browser. A visitor is a
 * hash of the day, a secret salt, the IP address and the browser string: it
 * counts one person once per day, cannot be turned back into an IP, and
 * changes at midnight, so nobody can be followed from one day to the next.
 * The same method privacy-first tools such as Plausible use.
 *
 * Per day (Warsaw time) there is one hash of counters (page views, clicks,
 * sources, seconds on the page) and a unique counter (HyperLogLog) per
 * step: visited, saw a section, clicked buy, opened checkout, started
 * paying. Unique counters can be merged across days, so "visitors this
 * week" is a real count of people, not a sum of daily counts.
 */

export const KEEP_SECONDS = 400 * 24 * 60 * 60;

const prefix = (day: string) => `wl:a:${day}`;
const countersKey = (day: string) => `${prefix(day)}:c`;
const uniqueKey = (day: string, step: string) => `${prefix(day)}:u:${step}`;

/** "2026-11-14", the day in Kraków. */
export function dayOf(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** The days of a range, oldest first, ending today. */
export function lastDays(count: number): string[] {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) days.push(dayOf(new Date(Date.now() - i * 86_400_000)));
  return [...new Set(days)];
}

const BOT =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|telegram|vercel|monitor|curl|wget|python|node-fetch|axios/i;

const salt = () =>
  process.env.ANALYTICS_SALT ?? process.env.TICKET_SECRET ?? "wonderland-dev-analytics";

/** Whether a request comes from a crawler or a script, not a person. */
export function isBot(request: Request): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  return !ua || BOT.test(ua);
}

/** The anonymous visitor for a request, or null for bots and for staff
    phones (signed in with the door PIN), who should not count. */
export function visitorOf(request: Request, day: string): string | null {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return null;

  const cookie = request.headers.get("cookie") ?? "";
  const staff = cookie.match(/(?:^|;\s*)wl_staff=([^;]+)/)?.[1];
  if (staff && verify(decodeURIComponent(staff), "staff")) return null;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  return createHash("sha256").update(`${day}|${salt()}|${ip}|${ua}`).digest("hex").slice(0, 20);
}

/* ------------------------------------------------------------ writing */

export interface Hit {
  /** Counters to add to: [field, amount]. */
  count?: [string, number][];
  /** Steps this visitor reached today. */
  reached?: string[];
}

export async function record(day: string, visitor: string, hit: Hit): Promise<void> {
  const ops: StoreOp[] = [
    ...(hit.count ?? []).map(([field, by]): StoreOp => ({ hincr: [countersKey(day), field, by] })),
    ...(hit.reached ?? []).map((step): StoreOp => ({ unique: [uniqueKey(day, step), visitor] })),
  ];
  await store().batch(ops, KEEP_SECONDS);
}

/** A counter with no visitor behind it (a door check-in). */
export async function count(field: string, by = 1, day = dayOf()): Promise<void> {
  await store().batch([{ hincr: [countersKey(day), field, by] }], KEEP_SECONDS);
}

/* ------------------------------------------------------------ reading */

export interface Report {
  days: string[];
  /** Every counter summed over the range. */
  totals: Record<string, number>;
  /** Visitors per day, for the chart. */
  visitorsByDay: number[];
  /** Distinct people over the whole range who reached each step. */
  reached: Record<string, number>;
}

export async function report(days: string[], steps: string[]): Promise<Report> {
  const s = store();
  const rows = await s.hashes(days.map(countersKey));
  const totals: Record<string, number> = {};
  for (const row of rows)
    for (const [field, value] of Object.entries(row)) totals[field] = (totals[field] ?? 0) + Number(value);

  /* Sources and sections are open-ended: their steps are found from the
     counters (src:instagram, sec:tickets). */
  const dynamic = Object.keys(totals)
    .filter((field) => field.startsWith("src:") || field.startsWith("sec:") || field.startsWith("dev:"))
    .map((field) => field);
  const allSteps = [...new Set([...steps, ...dynamic])];

  const [visitorsByDay, ...stepCounts] = await Promise.all([
    s.uniquesEach(days.map((day) => uniqueKey(day, "visit"))),
    ...allSteps.map((step) => s.uniques(days.map((day) => uniqueKey(day, step)))),
  ]);

  return {
    days,
    totals,
    visitorsByDay: visitorsByDay as number[],
    reached: Object.fromEntries(allSteps.map((step, i) => [step, stepCounts[i] as number])),
  };
}
