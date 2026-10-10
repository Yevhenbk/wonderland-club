import type { CSSProperties } from "react";

import { tickets } from "@/app/content";

import styles from "./tickets.module.scss";

type Plan = (typeof tickets)["standard"] | (typeof tickets)["vip"];

/**
 * The prices, as two cards side by side: the standard entry and the group
 * option. Every price is a row on a hairline, so the two cards read as one
 * price list; the cheapest way in (online) is the one figure set in the
 * logo's rose gold.
 */
export default function Tickets({
  href,
  pending,
}: {
  /** Where the buy buttons go: the shop once sales open, otherwise the
      channel that announces them. */
  href: string;
  /** No shop link yet: the buttons say so instead of promising a purchase. */
  pending: boolean;
}) {
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
                <dt>{tier.k}</dt>
                <dd>{tier.v}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.note}>{plan.note}</p>

          <a
            href={href}
            className={styles.cta}
            {...(href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            data-cta
          >
            {pending ? tickets.ctaPending : tickets.cta}
          </a>
        </article>
      ))}
    </div>
  );
}
