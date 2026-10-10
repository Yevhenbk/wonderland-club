import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";

import "./globals.scss";

/* Two faces, both with Cyrillic.
   - Unbounded: the spaced-out "CLUB" from the logo. Wide and extended; every
     heading and label.
   - Manrope: running text, so the wide face never has to be read for long. */
const wide = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-wide",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

/* The tab reads as the club, the way the logo names it, then the city.
   The icon is app/icon.svg (with favicon.ico and apple-icon.png beside it
   for browsers and home screens that want a bitmap): the four-point star
   from the centre of the logo. */
export const metadata: Metadata = {
  title: "Wonderland Club. Вечірки у Кракові",
  description:
    "Вечірки у Кракові, де кожна ніч це новий світ: нова тема, новий вайб, новий саунд, нова історія.",
  applicationName: "Wonderland Club",
};

export const viewport: Viewport = {
  /* The navbar's colour, so a phone's browser bar runs straight into it. */
  themeColor: "#0f0b19",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uk"
      className={`${wide.variable} ${body.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
