import { NextResponse } from "next/server";

import { dayOf, record, visitorOf } from "@/lib/analytics";
import { availability, invalidateStock } from "@/lib/inventory";
import { createSession, validateCart } from "@/lib/orders";
import { SoldOut } from "@/lib/sold-out";
import { createStripeCheckout, stripePriceFor } from "@/lib/stripe";

/**
 * Starts a payment: checks the cart, then returns where to pay. Tickets
 * with a Stripe price go to Stripe Checkout; the rest to the mock payment
 * page, with a 30-minute session. A VIP zone that is already taken is
 * refused here (and, for the mock, once more when the payment is confirmed).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некоректний запит." }, { status: 400 });
  }

  const result = validateCart(body);
  if (!result.ok)
    return NextResponse.json({ error: result.error }, { status: 400 });

  try {
    const price = stripePriceFor(result.cart.item);
    if (price) {
      const origin = (
        process.env.SITE_URL ?? new URL(request.url).origin
      ).replace(/\/$/, "");
      const url = await createStripeCheckout(result.cart, price, origin);
      invalidateStock();
      await startedPaying(request, result.cart.item);
      return NextResponse.json({ url });
    }

    invalidateStock();
    if ((await availability())[result.cart.item]?.left === 0)
      throw new SoldOut(result.cart.item);

    const session = createSession(result.cart);
    await startedPaying(request, result.cart.item);
    return NextResponse.json({
      url: `/checkout/pay?s=${encodeURIComponent(session)}`,
    });
  } catch (error) {
    if (error instanceof SoldOut)
      return NextResponse.json({ error: error.forBuyer }, { status: 409 });
    console.error("[checkout] could not open a session", error);
    return NextResponse.json(
      { error: "Оплата тимчасово недоступна. Спробуй трохи пізніше." },
      { status: 500 }
    );
  }
}

/* For /dashboard: this visitor reached the payment page. Never allowed to
   get in the way of the purchase itself. */
async function startedPaying(request: Request, item: string) {
  try {
    const day = dayOf();
    const visitor = visitorOf(request, day);
    if (visitor)
      await record(day, visitor, { count: [[`pay:${item}`, 1]], reached: ["pay_start"] });
  } catch (error) {
    console.error("[analytics] could not record a payment start", error);
  }
}
