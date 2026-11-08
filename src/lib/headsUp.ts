import type { Deck } from "./headsUpDecks.ts";

export const COUNTDOWN_MS = 3_000;
export const ROUND_MS = 60_000;
/** How long "Rätt!"/"Pass" covers the screen. Tilts are ignored meanwhile. */
export const FLASH_MS = 700;

export type Answer = "correct" | "pass";
export type Result = { word: string; answer: Answer };

export type Flash = { answer: Answer; until: number };

/** No round (null) means the player is picking a deck. */
export type Round =
  | { phase: "countdown"; deck: Deck; words: string[]; startsAt: number }
  | { phase: "playing"; deck: Deck; words: string[]; results: Result[]; endsAt: number; flash: Flash | null }
  | { phase: "done"; deck: Deck; results: Result[] };

export type Action =
  | { type: "start"; deck: Deck; words: string[]; now: number }
  | { type: "begin" }
  | { type: "answer"; answer: Answer; now: number }
  | { type: "unflash" }
  | { type: "timeUp" }
  | { type: "quit" };

export function roundReducer(round: Round | null, action: Action): Round | null {
  switch (action.type) {
    case "start":
      return { phase: "countdown", deck: action.deck, words: action.words, startsAt: action.now + COUNTDOWN_MS };
    case "quit":
      return null;
  }
  if (round === null) return null;

  switch (action.type) {
    case "begin":
      if (round.phase !== "countdown") return round;
      return { ...round, phase: "playing", results: [], endsAt: round.startsAt + ROUND_MS, flash: null };
    case "answer": {
      if (round.phase !== "playing" || round.flash !== null) return round;
      const word = round.words[round.results.length];
      if (word === undefined) return round;
      const results = [...round.results, { word, answer: action.answer }];
      // Out of words: the round is over early.
      if (results.length === round.words.length) return { phase: "done", deck: round.deck, results };
      return { ...round, results, flash: { answer: action.answer, until: action.now + FLASH_MS } };
    }
    case "unflash":
      return round.phase === "playing" ? { ...round, flash: null } : round;
    case "timeUp":
      return round.phase === "playing" ? { phase: "done", deck: round.deck, results: round.results } : round;
  }
}

export function currentWord(round: Extract<Round, { phase: "playing" }>): string | undefined {
  return round.words[round.results.length];
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  return items
    .map((item) => ({ item, key: random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
}

export type Tilt = "down" | "up" | "level" | "between";

/** |facing| at which a tilt counts (≈ 35° past vertical). */
const TRIGGER = 0.57;
/** |facing| under which the phone is back on the forehead (≈ 17°). */
const LEVEL = 0.3;

/**
 * Which way the screen faces, from DeviceOrientationEvent's beta/gamma.
 * cos(β)·cos(γ) is the vertical component of the screen's normal: +1 facing the
 * ceiling, −1 facing the floor, 0 upright. That holds in portrait and landscape
 * alike, so we don't need to know how the phone is rotated.
 */
export function tiltOf(beta: number, gamma: number): Tilt {
  const rad = Math.PI / 180;
  const facing = Math.cos(beta * rad) * Math.cos(gamma * rad);
  if (facing <= -TRIGGER) return "down";
  if (facing >= TRIGGER) return "up";
  return Math.abs(facing) < LEVEL ? "level" : "between";
}
