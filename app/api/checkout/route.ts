import { NextResponse } from "next/server";

import { createSession, validateCart } from "@/lib/orders";

/**
 * Starts a payment: checks the cart and opens a 30-minute session.
 *
 * Stand-in for creating a Stripe Checkout Session. With Stripe, this is
 * where `stripe.checkout.sessions.create` goes (prices from lib/catalog.ts,
 * the email as `customer_email`), and the URL returned is Stripe's.
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
    const session = createSession(result.cart);
    return NextResponse.json({
      url: `/checkout/pay?s=${encodeURIComponent(session)}`,
    });
  } catch (error) {
    console.error("[checkout] could not open a session", error);
    return NextResponse.json(
      { error: "Оплата тимчасово недоступна. Спробуй трохи пізніше." },
      { status: 500 }
    );
  }
}
