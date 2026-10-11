import { readFile } from "node:fs/promises";
import path from "node:path";

import { emailPreviewEnabled } from "@/lib/email/preview";
import { OUTBOX } from "@/lib/email/send";

/**
 * Shows an imitated ticket email from .data/outbox, as the customer would
 * get it. On in development; in production only with EMAIL_PREVIEW=1, since
 * these are customers' emails.
 */
export async function GET(request: Request) {
  if (!emailPreviewEnabled()) return new Response("Not found", { status: 404 });

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[A-Z0-9]{10}$/.test(id))
    return new Response("Unknown email", { status: 404 });

  try {
    const html = await readFile(path.join(OUTBOX, `${id}.html`), "utf8");
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    return new Response("Unknown email", { status: 404 });
  }
}
