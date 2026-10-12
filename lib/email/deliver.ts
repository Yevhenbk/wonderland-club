import { passToken, type Order } from "@/lib/orders";
import { qrPng } from "@/lib/qr";

import { sendEmail } from "./send";
import { renderTicketEmail } from "./ticket-email";

/** Emails an order's passes. Each QR opens /verify/<token>, which the door
    can check with any phone camera. */
export async function emailOrder(order: Order, origin: string) {
  const passes = await Promise.all(
    order.passes.map(async (pass) => {
      const token = passToken(order, pass);
      return {
        pass,
        url: `${origin}/pass/${token}`,
        qrSrc: await qrPng(`${origin}/verify/${token}`),
      };
    })
  );

  const email = renderTicketEmail(order, passes, origin);
  return sendEmail({ to: order.email, ...email, ref: order.id });
}
