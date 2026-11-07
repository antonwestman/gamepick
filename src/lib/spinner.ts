/**
 * Wheel math for "Vem börjar?". Angles are degrees clockwise from 12 o'clock,
 * where the pointer sits. Segment i covers [i·size, (i+1)·size) on the wheel.
 */

export const segmentSize = (count: number) => 360 / count;

const mod360 = (angle: number) => ((angle % 360) + 360) % 360;

/** Which segment is under the pointer after the wheel has turned `rotation` degrees. */
export function winnerAt(rotation: number, count: number): number {
  return Math.floor(mod360(-rotation) / segmentSize(count)) % count;
}

/**
 * The rotation to animate to so that `winner` stops under the pointer.
 * Always spins forward at least `turns` full turns from `current`.
 * `offset` (-0.5..0.5) moves the stop inside the segment so it doesn't always land dead centre.
 */
export function spinTarget(current: number, count: number, winner: number, offset = 0, turns = 5): number {
  const size = segmentSize(count);
  const stopOnWheel = (winner + 0.5 + offset * 0.8) * size;
  const extra = mod360(-stopOnWheel - current);
  return current + turns * 360 + extra;
}

/** Keeps the order people typed, drops blanks and case-insensitive duplicates. */
export function cleanNames(names: string[]): string[] {
  const seen = new Set<string>();
  return names
    .map((name) => name.trim())
    .filter((name) => {
      const key = name.toLowerCase();
      if (name === "" || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** How long the wheel spins. Every phone stops at startAt + SPIN_MS. */
export const SPIN_MS = 4500;
/** Head start before a shared spin begins, so other phones have time to fetch it. */
export const SHARED_LEAD_MS = 3000;

/**
 * A spin's id carries its start time ("<epoch ms>~<uuid>"), so all phones can start
 * and stop together without changing what the Apps Script stores.
 */
export function newSpinId(startAt: number): string {
  return `${Math.round(startAt)}~${crypto.randomUUID()}`;
}

export function spinStartAt(spinId: string): number | null {
  const match = spinId.match(/^(\d{13})~/);
  return match?.[1] ? Number(match[1]) : null;
}

export type SpinSchedule =
  | { kind: "wait"; waitMs: number } // count down, then spin for SPIN_MS
  | { kind: "spin"; durationMs: number } // already started: spin faster to stop on time
  | { kind: "over" }; // just show the result

/** What a phone should do about a spin that starts at `startAt`, seen at `now`. */
export function scheduleSpin(startAt: number, now: number): SpinSchedule {
  // A phone whose clock is far off shouldn't make everyone wait.
  const start = Math.min(startAt, now + SHARED_LEAD_MS);
  if (start > now) return { kind: "wait", waitMs: start - now };
  const remaining = start + SPIN_MS - now;
  // Under ~0.8 s the wheel would just jerk – show the result instead.
  return remaining > 800 ? { kind: "spin", durationMs: remaining } : { kind: "over" };
}
