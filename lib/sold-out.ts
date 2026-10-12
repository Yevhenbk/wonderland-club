import type { ItemId } from "./catalog";

/** Thrown when the last of a limited ticket (a VIP zone) is taken: paid
    for, or `held` while someone else is on Stripe's payment page. */
export class SoldOut extends Error {
  constructor(
    item: ItemId,
    readonly held = false
  ) {
    super(`${item} is ${held ? "held" : "sold out"}`);
  }

  /** What the buyer reads. A held zone may still come free. */
  get forBuyer() {
    return this.held
      ? "Цю VIP-зону саме зараз оплачує інша компанія. Спробуй за пів години або обери іншу."
      : "Цю VIP-зону вже викупили. Обери іншу або напиши нам в Instagram.";
  }
}
