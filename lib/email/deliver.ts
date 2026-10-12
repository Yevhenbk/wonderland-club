import { readFile } from "node:fs/promises";
import path from "node:path";

import { passToken, type Order } from "@/lib/orders";
import { qrPngBuffer } from "@/lib/qr";

import { sendEmail, type InlineImage } from "./send";
import { renderTicketEmail } from "./ticket-email";

/* The email's own small logo (400px wide, for 200px at 2x). Read from the
   project when the files are there, fetched from the site otherwise (a
   serverless function may not carry public/), and remembered. */
let logo: Promise<Buffer | null> | null = null;
function emailLogo(origin: string): Promise<Buffer | null> {
  logo ??= readFile(path.join(process.cwd(), "public", "media", "email-logo.png"))
    .catch(() =>
      fetch(`${origin}/media/email-logo.png`).then(async (response) =>
        response.ok ? Buffer.from(await response.arrayBuffer()) : null
      )
    )
    .catch(() => null)
    .then((png) => {
      if (!png) logo = null;
      return png;
    });
  return logo;
}

/** Emails an order's passes. Each QR opens /verify/<token>, which the door
    can check with any phone camera. The QR images and the logo go along as
    inline attachments (cid:), which mail clients show where they block
    data: images and often hold back linked ones. */
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

  const logoPng = await emailLogo(origin);
  if (logoPng) images.push({ id: "logo", filename: "wonderland.png", png: logoPng });

  const email = renderTicketEmail(
    order,
    passes,
    origin,
    logoPng ? "cid:logo" : undefined
  );
  return sendEmail({ to: order.email, ...email, ref: order.id, images });
}
