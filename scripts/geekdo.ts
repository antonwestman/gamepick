/**
 * Token-free fallback: the JSON API that boardgamegeek.com's own pages use
 * (api.geekdo.com). It's undocumented, so every field is treated as optional
 * and the build falls back to sheet-only data for a game if it changes shape.
 */
import { decodeEntities, type BggGame } from "./bgg.ts";

type Link = { name?: string };
type GeekItem = {
  objectid?: string | number;
  name?: string;
  yearpublished?: string | number;
  minplayers?: string | number;
  maxplayers?: string | number;
  minplaytime?: string | number;
  maxplaytime?: string | number;
  minage?: string | number;
  description?: string;
  imageurl?: string;
  images?: Record<string, string | undefined>;
  links?: Record<string, Link[] | undefined>;
  rankinfo?: { veryshortprettyname?: string; subdomain?: string | null; rank?: string | number }[];
};
type DynamicInfo = {
  stats?: { average?: string | number; avgweight?: string | number };
  rankinfo?: GeekItem["rankinfo"];
};

const API = "https://api.geekdo.com/api";
const HEADERS = { Accept: "application/json", "User-Agent": "gamepick (github pages build)" };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url: string): Promise<unknown> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { headers: HEADERS });
    if (response.ok) return response.json();
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`${url} → HTTP ${response.status}`);
    }
    await sleep(2000 * 2 ** attempt);
  }
  throw new Error(`${url} kept failing, giving up`);
}

function positive(value: string | number | undefined): number | null {
  const n = Number(value);
  return value === undefined || value === "" || !Number.isFinite(n) || n <= 0 ? null : n;
}

/** BGG descriptions here are HTML: keep paragraphs, drop tags. */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h\d)>/gi, "\n\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function overallRank(rankinfo: GeekItem["rankinfo"]): number | null {
  const overall = rankinfo?.find((r) => r.subdomain === null || r.veryshortprettyname === "Overall");
  return positive(overall?.rank);
}

export function parseGeekdo(id: number, item: GeekItem, dynamic: DynamicInfo | undefined): BggGame | null {
  if (!item.name) return null;
  const names = (type: string) => (item.links?.[type] ?? []).flatMap((link) => (link.name ? [decodeEntities(link.name)] : []));
  const minPlayers = positive(item.minplayers);
  const maxPlayers = positive(item.maxplayers);
  const minTime = positive(item.minplaytime);
  const maxTime = positive(item.maxplaytime);

  return {
    bggId: id,
    name: decodeEntities(item.name),
    year: positive(item.yearpublished),
    description: htmlToText(item.description ?? ""),
    image: item.images?.original ?? item.imageurl ?? null,
    thumbnail: item.images?.square200 ?? item.images?.thumb ?? null,
    players: minPlayers || maxPlayers ? { min: minPlayers ?? maxPlayers ?? 0, max: Math.max(minPlayers ?? 0, maxPlayers ?? 0) } : null,
    playTime: minTime || maxTime ? { min: minTime ?? maxTime ?? 0, max: Math.max(minTime ?? 0, maxTime ?? 0) } : null,
    minAge: positive(item.minage),
    rating: positive(dynamic?.stats?.average),
    weight: positive(dynamic?.stats?.avgweight),
    rank: overallRank(dynamic?.rankinfo ?? item.rankinfo),
    categories: names("boardgamecategory"),
    mechanics: names("boardgamemechanic"),
    designers: names("boardgamedesigner").filter((d) => d !== "(Uncredited)"),
  };
}

export async function fetchGeekdoGame(id: number): Promise<BggGame | null> {
  const query = `objectid=${id}&objecttype=thing`;
  const items = (await getJson(`${API}/geekitems?${query}`)) as { item?: GeekItem };
  // Ratings/weight live in a separate call; the page still works without them.
  const dynamic = await getJson(`${API}/dynamicinfo?${query}`)
    .then((json) => (json as { item?: DynamicInfo }).item)
    .catch((error: unknown) => {
      console.warn(`  no ratings for ${id}: ${error instanceof Error ? error.message : error}`);
      return undefined;
    });
  return items.item ? parseGeekdo(id, items.item, dynamic) : null;
}

export async function fetchGeekdoGames(ids: number[]): Promise<BggGame[]> {
  const games: BggGame[] = [];
  for (const id of ids) {
    try {
      const game = await fetchGeekdoGame(id);
      if (game) games.push(game);
    } catch (error) {
      console.warn(`⚠ ${id}: ${error instanceof Error ? error.message : error}`);
    }
    await sleep(1000);
  }
  return games;
}

/** Exact-name lookup via the site's autocomplete search. */
export async function searchGeekdoId(name: string): Promise<number | null> {
  const url = `https://boardgamegeek.com/search/boardgame?nosession=1&showcount=20&q=${encodeURIComponent(name)}`;
  try {
    const json = (await getJson(url)) as { items?: { objectid?: string | number; name?: string }[] };
    const wanted = name.trim().toLowerCase();
    const hit = json.items?.find((item) => item.name?.trim().toLowerCase() === wanted);
    return positive(hit?.objectid);
  } catch (error) {
    console.warn(`  search for "${name}" failed: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}
