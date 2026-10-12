import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import Shell from "@/app/components/shell";
import { emailOnce, orderFromStripe } from "@/lib/stripe";

import styles from "../../order/[token]/order.module.scss";

export const metadata: Metadata = {
  title: "Оплата. Wonderland Club",
  robots: { index: false },
};

/**
 * Where Stripe sends the buyer after paying. It checks the payment with
 * Stripe itself (the link alone proves nothing), emails the passes if the
 * webhook has not yet, and moves on to the order page.
 */
export default async function StripeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const result = session_id
    ? await orderFromStripe(session_id)
    : ({ status: "unknown" } as const);

  if (result.status === "paid") {
    /* The tickets are on the next page either way, so a failed email does
       not stop the buyer; the webhook tries it again. */
    await emailOnce(result).catch((error) =>
      console.error("[stripe] email from the return page failed", error)
    );
    redirect(`/order/${encodeURIComponent(result.orderToken)}`);
  }

  return (
    <Shell>
      <div className={styles.intro}>
        {result.status === "pending" ? (
          <>
            <h1 className={styles.title}>Оплата обробляється</h1>
            <p className={styles.lead}>
              Банк ще підтверджує платіж. Щойно він пройде, квитки з QR-кодом
              прийдуть на твій email.
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Оплату не знайдено</h1>
            <p className={styles.lead}>
              Якщо гроші списано, квитки прийдуть на email протягом кількох
              хвилин. Якщо ні, спробуй купити ще раз.
            </p>
          </>
        )}
        <Link href="/" className={styles.link}>
          На головну
        </Link>
      </div>
    </Shell>
  );
}
