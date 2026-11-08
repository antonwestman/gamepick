/**
 * Shared state for the evening, stored in our sheet behind a Google Apps Script
 * (apps-script/Code.gs): votes, the players in "Vem börjar?", its latest spin
 * and the players' own Pannlappen categories.
 */
import type { CustomDeck } from "./customDecks.ts";
import { applyVote, type Vote } from "./votes.ts";
import { cleanNames } from "./spinner.ts";

export type Spin = { id: string; winner: string; by: string };

export type GameNightState = {
  votes: Vote[];
  /** null when the deployed Apps Script predates shared players – the spinner then keeps its own list. */
  players: string[] | null;
  spin: Spin | null;
  /** null when the deployed Apps Script predates custom decks – making them is then hidden. */
  customDecks: CustomDeck[] | null;
};

export type Change =
  | { action: "vote"; gameId: string; voter: string; vote: boolean }
  | { action: "addPlayer"; name: string }
  | { action: "removePlayer"; name: string }
  | ({ action: "spin" } & Spin)
  | ({ action: "saveDeck" } & CustomDeck)
  | { action: "deleteDeck"; id: string };

export const emptyState: GameNightState = { votes: [], players: null, spin: null, customDecks: null };

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** What the server will do – applied right away so the UI doesn't wait for the round trip. */
export function applyChange(state: GameNightState, change: Change): GameNightState {
  switch (change.action) {
    case "vote":
      return { ...state, votes: applyVote(state.votes, change) };
    case "addPlayer":
      return { ...state, players: cleanNames([...(state.players ?? []), change.name]) };
    case "removePlayer":
      return { ...state, players: (state.players ?? []).filter((name) => !sameName(name, change.name)) };
    case "spin":
      return { ...state, spin: { id: change.id, winner: change.winner, by: change.by } };
    case "saveDeck": {
      const { action: _, ...deck } = change;
      const decks = state.customDecks ?? [];
      const exists = decks.some((d) => d.id === deck.id);
      return { ...state, customDecks: exists ? decks.map((d) => (d.id === deck.id ? deck : d)) : [...decks, deck] };
    }
    case "deleteDeck":
      return { ...state, customDecks: (state.customDecks ?? []).filter((d) => d.id !== change.id) };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseState(body: unknown): GameNightState {
  if (!isRecord(body)) throw new Error("Oväntat svar");
  if (typeof body.error === "string") throw new Error(body.error);
  if (!Array.isArray(body.votes)) throw new Error("Oväntat svar");

  const votes = body.votes.flatMap((v): Vote[] =>
    isRecord(v) && typeof v.gameId === "string" && typeof v.voter === "string" ? [{ gameId: v.gameId, voter: v.voter }] : [],
  );
  const players = Array.isArray(body.players)
    ? cleanNames(body.players.filter((p): p is string => typeof p === "string"))
    : null;
  const spin =
    isRecord(body.spin) && typeof body.spin.id === "string" && typeof body.spin.winner === "string"
      ? { id: body.spin.id, winner: body.spin.winner, by: typeof body.spin.by === "string" ? body.spin.by : "" }
      : null;
  const customDecks = Array.isArray(body.customDecks) ? body.customDecks.flatMap(parseDeck) : null;
  return { votes, players, spin, customDecks };
}

const parseDeck = (d: unknown): CustomDeck[] =>
  isRecord(d) && typeof d.id === "string" && typeof d.title === "string" && Array.isArray(d.words)
    ? [
        {
          id: d.id,
          title: d.title,
          emoji: typeof d.emoji === "string" ? d.emoji : "",
          by: typeof d.by === "string" ? d.by : "",
          words: d.words.filter((w): w is string => typeof w === "string"),
        },
      ]
    : [];

async function parse(response: Response): Promise<GameNightState> {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseState(await response.json());
}

export async function fetchState(url: string): Promise<GameNightState> {
  return parse(await fetch(url));
}

export async function sendChange(url: string, change: Change): Promise<GameNightState> {
  // Votes predate "action", so the script treats a body without one as a vote.
  const { action, ...rest } = change;
  const body = action === "vote" ? rest : change;
  // text/plain keeps this a "simple" request, so the browser skips the CORS preflight Apps Script can't answer.
  return parse(
    await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) }),
  );
}
