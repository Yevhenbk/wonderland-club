import { NextResponse } from "next/server";

import { signIn, signOut } from "@/lib/staff";
import { storeReady } from "@/lib/store";

const MESSAGES = {
  wrong: "Невірний PIN.",
  locked: "Забагато спроб. Зачекай 15 хвилин.",
  off: "Вхід для персоналу вимкнено: не задано STAFF_PIN.",
} as const;

/** Staff sign-in with the door PIN. */
export async function POST(request: Request) {
  if (!storeReady())
    return NextResponse.json(
      { error: "Сховище відміток не підключене (Upstash)." },
      { status: 503 }
    );

  let pin = "";
  try {
    pin = String((await request.json()).pin ?? "").trim().slice(0, 64);
  } catch {
    /* an empty PIN is simply wrong */
  }

  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const result = await signIn(pin, address);

  return result === "ok"
    ? NextResponse.json({ ok: true })
    : NextResponse.json(
        { error: MESSAGES[result] },
        { status: result === "locked" ? 429 : result === "off" ? 503 : 401 }
      );
}

export async function DELETE() {
  await signOut();
  return NextResponse.json({ ok: true });
}
