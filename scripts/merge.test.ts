import { describe, expect, it } from "vitest";
import type { BggGame } from "./bgg.ts";
import { mergeEntries, slugify } from "./merge.ts";
import type { SheetEntry } from "./sheet.ts";

const entry = (overrides: Partial<SheetEntry>): SheetEntry => ({
  bggId: null,
  name: null,
  collections: [],
  featured: false,
  owner: null,
  comment: null,
  ...overrides,
});

const bgg = (bggId: number, name: string): BggGame => ({
  bggId,
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
    expect(game).toMatchObject({ id: "13", bggId: 13, name: "Settlers", year: 2000, featured: true });
  });

  it("merges duplicate rows for the same game", () => {
    const games = mergeEntries(
      [entry({ bggId: 13, collections: ["A"] }), entry({ bggId: 13, collections: ["B", "A"], owner: "Pontus" })],
      [bgg(13, "CATAN")],
    );
    expect(games).toHaveLength(1);
    expect(games[0]).toMatchObject({ collections: ["A", "B"], owner: "Pontus" });
  });

  it("keeps games that aren't on BGG, using a slug of the name as id", () => {
    const [game] = mergeEntries([entry({ name: "Hitster – Guilty Pleasures", collections: ["Party"] })], []);
    expect(game).toMatchObject({ id: "hitster-guilty-pleasures", bggId: null, collections: ["Party"], players: null });
  });

  it("drops rows with neither a name nor BGG data", () => {
    expect(mergeEntries([entry({ bggId: 2 })], [])).toEqual([]);
  });
});

describe("slugify", () => {
  it("makes readable, url-safe ids", () => {
    expect(slugify("Brass: Birmingham")).toBe("brass-birmingham");
    expect(slugify("Släkt & vänner – Fördel")).toBe("slakt-vanner-fordel");
  });
});
