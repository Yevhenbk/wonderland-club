"use client";

import { useRef, useState, type MouseEvent } from "react";

import styles from "./faq-item.module.scss";

/* The same curve the buttons use: moves most of the way at once, then
   settles. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 420;

/**
 * One FAQ row that opens and closes smoothly.
 *
 * It stays a real <details>/<summary>, so it is keyboard and screen-reader
 * friendly and still works if the script never loads. The click is taken
 * over only to animate the answer's height: on open the element is opened
 * first and its content grown from 0, on close the content shrinks first
 * and the element is closed when it lands. Clicking again mid-animation
 * reverses from wherever the answer currently is instead of jumping.
 */
export default function FaqItem({
  q,
  a,
  track,
}: {
  q: string;
  a: string;
  /** Statistics name for this question (faq_3); counted on opening only. */
  track?: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  /* What the row is heading towards; drives the icon, which should turn as
     soon as the click lands rather than when the animation ends. */
  const [open, setOpen] = useState(false);

  const toggle = (event: MouseEvent) => {
    const details = detailsRef.current;
    const body = bodyRef.current;
    if (!details || !body) return;

    event.preventDefault();
    const opening = !open;
    setOpen(opening);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      details.open = opening;
      return;
    }

    /* Read the height the answer has right now (mid-animation included)
       before stopping whatever is running. */
    const from = details.open ? body.getBoundingClientRect().height : 0;
    animation.current?.cancel();

    if (opening) details.open = true;
    const to = opening ? body.scrollHeight : 0;

    const run = body.animate(
      [
        { height: `${from}px`, opacity: from === 0 ? 0 : 1 },
        { height: `${to}px`, opacity: opening ? 1 : 0 },
      ],
      /* A close holds its last frame: the animation ends one frame before
         `onfinish` runs, and without the hold the answer flashed back at full
         height for that frame before the row shut. */
      { duration: DURATION, easing: EASE, fill: opening ? "none" : "forwards" }
    );
    animation.current = run;

    run.onfinish = () => {
      if (!opening) {
        details.open = false;
        run.cancel();
      }
      animation.current = null;
    };
  };

  return (
    <details ref={detailsRef} className={styles.item}>
      <summary onClick={toggle} data-track={open ? undefined : (track ?? "faq")}>
        <span>{q}</span>
        <span className={styles.icon} data-open={open} aria-hidden="true" />
      </summary>
      <div ref={bodyRef} className={styles.body}>
        <p>{a}</p>
      </div>
    </details>
  );
}
