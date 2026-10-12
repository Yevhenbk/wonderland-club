import { NextResponse } from "next/server";

import { emailOrder } from "@/lib/email/deliver";
import { claimMock, releaseMock } from "@/lib/inventory";
import { SoldOut } from "@/lib/sold-out";
import {
  forgetPaid,
  fulfil,
  paidOrderUrl,
  readSession,
  rememberPaid,
} from "@/lib/orders";

/**
 * The mock payment went through: issue the passes and email them.
 *
 * Only for tickets not sold through Stripe (VIP for now). Stripe payments
 * are fulfilled by /checkout/success and /api/stripe/webhook instead.
 */
export async function POST(request: Request) {
  let body: { s?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некоректний запит." }, { status: 400 });
  }

  const session = typeof body.s === "string" ? readSession(body.s) : null;
  if (!session)
    return NextResponse.json(
      { error: "Сесія оплати завершилась. Почни, будь ласка, знову." },
      { status: 400 }
    );

  /* Being paid or already paid: the same order, not a second set of passes. */
  const existing = paidOrderUrl(session);
  if (existing) {
    try {
      return NextResponse.json({ url: await existing });
    } catch {
      /* the first attempt failed; fall through and try again */
    }
  }

  /* A VIP zone is taken now, as the money would be: whoever pays first
     gets it, and a second payment for the same last zone is refused. */
  try {
    claimMock(session.item, session.sid);
  } catch (error) {
    if (error instanceof SoldOut)
      return NextResponse.json({ error: error.forBuyer }, { status: 409 });
    throw error;
  }

  const job = (async () => {
    const { order, orderToken } = fulfil(session);
    const origin = (
      process.env.SITE_URL ?? new URL(request.url).origin
    ).replace(/\/$/, "");

    await emailOrder(order, origin);

    return `/order/${orderToken}`;
  })();
  rememberPaid(session, job);

  try {
    return NextResponse.json({ url: await job });
  } catch (error) {
    forgetPaid(session);
    releaseMock(session.item, session.sid);
    console.error("[checkout] could not fulfil the order", error);
    return NextResponse.json(
      { error: "Не вдалося оформити квитки. Спробуй ще раз." },
      { status: 500 }
    );
  }
}
