"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Gives the quote's section the width of the quote's longest line, as
 * --quote-ink, so the paragraph under it on a phone can match it exactly.
 * CSS alone cannot do this: a wrapped heading's box is as wide as its
 * column, not as its longest line. Re-measured whenever the quote's size
 * changes (rotation, font loading).
 */
export default function QuoteWidth() {
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const host = marker.current?.parentElement;
    const quote = host?.querySelector("blockquote");
    if (!host || !quote) return;

    const measure = () => {
      const range = document.createRange();
      range.selectNodeContents(quote);
      const widest = Math.max(
        0,
        ...Array.from(range.getClientRects(), (rect) => rect.width)
      );
      if (widest) host.style.setProperty("--quote-ink", `${Math.ceil(widest)}px`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(quote);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  return <span ref={marker} hidden />;
}
