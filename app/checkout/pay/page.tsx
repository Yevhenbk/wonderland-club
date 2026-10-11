import type { Metadata } from "next";

import MockPay from "@/app/components/checkout/mock-pay";
import Shell from "@/app/components/shell";
import { CATALOG, EVENT } from "@/lib/catalog";
import { readSession } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Оплата. Wonderland Club",
  robots: { index: false },
};

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s } = await searchParams;
  const session = s ? readSession(s) : null;

  if (!session || !s)
    return (
      <Shell>
        <MockPay expired />
      </Shell>
    );

  const item = CATALOG[session.item];

  return (
    <Shell>
      <MockPay
        token={s}
        summary={{
          event: `${EVENT.title}, ${EVENT.date}`,
          ticket: `${item.name}: ${item.detail}`,
          qty: item.maxQty > 1 ? session.qty : null,
          email: session.email,
          total: session.total,
          backHref: `/checkout?item=${session.item}`,
        }}
      />
    </Shell>
  );
}
