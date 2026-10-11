import type { Metadata } from "next";

import CheckoutForm from "@/app/components/checkout/checkout-form";
import Shell from "@/app/components/shell";
import { CATALOG, EVENT, isItemId } from "@/lib/catalog";

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

  return (
    <Shell>
      <CheckoutForm
        items={Object.values(CATALOG)}
        initialItem={isItemId(item) ? item : "standard"}
        event={EVENT}
      />
    </Shell>
  );
}
