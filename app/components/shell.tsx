import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import logo from "@/public/media/wonderland-wordmark.png";

import NightField from "./night-field";
import styles from "./shell.module.scss";

/**
 * The frame for the pages around a purchase (checkout, payment, passes):
 * the landing page's moving field and grain, the logo linking home, and one
 * narrow column, so buying a ticket never feels like leaving the site.
 */
export default function Shell({
  children,
  wide = false,
}: {
  children: ReactNode;
  /** A wider column, for pages that show several passes. */
  wide?: boolean;
}) {
  return (
    <div className={styles.shell}>
      <NightField />
      <span className={styles.grain} aria-hidden="true" />

      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Wonderland Club, на головну">
          <Image src={logo} alt="" className={styles.logo} priority sizes="178px" />
        </Link>
        <Link href="/" className={styles.back}>
          На головну
        </Link>
      </header>

      <main className={wide ? `${styles.main} ${styles.wide}` : styles.main}>
        {children}
      </main>
    </div>
  );
}
