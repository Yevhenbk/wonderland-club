"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Anonymous page statistics for /dashboard. No cookies, nothing kept in the
 * browser: it reports what happened on this page view and the server counts
 * it (app/api/t). It sends:
 * - the view: which page, where the visitor came from, phone or computer;
 * - the sections that came into view (marked with data-section);
 * - clicks on what matters: buying, the way to the prices, the map, the
 *   socials;
 * - how long the page was actually in front of the visitor (a hidden tab
 *   does not count).
 * Staff and admin pages are left out.
 */

const SKIP = /^\/(dashboard|staff|verify|pass|api)(\/|$)/;

/* The last view sent, so a page view is counted once even when the effect
   runs twice (React's development mode mounts it twice). */
let lastView = { path: "", at: 0 };

function send(data: object) {
  const body = JSON.stringify(data);
  try {
    if (navigator.sendBeacon?.("/api/t", new Blob([body], { type: "text/plain" }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/t", { method: "POST", body, keepalive: true }).catch(() => {});
}

/* What a click on a link or button means, or null for clicks we ignore. */
function clickName(element: Element): string | null {
  const named = element.closest("[data-track]")?.getAttribute("data-track");
  if (named) return named;
  const link = element.closest("a");
  if (!link) return null;
  const href = link.getAttribute("href") ?? "";
  if (/\/(checkout|buy)\?item=vip/.test(href)) return "buy_vip";
  if (/\/(checkout|buy)(\?|$)/.test(href)) return "buy_standard";
  if (/#tickets$/.test(href)) return link.closest("header") ? "header_tickets" : "to_tickets";
  if (/google\.[a-z.]+\/maps/.test(href)) return "map";
  if (/instagram\.com/.test(href)) return "instagram";
  if (/tiktok\.com/.test(href)) return "tiktok";
  if (/t\.me\//.test(href)) return "telegram";
  if (/\/terms$|\/regulamin$/.test(href)) return "terms";
  if (/\/privacy$|\/polityka/.test(href)) return "privacy";
  return null;
}

export default function Tracker() {
  const path = usePathname();

  useEffect(() => {
    if (SKIP.test(path)) return;

    const params = new URLSearchParams(location.search);
    const repeat = lastView.path === path && Date.now() - lastView.at < 1500;
    lastView = { path, at: Date.now() };
    if (!repeat)
      send({
        t: "view",
        p: path,
        r: document.referrer,
        u: params.get("utm_source") ?? "",
        phone: matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)").matches,
      });

    /* Sections: each counted once per view, sent two seconds after it came
       into view (several at once if the visitor scrolls fast). Waiting for
       the page to close lost them: phones often never report a close. */
    const seen = new Set<string>();
    let pending: string[] = [];
    let soon = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.section;
          if (entry.isIntersecting && id && !seen.has(id)) {
            seen.add(id);
            pending.push(id);
            window.clearTimeout(soon);
            soon = window.setTimeout(() => flush("seen"), 2000);
          }
        }
      },
      { threshold: 0.35 }
    );
    document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => observer.observe(el));

    /* Time in front of the visitor: counted only while the tab is visible. */
    let visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
    let unsentMs = 0;
    let totalMs = 0;
    const settle = () => {
      if (visibleSince) {
        const span = Date.now() - visibleSince;
        unsentMs += span;
        totalMs += span;
        visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
      }
    };
    const flush = (type: "seen" | "leave") => {
      settle();
      const seconds = Math.round(unsentMs / 1000);
      if (!pending.length && !seconds) return;
      send({ t: type, s: pending, d: seconds, m: Math.round(totalMs / 1000) });
      pending = [];
      unsentMs -= seconds * 1000;
    };
    const timer = window.setInterval(() => flush("seen"), 15_000);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush("leave");
      else visibleSince = Date.now();
    };
    const onLeave = () => flush("leave");

    const onClick = (event: MouseEvent) => {
      const name = event.target instanceof Element ? clickName(event.target) : null;
      if (name) send({ t: "click", c: [name] });
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      flush("leave");
      window.clearTimeout(soon);
      observer.disconnect();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [path]);

  return null;
}
