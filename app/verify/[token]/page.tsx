import type { Metadata } from "next";

import Shell from "@/app/components/shell";
import { CATALOG, EVENT } from "@/lib/catalog";
import { readPass } from "@/lib/orders";

import styles from "./verify.module.scss";

export const metadata: Metadata = {
  title: "Перевірка квитка. Wonderland Club",
  robots: { index: false },
};

/**
 * What the door sees after scanning a pass with any phone camera: whether
 * the pass is genuine (its signature checks out) and for which night.
 *
 * It cannot yet tell whether the pass was already used: that needs the
 * database that comes with the real payments. Until then, the door keeps
 * its own list of codes that have come in.
 */
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const claim = readPass(decodeURIComponent(token));
  const valid = claim !== null && claim.e === EVENT.id;

  if (!valid || !claim)
    return (
      <Shell>
        <div className={styles.card} data-state="invalid">
          <span className={styles.icon} aria-hidden="true">
            ✕
          </span>
          <h1 className={styles.title}>Квиток недійсний</h1>
          <p className={styles.lead}>
            {claim
              ? "Цей квиток на іншу подію."
              : "Код підроблений, пошкоджений або не наш. Не пропускати."}
          </p>
        </div>
      </Shell>
    );

  const item = CATALOG[claim.i];

  return (
    <Shell>
      <div className={styles.card} data-state="valid">
        <span className={styles.icon} aria-hidden="true">
          ✓
        </span>
        <h1 className={styles.title}>Квиток дійсний</h1>
        <p className={styles.code}>{claim.c}</p>

        <dl className={styles.rows}>
          <div>
            <dt>Вхід</dt>
            <dd>
              {item.name}: {item.passLabel}
            </dd>
          </div>
          {claim.n && (
            <div>
              <dt>Ім&apos;я</dt>
              <dd>{claim.n}</dd>
            </div>
          )}
          <div>
            <dt>Подія</dt>
            <dd>
              {EVENT.title}, {EVENT.date}
            </dd>
          </div>
          <div>
            <dt>Замовлення</dt>
            <dd>{claim.o}</dd>
          </div>
        </dl>

        <p className={styles.note}>
          Справжність перевірено. Позначка «вже пройшов» з&apos;явиться разом
          з базою даних; до того звіряй код зі списком на вході.
        </p>
      </div>
    </Shell>
  );
}
