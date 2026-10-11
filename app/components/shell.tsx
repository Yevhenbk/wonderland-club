import type { ReactNode } from "react";

import NightField from "./night-field";
import SiteHeader from "./site-header";
import styles from "./shell.module.scss";

/**
 * The frame for the pages around a purchase (checkout, payment, passes):
 * the landing page's moving field and grain, the same header as every page,
 * and one narrow column, so buying a ticket never feels like leaving the site.
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

      <SiteHeader />

      <main className={wide ? `${styles.main} ${styles.wide}` : styles.main}>
        {children}
      </main>
    </div>
  );
}
