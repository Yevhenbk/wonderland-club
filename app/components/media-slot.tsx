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
}: {
  media?: MediaSource;
  label: string;
  className?: string;
}) {
  const cls = className ? `${styles.slot} ${className}` : styles.slot;

  if (media?.type === "image")
    return (
      <span className={cls}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.src} alt={media.alt ?? ""} loading="lazy" />
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
