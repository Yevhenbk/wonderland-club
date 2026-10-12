import { CATALOG, EVENT, isItemId, type ItemId } from "./catalog";
import { derivedId, randomId, seal, sign, unseal, verify } from "./tokens";

/**
 * Checkout without a database: every step's state travels in a token.
 *
 *   cart  --createSession-->  session token (sealed, 30 min)
 *         --fulfil-->         order token (sealed) + one pass token per pass
 *
 * Tickets sold through Stripe skip the session token: the Stripe Checkout
 * Session plays that part, and `fulfil` builds the order from it with the
 * Stripe session id as the seed (lib/stripe.ts). A database later changes
 * where orders live, not their shape: orders and passes get rows, which is
 * also what marking a pass as used at the door needs.
 */

const SESSION_MINUTES = 30;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface Cart {
  item: ItemId;
  qty: number;
  email: string;
  name: string;
}

export interface Session extends Cart {
  v: 1;
  /** Identifies the session, so paying it twice issues one order. */
  sid: string;
  total: number;
  exp: number;
}

export interface Pass {
  id: string;
  /** What the door reads out: WL-XXXX-XXXX. */
  code: string;
  item: ItemId;
}

export interface Order {
  v: 1;
  id: string;
  email: string;
  name: string;
  item: ItemId;
  qty: number;
  total: number;
  paidAt: number;
  passes: Pass[];
}

/** What a pass's QR carries. No email: it is readable by anyone. */
export interface PassClaim {
  v: 1;
  p: string; // pass id
  c: string; // code
  i: ItemId;
  e: string; // event id
  o: string; // order id
  n: string; // holder's name, may be empty
}

export type CartResult = { ok: true; cart: Cart } | { ok: false; error: string };

/** Checks what the buyer sent. Prices are not accepted from the browser. */
export function validateCart(input: unknown): CartResult {
  const data = (input ?? {}) as Record<string, unknown>;

  if (!isItemId(data.item)) return { ok: false, error: "Обери квиток." };
  const item = CATALOG[data.item];

  const qty = Number(data.qty ?? 1);
  if (!Number.isInteger(qty) || qty < 1 || qty > item.maxQty)
    return {
      ok: false,
      error:
        item.maxQty === 1
          ? "VIP-група купується по одній."
          : `Можна від 1 до ${item.maxQty} квитків.`,
    };

  const email = String(data.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 120)
    return { ok: false, error: "Перевір email: на нього прийдуть квитки." };

  const name = String(data.name ?? "").trim().slice(0, 60);

  return { ok: true, cart: { item: item.id, qty, email, name } };
}

export const totalOf = (cart: Pick<Cart, "item" | "qty">) =>
  CATALOG[cart.item].price * cart.qty;

export function createSession(cart: Cart): string {
  const session: Session = {
    v: 1,
    sid: randomId(16),
    ...cart,
    total: totalOf(cart),
    exp: Date.now() + SESSION_MINUTES * 60_000,
  };
  return seal(session, "session");
}

export function readSession(token: string): Session | null {
  const session = unseal<Session>(token, "session");
  if (!session || session.v !== 1 || session.exp < Date.now()) return null;
  return session;
}

/* Sessions being paid or already paid, so a second confirm (a double click,
   a refresh, a back button) gets the same order instead of new passes. The
   entry is a promise registered before any work starts, so two requests
   arriving at the same moment share one fulfilment. Kept in memory for the
   session's lifetime: enough for one server. With Stripe and a database this
   becomes a unique constraint on the Stripe session id. */
type PaidEntry = { url: Promise<string>; exp: number };
const paid: Map<string, PaidEntry> = ((
  globalThis as { __wlPaidSessions?: Map<string, PaidEntry> }
).__wlPaidSessions ??= new Map());

export function paidOrderUrl(session: Session): Promise<string> | null {
  for (const [sid, entry] of paid) if (entry.exp < Date.now()) paid.delete(sid);
  return paid.get(session.sid)?.url ?? null;
}

export function rememberPaid(session: Session, url: Promise<string>) {
  paid.set(session.sid, { url, exp: session.exp });
}

export function forgetPaid(session: Session) {
  paid.delete(session.sid);
}

/** What a payment covered, from a mock session or a Stripe one. */
export interface Paid extends Cart {
  total: number;
  paidAt?: number;
  /** Makes the order's ids repeatable: the same seed, the same passes. */
  seed?: string;
}

/** A payment becomes an order: one pass per person (standard) or one per
    group (VIP). */
export function fulfil(paid: Paid): { order: Order; orderToken: string } {
  const id = (label: string, length: number) =>
    paid.seed ? derivedId(`${paid.seed}:${label}`, length) : randomId(length);

  const passes: Pass[] = Array.from({ length: paid.qty }, (_, index) => {
    const code = id(`code${index}`, 8);
    return {
      id: id(`pass${index}`, 12),
      code: `WL-${code.slice(0, 4)}-${code.slice(4)}`,
      item: paid.item,
    };
  });

  const order: Order = {
    v: 1,
    id: id("order", 10),
    email: paid.email,
    name: paid.name,
    item: paid.item,
    qty: paid.qty,
    total: paid.total,
    paidAt: paid.paidAt ?? Date.now(),
    passes,
  };

  return { order, orderToken: seal(order, "order") };
}

export function readOrder(token: string): Order | null {
  const order = unseal<Order>(token, "order");
  return order && order.v === 1 ? order : null;
}

export function passToken(order: Order, pass: Pass): string {
  const claim: PassClaim = {
    v: 1,
    p: pass.id,
    c: pass.code,
    i: pass.item,
    e: EVENT.id,
    o: order.id,
    n: order.name,
  };
  return sign(claim, "pass");
}

export function readPass(token: string): PassClaim | null {
  const claim = verify<PassClaim>(token, "pass");
  if (!claim || claim.v !== 1 || !isItemId(claim.i)) return null;
  return claim;
}

/** "an***@gmail.com": enough to recognise, not enough to harvest. */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  return `${user.slice(0, 2)}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}
