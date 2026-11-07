import type { Game } from "./game.ts";

export type Rail = { id: string; title: string; games: Game[] };

const RAIL_LENGTH = 20;
/** Derived rails with fewer games than this feel empty, so we skip them. */
const MIN_DERIVED = 2;

const byRating = (a: Game, b: Game) => (b.rating ?? 0) - (a.rating ?? 0);

export function supportsPlayerCount(game: Game, count: number): boolean {
  if (!game.players) return true; // unknown → don't hide it
  return game.players.min <= count && count <= game.players.max;
}

/** Our own collections from the sheet, in the order they first appear. */
function collectionRails(games: Game[]): Rail[] {
  const names = [...new Set(games.flatMap((game) => game.collections))];
  return names.map((name) => ({
    id: `samling-${name}`,
    title: name,
    games: games.filter((game) => game.collections.includes(name)),
  }));
}

function derivedRails(games: Game[]): Rail[] {
  const rule = (id: string, title: string, keep: (g: Game) => boolean, sort?: typeof byRating): Rail => {
    const matching = games.filter(keep);
    return { id, title, games: (sort ? matching.sort(sort) : matching).slice(0, RAIL_LENGTH) };
  };

  return [
    rule("topp", "Högst betyg på BoardGameGeek", (g) => g.rating !== null, byRating),
    rule("samarbete", "Spela tillsammans – samarbetsspel", (g) => g.mechanics.includes("Cooperative Game")),
    rule("snabba", "Snabba spel – högst 30 min", (g) => (g.playTime?.max ?? Infinity) <= 30),
    rule("party", "Många spelare – 6 eller fler", (g) => (g.players?.max ?? 0) >= 6),
    rule("tva", "Bara för två", (g) => g.players?.max === 2),
    rule("latta", "Lätta att lära", (g) => g.weight !== null && g.weight < 2),
    rule("tunga", "Tunga strategispel", (g) => g.weight !== null && g.weight >= 3, byRating),
  ].filter((rail) => rail.games.length >= MIN_DERIVED);
}

/** BGG categories shared by at least three games, most common first. */
function categoryRails(games: Game[]): Rail[] {
  const counts = new Map<string, number>();
  for (const category of games.flatMap((g) => g.categories)) {
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category]) => ({
      id: `kategori-${category}`,
      title: category,
      games: games.filter((g) => g.categories.includes(category)),
    }));
}

/**
 * The browse page: newest first (the sheet is in the order games were added),
 * then our own collections, then rails derived from BGG data.
 */
export function buildRails(games: Game[]): Rail[] {
  const newest: Rail = { id: "nya", title: "Senast tillagda", games: [...games].reverse().slice(0, RAIL_LENGTH) };
  return [newest, ...collectionRails(games), ...derivedRails(games), ...categoryRails(games)].filter(
    (rail) => rail.games.length > 0,
  );
}

/** Featured games for the hero; falls back to the best rated ones. */
export function heroGames(games: Game[]): Game[] {
  const featured = games.filter((g) => g.featured);
  return featured.length > 0 ? featured : [...games].sort(byRating).slice(0, 3);
}

/** Games sharing the most categories and mechanics with `game`. */
export function similarGames(game: Game, games: Game[], limit = 10): Game[] {
  const traits = new Set([...game.categories, ...game.mechanics]);
  return games
    .filter((other) => other.id !== game.id)
    .map((other) => ({
      other,
      score: [...other.categories, ...other.mechanics].filter((t) => traits.has(t)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byRating(a.other, b.other))
    .slice(0, limit)
    .map(({ other }) => other);
}

export function searchGames(games: Game[], query: string): Game[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return [];
  return games.filter((game) =>
    [game.name, ...game.categories, ...game.mechanics, ...game.designers, ...game.collections].some((text) =>
      text.toLowerCase().includes(needle),
    ),
  );
}
