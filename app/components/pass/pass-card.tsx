import Image from "next/image";

import { CATALOG, EVENT, type ItemId } from "@/lib/catalog";
import logo from "@/public/media/wonderland-wordmark.png";

import styles from "./pass-card.module.scss";

export interface PassView {
  code: string;
  item: ItemId;
  /** Holder's name; empty when the buyer left it out. */
  name: string;
  /** Inline SVG of the QR, which opens the door check. */
  qrSvg: string;
}

/**
 * One pass: a ticket stub with the event above a perforated line and the QR
 * below it. The two halves are separate boxes, each with its notches cut at
 * the edge they share, so the notches always meet the tear line exactly.
 * The QR sits on white whatever the theme, because scanners need the
 * contrast. Rendered on the server: it is static and prints as is.
 */
export default function PassCard({
  pass,
  index,
  count,
}: {
  pass: PassView;
  index?: number;
  count?: number;
}) {
  const item = CATALOG[pass.item];
  const isGroup = item.maxQty === 1;

  return (
    <article className={styles.pass} data-group={isGroup || undefined}>
      <div className={styles.top}>
        <div className={styles.head}>
          <Image src={logo} alt="Wonderland Club" className={styles.logo} sizes="150px" />
          {count && count > 1 && index !== undefined && (
            <span className={styles.count}>
              {index + 1} / {count}
            </span>
          )}
        </div>

        <p className={styles.eyebrow}>{EVENT.title}</p>
        <h2 className={styles.type}>
          {item.name}
          <span className={styles.detail}>{item.detail}</span>
        </h2>

        <dl className={styles.rows}>
          <div>
            <dt>Дата</dt>
            <dd>{EVENT.date}</dd>
          </div>
          <div>
            <dt>Локація</dt>
            <dd>{EVENT.venue}</dd>
          </div>
          <div>
            <dt>Вхід</dt>
            <dd>{item.passLabel}</dd>
          </div>
          {pass.name && (
            <div>
              <dt>Ім&apos;я</dt>
              <dd>{pass.name}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className={styles.bottom}>
        <div
          className={styles.qr}
          role="img"
          aria-label={`QR-код квитка ${pass.code}`}
          dangerouslySetInnerHTML={{ __html: pass.qrSvg }}
        />
        <p className={styles.code}>{pass.code}</p>
        <p className={styles.hint}>Покажи цей код на вході</p>
      </div>
    </article>
  );
}
