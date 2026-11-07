import { describe, expect, it } from "vitest";
import type { BggGame } from "./bgg.ts";
import { mergeEntries, type ResolvedEntry } from "./merge.ts";

const entry = (overrides: Partial<ResolvedEntry> & { bggId: number }): ResolvedEntry => ({
  name: null,
  collections: [],
  featured: false,
  owner: null,
  comment: null,
  ...overrides,
});

const bgg = (id: number, name: string): BggGame => ({
  id,
  name,
  year: 2000,
  description: "",
  image: null,
  thumbnail: null,
  players: { min: 2, max: 4 },
  playTime: null,
  minAge: null,
  rating: 7,
  weight: 2,
  rank: null,
  categories: [],
  mechanics: [],
  designers: [],
});

describe("mergeEntries", () => {
  it("combines sheet rows with BGG data, preferring the sheet's name", () => {
    const [game] = mergeEntries([entry({ bggId: 13, name: "Settlers", featured: true })], [bgg(13, "CATAN")]);
    expect(game).toMatchObject({ id: 13, name: "Settlers", year: 2000, featured: true });
  });

  it("merges duplicate rows for the same game", () => {
    const games = mergeEntries(
      [entry({ bggId: 13, collections: ["A"] }), entry({ bggId: 13, collections: ["B", "A"], owner: "Pontus" })],
      [bgg(13, "CATAN")],
    );
    expect(games).toHaveLength(1);
    expect(games[0]).toMatchObject({ collections: ["A", "B"], owner: "Pontus" });
  });

  it("keeps a game BGG didn't return if the sheet names it, drops it otherwise", () => {
    const games = mergeEntries([entry({ bggId: 1, name: "Hemmagjort" }), entry({ bggId: 2 })], []);
    expect(games.map((g) => g.name)).toEqual(["Hemmagjort"]);
    expect(games[0]?.players).toBeNull();
  });
});
