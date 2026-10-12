import type { CSSProperties } from "react";

import { tickets, type SellableTier } from "@/app/content";

import styles from "./tickets.module.scss";
import Price from "./price";
import { StockBadge, VipBuy } from "./vip-stock";

type Plan = (typeof tickets)["standard"] | (typeof tickets)["vip"];

/**
 * The prices, as two cards side by side: the standard entry and the group
 * option. Every price is a row on a hairline, so the two cards read as one
 * price list; the cheapest way in (online) is the one figure set in the
 * logo's rose gold. Each card's button opens checkout with its ticket
 * already chosen. VIP zones are limited, so each size shows how many are
 * left, and the button skips sizes that are gone.
 */
export default function Tickets() {
  const plans: { plan: Plan; tint: CSSProperties }[] = [
    {
      plan: tickets.standard,
      tint: { "--card-glow": "rgb(214, 142, 133)" } as CSSProperties,
    },
    {
      plan: tickets.vip,
      tint: { "--card-glow": "rgb(88, 122, 176)" } as CSSProperties,
    },
  ];

  return (
    <div className={styles.grid}>
      {plans.map(({ plan, tint }) => (
        <article key={plan.eyebrow} className={styles.card} style={tint}>
          <p className={styles.eyebrow}>{plan.eyebrow}</p>
          <h3 className={styles.name}>{plan.name}</h3>

          <dl className={styles.tiers}>
            {plan.tiers.map((tier) => (
              <div
                key={tier.k}
                className={"best" in tier && tier.best ? styles.best : undefined}
              >
                <dt>
                  {tier.k}
                  {"stock" in tier && tier.stock !== undefined && (
                    <StockBadge item={tier.id} />
                  )}
                </dt>
                <dd>
                  <Price value={tier.price} />
                </dd>
              </div>
            ))}
          </dl>

          <p className={styles.note}>{plan.note}</p>

          {plan === tickets.vip ? (
            <VipBuy
              items={plan.tiers
                .filter((tier): tier is SellableTier => "id" in tier)
                .map((tier) => tier.id)}
              checkoutPath={tickets.checkoutPath}
              className={styles.cta}
            >
              {tickets.cta}
            </VipBuy>
          ) : (
            <a
              href={`${tickets.checkoutPath}?item=${plan.buyItem}`}
              className={styles.cta}
            >
              {tickets.cta}
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
