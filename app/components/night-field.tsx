"use client";

import { useEffect, useRef } from "react";

import styles from "./night-field.module.scss";

/**
 * The living ground the whole page sits on: three soft fields of light that
 * drift under a fine grain and lean a few pixels away from the pointer.
 * Same mechanism as Soul Guide's hero field, re-lit for a night.
 */
export default function NightField() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = fieldRef.current;

    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    let frame: number | null = null;
    let pointerX = 0;
    let pointerY = 0;

    const onMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;

      if (frame === null) {
        frame = requestAnimationFrame(() => {
          node.style.setProperty("--px", pointerX.toFixed(3));
          node.style.setProperty("--py", pointerY.toFixed(3));
          frame = null;
        });
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);

      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.field} ref={fieldRef} aria-hidden="true">
      <span className={`${styles.bloom} ${styles.bloomA}`} />
      <span className={`${styles.bloom} ${styles.bloomB}`} />
      <span className={`${styles.bloom} ${styles.bloomC}`} />
    </div>
  );
}
