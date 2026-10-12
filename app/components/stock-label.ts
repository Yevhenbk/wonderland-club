import type { Stock } from "@/lib/inventory";

/** What a VIP zone size shows next to its price: how many are left, or why
    none are. Nothing for tickets that never run out. */
export function stockLabel(stock: Stock | undefined): string | null {
  if (!stock) return null;
  if (stock.left > 0) return `Залишилось ${stock.left} з ${stock.total}`;
  return stock.sold >= stock.total ? "Розпродано" : "Заброньовано";
}
