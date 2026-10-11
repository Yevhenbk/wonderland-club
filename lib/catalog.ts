import {
  nextNight,
  tickets,
  venue,
  type SellableTier,
} from "@/app/content";

/**
 * What can be bought online, built from the prices on the page
 * (app/content.ts), so the price shown and the price charged come from one
 * place. Checkout only ever trusts these numbers, never ones sent by the
 * browser.
 */

export type ItemId = SellableTier["id"];

export interface CatalogItem {
  id: ItemId;
  /** "Стандарт" or "VIP-група". */
  name: string;
  /** What exactly is bought: "Вхідний квиток" or "4-5 людей". */
  detail: string;
  /** zł, per unit. */
  price: number;
  /** How many units one order may hold. */
  maxQty: number;
  /** One pass per unit: a person for standard, a whole group for VIP. */
  passLabel: string;
}

const sellable = (tiers: readonly { price: number }[]) =>
  tiers.filter((tier): tier is SellableTier => "id" in tier);

export const CATALOG: Record<ItemId, CatalogItem> = Object.fromEntries([
  ...sellable(tickets.standard.tiers).map((tier) => [
    tier.id,
    {
      id: tier.id,
      name: tickets.standard.eyebrow,
      detail: tickets.standard.name,
      price: tier.price,
      maxQty: 10,
      passLabel: "1 особа",
    },
  ]),
  ...sellable(tickets.vip.tiers).map((tier) => [
    tier.id,
    {
      id: tier.id,
      name: tickets.vip.eyebrow,
      detail: tier.k,
      price: tier.price,
      maxQty: 1,
      passLabel: `Група, ${tier.k}`,
    },
  ]),
]) as Record<ItemId, CatalogItem>;

export const isItemId = (value: unknown): value is ItemId =>
  typeof value === "string" && value in CATALOG;

/** The night these tickets are for, as the passes and the email name it. */
export const EVENT = {
  id: nextNight.eventId,
  title: `${nextNight.label} ${nextNight.number}`,
  date: nextNight.dateLong,
  time: nextNight.time,
  theme: nextNight.theme,
  venueName: venue.name,
  venue: `${venue.address}, ${venue.city}`,
  /* The two parts on their own, for cards that drop the city on a phone. */
  venueStreet: venue.address,
  venueCity: venue.city,
  mapsHref: venue.mapsHref,
};
