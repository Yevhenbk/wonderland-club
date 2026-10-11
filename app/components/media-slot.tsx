import Image from "next/image";

import type { MediaSource } from "@/app/content";

import AmbientVideo from "./ambient-video";
import styles from "./media-slot.module.scss";

/**
 * One slot for a photo or a clip. Without a source it renders a labelled
 * placeholder of the same shape, so the layout is final before the media is.
 */
export default function MediaSlot({
  media,
  label,
  className,
  sizes = "100vw",
}: {
  media?: MediaSource;
  label: string;
  className?: string;
  /** How wide the slot is drawn, so a phone gets a small file rather than
      the full photo. */
  sizes?: string;
}) {
  const cls = className ? `${styles.slot} ${className}` : styles.slot;

  /* Photos go through next/image: resized and recompressed to the width the
     slot is drawn at, and loaded only as they approach the screen. */
  if (media?.type === "image")
    return (
      <span className={cls}>
        <Image
          src={media.src}
          alt={media.alt ?? ""}
          fill
          sizes={sizes}
          quality={90}
          style={{ objectFit: "cover", objectPosition: media.position ?? "50% 50%" }}
        />
      </span>
    );

  if (media?.type === "video")
    return (
      <span className={cls}>
        <AmbientVideo
          sources={Array.isArray(media.src) ? media.src : [media.src]}
          poster={media.poster}
        />
      </span>
    );

  return (
    <span className={`${cls} ${styles.pending}`}>
      <span className={styles.tag}>{label}</span>
      <span className={styles.note}>медіа скоро</span>
    </span>
  );
}
