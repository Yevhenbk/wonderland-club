import { NextResponse } from "next/server";

import { emailOnce, orderFromStripe, readWebhook } from "@/lib/stripe";

/**
 * Stripe's word that a payment went through: email the passes.
 *
 * The buyer usually gets there first through /checkout/success, which
 * sends the same email (once, either way). This is what still delivers the
 * tickets when the buyer closes the tab before returning, and for payments
 * that are confirmed later. A failure answers 500, so Stripe tries again.
 */
export async function POST(request: Request) {
  let event;
  try {
    event = readWebhook(await request.text(), request.headers.get("stripe-signature"));
  } catch (error) {
    console.error("[stripe] webhook is not configured", error);
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (!event) return NextResponse.json({ error: "Bad signature" }, { status: 400 });

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    try {
      const result = await orderFromStripe(event.data.object.id);
      if (result.status === "paid") await emailOnce(result);
    } catch (error) {
      console.error("[stripe] could not deliver the order", error);
      return NextResponse.json({ error: "Delivery failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
