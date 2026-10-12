import { passToken, type Order } from "@/lib/orders";
import { qrPngBuffer } from "@/lib/qr";

import { sendEmail, type InlineImage } from "./send";
import { renderTicketEmail } from "./ticket-email";

/** Emails an order's passes. Each QR opens /verify/<token>, which the door
    can check with any phone camera. The QR images go along as inline
    attachments (cid:), which mail clients show where they block data:. */
export async function emailOrder(order: Order, origin: string) {
  const images: InlineImage[] = [];

  const passes = await Promise.all(
    order.passes.map(async (pass, index) => {
      const token = passToken(order, pass);
      const id = `qr-${index + 1}`;
      images[index] = {
        id,
        filename: `wonderland-${pass.code}.png`,
        png: await qrPngBuffer(`${origin}/verify/${token}`),
      };
      return { pass, url: `${origin}/pass/${token}`, qrSrc: `cid:${id}` };
    })
  );

  const email = renderTicketEmail(order, passes, origin);
  return sendEmail({ to: order.email, ...email, ref: order.id, images });
}
