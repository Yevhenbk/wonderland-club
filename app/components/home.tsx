"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  aftermovie,
  bar,
  faq,
  final,
  gallery,
  hero,
  nextNight,
  nights,
  quote,
  site,
  tickets,
  why,
  worlds,
} from "@/app/content";

import logo from "@/public/media/wonderland-wordmark.png";

import FaqItem from "./faq-item";
import MediaSlot from "./media-slot";
import NightField from "./night-field";
import NightsRail from "./nights-rail";
import SiteHeader from "./site-header";
import Tickets from "./tickets";
import styles from "./home.module.scss";

/** Where the sales start is announced; the buy buttons lead here until the
    ticket shop link is set. */
const FOLLOW_HREF = site.socials[0].href;

/* Opens outside links in a new tab, keeps in-page anchors in place. */
const external = (href: string) =>
  href.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

export default function Home() {
  const ticketRef = useRef<HTMLDivElement>(null);

  const scrollToTicket = () =>
    ticketRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  const scrollToPrices = () =>
    document
      .getElementById("tickets")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* The phone bar: arms once the ticket card has left the screen and stands
     down whenever the card or any other gold call is back in view, so the
     page never shows two gold surfaces at once. */
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const targets = [
      ticketRef.current,
      ...Array.from(document.querySelectorAll("[data-cta]")),
    ].filter((node): node is Element => !!node);

    const state = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          state.set(entry.target, entry.isIntersecting)
        );
        setShowBar(![...state.values()].some(Boolean));
      },
      { rootMargin: "-8% 0px -12% 0px" }
    );
    targets.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  /* With a shop link, every ticket call buys. Without one, the calls about
     the night lead to the prices, and the buy buttons under the prices lead
     to where the sales start will be announced. */
  const salesOpen = nextNight.ticketsHref !== null;
  const ticketHref = nextNight.ticketsHref ?? "#tickets";
  const buyHref = nextNight.ticketsHref ?? FOLLOW_HREF;
  /* The marquee slides by exactly half its width and jumps back, so each
     half has to be wider than any screen or its end shows. One run of the
     four words is ~1000px; four runs per half clear a 4K-wide window. */
  const TICKER_RUNS_PER_HALF = 4;
  const tickerWords = Array.from(
    { length: TICKER_RUNS_PER_HALF * 2 },
    () => hero.ticker
  ).flat();
  const [leadShot, ...shots] = gallery.items;

  return (
    <div className={styles.page} id="top">
      <NightField />
      <span className={styles.grain} aria-hidden="true" />
      <SiteHeader onTickets={scrollToPrices} />

      {/* --------------------------------------------------------- hero */}
      <section className={styles.hero}>
        <span className={styles.heroAura} aria-hidden="true" />

        <div className={styles.heroCenter}>
          <p className={styles.label}>{hero.eyebrow}</p>
          <h1 className={`${styles.h1} ${styles.grad}`}>{hero.title}</h1>
          <p className={styles.heroSub}>{hero.sub}</p>

          {/* The calculator card's place: the one object on the first
              screen that does any work. */}
          <div className={styles.ticketCard} ref={ticketRef}>
            <div className={styles.ticketHead}>
              <span className={styles.ticketKicker}>
                {nextNight.label} {nextNight.number}
              </span>
              <span className={styles.ticketLive} aria-hidden="true" />
            </div>
            <p className={styles.ticketTheme}>{nextNight.theme}</p>
            <dl className={styles.ticketRows}>
              {nextNight.rows.map((row) => (
                <div key={row.k}>
                  <dt>{row.k}</dt>
                  <dd>
                    {row.href ? (
                      <a href={row.href} {...external(row.href)}>
                        {row.v}
                      </a>
                    ) : (
                      row.v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href={ticketHref}
              className={styles.ticketBtn}
              {...external(ticketHref)}
            >
              {salesOpen ? nextNight.cta : nextNight.ctaPending}
            </a>
          </div>

          <p className={styles.heroGet}>{nextNight.note}</p>
        </div>

        <div className={styles.tickerWrap} aria-hidden="true">
          <div className={styles.ticker}>
            {tickerWords.map((word, index) => (
              <span key={index} className={styles.tickerItem}>
                {word}
                <span className={styles.tickerStar}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- why */}
      <section className={styles.section} id="why">
        <div className={styles.splitTop}>
          <div>
            <p className={styles.label}>{why.label}</p>
            <h2 className={styles.h2}>{why.title}</h2>
            <p className={styles.lead}>{why.lead}</p>
            <button
              type="button"
              className={styles.btn}
              onClick={scrollToTicket}
              data-cta
            >
              {why.cta}
            </button>
          </div>
          <div className={styles.listCol}>
            <h3 className={styles.listTitle}>{why.leftBehindTitle}</h3>
            <p className={styles.listNote}>{why.leftBehindNote}</p>
            <ul className={styles.list}>
              {why.leftBehind.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- aftermovie */}
      <section className={styles.videoBand}>
        <div className={styles.videoInner}>
          <div className={styles.videoMedia}>
            <MediaSlot media={aftermovie.media} label={aftermovie.label} />
          </div>
          <div className={styles.videoText}>
            <p className={styles.label}>{aftermovie.label}</p>
            <h2 className={styles.h2}>{aftermovie.title}</h2>
            <p className={styles.leadLeft}>{aftermovie.lead1}</p>
            <p className={styles.leadLeft}>{aftermovie.lead2}</p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- quote */}
      <section className={styles.quoteBand}>
        <div className={styles.inner}>
          <p className={styles.quoteBefore}>{quote.before}</p>
          <blockquote className={styles.quote}>{quote.text}</blockquote>
          <p className={styles.quoteBy}>{quote.after}</p>
        </div>
      </section>

      {/* ------------------------------------------------------- nights */}
      <section className={styles.nightsBand} id="nights">
        <div className={styles.inner}>
          <div className={styles.nightsHead}>
            <p className={styles.label}>{nights.label}</p>
            <h2 className={styles.h2}>{nights.title}</h2>
            <p className={styles.leadLeft}>{nights.lead}</p>
          </div>
          <NightsRail ticketHref={ticketHref} />
        </div>
      </section>

      {/* ------------------------------------------------------ tickets */}
      <section className={styles.sectionLeft} id="tickets">
        <div className={styles.nightsHead}>
          <p className={styles.label}>{tickets.label}</p>
          <h2 className={styles.h2}>{tickets.title}</h2>
          <p className={styles.leadLeft}>{tickets.lead}</p>
        </div>
        <Tickets href={buyHref} pending={!salesOpen} />
      </section>

      {/* ------------------------------------------------------- worlds */}
      <section className={styles.worldsBand}>
        <div className={styles.inner}>
          <p className={styles.label}>{worlds.label}</p>
          <h2 className={styles.h2}>{worlds.title}</h2>
          <p className={styles.lead}>{worlds.lead}</p>
          <ol className={styles.worlds}>
            {worlds.items.map((item) => (
              <li key={item.n} className={styles.world}>
                <span className={styles.worldN}>{item.n}</span>
                <span className={styles.worldWord}>{item.word}</span>
              </li>
            ))}
          </ol>
          <p className={styles.worldsClose}>{worlds.close}</p>
        </div>
      </section>

      {/* ------------------------------------------------------ gallery */}
      <section className={styles.sectionLeft} id="gallery">
        <div className={styles.galleryHead}>
          <div>
            <p className={styles.label}>{gallery.label}</p>
            <h2 className={styles.h2}>{gallery.title}</h2>
          </div>
          <a href={FOLLOW_HREF} className={styles.galleryAll}>
            {gallery.all} &rarr;
          </a>
        </div>

        <ul className={styles.galleryGrid}>
          {[leadShot, ...shots.slice(0, 6)].map((item, index) => (
            <li
              key={item.id}
              className={index === 0 ? styles.galleryFeatured : undefined}
            >
              <figure className={styles.shot}>
                <span className={styles.shotFrame}>
                  <MediaSlot media={item.media} label={item.night} />
                </span>
                <figcaption className={styles.shotMeta}>
                  <span className={styles.shotNight}>{item.night}</span>
                  <span className={styles.shotCaption}>{item.caption}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------- faq */}
      <section className={styles.faqSection} id="faq">
        <p className={styles.label}>{faq.label}</p>
        <h2 className={styles.h2}>{faq.title}</h2>
        <div className={styles.faq}>
          {faq.items.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- final */}
      <section className={styles.final}>
        <h2 className={`${styles.h2} ${styles.grad}`}>{final.title}</h2>
        <p className={styles.finalLine}>{final.line}</p>
        <a href="#tickets" className={styles.btn} data-cta>
          {final.button}
        </a>
      </section>

      <footer className={styles.footer}>
        <Image
          src={logo}
          alt={site.name}
          className={styles.footerLogo}
          sizes="162px"
        />
        <ul className={styles.footerLinks}>
          {site.socials.map((social) => (
            <li key={social.label}>
              <a href={social.href}>{social.label}</a>
            </li>
          ))}
        </ul>
        <span className={styles.footerNote}>
          © {new Date().getFullYear()} {site.city}
        </span>
      </footer>

      {/* Phone only. Same action, under the thumb, one gold at a time. */}
      <div
        className={`${styles.bar} ${showBar ? styles.barOn : ""}`}
        aria-hidden={!showBar}
      >
        <p className={styles.barMeta}>
          <strong>{bar.strong}</strong>
          <span>{bar.note}</span>
        </p>
        <button
          type="button"
          className={styles.barBtn}
          onClick={scrollToPrices}
          tabIndex={showBar ? 0 : -1}
        >
          {bar.button}
        </button>
      </div>
    </div>
  );
}
