"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { header, nav, site } from "@/app/content";
import logo from "@/public/media/wonderland-wordmark.png";

import styles from "./site-header.module.scss";

/**
 * The mark and a few links. No ticket button up here: the menu has a
 * "Квитки" link, and the prices section carries the call.
 * Transparent over the hero so it owns the first paint, solid once the page
 * has moved.
 */
export default function SiteHeader() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={styles.header} data-solid={solid || open}>
      <div className={styles.inner}>
        <a
          href="#top"
          className={styles.brand}
          aria-label={site.name}
          onClick={() => setOpen(false)}
        >
          <Image
            src={logo}
            alt=""
            className={styles.logo}
            priority
            sizes="(max-width: 440px) 154px, 195px"
          />
        </a>

        <nav className={styles.nav}>
          {nav.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.right}>
          <button
            type="button"
            className={styles.burger}
            aria-label={header.menuLabel}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span data-open={open} />
          </button>
        </div>
      </div>

      {open && (
        <div
          className={styles.scrim}
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <nav className={styles.sheet}>
          {nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.sheetLink}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
