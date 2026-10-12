import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

/**
 * Tokens that carry checkout state in links instead of a database.
 *
 * Two kinds:
 * - sealed (AES-256-GCM): the content is private and tamper-proof. Used for
 *   checkout sessions and orders, which hold the buyer's email.
 * - signed (HMAC-SHA256): the content is readable but cannot be altered or
 *   forged. Used for passes, so the door check can verify a QR on its own.
 *
 * Each use has its own "purpose", which derives its own key: a token made
 * for one purpose never validates as another.
 *
 * The secret is TICKET_SECRET. In development a fixed fallback keeps things
 * working; in production a missing secret is an error, because tokens made
 * with a known key could be forged by anyone.
 */

export type Purpose = "session" | "order" | "pass" | "staff";

const DEV_SECRET = "wonderland-dev-secret-not-for-production";

function secret(): string {
  const value = process.env.TICKET_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production")
    throw new Error("TICKET_SECRET is not set");
  return DEV_SECRET;
}

const keyFor = (purpose: Purpose) =>
  createHash("sha256").update(`${secret()}:${purpose}`).digest();

const b64url = (buf: Buffer) => buf.toString("base64url");
const fromB64url = (text: string) => Buffer.from(text, "base64url");

/** Encrypts `data` so only this server can read it. */
export function seal(data: unknown, purpose: Purpose): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFor(purpose), iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  return b64url(Buffer.concat([iv, cipher.getAuthTag(), body]));
}

/** Reads a sealed token, or null if it is malformed, altered or foreign. */
export function unseal<T>(token: string, purpose: Purpose): T | null {
  try {
    const raw = fromB64url(token);
    if (raw.length < 29) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      keyFor(purpose),
      raw.subarray(0, 12)
    );
    decipher.setAuthTag(raw.subarray(12, 28));
    const text = Buffer.concat([
      decipher.update(raw.subarray(28)),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

const mac = (body: string, purpose: Purpose) =>
  createHmac("sha256", keyFor(purpose)).update(body).digest().subarray(0, 16);

/** Signs `data`: readable, but any change breaks the signature. */
export function sign(data: unknown, purpose: Purpose): string {
  const body = b64url(Buffer.from(JSON.stringify(data), "utf8"));
  return `${body}.${b64url(mac(body, purpose))}`;
}

/** Reads a signed token, or null if the signature does not match. */
export function verify<T>(token: string, purpose: Purpose): T | null {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = mac(body, purpose);
    const given = fromB64url(sig);
    if (given.length !== expected.length || !timingSafeEqual(given, expected))
      return null;
    return JSON.parse(fromB64url(body).toString("utf8")) as T;
  } catch {
    return null;
  }
}

/** Short random ids from an alphabet with no look-alike characters. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const toId = (bytes: Buffer, length: number) => {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
};

export function randomId(length: number): string {
  return toId(randomBytes(length), length);
}

/** Like randomId, but the same seed always gives the same id (up to 32
    characters). For orders built from a Stripe payment: the return page and
    the webhook may each build the order, and both must get the same passes.
    Keyed with the secret, so the ids cannot be worked out from the seed. */
export function derivedId(seed: string, length: number): string {
  return toId(
    createHmac("sha256", keyFor("order")).update(`id:${seed}`).digest(),
    length
  );
}
