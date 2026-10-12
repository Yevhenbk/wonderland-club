import { createHash, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { store } from "./store";
import { sign, verify } from "./tokens";

/**
 * Who may let people in: anyone who knows STAFF_PIN. Entering it once marks
 * that phone as staff for the night (a signed cookie, 16 hours), so the
 * door only scans after that.
 *
 * In development the PIN is 1234 unless set. In production a missing PIN
 * turns staff sign-in off. Ten wrong tries lock an address for 15 minutes.
 */

const COOKIE = "wl_staff";
const HOURS = 16;
const MAX_FAILS = 10;
const LOCK_SECONDS = 15 * 60;

export const DEV_PIN = "1234";

function staffPin(): string | null {
  const pin = process.env.STAFF_PIN;
  if (pin) return pin;
  return process.env.NODE_ENV === "production" ? null : DEV_PIN;
}

export async function isStaff(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  const claim = value ? verify<{ v: 1; exp: number }>(value, "staff") : null;
  return Boolean(claim && claim.v === 1 && claim.exp > Date.now());
}

const digest = (text: string) => createHash("sha256").update(text).digest();

export type SignIn = "ok" | "wrong" | "locked" | "off";

export async function signIn(pin: string, address: string): Promise<SignIn> {
  const expected = staffPin();
  if (!expected) return "off";

  const fails = `wl:pinfail:${address}`;
  if (Number(await store().get(fails)) >= MAX_FAILS) return "locked";

  if (!timingSafeEqual(digest(pin), digest(expected))) {
    await store().incr(fails, LOCK_SECONDS);
    return "wrong";
  }

  const exp = Date.now() + HOURS * 3_600_000;
  (await cookies()).set(COOKIE, sign({ v: 1, exp }, "staff"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: HOURS * 3600,
  });
  return "ok";
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
