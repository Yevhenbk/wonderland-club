"use client";

import { useEffect, useState } from "react";

import { soldOffline } from "@/app/content";

/* Ukrainian plural for a count: 1, 21 квиток; 2-4, 22-24 квитки; else квитків. */
export function tickets(n: number): string {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return "квиток";
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "квитки";
  return "квитків";
}

/* One request for every place the count is shown. */
let request: Promise<number> | null = null;

/**
 * "Вже продано 21 квиток": the tickets sold directly (app/content.ts) plus
 * those paid on the site (/api/sold, from Stripe). The page is drawn with
 * the direct number and the online sales are added as soon as they arrive.
 */
export default function SoldCount() {
  const [sold, setSold] = useState(soldOffline);

  useEffect(() => {
    request ??= fetch("/api/sold")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { sold?: number } | null) => Math.max(soldOffline, Number(data?.sold) || 0))
      .catch(() => soldOffline);
    request.then(setSold);
  }, []);

  return (
    <>
      Вже продано {sold} {tickets(sold)}
    </>
  );
}
