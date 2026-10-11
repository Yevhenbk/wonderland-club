import Image from "next/image";

import { site } from "@/app/content";
import logo from "@/public/media/wonderland-wordmark.png";

import styles from "./site-header.module.scss";

/**
 * The header on every page: the logo, centred, linking home. Nothing else.
 *
 * It is static, part of the page, and scrolls away with it. A fixed bar was
 * what let the page show through above it in iPhone Safari, where the
 * address bar floats over the top of the page; with nothing fixed there,
 * what Safari shows behind its bar is simply the page scrolling, as on most
 * sites.
 */
export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <a href="/" className={styles.brand} aria-label={`${site.name}, на головну`}>
        <Image
          src={logo}
          alt=""
          className={styles.logo}
          priority
          sizes="(max-width: 767px) 211px, 235px"
        />
      </a>
    </header>
  );
}
