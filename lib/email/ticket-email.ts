import { CATALOG, EVENT } from "../catalog";
import type { Order, Pass } from "../orders";

/**
 * The ticket email: the same passes the confirmation page shows, as an
 * email that works in mail clients. That means tables and inline styles,
 * no web fonts and no SVG.
 *
 * Images: each QR is an inline attachment, referenced as cid:qr-1 and so
 * on (lib/email/deliver.ts); Gmail blocks data: images. The logo travels
 * the same way when it can be read, and is loaded from the site otherwise.
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
  origin: string,
  /** The logo's image source: cid:<id> of its inline attachment. */
  logoSrc = `${origin}/media/email-logo.png`
): RenderedEmail {
  const item = CATALOG[order.item];
  const count = passes.length;
  const subject = `Твої квитки: Wonderland Club, ${EVENT.theme}, ${EVENT.date}`;
  const font = "Arial,Helvetica,sans-serif";

  const row = (k: string, v: string) => `
    <tr>
      <td style="padding:10px 0;border-top:1px solid ${C.line};font:14px ${font};color:${C.faint};">${esc(k)}</td>
      <td style="padding:10px 0;border-top:1px solid ${C.line};font:bold 14px ${font};color:${C.ink};text-align:right;">${esc(v)}</td>
    </tr>`;

  /* One ticket, laid out like the pass on the site: night and theme, what
     it is, the facts, a dashed tear line, then the QR on white. */
  const passBlock = ({ pass, url, qrSrc }: EmailPass, index: number) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;background:${C.paper};border:1px solid ${C.line};border-radius:18px;">
      <tr><td align="center" style="padding:26px 24px 4px;">
        ${count > 1 ? `<div style="font:12px ${font};color:${C.faint};margin-bottom:10px;">Квиток ${index + 1} із ${count}</div>` : ""}
        <div style="font:bold 12px ${font};letter-spacing:2px;text-transform:uppercase;color:${C.rose};">
          ${esc(EVENT.title)}. ${esc(EVENT.theme)}
        </div>
        <div style="margin-top:8px;font:bold 24px ${font};color:${C.ink};">${esc(item.name)}</div>
        <div style="margin-top:2px;font:bold 16px ${font};color:${C.soft};">${esc(item.detail)}</div>
      </td></tr>
      <tr><td style="padding:16px 24px 6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row("Дата", EVENT.date)}
          ${row("Час", EVENT.time)}
          ${row("Локація", EVENT.venue)}
          ${row("Вхід", item.passLabel)}
          ${order.name ? row("Ім'я", order.name) : ""}
        </table>
      </td></tr>
      <tr><td style="padding:10px 24px 0;">
        <div style="border-top:2px dashed ${C.line};font-size:0;line-height:0;">&nbsp;</div>
      </td></tr>
      <tr><td align="center" style="padding:22px 24px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;">
          <tr><td style="padding:10px;">
            <img src="${qrSrc}" width="210" height="210" alt="QR-код квитка ${esc(pass.code)}" style="display:block;width:210px;height:210px;border:0;" />
          </td></tr>
        </table>
        <div style="margin-top:14px;font:bold 17px 'Courier New',Courier,monospace;letter-spacing:3px;color:${C.ink};">${esc(pass.code)}</div>
      </td></tr>
      <tr><td align="center" style="padding:16px 24px 26px;">
        <a href="${esc(url)}" style="display:inline-block;padding:13px 26px;border-radius:999px;background:${C.rose};color:${C.goldInk};font:bold 15px ${font};text-decoration:none;">
          Відкрити квиток
        </a>
      </td></tr>
    </table>`;

  const html = `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.night};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${count === 1 ? "Твій квиток" : `Твої квитки (${count})`} на ${esc(EVENT.theme)}, ${esc(EVENT.date)}. QR-код всередині.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.night};">
    <tr><td align="center" style="padding:32px 14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
        <tr><td align="center" style="padding:0 0 26px;">
          <img src="${logoSrc}" width="200" height="50" alt="Wonderland Club" style="display:block;width:200px;height:auto;border:0;" />
        </td></tr>
        <tr><td align="center" style="padding:0 8px 26px;">
          <div style="font:bold 26px ${font};color:${C.ink};">Оплату підтверджено</div>
          <div style="margin-top:10px;font:15px/1.6 ${font};color:${C.soft};">
            ${order.name ? `${esc(order.name)}, до` : "До"} зустрічі у Wonderland!
            ${count === 1 ? "Твій квиток нижче" : `Твої квитки (${count}) нижче`}:
            покажи QR-код на вході з телефона або роздрукованим.
          </div>
        </td></tr>
        <tr><td>${passes.map(passBlock).join("")}</td></tr>
        <tr><td align="center" style="padding:4px 8px 0;font:13px/1.7 ${font};color:${C.faint};">
          Кожен код проходить один раз, тож не пересилай його.<br />
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
    `Оплату підтверджено. ${EVENT.title}. ${EVENT.theme}, ${EVENT.date}, ${EVENT.time}, ${EVENT.venue}.`,
    "",
    ...passes.map(
      ({ pass, url }, i) =>
        `Квиток ${i + 1} із ${count}: ${item.name}, ${item.detail}. Код ${pass.code}. ${url}`
    ),
    "",
    "Кожен код проходить один раз, тож не пересилай його.",
    `Замовлення ${order.id}, сума ${order.total} zł.`,
  ].join("\n");

  return { subject, html, text };
}
