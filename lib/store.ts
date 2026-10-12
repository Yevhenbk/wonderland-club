import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Redis } from "@upstash/redis";

/**
 * The little the site has to remember between requests: which passes came
 * in at the door, and failed staff PIN attempts.
 *
 * Upstash Redis when it is connected (Vercel > Storage > Upstash adds
 * KV_REST_API_URL and KV_REST_API_TOKEN), otherwise a JSON file in .data/
 * for local development. In production a missing Redis is an error rather
 * than a quiet fallback: a file on a serverless host is neither shared
 * between servers nor kept, so check-ins would stop counting without anyone
 * noticing.
 */

interface Store {
  /** Sets the key only if it is not set yet. True if this call set it. */
  setNew(key: string, value: string, ttlSeconds: number): Promise<boolean>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<void>;
  /** Adds one and returns the new count; the count expires after ttl. */
  incr(key: string, ttlSeconds: number): Promise<number>;
}

function redisStore(url: string, token: string): Store {
  /* Values stay strings: left on, the client would turn "1731..." into a
     number on the way out. */
  const redis = new Redis({ url, token, automaticDeserialization: false });
  return {
    setNew: async (key, value, ttl) =>
      (await redis.set(key, value, { nx: true, ex: ttl })) === "OK",
    get: (key) => redis.get<string>(key),
    del: async (key) => {
      await redis.del(key);
    },
    incr: async (key, ttl) => {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, ttl);
      return count;
    },
  };
}

function fileStore(): Store {
  const file = path.join(process.cwd(), ".data", "store.json");
  type Entry = { v: string; exp: number };
  /* Read fresh every time: in development the pages and the API routes
     each load their own copy of this module, and must see each other's
     writes. Changes queue one after another, so none is lost. */
  let queue: Promise<unknown> = Promise.resolve();
  const read = () =>
    readFile(file, "utf8")
      .then((text) => JSON.parse(text) as Record<string, Entry>)
      .catch((): Record<string, Entry> => ({}));
  const change = <T>(edit: (all: Record<string, Entry>) => T): Promise<T> => {
    const job = queue.then(async () => {
      const all = await read();
      const result = edit(all);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(all, null, 1), "utf8");
      return result;
    });
    queue = job.catch(() => {});
    return job;
  };
  const alive = (entry: Entry | undefined) =>
    entry && entry.exp >= Date.now() ? entry : undefined;

  return {
    setNew: (key, value, ttl) =>
      change((all) => {
        if (alive(all[key])) return false;
        all[key] = { v: value, exp: Date.now() + ttl * 1000 };
        return true;
      }),
    get: async (key) => alive((await read())[key])?.v ?? null,
    del: (key) =>
      change((all) => {
        delete all[key];
      }),
    incr: (key, ttl) =>
      change((all) => {
        const entry = alive(all[key]);
        const count = Number(entry?.v ?? 0) + 1;
        all[key] = { v: String(count), exp: entry?.exp ?? Date.now() + ttl * 1000 };
        return count;
      }),
  };
}

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

let instance: Store | null = null;

/** False in production until Upstash is connected. */
export const storeReady = () =>
  Boolean(url && token) || process.env.NODE_ENV !== "production";

export function store(): Store {
  if (!storeReady()) throw new Error("Upstash Redis is not connected");
  return (instance ??= url && token ? redisStore(url, token) : fileStore());
}
