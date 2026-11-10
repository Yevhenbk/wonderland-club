import Stripe from "stripe";

import { emailOrder } from "./email/deliver";
import { CATALOG, EVENT, isItemId, type ItemId } from "./catalog";
import { fulfil, type Cart, type Order } from "./orders";
import { SoldOut } from "./sold-out";

/**
 * Real payments through Stripe Checkout.
 *
 * Which tickets Stripe sells is set by which price ids are configured
 * (below). A ticket without one, or every ticket when STRIPE_SECRET_KEY is
 * missing, stays on the mock checkout.
 *
 * There is still no database. The Stripe Checkout Session is the record:
 * it holds the cart in its metadata, and the order is rebuilt from it with
 * the session id as the seed, so the return page and the webhook always
 * produce the same passes. Whether the email went out is noted on the
 * payment itself (wl_emailed in its metadata).
 */

const PRICE_ENV: Partial<Record<ItemId, string>> = {
  standard: "STRIPE_PRICE_STANDARD",
  "vip-4-5": "STRIPE_PRICE_VIP_4_5",
  "vip-6-8": "STRIPE_PRICE_VIP_6_8",
  "vip-8-10": "STRIPE_PRICE_VIP_8_10",
};

let client: Stripe | null = null;
function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return (client ??= new Stripe(key));
}

/** The Stripe price for a ticket, or null when it is sold by the mock. */
export function stripePriceFor(item: ItemId): string | null {
  const env = PRICE_ENV[item];
  const price = env ? process.env[env] : undefined;
  return process.env.STRIPE_SECRET_KEY && price ? price : null;
}

/* The price on Stripe must be the price on the page, or buyers would be
   charged something other than what they were shown. If the configured
   price id no longer matches (the page's price changed, say after an early
   bird), the active PLN price on the same Stripe product with the page's
   amount is used instead, so a price change needs no new env value. With
   none matching, buying fails rather than charging the wrong amount.
   Checked once per server, and again after a failure. */
const checkedPrices = new Map<string, Promise<string>>();
function resolvePrice(priceId: string, item: ItemId): Promise<string> {
  const expected = CATALOG[item].price * 100;
  const key = `${priceId}:${expected}`;
  let check = checkedPrices.get(key);
  if (!check) {
    check = stripe()
      .prices.retrieve(priceId)
      .then(async (price) => {
        if (price.active && price.currency === "pln" && price.unit_amount === expected) return price.id;
        const product = typeof price.product === "string" ? price.product : price.product.id;
        const others = await stripe().prices.list({ product, active: true, currency: "pln", limit: 100 });
        const match = others.data.find((other) => other.unit_amount === expected && other.type === "one_time");
        if (match) return match.id;
        throw new Error(
          `No active ${expected / 100} pln price on ${product} (configured ${priceId} is ${price.unit_amount} ${price.currency})`
        );
      });
    check.catch(() => checkedPrices.delete(key));
    checkedPrices.set(key, check);
  }
  return check;
}

/* ------------------------------------------------- limited tickets (VIP) */

/** This night's Checkout Sessions for a ticket that runs out, paid or still
    open (a buyer on Stripe's page), oldest first. */
async function limitedSessions(): Promise<Stripe.Checkout.Session[]> {
  const found: Stripe.Checkout.Session[] = [];
  for (const status of ["complete", "open"] as const)
    for await (const session of stripe().checkout.sessions.list({ status, limit: 100 })) {
      const item = session.metadata?.item;
      if (session.metadata?.event === EVENT.id && isItemId(item) && CATALOG[item].stock)
        found.push(session);
    }
  return found.sort((a, b) => a.created - b.created || (a.id < b.id ? -1 : 1));
}

/** How many of each limited ticket Stripe has sold or is selling now. */
export async function stripeTaken(): Promise<
  Partial<Record<ItemId, { sold: number; held: number }>>
> {
  const taken: Partial<Record<ItemId, { sold: number; held: number }>> = {};
  for (const session of await limitedSessions()) {
    const entry = (taken[session.metadata!.item as ItemId] ??= { sold: 0, held: 0 });
    if (session.status === "complete") entry.sold++;
    else entry.held++;
  }
  return taken;
}

export interface Sales {
  /** Per ticket: orders, tickets (people or zones) and zł. */
  byItem: Partial<Record<ItemId, { orders: number; tickets: number; revenue: number }>>;
  orders: number;
  tickets: number;
  revenue: number;
}

/** What this night has sold through Stripe since a moment (all time if
    omitted): paid Checkout Sessions only, so the dashboard matches Stripe. */
export async function stripeSales(sinceMs?: number): Promise<Sales | null> {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const sales: Sales = { byItem: {}, orders: 0, tickets: 0, revenue: 0 };
  const created = sinceMs ? { gte: Math.floor(sinceMs / 1000) } : undefined;
  for await (const session of stripe().checkout.sessions.list({
    status: "complete",
    limit: 100,
    created,
    expand: ["data.line_items"],
  })) {
    const item = session.metadata?.item;
    if (session.metadata?.event !== EVENT.id || !isItemId(item) || session.payment_status !== "paid") continue;
    /* The paid line says how many: a quick checkout's quantity is chosen on
       Stripe's page, and the price per ticket may have changed since. */
    const revenue = (session.amount_total ?? 0) / 100;
    const tickets = session.line_items?.data.reduce((sum, line) => sum + (line.quantity ?? 0), 0) || Number(session.metadata?.qty) || 1;
    const row = (sales.byItem[item] ??= { orders: 0, tickets: 0, revenue: 0 });
    row.orders++;
    row.tickets += tickets;
    row.revenue += revenue;
    sales.orders++;
    sales.tickets += tickets;
    sales.revenue += revenue;
  }
  return sales;
}

/**
 * One tap from the page to Stripe: no form of ours in between. Stripe asks
 * for the email itself, and the number of tickets can be changed on its
 * page (1 to 10). For tickets that never run out (the standard entry);
 * VIP zones still go through our form, where a zone is held first.
 */
export async function createQuickCheckout(
  item: ItemId,
  priceId: string,
  origin: string
): Promise<string> {
  if (CATALOG[item].stock !== undefined) throw new Error(`${item} is limited`);
  priceId = await resolvePrice(priceId, item);

  const metadata = { item, qty: "1", name: "", event: EVENT.id, origin };
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: priceId,
        quantity: 1,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: CATALOG[item].maxQty },
      },
    ],
    metadata,
    payment_intent_data: {
      metadata,
      description: `${EVENT.title}. ${EVENT.theme}, ${EVENT.date}`,
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#tickets`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });
  if (!session.url) throw new Error("Stripe returned no checkout URL");
  return session.url;
}

/** Opens a Stripe Checkout Session and returns the URL of Stripe's page. */
export async function createStripeCheckout(
  cart: Cart,
  priceId: string,
  origin: string
): Promise<string> {
  priceId = await resolvePrice(priceId, cart.item);

  const stock = CATALOG[cart.item].stock;
  const sameZone = async () =>
    (await limitedSessions()).filter((session) => session.metadata?.item === cart.item);

  /* A zone: count before opening a payment. A buyer who went back from
     Stripe's page and is trying again would otherwise hold a zone against
     themselves, so their own open session is closed first. */
  if (stock !== undefined) {
    const holders = await sameZone();
    const own = holders.filter(
      (session) => session.status === "open" && session.customer_email === cart.email
    );
    await Promise.all(
      own.map((session) => stripe().checkout.sessions.expire(session.id).catch(() => {}))
    );
    const others = holders.filter((session) => !own.includes(session));
    if (others.length >= stock) {
      const paid = others.filter((session) => session.status === "complete").length;
      throw new SoldOut(cart.item, paid < stock);
    }
  }

  const metadata = {
    item: cart.item,
    qty: String(cart.qty),
    name: cart.name,
    event: EVENT.id,
    origin,
  };

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: cart.qty }],
    customer_email: cart.email,
    metadata,
    payment_intent_data: {
      metadata,
      description: `${EVENT.title}. ${EVENT.theme}, ${EVENT.date}`,
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?item=${cart.item}`,
    /* As long as the mock's sessions; 30 minutes is Stripe's minimum. */
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  if (!session.url) throw new Error("Stripe returned no checkout URL");

  /* Two buyers can pass the count above at the same moment for the last
     zone. Counting again now that both sessions exist settles it: they are
     ranked by when they were opened, and whoever is past the number of
     zones closes theirs and is told the zone is gone. */
  if (stock !== undefined) {
    const rank = (await sameZone()).findIndex((held) => held.id === session.id);
    if (rank >= stock) {
      await stripe().checkout.sessions.expire(session.id).catch(() => {});
      throw new SoldOut(cart.item, true);
    }
  }

  return session.url;
}

export type PaidStripeOrder = {
  status: "paid";
  order: Order;
  orderToken: string;
  session: Stripe.Checkout.Session;
};

export type StripeOrder =
  | PaidStripeOrder
  /* Completed, but the money has not arrived yet (a delayed method). */
  | { status: "pending" }
  | { status: "unknown" };

/** Rebuilds the order a Stripe Checkout Session paid for. */
export async function orderFromStripe(sessionId: string): Promise<StripeOrder> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return { status: "unknown" };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });
  } catch {
    return { status: "unknown" };
  }

  const { item, qty, name = "" } = session.metadata ?? {};
  const email = session.customer_details?.email ?? session.customer_email;
  if (!isItemId(item) || !email || session.amount_total === null)
    return { status: "unknown" };

  if (session.payment_status !== "paid")
    return session.status === "complete" ? { status: "pending" } : { status: "unknown" };

  const { order, orderToken } = fulfil({
    item,
    /* The quick checkout lets the buyer change the number on Stripe's page,
       so the paid quantity is read from the line, not from our metadata. */
    qty: session.line_items?.data[0]?.quantity ?? (Number(qty) || 1),
    email: email.toLowerCase(),
    name,
    total: session.amount_total / 100,
    paidAt: session.created * 1000,
    seed: session.id,
  });
  return { status: "paid", order, orderToken, session };
}

/* Emails being sent right now, so the return page and the webhook landing
   on the same server at once send one email. Across servers the flag on
   the payment does that job, all but for a moment's overlap; a database
   with a unique row per order closes that gap. */
const sending = new Map<string, Promise<void>>();

/** Emails the passes once per payment, however many times it is called. */
export function emailOnce({ session, order }: PaidStripeOrder): Promise<void> {
  let job = sending.get(session.id);
  if (!job) {
    job = (async () => {
      const intent = session.payment_intent as Stripe.PaymentIntent | null;
      if (!intent || intent.metadata.wl_emailed) return;

      const flag = (value: string) =>
        stripe().paymentIntents.update(intent.id, { metadata: { wl_emailed: value } });

      await flag(String(Date.now()));
      try {
        const origin =
          session.metadata?.origin ?? process.env.SITE_URL?.replace(/\/$/, "") ?? "";
        await emailOrder(order, origin);
      } catch (error) {
        await flag("").catch(() => {});
        throw error;
      }
    })().finally(() => sending.delete(session.id));
    sending.set(session.id, job);
  }
  return job;
}

/** Checks a webhook's signature and returns the event, or null. */
export function readWebhook(body: string, signature: string | null): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  try {
    return stripe().webhooks.constructEvent(body, signature ?? "", secret);
  } catch {
    return null;
  }
}
