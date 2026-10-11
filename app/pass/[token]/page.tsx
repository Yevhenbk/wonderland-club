import type { Metadata } from "next";
import Link from "next/link";

import PassCard from "@/app/components/pass/pass-card";
import PrintButton from "@/app/components/pass/print-button";
import Shell from "@/app/components/shell";
import { readPass } from "@/lib/orders";
import { siteOrigin } from "@/lib/origin";
import { qrSvg } from "@/lib/qr";

import styles from "./pass.module.scss";

export const metadata: Metadata = {
  title: "Квиток. Wonderland Club",
  robots: { index: false },
};

/** One pass on its own: the link in the email, and what to open at the door. */
export default async function PassPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const raw = decodeURIComponent(token);
  const claim = readPass(raw);

  if (!claim)
    return (
      <Shell>
        <div className={styles.missing}>
          <h1 className={styles.title}>Квиток не знайдено</h1>
          <p className={styles.lead}>
            Посилання пошкоджене або неповне. Відкрий квиток з листа, який
            прийшов після оплати.
          </p>
          <Link href="/" className={styles.link}>
            На головну
          </Link>
        </div>
      </Shell>
    );

  const origin = await siteOrigin();

  return (
    <Shell>
      <PassCard
        pass={{
          code: claim.c,
          item: claim.i,
          name: claim.n,
          qrSvg: await qrSvg(`${origin}/verify/${raw}`),
        }}
      />
      <div className={styles.actions}>
        <PrintButton />
        <p className={styles.note}>
          Порада: збільш яскравість екрана, коли показуєш код на вході.
        </p>
      </div>
    </Shell>
  );
}
