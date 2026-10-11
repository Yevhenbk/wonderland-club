import type { CSSProperties } from "react";

import { nextNight, nights, tickets, zl, type Ramp } from "@/app/content";

import MediaSlot from "./media-slot";
import styles from "./nights-rail.module.scss";

function rampVariables(ramp: Ramp): CSSProperties {
  return {
    "--tint-from": ramp.from,
    "--tint-mid": ramp.mid,
    "--tint-mid2": ramp.mid2,
    "--tint-to": ramp.to,
  } as CSSProperties;
}

/**
 * The next night gets a wide card of its own, the way the flagship product
 * does; the nights that already happened follow as a grid, each carrying its
 * own colour in a band across the head where nothing has to be read over it.
 */
export default function NightsRail({ ticketHref }: { ticketHref: string }) {
  return (
    <div className={styles.rail}>
      <article
        className={styles.hero}
        style={rampVariables(nights.flagshipRamp)}
      >
        <div className={styles.heroBody}>
          <p className={styles.heroEyebrow}>
            {nextNight.label} {nextNight.number}
          </p>
          <h3 className={styles.heroName}>{nextNight.theme}</h3>
          <dl className={styles.facts}>
            {nextNight.rows.map((row) => (
              <div key={row.k}>
                <dt>{row.k}</dt>
                <dd>
                  {row.href ? (
                    <a href={row.href} target="_blank" rel="noopener noreferrer">
                      {row.v}
                    </a>
                  ) : (
                    row.v
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.buy}>
          <span className={styles.buyKicker}>Квитки від</span>
          <span className={styles.buyBig}>
            {zl(tickets.standard.tiers[0].price)}
          </span>
          <a href={ticketHref} className={styles.buyCta}>
            {nextNight.cta}{" "}
            &rarr;
          </a>
          <span className={styles.buyNote}>{nextNight.note}</span>
        </div>
      </article>

      {/* Hidden until there is a night to look back on. */}
      {nights.past.length > 0 && (
        <>
          <p className={styles.pastLabel}>{nights.pastLabel}</p>
          <ul className={styles.grid}>
            {nights.past.map((night) => (
              <li
                key={night.slug}
                className={styles.card}
                style={rampVariables(night.ramp)}
              >
                <div className={styles.stage}>
                  <span className={styles.stageBlobs} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <div className={styles.stageText}>
                    <span className={styles.cardNumber}>{night.number}</span>
                    <h3 className={styles.cardName}>{night.name}</h3>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <MediaSlot
                    media={night.media}
                    label={night.number}
                    className={styles.cardMedia}
                  />
                  <p className={styles.cardLine}>{night.line}</p>
                  <span className={styles.cardDate}>{night.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
