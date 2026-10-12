import { CATALOG, EVENT } from "../catalog";
import type { Order, Pass } from "../orders";

/**
 * The ticket email: the same passes the confirmation page shows, as an
 * email that works in mail clients. That means tables and inline styles,
 * no web fonts and no SVG.
 *
 * Images: each QR is an inline attachment, referenced as cid:qr-1 and so
 * on (lib/email/deliver.ts); Gmail blocks data: images. The logo is loaded
 * from the site.
 */

export interface EmailPass {
  pass: Pass;
  /** Where the pass opens online. */
  url: string;
  /** QR image source: cid:<id> of its inline attachment. */
  qrSrc: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const C = {
  night: "#050309",
  paper: "#0f0b19",
  line: "#2a2433",
  ink: "#f5eeec",
  soft: "#b4abb3",
  faint: "#857d8a",
  rose: "#e2a59d",
  goldInk: "#3a1e1b",
};

const esc = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function renderTicketEmail(
  order: Order,
  passes: EmailPass[],
  origin: string
): RenderedEmail {
  const item = CATALOG[order.item];
  const count = passes.length;
  const subject = `Твої квитки: Wonderland Club, ${EVENT.theme}, ${EVENT.date}`;

  const row = (k: string, v: string) => `
    <tr>
      <td style="padding:8px 0;border-top:1px solid ${C.line};font:13px Arial,sans-serif;color:${C.faint};">${esc(k)}</td>
      <td style="padding:8px 0;border-top:1px solid ${C.line};font:bold 14px Arial,sans-serif;color:${C.ink};text-align:right;">${esc(v)}</td>
    </tr>`;

  const passBlock = ({ pass, url, qrSrc }: EmailPass, index: number) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:${C.paper};border:1px solid ${C.line};border-radius:16px;">
      <tr><td style="padding:22px 22px 6px;">
        <div style="font:bold 11px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${C.rose};">
          Квиток ${index + 1} з ${count}
        </div>
        <div style="margin-top:6px;font:bold 20px Arial,sans-serif;color:${C.ink};">
          ${esc(item.name)}: ${esc(item.detail)}
        </div>
      </td></tr>
      <tr><td style="padding:14px 22px;" align="center">
        <img src="${qrSrc}" width="220" height="220" alt="QR-код квитка ${esc(pass.code)}"
             style="display:block;width:220px;height:220px;border-radius:12px;background:#ffffff;" />
        <div style="margin-top:12px;font:bold 16px 'Courier New',monospace;letter-spacing:2px;color:${C.ink};">
          ${esc(pass.code)}
        </div>
      </td></tr>
      <tr><td style="padding:0 22px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row("Подія", `${EVENT.title}. ${EVENT.theme}`)}
          ${row("Дата", EVENT.date)}
          ${row("Час", EVENT.time)}
          ${row("Локація", EVENT.venue)}
          ${row("Вхід", item.passLabel)}
          ${order.name ? row("Ім'я", order.name) : ""}
        </table>
      </td></tr>
      <tr><td style="padding:0 22px 22px;" align="center">
        <a href="${esc(url)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:${C.rose};color:${C.goldInk};font:bold 14px Arial,sans-serif;text-decoration:none;">
          Відкрити квиток
        </a>
      </td></tr>
    </table>`;

  const html = `<!doctype html>
<html lang="uk">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.night};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.night};">
    <tr><td align="center" style="padding:28px 14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td align="center" style="padding:0 0 22px;">
          <img src="${origin}/media/wonderland-wordmark.png" width="200" alt="Wonderland Club" style="display:block;width:200px;height:auto;" />
        </td></tr>
        <tr><td style="padding:0 4px 22px;font:15px/1.6 Arial,sans-serif;color:${C.soft};">
          <div style="font:bold 22px Arial,sans-serif;color:${C.ink};margin-bottom:8px;">
            ${order.name ? `${esc(order.name)}, ` : ""}до зустрічі у Wonderland!
          </div>
          Оплату отримано. ${count === 1 ? "Твій квиток" : `Твої квитки (${count})`} нижче:
          покажи QR-код на вході з телефона або роздрукованим.
        </td></tr>
        <tr><td>${passes.map(passBlock).join("")}</td></tr>
        <tr><td style="padding:6px 4px 0;font:13px/1.6 Arial,sans-serif;color:${C.faint};">
          Замовлення ${esc(order.id)}, сума ${order.total} zł<br />
          ${esc(EVENT.venueName)}, ${esc(EVENT.venue)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `${order.name ? `${order.name}, д` : "Д"}о зустрічі у Wonderland!`,
    "",
    `Оплату отримано. ${EVENT.title}. ${EVENT.theme}, ${EVENT.date}, ${EVENT.time}, ${EVENT.venue}.`,
    "",
    ...passes.map(
      ({ pass, url }, i) =>
        `Квиток ${i + 1} з ${count}: ${item.name}, ${item.detail}. Код ${pass.code}. ${url}`
    ),
    "",
    `Замовлення ${order.id}, сума ${order.total} zł.`,
  ].join("\n");

  return { subject, html, text };
}
