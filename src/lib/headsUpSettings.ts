import { useState } from "react";
import { DIFFICULTIES, LANGUAGES, type Difficulty, type Language } from "./headsUpDecks.ts";

export type Settings = { language: Language; difficulty: Difficulty; teams: string[] };

const KEY = "gamepick.headsUp";
const DEFAULTS: Settings = { language: "sv", difficulty: "medium", teams: [] };

const isLanguage = (value: unknown): value is Language => LANGUAGES.some((l) => l.id === value);
const isDifficulty = (value: unknown): value is Difficulty => DIFFICULTIES.some((d) => d.id === value);

function read(): Settings {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (typeof stored !== "object" || stored === null) return DEFAULTS;
    const language = "language" in stored && isLanguage(stored.language) ? stored.language : DEFAULTS.language;
    const difficulty = "difficulty" in stored && isDifficulty(stored.difficulty) ? stored.difficulty : DEFAULTS.difficulty;
    const teams =
      "teams" in stored && Array.isArray(stored.teams)
        ? stored.teams.filter((t): t is string => typeof t === "string")
        : DEFAULTS.teams;
    return { language, difficulty, teams };
  } catch {
    return DEFAULTS;
  }
}

/** Language, difficulty and teams, remembered on this phone until next game night. */
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
