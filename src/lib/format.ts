import type { Range } from "./game.ts";

export function formatRange(range: Range | null, unit: string): string | null {
  if (!range) return null;
  const value = range.min === range.max ? `${range.min}` : `${range.min}–${range.max}`;
  return `${value} ${unit}`;
}

export const formatPlayers = (players: Range | null) => formatRange(players, "spelare");
export const formatPlayTime = (playTime: Range | null) => formatRange(playTime, "min");

export function weightLabel(weight: number | null): string | null {
  if (weight === null) return null;
  if (weight < 2) return "Lätt";
  if (weight < 3) return "Medel";
  return "Tungt";
}

export function bggUrl(id: number): string {
  return `https://boardgamegeek.com/boardgame/${id}`;
}

/** First paragraph, cut at a word boundary – used for the hero teaser. */
export function teaser(description: string, maxLength = 220): string {
  const first = description.split("\n").find((p) => p.trim() !== "") ?? "";
  if (first.length <= maxLength) return first;
  return `${first.slice(0, first.lastIndexOf(" ", maxLength))}…`;
}
