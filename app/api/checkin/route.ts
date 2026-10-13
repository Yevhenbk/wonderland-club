import { NextResponse } from "next/server";

import { EVENT } from "@/lib/catalog";
import { count } from "@/lib/analytics";
import { checkIn, undoCheckIn } from "@/lib/checkins";
import { readPass } from "@/lib/orders";
import { isStaff } from "@/lib/staff";
import { storeReady } from "@/lib/store";

/**
 * The door's button: lets a pass in (once), or takes back a check-in made a
 * moment ago by mistake. Staff only.
 */
export async function POST(request: Request) {
  if (!(await isStaff()))
    return NextResponse.json({ error: "Лише для персоналу." }, { status: 401 });
  if (!storeReady())
    return NextResponse.json(
      { error: "Сховище відміток не підключене (Upstash)." },
      { status: 503 }
    );

  let body: { token?: unknown; undo?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некоректний запит." }, { status: 400 });
  }

  const claim = typeof body.token === "string" ? readPass(body.token) : null;
  if (!claim || claim.e !== EVENT.id)
    return NextResponse.json({ error: "Квиток недійсний." }, { status: 400 });

  try {
    if (typeof body.undo === "number") {
      const undone = await undoCheckIn(claim.p, body.undo);
      if (undone) await count("door", -1).catch(() => {});
      return NextResponse.json({ undone });
    }
    const result = await checkIn(claim.p);
    /* The night's entries for /dashboard: one per pass let in. */
    if (result.first) await count("door").catch(() => {});
    return NextResponse.json(result);
  } catch (error) {
    console.error("[checkin] store failed", error);
    return NextResponse.json(
      { error: "Не вдалося зберегти відмітку. Спробуй ще раз." },
      { status: 500 }
    );
  }
}
