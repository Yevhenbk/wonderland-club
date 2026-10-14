"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { nav, site } from "@/app/content";
import logo from "@/public/media/wonderland-wordmark.png";

import styles from "./site-header.module.scss";

/**
 * The header on every page, in two forms.
 *
 * Desktop (wider than 860px): the logo on the left, the links centred and
 * the gold ticket call on the right.
 *
 * Phones and tablets: the gold «Квитки» on the left and a menu button on
 * the right; the logo itself sits in the hero, under the bar. The menu
 * opens a full-screen panel with the sections.
 *
 * Both are fixed: transparent over the top of the page, then a dark,
 * slightly see-through bar once the page has moved.
 */
export default function SiteHeader() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* While the menu is open: the page behind holds still, Escape closes it,
     and it closes by itself if the screen grows to the desktop bar. */
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const desktop = window.matchMedia("(min-width: 861px)");
    const onWide = () => desktop.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onWide);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onWide);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    menuButton.current?.focus();
  };

  return (
    <header className={styles.header} data-solid={solid || undefined} data-open={open || undefined}>
      <div className={styles.inner}>
        <a href="/" className={styles.brand} aria-label={`${site.name}, на головну`}>
          <Image
            src={logo}
            alt=""
            className={styles.logo}
            priority
            sizes="195px"
          />
        </a>

        {/* Phones: the ticket call in the left corner. */}
        <a href="/#tickets" className={`${styles.cta} ${styles.ctaPhone}`}>
          Квитки
        </a>

        <nav className={styles.nav} aria-label="Розділи">
          {nav.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* The right-hand column: the ticket call on desktop. The column
            matches the logo's, so the links sit at the true centre. */}
        <div className={styles.right}>
          <a href="/#tickets" className={styles.cta}>
            Квитки
          </a>
        </div>

        <button
          ref={menuButton}
          type="button"
          className={styles.burger}
          aria-label={open ? "Закрити меню" : "Меню"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id="site-menu" className={styles.menu} hidden={!open}>
        <Image src={logo} alt="" className={styles.menuLogo} sizes="220px" />
        <nav aria-label="Розділи">
          {nav.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.menuLink}
              style={{ animationDelay: `${0.05 + index * 0.05}s` }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a href="/buy?item=standard" className={styles.menuBuy} onClick={() => setOpen(false)}>
          Купити квиток, 40 zł
        </a>
      </div>
    </header>
  );
}
