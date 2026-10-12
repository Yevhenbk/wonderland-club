import { CATALOG, type ItemId } from "./catalog";
import { SoldOut } from "./sold-out";
import { stripePriceFor, stripeTaken } from "./stripe";

/**
 * Tickets that run out: the VIP zones. Each purchase is one whole zone, and
 * once every zone of a size is taken, that size is locked for everyone.
 *
 * Who holds what comes from where the ticket is sold:
 * - Stripe (a ticket with a Stripe price): its Checkout Sessions. A paid one
 *   is sold; an open one is held while its buyer is on Stripe's page, for at
 *   most 30 minutes, so two people cannot pay for the last zone at once.
 * - the mock checkout: a list kept by this server, filled when a mock
 *   payment is confirmed. Fine for testing; it resets on restart.
 */

export interface Stock {
  total: number;
  /** Paid for. */
  sold: number;
  /** Someone is paying for it right now. */
  held: number;
  left: number;
}

export type StockMap = Partial<Record<ItemId, Stock>>;

const limited = () =>
  Object.values(CATALOG).filter((item) => item.stock !== undefined);

/* ------------------------------------------------------- mock checkout */

const mockSold: Map<ItemId, Set<string>> = ((
  globalThis as { __wlMockSold?: Map<ItemId, Set<string>> }
).__wlMockSold ??= new Map());

/** Takes a zone for a mock payment, or throws SoldOut. Paying the same
    session twice keeps its one zone. */
export function claimMock(item: ItemId, sessionId: string) {
  const total = CATALOG[item].stock;
  if (total === undefined) return;
  const holders = mockSold.get(item) ?? new Set<string>();
  if (!holders.has(sessionId) && holders.size >= total) throw new SoldOut(item);
  holders.add(sessionId);
  mockSold.set(item, holders);
  cached = null;
}

/** Gives a zone back, when issuing the passes failed after taking it. */
export function releaseMock(item: ItemId, sessionId: string) {
  mockSold.get(item)?.delete(sessionId);
  cached = null;
}

/* -------------------------------------------------------- availability */

/* Every page view asks, so the answer is kept for a few seconds. Checkout
   never relies on it: it counts again before taking a zone. */
let cached: { at: number; value: Promise<StockMap> } | null = null;
const CACHE_MS = 10_000;

export function invalidateStock() {
  cached = null;
}

async function count(): Promise<StockMap> {
  const items = limited();
  const onStripe = items.filter((item) => stripePriceFor(item.id));
  const taken = onStripe.length ? await stripeTaken() : {};

  return Object.fromEntries(
    items.map((item) => {
      const total = item.stock ?? 0;
      const { sold, held } = stripePriceFor(item.id)
        ? (taken[item.id] ?? { sold: 0, held: 0 })
        : { sold: mockSold.get(item.id)?.size ?? 0, held: 0 };
      return [item.id, { total, sold, held, left: Math.max(0, total - sold - held) }];
    })
  );
}

/** How many of each limited ticket are left. */
export function availability(): Promise<StockMap> {
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    const value = count();
    value.catch(() => (cached = null));
    cached = { at: Date.now(), value };
  }
  return cached.value;
}
