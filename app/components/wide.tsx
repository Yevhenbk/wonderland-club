import type { ReactNode } from "react";

/** Text shown on wider screens only, such as the city after a street on a
    card: a phone drops it where every character counts. Renders nothing
    when there is nothing to show. */
export default function Wide({ children }: { children?: ReactNode }) {
  if (children === undefined || children === null || children === "") return null;
  return <span className="wide-only">{children}</span>;
}
