"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { nav, site } from "@/app/content";
import logo from "@/public/media/wonderland-wordmark.png";

import styles from "./site-header.module.scss";

/**
 * The header on every page, in two forms.
 *
 * Desktop (wider than 860px): a fixed bar, the logo on the left and the
 * links centred, transparent over the hero and solid once the page has
 * moved.
 *
 * Phones and tablets: the logo alone, centred and larger, in a static row
 * that scrolls away with the page. A fixed bar is what let the page show
 * through above it in iPhone Safari, where the address bar floats over the
 * top of the page; with nothing fixed there, that is simply the page
 * scrolling, as on most sites.
 */
export default function SiteHeader() {
  const [solid, setSolid] = useState(false);

  /* Only the fixed desktop bar changes on scroll, so phones skip the
     listener altogether. */
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 861px)");
    const onScroll = () => setSolid(desktop.matches && window.scrollY > 12);
    const watch = () => {
      onScroll();
      if (desktop.matches)
        window.addEventListener("scroll", onScroll, { passive: true });
      else window.removeEventListener("scroll", onScroll);
    };
    watch();
    desktop.addEventListener("change", watch);
    return () => {
      desktop.removeEventListener("change", watch);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={styles.header} data-solid={solid}>
      <div className={styles.inner}>
        <a href="/" className={styles.brand} aria-label={`${site.name}, на головну`}>
          <Image
            src={logo}
            alt=""
            className={styles.logo}
            priority
            sizes="(max-width: 767px) 211px, (max-width: 860px) 235px, 195px"
          />
        </a>

        <nav className={styles.nav} aria-label="Розділи">
          {nav.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Balances the logo's column, so the links sit at the true centre. */}
        <span className={styles.balance} aria-hidden="true" />
      </div>
    </header>
  );
}
