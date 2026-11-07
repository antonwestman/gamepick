import type { Game } from "../src/lib/game.ts";
import type { BggGame } from "./bgg.ts";
import type { SheetEntry } from "./sheet.ts";

export type ResolvedEntry = Omit<SheetEntry, "bggId"> & { bggId: number };

/**
 * Combines our sheet rows with BGG data. Sheet order is kept (it's used for
 * "Senast tillagda"), duplicate rows for the same game are merged, and the
 * name from the sheet wins over BGG's (handy for Swedish titles).
 */
export function mergeEntries(entries: ResolvedEntry[], bggGames: BggGame[]): Game[] {
  const bggById = new Map(bggGames.map((game) => [game.id, game]));
  const games = new Map<number, Game>();

  for (const entry of entries) {
    const existing = games.get(entry.bggId);
    if (existing) {
      games.set(entry.bggId, {
        ...existing,
        collections: [...new Set([...existing.collections, ...entry.collections])],
        featured: existing.featured || entry.featured,
        owner: existing.owner ?? entry.owner,
        comment: existing.comment ?? entry.comment,
      });
      continue;
    }

    const bgg = bggById.get(entry.bggId);
    const name = entry.name ?? bgg?.name;
    if (!name) continue; // nothing to show

    games.set(entry.bggId, {
      id: entry.bggId,
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
      name,
      collections: [...new Set(entry.collections)],
      featured: entry.featured,
      owner: entry.owner,
      comment: entry.comment,
    });
  }

  return [...games.values()];
}
