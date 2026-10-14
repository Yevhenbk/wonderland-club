"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import styles from "./halloween.module.scss";

/**
 * Halloween decorations, made from real images rather than drawings, so
 * they look eerie, not cartoonish. All public domain or CC0, from
 * Wikimedia Commons (processed by scripts/halloween-assets.py):
 * - the skeleton: Vesalius, De humani corporis fabrica (1543), p. 163,
 *   inverted to pale bone on the night;
 * - the bat: Haeckel, Kunstformen der Natur (1904), plate 67, no. 1;
 * - the spider: Haeckel, Arachnida plate, Araneus diadematus;
 * - the pumpkin: "Carved pumpkin as face" (Unsplash, CC0);
 * - the fog: generated noise.
 * Their life is added in CSS: candle light flickering over the pumpkin's
 * face, bats beating their wings on swooping paths, the spider dropping on
 * its thread, the skeleton fading in and out with red glints in its eyes,
 * eyes blinking in dark corners, fog creeping along the floor. Movement is
 * transform and opacity only, so the GPU does it without repainting.
 *
 * They appear only on phones and tablets, only in the season (SEASON below,
 * Kraków time), and switch themselves off afterwards: the first night (14.11, "Кінець світу") is
 * after Halloween. For a preview outside the season, add ?halloween=1 to the
 * address. Decorations never take clicks and hold still for visitors who
 * ask for reduced motion.
 */

const SEASON = { from: "2026-10-01", to: "2026-11-01" };

function inSeason(): boolean {
  if (new URLSearchParams(location.search).get("halloween") === "1") return true;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" }).format(new Date());
  return today >= SEASON.from && today <= SEASON.to;
}

/* Phones and tablets only: on a desktop the decorations are not drawn at
   all (nothing is downloaded for them either). */
const PHONE = "(max-width: 860px)";

/** Renders its decorations only in the season and only on phones and
    tablets (decided in the browser, so a page built before Halloween still
    switches on and off by itself, and a resized window follows along). */
export function Halloween({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const phone = window.matchMedia(PHONE);
    const update = () => setOn(inSeason() && phone.matches);
    update();
    phone.addEventListener("change", update);
    return () => phone.removeEventListener("change", update);
  }, []);
  return on ? <>{children}</> : null;
}

/** A layer over a whole section for its decorations, so the section's own
    layout rules (full-width children on phones) never reach them. */
export function Layer({ children }: { children: ReactNode }) {
  return <div className={styles.layer}>{children}</div>;
}

const vars = (values: Record<string, string | number>) => values as CSSProperties;

/* ------------------------------------------------------------- pumpkin */

/** A real carved jack-o'-lantern, its candle flickering inside the face. */
export function Pumpkin({
  className,
  delay = 0,
  style,
}: {
  className?: string;
  /** Seconds, so pumpkins side by side never flicker in step. */
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`${styles.pumpkin} ${className ?? ""}`}
      style={{ ...style, ...vars({ "--d": `${delay}s` }) }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/halloween/pumpkin.webp" alt="" width={360} height={326} loading="lazy" decoding="async" />
      <span className={styles.pumpkinFlame} />
    </span>
  );
}

/* ---------------------------------------------------------------- bats */

/**
 * One bat, cut from Haeckel's engraving into three layers of the same image:
 * the left wing, the body and the right wing. Each wing beats from its own
 * shoulder, turning in depth (it foreshortens on the downstroke, as a real
 * wing seen from below does) while the body rises and falls with the beat.
 */
function BatRig() {
  const img = (cls: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cls} src="/halloween/bat.webp" alt="" width={520} height={196} loading="lazy" decoding="async" />
  );
  return (
    <span className={styles.rig}>
      <span className={styles.rigBody}>
        {img(styles.wingL)}
        {img(styles.wingR)}
        {img(styles.torso)}
      </span>
    </span>
  );
}

/** Bats crossing the box on swooping paths, beating their wings: they bank
    into the turns and grow or shrink as they come nearer or fly off. */
export function Bats() {
  const bats = [
    { cls: styles.flyA, t: "17s", d: "0.5s", y: "16%", w: "96px", o: "1" },
    { cls: styles.flyB, t: "24s", d: "7s", y: "30%", w: "64px", o: "0.8" },
    { cls: styles.flyA, t: "29s", d: "14s", y: "7%", w: "44px", o: "0.6" },
  ];
  return (
    <div className={styles.bats} aria-hidden="true">
      {bats.map((bat, i) => (
        <span
          key={i}
          className={`${styles.flight} ${bat.cls}`}
          style={vars({ "--t": bat.t, "--d": bat.d, "--y": bat.y, "--w": bat.w, "--o": bat.o })}
        >
          <BatRig />
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ garland */

/* Old incandescent colours: amber, blood red, one sick violet. */
const BULB_COLOURS = ["#ff7a12", "#d4122b", "#ffa23a", "#9b3cf0", "#c0101f"];

/**
 * A string of lights across the top of a section, sagging between hooks.
 * The wire is one SVG stretched to the width; the bulbs are placed along
 * the same curve in HTML, so they keep their shape at any width. Each bulb
 * is an old C7: a ribbed plastic socket clipped to a twisted pair of wires,
 * tinted glass with a white-hot filament inside and a reflection on its
 * side, a bloom of coloured light around it. The glass stays visible when a
 * dying bulb cuts out; only its light goes. They sway a little on the wire.
 */
export function Garland({
  swags = 3,
  perSwag = 6,
  sag = 34,
  className,
}: {
  swags?: number;
  perSwag?: number;
  /** How far the wire drops between hooks, in pixels. */
  sag?: number;
  className?: string;
}) {
  const wire = Array.from({ length: swags }, (_, i) => {
    const x0 = (i * 1000) / swags;
    const x1 = ((i + 1) * 1000) / swags;
    return `${i === 0 ? `M ${x0} 6` : ""} Q ${(x0 + x1) / 2} ${6 + sag * 2} ${x1} 6`;
  }).join(" ");

  const bulbs: { left: number; top: number; tilt: number; colour: string; delay: number; faulty: boolean }[] = [];
  for (let s = 0; s < swags; s++) {
    for (let b = 1; b <= perSwag; b++) {
      const t = b / (perSwag + 1);
      const left = ((s + t) / swags) * 100;
      /* The quadratic's height at t: 2t(1-t) of the double sag. */
      const top = 6 + sag * 2 * 2 * t * (1 - t);
      /* A bulb's clip follows the wire, so it leans a little with the
         slope; gravity keeps the rest hanging down. */
      const tilt = ((1 - 2 * t) * sag * 2 * 2 * swags) / 30;
      const n = s * perSwag + b;
      bulbs.push({
        left,
        top,
        tilt: Math.max(-12, Math.min(12, -tilt)),
        colour: BULB_COLOURS[n % BULB_COLOURS.length],
        delay: (n * 0.37) % 2.4,
        /* Every fourth bulb is dying: it cuts out and stutters. */
        faulty: n % 4 === 1,
      });
    }
  }

  return (
    <div className={`${styles.garland} ${className ?? ""}`} aria-hidden="true">
      <svg className={styles.wire} viewBox="0 0 1000 80" preserveAspectRatio="none">
        {/* Two twisted insulated strands and a glint along the top. */}
        <path d={wire} vectorEffect="non-scaling-stroke" className={styles.strandA} />
        <path d={wire} vectorEffect="non-scaling-stroke" className={styles.strandB} />
        <path d={wire} vectorEffect="non-scaling-stroke" className={styles.strandGlint} />
      </svg>
      {bulbs.map((bulb, i) => (
        <span
          key={i}
          className={styles.bulb}
          data-faulty={bulb.faulty || undefined}
          style={vars({
            left: `${bulb.left}%`,
            top: `${bulb.top}px`,
            "--c": bulb.colour,
            "--d": `${bulb.delay}s`,
            "--tilt": `${bulb.tilt}deg`,
          })}
        >
          <span className={styles.socket} />
          <span className={styles.glass}>
            <span className={styles.lit} />
          </span>
          <span className={styles.halo} />
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- spider */

/** A real spider hanging head down on its thread: it drops, hangs and
    sways, and climbs back. */
export function Spider({ className }: { className?: string }) {
  return (
    <div className={`${styles.spider} ${className ?? ""}`} aria-hidden="true">
      <span className={styles.thread} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.spiderBody} src="/halloween/spider.webp" alt="" width={240} height={336} loading="lazy" decoding="async" />
    </div>
  );
}

/* ------------------------------------------------------------ skeleton */

/**
 * Vesalius's skeleton, pale bone in the dark: it comes and goes like an
 * apparition, and now and then two red glints light up in its eyes.
 */
export function Skeleton({ className, rise }: { className?: string; rise?: boolean }) {
  return (
    <div className={`${styles.skeleton} ${rise ? styles.rise : ""} ${className ?? ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/halloween/skeleton.webp" alt="" width={415} height={620} loading="lazy" decoding="async" />
      <span className={styles.glint} style={vars({ left: "46.5%", top: "8.4%" })} />
      <span className={styles.glint} style={vars({ left: "55%", top: "8.4%" })} />
    </div>
  );
}

/* ---------------------------------------------------------------- eyes */

/** A pair of eyes in the dark: they open, blink, look, and are gone. */
export function Eyes({
  className,
  delay = 0,
  colour = "#ff2a1f",
}: {
  className?: string;
  delay?: number;
  colour?: string;
}) {
  return (
    <span className={`${styles.eyes} ${className ?? ""}`} style={vars({ "--d": `${delay}s`, "--c": colour })} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

/* ----------------------------------------------------------------- fog */

/** Fog creeping along the floor of a section: two layers drifting at their
    own speeds, so it never repeats the same way. */
export function Fog({ className }: { className?: string }) {
  return (
    <div className={`${styles.fog} ${className ?? ""}`} aria-hidden="true">
      <span className={styles.fogBack} />
      <span className={styles.fogFront} />
    </div>
  );
}

/* -------------------------------------------------------------- cobweb */

/** A cobweb for a corner, swaying a little, dew drops glinting on it. */
export function Cobweb({ className }: { className?: string }) {
  const spokes = [0, 15, 32, 50, 68, 90].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return [Math.cos(r) * 100, Math.sin(r) * 100];
  });
  const rings = [18, 34, 50, 66, 82].map((radius) =>
    spokes
      .map(([x, y], i) => {
        const k = radius / 100;
        const px = x * k;
        const py = y * k;
        if (i === 0) return `M ${px} ${py}`;
        const [qx, qy] = spokes[i - 1];
        /* Each strand sags a little towards the corner between spokes. */
        const mx = ((qx + x) / 2) * k * 0.84;
        const my = ((qy + y) / 2) * k * 0.84;
        return `Q ${mx} ${my} ${px} ${py}`;
      })
      .join(" ")
  );
  const drops = [
    [30, 22, 0],
    [54, 40, 1.3],
    [22, 60, 2.1],
    [70, 30, 0.7],
  ];
  return (
    <svg className={`${styles.cobweb} ${className ?? ""}`} viewBox="0 0 100 100" aria-hidden="true">
      <g className={styles.webSway}>
        <g fill="none" stroke="rgba(232,222,230,0.3)" strokeWidth="0.7">
          {spokes.map(([x, y], i) => (
            <line key={i} x1="0" y1="0" x2={x} y2={y} />
          ))}
          {rings.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {drops.map(([x, y, d], i) => (
          <circle key={i} className={styles.dew} cx={x} cy={y} r="1.3" style={vars({ "--d": `${d}s` })} />
        ))}
      </g>
    </svg>
  );
}
