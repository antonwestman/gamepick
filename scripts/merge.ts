import type { Game } from "../src/lib/game.ts";
import type { BggGame } from "./bgg.ts";
import type { SheetEntry } from "./sheet.ts";

/** "Hitster – Guilty Pleasures" → "hitster-guilty-pleasures" */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Combines our sheet rows with BGG data. Sheet order is kept (it's used for
 * "Senast tillagda"), duplicate rows for the same game are merged, and the
 * name from the sheet wins over BGG's (handy for Swedish titles). Rows that
 * aren't on BGG are kept with just the sheet's data.
 */
export function mergeEntries(entries: SheetEntry[], bggGames: BggGame[]): Game[] {
  const bggById = new Map(bggGames.map((game) => [game.bggId, game]));
  const games = new Map<string, Game>();

  for (const entry of entries) {
    const bgg = entry.bggId === null ? undefined : bggById.get(entry.bggId);
    const name = entry.name ?? bgg?.name;
    if (!name) continue; // nothing to show

    const id = entry.bggId === null ? slugify(name) : String(entry.bggId);
    const existing = games.get(id);
    if (existing) {
      games.set(id, {
        ...existing,
        collections: [...new Set([...existing.collections, ...entry.collections])],
        featured: existing.featured || entry.featured,
        owner: existing.owner ?? entry.owner,
        comment: existing.comment ?? entry.comment,
      });
      continue;
    }

    games.set(id, {
      year: null,
      description: "",
      image: null,
      thumbnail: null,
      players: null,
      playTime: null,
      minAge: null,
      rating: null,
      weight: null,
      rank: null,
      categories: [],
      mechanics: [],
      designers: [],
      ...bgg,
      id,
      bggId: entry.bggId,
      name,
      collections: [...new Set(entry.collections)],
      featured: entry.featured,
      owner: entry.owner,
      comment: entry.comment,
    });
  }

  return [...games.values()];
}
