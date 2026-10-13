import { NextResponse } from "next/server";

import { dayOf, isBot, record, visitorOf } from "@/lib/analytics";
import { CATALOG, isItemId } from "@/lib/catalog";
import { createQuickCheckout, stripePriceFor } from "@/lib/stripe";

/**
 * "Купити" for a standard ticket: straight to Stripe's payment page, with no
 * form of ours in between (Stripe asks for the email, and the number of
 * tickets can be changed there). Anything this cannot do (a VIP zone, which
 * must be held first, a ticket without a Stripe price, or Stripe failing)
 * falls back to our checkout form, so a tap never ends in an error page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const item = url.searchParams.get("item") ?? "standard";
  const origin = (process.env.SITE_URL ?? url.origin).replace(/\/$/, "");
  const form = NextResponse.redirect(`${origin}/checkout?item=${isItemId(item) ? item : "standard"}`, 303);

  /* Crawlers follow links; they must not open payment pages. */
  if (isBot(request) || !isItemId(item) || CATALOG[item].stock !== undefined) return form;
  const price = stripePriceFor(item);
  if (!price) return form;

  try {
    const stripeUrl = await createQuickCheckout(item, price, origin);
    try {
      const day = dayOf();
      const visitor = visitorOf(request, day);
      if (visitor) await record(day, visitor, { count: [[`pay:${item}`, 1]], reached: ["pay_start"] });
    } catch (error) {
      console.error("[analytics] could not record a payment start", error);
    }
    return NextResponse.redirect(stripeUrl, 303);
  } catch (error) {
    console.error("[buy] quick checkout failed, falling back to the form", error);
    return form;
  }
}
