import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Sends an email. For now it only imitates sending: the message is written
 * to .data/outbox/ (one .html and one .txt per email) and logged, so it can
 * be read exactly as a customer would get it. In development the order page
 * links to it through /api/dev/outbox.
 *
 * To go live, replace the body of `sendEmail` with the provider's call
 * (Resend, Postmark, SES...). Its arguments and result stay the same.
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Names the preview file; the order id. */
  ref: string;
}

export interface SendResult {
  delivered: boolean;
  /** Set when the email was only written to the outbox. */
  previewRef?: string;
}

export const OUTBOX = path.join(process.cwd(), ".data", "outbox");

export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  console.info(
    `[email:mock] to=${email.to} subject="${email.subject}" ref=${email.ref}`
  );

  /* Some hosts (Vercel) have a read-only filesystem. The order still goes
     through; only the local preview is skipped. */
  try {
    await mkdir(OUTBOX, { recursive: true });
    await writeFile(path.join(OUTBOX, `${email.ref}.html`), email.html, "utf8");
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
