"use client";

import { useEffect, useState, type ReactNode } from "react";

import type { ItemId } from "@/lib/catalog";
import type { StockMap } from "@/lib/inventory";

import { stockLabel } from "./stock-label";
import styles from "./tickets.module.scss";

/* The landing page is static, so what is left is asked for once it is in
   the browser. One request, shared by every badge and button. */
let request: Promise<StockMap> | null = null;

export function useStock(): StockMap | null {
  const [stock, setStock] = useState<StockMap | null>(null);
  useEffect(() => {
    request ??= fetch("/api/availability")
      .then((response) => (response.ok ? response.json() : {}))
      .catch(() => ({}));
    request.then(setStock);
  }, []);
  return stock;
}

/** "Залишилось 1 з 2" or "Розпродано", under a zone size's name. */
export function StockBadge({ item }: { item: ItemId }) {
  const stock = useStock()?.[item];
  const label = stockLabel(stock);
  if (!label || !stock) return null;
  return (
    <span className={styles.stock} data-out={stock.left === 0 || undefined}>
      {label}
    </span>
  );
}

/** The VIP card's button: opens checkout on the first size still free, and
    turns into a plain "Розпродано" once every zone is gone. */
export function VipBuy({
  items,
  checkoutPath,
  className,
  children,
}: {
  items: ItemId[];
  checkoutPath: string;
  className: string;
  children: ReactNode;
}) {
  const stock = useStock();
  const free = stock ? items.find((item) => (stock[item]?.left ?? 1) > 0) : items[0];

  if (!free)
    return (
      <span className={className} aria-disabled="true" data-out>
        Розпродано
      </span>
    );

  return (
    <a href={`${checkoutPath}?item=${free}`} className={className}>
      {children}
    </a>
  );
}
