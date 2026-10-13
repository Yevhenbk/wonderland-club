"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./ambient-video.module.scss";

/* How long the finished clip is kept, frozen on its last frame, behind the
   new one before its player is reused for the clip after next. */
const REFILL_DELAY_MS = 150;

/**
 * Short clips that play themselves, silently, while they are on screen, and
 * pause when they leave (so they cost no data or battery further down the
 * page). Browsers only allow autoplay when muted, so sound is one tap away
 * on the corner button instead.
 *
 * Several sources play back to back as if they were one video: two <video>
 * elements take turns. While one plays, the next clip loads underneath it;
 * when the clip ends the next one starts, and the cut is made only once its
 * first frame is on screen. No black frame, no loading pause.
 * After the last clip it starts again from the first. A single source simply
 * loops.
 *
 * With reduced motion on, nothing starts by itself: the clips get controls
 * and still run on into each other once started.
 */
export default function AmbientVideo({
  sources,
  poster,
}: {
  sources: string[];
  poster?: string;
}) {
  const slots = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  /* Which slot is in front, and which clip each slot holds. */
  const [front, setFront] = useState(0);
  const [clipIn, setClipIn] = useState<[number, number]>([
    0,
    sources.length > 1 ? 1 : 0,
  ]);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(false);
  /* Set the first time the player comes on screen. Until then the clip
     waiting behind loads nothing, so visitors who never scroll this far do
     not download it. */
  const [seen, setSeen] = useState(false);
  /* Set once the visitor starts scrolling (see below). Until then the
     players have no file at all: browsers treat preload="metadata" as a
     hint and Chrome downloaded the whole first clip (over 1 MB) with the
     page, competing with what the first screen needs on a phone connection. */
  const [near, setNear] = useState(false);
  const visible = useRef(false);
  const refill = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failures = useRef(0);
  const single = sources.length === 1;

  const frontVideo = () => slots[front].current;

  /* Give the players their files on the visitor's first scroll, or when the
     section comes into view without one (a link straight to it). Not on
     load: the section starts right where the full-screen hero ends, so any
     "near the screen" margin was already met before anything was scrolled,
     and the clip downloaded alongside the first screen. */
  useEffect(() => {
    const host = slots[0].current?.parentElement;
    if (!host || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    const attach = () => {
      setNear(true);
      window.removeEventListener("scroll", attach);
      observer.disconnect();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) attach();
    });
    observer.observe(host);
    window.addEventListener("scroll", attach, { passive: true, once: true });

    return () => {
      window.removeEventListener("scroll", attach);
      observer.disconnect();
    };
    // Runs once; the host element does not change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Arriving straight at the section (a link, a fast scroll) can make it
     visible before its file is attached: start playing once it is. */
  useEffect(() => {
    if (near && visible.current && !reduced) frontVideo()?.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near]);

  /* Play while on screen, pause when off it. */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReduced(true);
      return;
    }

    const host = slots[0].current?.parentElement;
    if (!host) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting) setSeen(true);
        const video = frontVideo();
        if (!video) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.3 }
    );
    observer.observe(host);

    return () => observer.disconnect();
    // The observer reads the current front slot through `frontVideo`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front]);

  /* The front clip ended: start the one waiting behind it and cut to it
     once its first frame is actually on screen. The finished clip stays
     frozen on its last frame behind it for a moment before its player loads
     the clip after next; swapping its file at the same instant could flash a
     blank, loading player. */
  const onEnded = (slot: number) => {
    if (single || slot !== front) return;

    const back = 1 - slot;
    const next = slots[back].current;
    if (!next) return;

    const bringForward = () => {
      setFront(back);
      if (refill.current) clearTimeout(refill.current);
      refill.current = setTimeout(() => {
        setClipIn((current) => {
          const updated: [number, number] = [...current];
          updated[slot] = (current[back] + 1) % sources.length;
          return updated;
        });
      }, REFILL_DELAY_MS);
    };

    /* The clip waiting behind failed to load (a missing or broken file):
       skip it, so the sequence carries on instead of freezing on a frame
       that never comes. */
    if (next.error) {
      skipBroken(back);
      slots[slot].current?.play().catch(() => {});
      return;
    }

    next.currentTime = 0;
    next.muted = muted;
    next
      .play()
      .then(() => {
        failures.current = 0;
        if ("requestVideoFrameCallback" in next)
          next.requestVideoFrameCallback(() => bringForward());
        else bringForward();
      })
      .catch(() => {
        if (next.error) {
          skipBroken(back);
          slots[slot].current?.play().catch(() => {});
        } else bringForward();
      });
  };

  /* Load the clip after a broken one into that slot. Gives up after one
     full round of failures, so a list where nothing loads does not spin. */
  const skipBroken = (slot: number) => {
    failures.current += 1;
    if (failures.current > sources.length) return;
    setClipIn((current) => {
      const updated: [number, number] = [...current];
      updated[slot] = (current[slot] + 1) % sources.length;
      return updated;
    });
  };

  /* A load error on the clip in front (e.g. the very first file is missing)
     is handled like that clip ending; on the one behind it, the next clip is
     queued in its place. */
  const onError = (slot: number) => {
    if (single) return;
    if (slot === front) onEnded(slot);
    else skipBroken(slot);
  };

  useEffect(
    () => () => {
      if (refill.current) clearTimeout(refill.current);
    },
    []
  );

  const toggleSound = () => {
    const nowMuted = !muted;
    slots.forEach((ref) => {
      if (ref.current) ref.current.muted = nowMuted;
    });
    setMuted(nowMuted);

    const video = frontVideo();
    if (video?.paused && visible.current) video.play().catch(() => {});
  };

  return (
    <span className={styles.wrap}>
      {slots.map((ref, slot) =>
        single && slot === 1 ? null : (
          <video
            key={slot}
            ref={ref}
            className={styles.video}
            data-front={slot === front}
            src={near ? sources[clipIn[slot]] : undefined}
            poster={slot === 0 ? poster : undefined}
            muted
            loop={single && !reduced}
            playsInline
            /* The clip in front loads first; the one behind it loads in full
               once the player has been seen, so it is ready the moment the
               front one ends. */
            preload={slot === front ? "metadata" : seen || reduced ? "auto" : "none"}
            controls={reduced && slot === front}
            onEnded={() => onEnded(slot)}
            onError={() => onError(slot)}
            aria-hidden={slot !== front}
            tabIndex={slot === front ? undefined : -1}
          />
        )
      )}
      {!reduced && (
        <button
          type="button"
          className={styles.sound}
          data-track="sound"
          onClick={toggleSound}
          aria-label={muted ? "Увімкнути звук" : "Вимкнути звук"}
          aria-pressed={!muted}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" />
            {muted ? (
              <path
                d="m16 9.5 5 5m0-5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </svg>
        </button>
      )}
    </span>
  );
}
