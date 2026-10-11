import type { Metadata } from "next";
import Link from "next/link";

import PassCard from "@/app/components/pass/pass-card";
import PrintButton from "@/app/components/pass/print-button";
import Shell from "@/app/components/shell";
import { CATALOG } from "@/lib/catalog";
import { emailPreviewEnabled } from "@/lib/email/preview";
import { maskEmail, passToken, readOrder } from "@/lib/orders";
import { siteOrigin } from "@/lib/origin";
import { qrSvg } from "@/lib/qr";

import styles from "./order.module.scss";

export const metadata: Metadata = {
  title: "Твої квитки. Wonderland Club",
  robots: { index: false },
};

/**
 * Where the buyer lands after paying: the passes, ready to show or save,
 * and a note that the same passes went to their email. The link itself is
 * the order (sealed), so it keeps working from the browser history.
 */
export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = readOrder(decodeURIComponent(token));

  if (!order)
    return (
      <Shell>
        <div className={styles.intro}>
          <h1 className={styles.title}>Замовлення не знайдено</h1>
          <p className={styles.lead}>
            Посилання пошкоджене або неповне. Квитки також є у листі, який ми
            надіслали після оплати.
          </p>
          <Link href="/" className={styles.link}>
            На головну
          </Link>
        </div>
      </Shell>
    );

  const origin = await siteOrigin();
  const passes = await Promise.all(
    order.passes.map(async (pass) => {
      const passTok = passToken(order, pass);
      return {
        pass,
        href: `/pass/${passTok}`,
        view: {
          code: pass.code,
          item: pass.item,
          name: order.name,
          qrSvg: await qrSvg(`${origin}/verify/${passTok}`),
        },
      };
    })
  );
  const item = CATALOG[order.item];
  const count = passes.length;

  return (
    <Shell wide>
      <div className={styles.intro}>
        <span className={styles.check} aria-hidden="true" />
        <h1 className={styles.title}>Оплату підтверджено</h1>
        <p className={styles.lead}>
          {count === 1 ? "Твій квиток нижче." : `Твої квитки (${count}) нижче.`}{" "}
          Ми також надіслали {count === 1 ? "його" : "їх"} на{" "}
          <strong>{maskEmail(order.email)}</strong>.
        </p>
        <p className={styles.meta}>
          Замовлення {order.id}, {item.name}: {item.detail}
          {item.maxQty > 1 ? ` × ${order.qty}` : ""}, {order.total} zł
        </p>
        {emailPreviewEnabled() && (
          <a
            className={styles.devLink}
            href={`/api/dev/outbox?id=${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Переглянути лист (тестовий режим)
          </a>
        )}
      </div>

      <ol className={styles.passes} data-count={count}>
        {passes.map(({ pass, href, view }, index) => (
          <li key={pass.id}>
            <PassCard pass={view} index={index} count={count} />
            <Link href={href} className={styles.link}>
              Відкрити окремо
            </Link>
          </li>
        ))}
      </ol>

      <div className={styles.actions}>
        <PrintButton
          label={count === 1 ? "Зберегти або роздрукувати" : "Зберегти або роздрукувати всі"}
        />
        <p className={styles.note}>
          Покажи QR-код на вході з телефона або роздрукованим. Кожен код
          проходить один раз.
        </p>
      </div>
    </Shell>
  );
}
