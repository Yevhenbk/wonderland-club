import Link from "next/link";
import type { ReactNode } from "react";

import Shell from "@/app/components/shell";

import type { LegalDoc, Point } from "./docs";
import styles from "./legal.module.scss";

/* "[label](href)" inside a point becomes a link; the rest stays text. */
function inline(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return link ? (
      <Link key={index} href={link[2]} className={styles.link}>
        {link[1]}
      </Link>
    ) : (
      part
    );
  });
}

const point = (item: Point, index: number) =>
  Array.isArray(item) ? (
    <ul key={index} className={styles.bullets}>
      {item.map((line) => (
        <li key={line}>{inline(line)}</li>
      ))}
    </ul>
  ) : (
    <p key={index}>{inline(item)}</p>
  );

/**
 * A legal page: the terms or the privacy policy, in one language, with a
 * switch to the other. Plain and readable, in the site's frame.
 */
export default function LegalPage({
  doc,
  lang,
  updatedLabel,
  other,
}: {
  doc: LegalDoc;
  /** The document's language, for screen readers and translation tools. */
  lang: "uk" | "pl";
  updatedLabel: string;
  /** The same document in the other language. */
  other: { href: string; label: string; lang: string };
}) {
  /* Points that are a bullet list belong to the point before them, so the
     numbering only counts sentences. */
  let number = 0;

  return (
    <Shell wide>
      <article className={styles.doc} lang={lang}>
        <div className={styles.head}>
          <Link href={other.href} hrefLang={other.lang} className={styles.lang}>
            {other.label}
          </Link>
          <h1 className={styles.title}>{doc.title}</h1>
          <p className={styles.updated}>
            {updatedLabel} {doc.updated}
          </p>
          <p className={styles.intro}>{doc.intro}</p>
        </div>

        {doc.sections.map((section, s) => {
          number = 0;
          return (
            <section key={section.title} className={styles.section}>
              <h2 className={styles.h2}>
                § {s + 1}. {section.title}
              </h2>
              <div className={styles.points}>
                {section.points.map((item, index) => {
                  if (Array.isArray(item)) return point(item, index);
                  number += 1;
                  return (
                    <div key={index} className={styles.point}>
                      <span className={styles.num}>
                        {s + 1}.{number}
                      </span>
                      {point(item, index)}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </article>
    </Shell>
  );
}
