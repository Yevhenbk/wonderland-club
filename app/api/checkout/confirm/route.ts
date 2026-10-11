import { NextResponse } from "next/server";

import { renderTicketEmail } from "@/lib/email/ticket-email";
import { sendEmail } from "@/lib/email/send";
import {
  forgetPaid,
  fulfil,
  paidOrderUrl,
  passToken,
  readSession,
  rememberPaid,
} from "@/lib/orders";
import { qrPng } from "@/lib/qr";

/**
 * The payment went through: issue the passes and email them.
 *
 * Stand-in for Stripe's `checkout.session.completed` webhook. With Stripe,
 * this logic moves into the webhook handler (after verifying Stripe's
 * signature), and the buyer is sent to the order page by Stripe's
 * success_url. Each pass's QR opens /verify/<token>, which the door can
 * check with any phone camera.
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

  const job = (async () => {
    const { order, orderToken } = fulfil(session);
    const origin = (
      process.env.SITE_URL ?? new URL(request.url).origin
    ).replace(/\/$/, "");

    const passes = await Promise.all(
      order.passes.map(async (pass) => {
        const token = passToken(order, pass);
        return {
          pass,
          url: `${origin}/pass/${token}`,
          qrSrc: await qrPng(`${origin}/verify/${token}`),
        };
      })
    );

    const email = renderTicketEmail(order, passes, origin);
    await sendEmail({ to: order.email, ...email, ref: order.id });

    return `/order/${orderToken}`;
  })();
  rememberPaid(session, job);

  try {
    return NextResponse.json({ url: await job });
  } catch (error) {
    forgetPaid(session);
    console.error("[checkout] could not fulfil the order", error);
    return NextResponse.json(
      { error: "Не вдалося оформити квитки. Спробуй ще раз." },
      { status: 500 }
    );
  }
}
