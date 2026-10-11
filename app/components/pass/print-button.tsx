"use client";

import styles from "./pass-actions.module.scss";

/** Opens the print dialog, where the passes can also be saved as a PDF. */
export default function PrintButton({ label = "Зберегти або роздрукувати" }: { label?: string }) {
  return (
    <button type="button" className={styles.primary} onClick={() => window.print()}>
      {label}
    </button>
  );
}
