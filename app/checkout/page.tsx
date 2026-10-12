import type { Metadata } from "next";

import CheckoutForm from "@/app/components/checkout/checkout-form";
import Shell from "@/app/components/shell";
import { CATALOG, EVENT, isItemId } from "@/lib/catalog";
import { availability, type StockMap } from "@/lib/inventory";

export const metadata: Metadata = {
  title: "Квитки. Wonderland Club",
  robots: { index: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { item } = await searchParams;

  /* Taken VIP zones are shown, but locked. If counting fails, nothing is
     locked here: the server checks again before taking any payment. */
  const stock: StockMap = await availability().catch(() => ({}));
  const wanted = isItemId(item) && stock[item]?.left !== 0 ? item : "standard";

  return (
    <Shell>
      <CheckoutForm
        items={Object.values(CATALOG)}
        initialItem={wanted}
        event={EVENT}
        stock={stock}
      />
    </Shell>
  );
}
