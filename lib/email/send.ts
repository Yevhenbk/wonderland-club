import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Sends an email.
 *
 * With RESEND_API_KEY set, through Resend, from EMAIL_FROM (the domain must
 * be verified in Resend). Without it, the message is only written to
 * .data/outbox/ (one .html and one .txt per email) and logged, so it can be
 * read exactly as a customer would get it; in development the order page
 * links to it through /api/dev/outbox.
 *
 * Images travel as inline attachments, referenced as cid:<id> in the HTML:
 * Gmail and others block data: images, which would leave the QR codes
 * blank. The outbox preview swaps them back to data: URLs for the browser.
 */

export interface InlineImage {
  /** Referenced in the HTML as cid:<id>. */
  id: string;
  filename: string;
  png: Buffer;
}

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Names the preview file and keys the send; the order id. */
  ref: string;
  images?: InlineImage[];
}

export interface SendResult {
  delivered: boolean;
  /** Set when the email was only written to the outbox. */
  previewRef?: string;
}

export const OUTBOX = path.join(process.cwd(), ".data", "outbox");

const FROM = process.env.EMAIL_FROM ?? "Wonderland Club <tickets@wonderlandkrk.club>";

export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (key) return sendWithResend(email, key);

  if (process.env.NODE_ENV === "production")
    console.error(
      `[email] RESEND_API_KEY is not set: ticket email for order ${email.ref} was not sent`
    );
  return writeToOutbox(email);
}

async function sendWithResend(email: OutgoingEmail, key: string): Promise<SendResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      /* The return page and the webhook may both try to send an order's
         email at the same moment; Resend sends it once. */
      "idempotency-key": `ticket-email-${email.ref}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [email.to],
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: email.images?.map((image) => ({
        filename: image.filename,
        content: image.png.toString("base64"),
        content_id: image.id,
      })),
    }),
  });

  /* A failure throws, so the caller marks the email unsent and Stripe's
     webhook tries again later. */
  if (!response.ok)
    throw new Error(`Resend refused the email (${response.status}): ${await response.text()}`);

  console.info(`[email] sent order ${email.ref}`);
  return { delivered: true };
}

async function writeToOutbox(email: OutgoingEmail): Promise<SendResult> {
  console.info(
    `[email:mock] to=${email.to} subject="${email.subject}" ref=${email.ref}`
  );

  let html = email.html;
  for (const image of email.images ?? [])
    html = html.replaceAll(
      `cid:${image.id}`,
      `data:image/png;base64,${image.png.toString("base64")}`
    );

  /* Some hosts (Vercel) have a read-only filesystem. The order still goes
     through; only the local preview is skipped. */
  try {
    await mkdir(OUTBOX, { recursive: true });
    await writeFile(path.join(OUTBOX, `${email.ref}.html`), html, "utf8");
    await writeFile(
      path.join(OUTBOX, `${email.ref}.txt`),
      `To: ${email.to}\nSubject: ${email.subject}\n\n${email.text}`,
      "utf8"
    );
    return { delivered: false, previewRef: email.ref };
  } catch (error) {
    console.warn("[email:mock] could not write the outbox preview", error);
    return { delivered: false };
  }
}
