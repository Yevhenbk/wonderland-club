import { EVENT } from "./catalog";
import { store } from "./store";

/**
 * The door's record: which passes have come in, and when. A pass comes in
 * once; the first scan to claim it wins, even if two staff phones scan the
 * same code at the same moment (the store sets the key only if it is new).
 */

const key = (passId: string) => `wl:${EVENT.id}:in:${passId}`;

/* Kept well past the night, for questions afterwards, then dropped. */
const KEEP_SECONDS = 120 * 24 * 60 * 60;

/** A check-in can be taken back for a few minutes, for a mis-tap. */
export const UNDO_MS = 5 * 60_000;

/** When the pass came in, or null if it has not. */
export async function checkedInAt(passId: string): Promise<number | null> {
  const value = await store().get(key(passId));
  return value ? Number(value) : null;
}

/** Lets the pass in. `first` is false if it had already come in. */
export async function checkIn(passId: string): Promise<{ first: boolean; at: number }> {
  const now = Date.now();
  if (await store().setNew(key(passId), String(now), KEEP_SECONDS))
    return { first: true, at: now };
  return { first: false, at: (await checkedInAt(passId)) ?? now };
}

/** Takes back a check-in, only the one made at `at` and only for a few
    minutes, so an old entry cannot be wiped to let a copy through. */
export async function undoCheckIn(passId: string, at: number): Promise<boolean> {
  const current = await checkedInAt(passId);
  if (current !== at || Date.now() - at > UNDO_MS) return false;
  await store().del(key(passId));
  return true;
}
