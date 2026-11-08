import { useState } from "react";
import { DIFFICULTIES, type Difficulty } from "./headsUpDecks.ts";

export type Settings = { difficulty: Difficulty; teams: string[] };

const KEY = "gamepick.headsUp";
const DEFAULTS: Settings = { difficulty: "medium", teams: [] };

const isDifficulty = (value: unknown): value is Difficulty => DIFFICULTIES.some((d) => d.id === value);

function read(): Settings {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (typeof stored !== "object" || stored === null) return DEFAULTS;
    const difficulty = "difficulty" in stored && isDifficulty(stored.difficulty) ? stored.difficulty : DEFAULTS.difficulty;
    const teams =
      "teams" in stored && Array.isArray(stored.teams)
        ? stored.teams.filter((t): t is string => typeof t === "string")
        : DEFAULTS.teams;
    return { difficulty, teams };
  } catch {
    return DEFAULTS;
  }
}

/** Difficulty and teams, remembered on this phone until next game night. */
export function useHeadsUpSettings(): [Settings, (next: Settings) => void] {
  const [settings, setSettings] = useState(read);
  const update = (next: Settings) => {
    setSettings(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Not remembered next time – fine.
    }
  };
  return [settings, update];
}
