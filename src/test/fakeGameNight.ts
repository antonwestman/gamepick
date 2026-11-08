import { vi } from "vitest";
import { applyChange, type Change, type GameNightState } from "../lib/gameNight.ts";

export const GAME_NIGHT_URL = "https://script.example/exec";

/**
 * An in-memory stand-in for the Apps Script endpoint (apps-script/Code.gs),
 * installed as `fetch`. `shared: false` mimics the first, votes-only script.
 */
export function fakeGameNightServer(initial: Partial<GameNightState> = {}, { shared = true } = {}) {
  let state: GameNightState = {
    votes: [],
    players: shared ? [] : null,
    spin: null,
    customDecks: shared ? [] : null,
    ...initial,
  };
  const body = () => (shared ? state : { votes: state.votes });

  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    if (url !== GAME_NIGHT_URL) return new Response("not found", { status: 404 });
    if (init?.method === "POST") {
      const sent = JSON.parse(String(init.body)) as Record<string, unknown>;
      const change = (sent.action ? sent : { ...sent, action: "vote" }) as Change;
      state = applyChange(state, change);
    }
    return new Response(JSON.stringify(body()), { headers: { "Content-Type": "application/json" } });
  });

  return {
    state: () => state,
    /** Simulates another phone changing things. */
    update: (change: Change) => {
      state = applyChange(state, change);
    },
  };
}
