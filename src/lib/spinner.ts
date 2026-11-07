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
