import { deckWords, type Deck, type Difficulty, type Language } from "./headsUpDecks.ts";

export const COUNTDOWN_MS = 3_000;
export const ROUND_MS = 60_000;
/** How long "Rätt!"/"Pass" covers the screen. Tilts are ignored meanwhile. */
export const FLASH_MS = 700;

export type Answer = "correct" | "pass";
export type Result = { word: string; answer: Answer };
export type Flash = { answer: Answer; until: number };

/** `team` is null when playing without teams. */
type RoundBase = { deck: Deck; team: string | null };

export type Round =
  | (RoundBase & { phase: "countdown"; words: string[]; startsAt: number })
  | (RoundBase & { phase: "playing"; words: string[]; results: Result[]; endsAt: number; flash: Flash | null })
  | (RoundBase & { phase: "done"; results: Result[] });

export type Played = { team: string | null; results: Result[] };

/**
 * No round (null) means we're on the setup screen. `played` is every finished round since the last reset;
 * `seen` is every word anyone has had on their forehead, so no word comes up twice in a game.
 */
export type Game = { round: Round | null; played: Played[]; seen: string[] };

export const NEW_GAME: Game = { round: null, played: [], seen: [] };

export type Action =
  | { type: "start"; deck: Deck; team: string | null; words: string[]; now: number }
  | { type: "begin" }
  | { type: "answer"; answer: Answer; now: number }
  | { type: "unflash" }
  | { type: "timeUp" }
  | { type: "quit" }
  | { type: "newGame" };

/** The answered words plus the one on screen, if any – it was seen even if time ran out. */
function shownWords(round: Round): string[] {
  switch (round.phase) {
    case "countdown":
      return [];
    case "playing":
      return round.words.slice(0, round.results.length + 1);
    case "done":
      return round.results.map((r) => r.word);
  }
}

function finish(game: Game, round: Extract<Round, { phase: "playing" }>, results: Result[]): Game {
  return {
    round: { phase: "done", deck: round.deck, team: round.team, results },
    played: [...game.played, { team: round.team, results }],
    seen: [...game.seen, ...shownWords({ ...round, results })],
  };
}

export function gameReducer(game: Game, action: Action): Game {
  const { round } = game;
  switch (action.type) {
    case "start":
      return {
        ...game,
        round: {
          phase: "countdown",
          deck: action.deck,
          team: action.team,
          words: action.words,
          startsAt: action.now + COUNTDOWN_MS,
        },
      };
    case "quit":
      // Words from an abandoned round still count as seen.
      return { ...game, round: null, seen: round?.phase === "playing" ? [...game.seen, ...shownWords(round)] : game.seen };
    case "newGame":
      return NEW_GAME;
    case "begin":
      if (round?.phase !== "countdown") return game;
      return {
        ...game,
        round: { ...round, phase: "playing", results: [], endsAt: round.startsAt + ROUND_MS, flash: null },
      };
    case "answer": {
      if (round?.phase !== "playing" || round.flash !== null) return game;
      const word = currentWord(round);
      if (word === undefined) return game;
      const results = [...round.results, { word, answer: action.answer }];
      // Out of words: the round is over early.
      if (results.length === round.words.length) return finish(game, round, results);
      return { ...game, round: { ...round, results, flash: { answer: action.answer, until: action.now + FLASH_MS } } };
    }
    case "unflash":
      return round?.phase === "playing" ? { ...game, round: { ...round, flash: null } } : game;
    case "timeUp":
      return round?.phase === "playing" ? finish(game, round, round.results) : game;
  }
}

export function currentWord(round: Extract<Round, { phase: "playing" }>): string | undefined {
  return round.words[round.results.length];
}

export const correctCount = (results: Result[]) => results.filter((r) => r.answer === "correct").length;

/** Teams only count with at least two of them. */
export const isTeamGame = (teams: readonly string[]) => teams.length >= 2;

/** Whose turn it is: teams take turns in order. */
export function nextTeam(teams: readonly string[], played: readonly Played[]): string | null {
  return isTeamGame(teams) ? (teams[played.length % teams.length] ?? null) : null;
}

export function teamScores(teams: readonly string[], played: readonly Played[]) {
  return teams.map((team) => ({
    team,
    score: played.filter((p) => p.team === team).reduce((sum, p) => sum + correctCount(p.results), 0),
  }));
}

/** The words in a deck nobody has seen yet this game. */
export function unseenWords(deck: Deck, language: Language, difficulty: Difficulty, seen: readonly string[]): string[] {
  const used = new Set(seen);
  return deckWords(deck, language, difficulty).filter((word) => !used.has(word));
}

/**
 * The unseen words, shuffled. Can be short or empty: a round ends early when
 * it runs out, and an empty deck can't be started.
 */
export function wordsForRound(
  deck: Deck,
  language: Language,
  difficulty: Difficulty,
  seen: readonly string[],
  random: () => number = Math.random,
): string[] {
  return shuffle(unseenWords(deck, language, difficulty, seen), random);
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
