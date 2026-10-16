import Image from "next/image";

import {
  aftermovie,
  expect,
  faq,
  final,
  gallery,
  hero,
  nextNight,
  nights,
  quote,
  rules,
  site,
  tickets,
  vip,
  worlds,
} from "@/app/content";

import logo from "@/public/media/wonderland-wordmark.png";

import FaqItem from "./faq-item";
import MediaSlot from "./media-slot";
import NightField from "./night-field";
import { Bats, Cobweb, Eyes, Fog, Halloween, Layer, Pumpkin, Skeleton, Spider } from "./halloween/halloween";
import HeroTicket from "./hero-ticket";
import NightsRail from "./nights-rail";
import QuoteWidth from "./quote-width";
import SiteHeader from "./site-header";
import { organizer } from "@/app/legal/organizer";
import Tickets from "./tickets";
import Wide from "./wide";
import styles from "./home.module.scss";

/* Opens outside links in a new tab, keeps in-page anchors in place. */
const external = (href: string) =>
  href.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

export default function Home() {
  /* The calls about the night lead to the prices; each price card opens
     checkout with its ticket already chosen. */
  const ticketHref = nextNight.ctaHref;
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
      <SiteHeader />

      {/* --------------------------------------------------------- hero */}
      <section className={styles.hero} data-section="hero">
        <span className={styles.heroAura} aria-hidden="true" />
        <Halloween>
          <Bats />
          {/* Wide screens: under the headline, a skeleton rising out of the
              fog and sinking back. Drawn before the fog, so the fog covers
              its feet. */}
          <Skeleton className={styles.hwHeroSkeleton} rise />
          <Fog className={styles.hwFogHero} />
        </Halloween>

        <div className={`${styles.heroCenter} ${styles.heroFill}`}>
          <div className={styles.heroIntro}>
            <p className={styles.label}>{hero.eyebrow}</p>
            {/* Phones: the logo in the headline's place (the words stay for
                search engines and screen readers). */}
            <h1 className={`${styles.h1} ${styles.grad}`}>
              <span className={styles.h1Words}>{hero.title}</span>
              <Image src={logo} alt="" className={styles.h1Logo} priority sizes="(max-width: 860px) 300px, 1px" />
            </h1>
            <p className={styles.heroSub}>{hero.sub}</p>
          </div>

          {/* The ticket itself: a preview of the pass, and the way to buy it. */}
          <HeroTicket
            extra={
              <Halloween>
                {/* Phones only: on wide screens the skeleton has the hero. */}
                <span className={styles.hwTicketPumpkin}>
                  <Pumpkin delay={0.4} />
                </span>
              </Halloween>
            }
          />
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

      {/* ---------------------------------------------------- aftermovie */}
      <section className={styles.videoBand} data-section="atmosphere">
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
      <section className={styles.quoteBand} data-section="quote">
        <div className={styles.inner}>
          <p className={`${styles.quoteBefore} ${styles.quoteDesktop}`}>
            {quote.before}
          </p>
          <p className={`${styles.quoteBefore} ${styles.quotePhone}`}>
            {quote.afterPhone}
          </p>
          <blockquote className={styles.quote}>{quote.text}</blockquote>
          <p className={styles.quoteBy}>{quote.after}</p>
          <QuoteWidth />
        </div>
      </section>

      {/* ------------------------------------------------------- nights */}
      <section className={styles.nightsBand} id="nights" data-section="nights">
        <Halloween>
          <Layer>
            <Eyes className={styles.hwEyesNights} delay={3} colour="#ffb020" />
          </Layer>
        </Halloween>
        <div className={styles.inner}>
          <div className={styles.nightsHead}>
            <p className={styles.label}>{nights.label}</p>
            <h2 className={styles.h2}>{nights.title}</h2>
            <p className={`${styles.leadLeft} ${styles.wideOnly}`}>{nights.lead}</p>
            <p className={`${styles.leadLeft} ${styles.wideOnly}`}>{nights.lead2}</p>
            <p className={`${styles.leadLeft} ${styles.phoneOnly}`}>{nights.leadPhone}</p>
          </div>
          <NightsRail ticketHref={ticketHref} />
          <div className={styles.nightClose}>
            {nights.close.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- expect */}
      <section className={`${styles.section} ${styles.hideOnPhone}`} id="expect" data-section="expect">
        <p className={styles.label}>{expect.label}</p>
        <h2 className={styles.h2}>{expect.title}</h2>
        <p className={styles.lead}>{expect.lead}</p>
        <ol className={styles.expectList}>
          {expect.items.map((item, index) => (
            <li key={item} className={styles.expectItem}>
              <span className={styles.expectN}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.expectText}>{item}</span>
            </li>
          ))}
        </ol>
        <p className={styles.expectClose}>{expect.close}</p>
      </section>

      {/* ---------------------------------------------------------- vip */}
      <section className={`${styles.vipBand} ${styles.hideOnPhone}`} id="vip" data-section="vip">
        <div className={styles.inner}>
          <div className={styles.vipCard}>
            <p className={styles.label}>{vip.label}</p>
            <h2 className={styles.h2}>{vip.title}</h2>
            <p className={styles.lead}>{vip.lead}</p>
            <p className={styles.vipTrio}>
              {vip.trio.map((word) => (
                <span key={word}>{word}</span>
              ))}
            </p>
            <p className={styles.lead}>{vip.body}</p>
            <p className={`${styles.vipHighlight} ${styles.grad}`}>
              {vip.highlight}
            </p>
            <div className={styles.vipIncludes}>
              <h3 className={styles.vipIncludesTitle}>{vip.includesTitle}</h3>
              <ul>
                {vip.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <p className={styles.vipNote}>{vip.note}</p>
            <a href={vip.ctaHref} className={styles.btn}>
              {vip.cta}
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ tickets */}
      <section className={styles.sectionLeft} id="tickets" data-section="tickets">
        <Halloween>
          <Layer>
            <Spider className={styles.hwSpider} />
            <Cobweb className={styles.hwWebLeft} />
          </Layer>
        </Halloween>
        <div className={styles.nightsHead}>
          <p className={styles.label}>{tickets.label}</p>
          <h2 className={styles.h2}>{tickets.title}</h2>
          <p className={styles.leadLeft}>{tickets.lead}</p>
        </div>
        <Tickets />
      </section>

      {/* -------------------------------------------------------- rules */}
      <section className={styles.rulesBand} id="rules" data-section="rules">
        <div className={styles.inner}>
          <p className={styles.label}>{rules.label}</p>
          <h2 className={styles.h2}>{rules.title}</h2>
          <ol className={styles.rulesList}>
            {rules.items.map((rule, index) => (
              <li key={rule}>
                <span className={styles.ruleN}>{index + 1}</span>
                <span className={styles.ruleText}>{rule}</span>
              </li>
            ))}
          </ol>
          <p className={`${styles.rulesClose} ${styles.grad}`}>{rules.close}</p>
        </div>
      </section>

      {/* ------------------------------------------------------- worlds */}
      <section className={`${styles.worldsBand} ${styles.hideOnPhone}`} data-section="worlds">
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
      <section className={styles.sectionLeft} id="gallery" data-section="gallery">
        <div className={styles.galleryHead}>
          <div>
            <p className={styles.label}>{gallery.label}</p>
            <h2 className={styles.h2}>{gallery.title}</h2>
          </div>
        </div>

        {/* The stage photo leads, whole; the rest follow as a grid, or on a
            phone as a row you swipe through. */}
        <figure className={`${styles.shot} ${styles.galleryFeatured}`}>
          <span
            className={styles.shotFrame}
            style={
              leadShot.frame
                ? ({ "--frame": leadShot.frame } as React.CSSProperties)
                : undefined
            }
          >
            <MediaSlot
              media={leadShot.media}
              label={leadShot.tag}
              sizes="(max-width: 1080px) 100vw, 1080px"
            />
          </span>
          <figcaption className={styles.shotMeta}>
            <span className={styles.shotNight}>{leadShot.tag}</span>
            <span className={styles.shotCaption}>{leadShot.caption}</span>
          </figcaption>
        </figure>

        <ul className={styles.galleryRail}>
          {shots.map((item) => (
            <li key={item.id}>
              <figure className={styles.shot}>
                <span className={styles.shotFrame}>
                  <MediaSlot
                    media={item.media}
                    label={item.tag}
                    /* Generous on purpose: the browser multiplies these by
                       the screen's pixel density, and a hint that ran at
                       the tile's exact width left scaled screens with a
                       file smaller than the space it fills. */
                    sizes="(max-width: 767px) 70vw, (max-width: 920px) 50vw, 420px"
                  />
                </span>
                <figcaption className={styles.shotMeta}>
                  <span className={styles.shotNight}>{item.tag}</span>
                  <span className={styles.shotCaption}>{item.caption}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------- faq */}
      <section className={styles.faqSection} id="faq" data-section="faq">
        <p className={styles.label}>{faq.label}</p>
        <h2 className={styles.h2}>{faq.title}</h2>
        <div className={styles.faq}>
          {faq.items.map((item, index) => (
            <FaqItem key={item.q} q={item.q} a={item.a} track={`faq_${index + 1}`} />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- final */}
      <section className={styles.final} data-section="final">
        <h2 className={`${styles.h2} ${styles.grad}`}>{final.title}</h2>
        <p className={styles.finalLine}>{final.line}</p>
        <a href="#tickets" className={styles.btn}>
          {final.button}
        </a>
        <Halloween>
          <Layer>
            {/* Standing at the foot of the section, its legs lost in the
                fog drawn over it. */}
            <Skeleton className={styles.hwFinalSkeleton} still />
            <Fog />
          </Layer>
        </Halloween>
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
        <nav className={styles.footerLegal} aria-label="Правова інформація">
          <a href="/terms">Регламент</a>
          <a href="/privacy">Політика конфіденційності</a>
        </nav>
      </footer>

    </div>
  );
}
