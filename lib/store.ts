import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Redis } from "@upstash/redis";

/**
 * The little the site has to remember between requests: which passes came
 * in at the door, failed staff PIN attempts, and the anonymous visit
 * statistics behind /dashboard (lib/analytics.ts).
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
  /** Several writes in one round trip: counters in hashes and members in
      unique counters (HyperLogLog), each key kept for ttl. */
  batch(ops: StoreOp[], ttlSeconds: number): Promise<void>;
  /** Many hashes in one round trip, in the order asked. */
  hashes(keys: string[]): Promise<Record<string, string>[]>;
  /** How many distinct members across all the given unique counters. */
  uniques(keys: string[]): Promise<number>;
  /** The same, for each key on its own, in one round trip. */
  uniquesEach(keys: string[]): Promise<number[]>;
}

export type StoreOp =
  | { hincr: [key: string, field: string, by: number] }
  | { unique: [key: string, member: string] };

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
    batch: async (ops, ttl) => {
      if (!ops.length) return;
      const pipe = redis.pipeline();
      const keys = new Set<string>();
      for (const op of ops) {
        if ("hincr" in op) {
          pipe.hincrby(op.hincr[0], op.hincr[1], op.hincr[2]);
          keys.add(op.hincr[0]);
        } else {
          pipe.pfadd(op.unique[0], op.unique[1]);
          keys.add(op.unique[0]);
        }
      }
      for (const key of keys) pipe.expire(key, ttl);
      await pipe.exec();
    },
    hashes: async (keys) => {
      if (!keys.length) return [];
      const pipe = redis.pipeline();
      for (const key of keys) pipe.hgetall(key);
      const rows = (await pipe.exec()) as (Record<string, string> | string[] | null)[];
      /* Without deserialisation a hash may come back as a flat
         [field, value, ...] list. */
      return rows.map((row) => {
        if (!row) return {};
        if (Array.isArray(row)) {
          const out: Record<string, string> = {};
          for (let i = 0; i < row.length; i += 2) out[row[i]] = row[i + 1];
          return out;
        }
        return row;
      });
    },
    uniques: async (keys) => (keys.length ? Number(await redis.pfcount(keys[0], ...keys.slice(1))) : 0),
    uniquesEach: async (keys) => {
      if (!keys.length) return [];
      const pipe = redis.pipeline();
      for (const key of keys) pipe.pfcount(key);
      return ((await pipe.exec()) as unknown[]).map(Number);
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
    /* Locally a hash is a JSON object and a unique counter an exact list of
       members: the same answers Redis gives, near enough for development. */
    batch: (ops, ttl) =>
      change((all) => {
        const exp = Date.now() + ttl * 1000;
        for (const op of ops) {
          const key = "hincr" in op ? op.hincr[0] : op.unique[0];
          const value = JSON.parse(alive(all[key])?.v ?? ("hincr" in op ? "{}" : "[]"));
          if ("hincr" in op) value[op.hincr[1]] = (value[op.hincr[1]] ?? 0) + op.hincr[2];
          else if (!value.includes(op.unique[1])) value.push(op.unique[1]);
          all[key] = { v: JSON.stringify(value), exp };
        }
      }),
    hashes: async (keys) => {
      const all = await read();
      return keys.map((key) => {
        const value = JSON.parse(alive(all[key])?.v ?? "{}") as Record<string, number>;
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, String(v)]));
      });
    },
    uniques: async (keys) => {
      const all = await read();
      const members = new Set<string>();
      for (const key of keys) for (const m of JSON.parse(alive(all[key])?.v ?? "[]")) members.add(m);
      return members.size;
    },
    uniquesEach: async (keys) => {
      const all = await read();
      return keys.map((key) => (JSON.parse(alive(all[key])?.v ?? "[]") as string[]).length);
    },
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
