import type { Metadata } from "next";

import DoorCheck from "@/app/components/pass/door-check";
import Shell from "@/app/components/shell";
import { CATALOG, EVENT } from "@/lib/catalog";
import { checkedInAt } from "@/lib/checkins";
import { readPass } from "@/lib/orders";
import { isStaff } from "@/lib/staff";

import styles from "./verify.module.scss";

export const metadata: Metadata = {
  title: "Перевірка квитка. Wonderland Club",
  robots: { index: false },
};

/**
 * What the door sees after scanning a pass with any phone camera: whether
 * the pass is genuine (its signature checks out), for which night, and
 * whether it has already come in. Staff (signed in with the door PIN) get
 * the «Впустити» button, which lets each pass in once.
 */
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const raw = decodeURIComponent(token);
  const claim = readPass(raw);
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

  /* If the store cannot be read, the pass still shows as genuine; staff are
     told to check by hand rather than shown a green they cannot trust. */
  let usedAt: number | null = null;
  let storeDown = false;
  try {
    usedAt = await checkedInAt(claim.p);
  } catch {
    storeDown = true;
  }

  return (
    <Shell>
      <DoorCheck
        token={raw}
        usedAt={usedAt}
        staff={await isStaff()}
        storeDown={storeDown}
      >
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
              {EVENT.title}. {EVENT.theme}, {EVENT.date}
            </dd>
          </div>
          <div>
            <dt>Замовлення</dt>
            <dd>{claim.o}</dd>
          </div>
        </dl>
      </DoorCheck>
    </Shell>
  );
}
