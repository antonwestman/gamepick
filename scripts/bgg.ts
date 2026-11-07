/** BoardGameGeek XML API2 client + parser. Docs: https://boardgamegeek.com/wiki/page/BGG_XML_API2 */
import { XMLParser } from "fast-xml-parser";
import type { Range } from "../src/lib/game.ts";

export type BggGame = {
  id: number;
  name: string;
  year: number | null;
  description: string;
  image: string | null;
  thumbnail: string | null;
  players: Range | null;
  playTime: Range | null;
  minAge: number | null;
  rating: number | null;
  weight: number | null;
  rank: number | null;
  categories: string[];
  mechanics: string[];
  designers: string[];
};

const API = "https://boardgamegeek.com/xmlapi2";
/** BGG rejects /thing requests with more than 20 ids. */
const MAX_IDS_PER_REQUEST = 20;

// ---------- parsing ----------

type ValueNode = { value?: string | number };
type LinkNode = { type?: string; value?: string | number };
type NameNode = { type?: string; value?: string | number };
type RankNode = { name?: string; value?: string | number };
type ItemNode = {
  id?: string | number;
  thumbnail?: string;
  image?: string;
  name?: NameNode[];
  description?: string;
  yearpublished?: ValueNode;
  minplayers?: ValueNode;
  maxplayers?: ValueNode;
  minplaytime?: ValueNode;
  maxplaytime?: ValueNode;
  playingtime?: ValueNode;
  minage?: ValueNode;
  link?: LinkNode[];
  statistics?: {
    ratings?: {
      average?: ValueNode;
      averageweight?: ValueNode;
      ranks?: { rank?: RankNode[] };
    };
  };
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  // Keep entities as-is; BGG double-encodes some and we decode them ourselves.
  processEntities: false,
  parseAttributeValue: false,
  parseTagValue: false,
  // Only elements: "name" is also an attribute on <rank>.
  isArray: (name, _path, _isLeaf, isAttribute) => !isAttribute && ["item", "name", "link", "rank"].includes(name),
});

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", bull: "•", eacute: "é", auml: "ä", ouml: "ö",
  aring: "å", uuml: "ü", times: "×", deg: "°",
};

function decodeOnce(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const hex = code[1] === "x" || code[1] === "X";
      return String.fromCodePoint(parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10));
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** BGG text is HTML-entity encoded, sometimes twice ("&amp;mdash;"). */
export function decodeEntities(text: string): string {
  let current = text;
  for (let i = 0; i < 3; i++) {
    const next = decodeOnce(current);
    if (next === current) break;
    current = next;
  }
  return current;
}

function toNumber(node: ValueNode | undefined): number | null {
  const n = Number(node?.value);
  return node?.value === undefined || node.value === "" || !Number.isFinite(n) ? null : n;
}

/** BGG uses 0 for "unknown". */
function toPositive(node: ValueNode | undefined): number | null {
  const n = toNumber(node);
  return n !== null && n > 0 ? n : null;
}

function toRange(min: number | null, max: number | null): Range | null {
  if (min === null && max === null) return null;
  const lo = min ?? max ?? 0;
  return { min: lo, max: Math.max(lo, max ?? lo) };
}

function linksOf(item: ItemNode, type: string): string[] {
  return (item.link ?? [])
    .filter((link) => link.type === type && link.value !== undefined)
    .map((link) => decodeEntities(String(link.value)));
}

function cleanDescription(raw: string | undefined): string {
  return decodeEntities(raw ?? "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseThings(xml: string): BggGame[] {
  const doc = parser.parse(xml) as { items?: { item?: ItemNode[] } };
  return (doc.items?.item ?? []).flatMap((item): BggGame[] => {
    const id = Number(item.id);
    const primary = item.name?.find((n) => n.type === "primary") ?? item.name?.[0];
    if (!Number.isFinite(id) || primary?.value === undefined) return [];

    const ratings = item.statistics?.ratings;
    const rank = ratings?.ranks?.rank?.find((r) => r.name === "boardgame");

    return [
      {
        id,
        name: decodeEntities(String(primary.value)),
        year: toNumber(item.yearpublished),
        description: cleanDescription(item.description),
        image: item.image?.trim() || null,
        thumbnail: item.thumbnail?.trim() || null,
        players: toRange(toPositive(item.minplayers), toPositive(item.maxplayers)),
        playTime: toRange(
          toPositive(item.minplaytime) ?? toPositive(item.playingtime),
          toPositive(item.maxplaytime) ?? toPositive(item.playingtime),
        ),
        minAge: toPositive(item.minage),
        rating: toPositive(ratings?.average),
        weight: toPositive(ratings?.averageweight),
        rank: toPositive(rank),
        categories: linksOf(item, "boardgamecategory"),
        mechanics: linksOf(item, "boardgamemechanic"),
        designers: linksOf(item, "boardgamedesigner").filter((d) => d !== "(Uncredited)"),
      },
    ];
  });
}

/** Parses /search results, returning ids in BGG's order. */
export function parseSearch(xml: string): { id: number; name: string }[] {
  const doc = parser.parse(xml) as { items?: { item?: ItemNode[] } };
  return (doc.items?.item ?? []).flatMap((item) => {
    const name = item.name?.[0]?.value;
    const id = Number(item.id);
    return Number.isFinite(id) && name !== undefined ? [{ id, name: decodeEntities(String(name)) }] : [];
  });
}

// ---------- fetching ----------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * BGG answers 202 while it prepares a response and 429 when rate limited,
 * so we retry with backoff. A token is required for apps registered after 2025
 * (https://boardgamegeek.com/using_the_xml_api).
 */
async function bggFetch(path: string, token: string | undefined): Promise<string> {
  const headers: Record<string, string> = { "User-Agent": "gamepick (github pages build)" };
  if (token) headers.Authorization = `Bearer ${token}`;

  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await fetch(`${API}${path}`, { headers });
    if (response.status === 200) return response.text();
    if (response.status !== 202 && response.status !== 429 && response.status < 500) {
      throw new Error(`BGG ${path} → HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
    }
    await sleep(2000 * 2 ** attempt);
  }
  throw new Error(`BGG ${path} kept failing, giving up`);
}

export async function fetchGames(ids: number[], token: string | undefined): Promise<BggGame[]> {
  const games: BggGame[] = [];
  for (let i = 0; i < ids.length; i += MAX_IDS_PER_REQUEST) {
    if (i > 0) await sleep(2000); // be polite: BGG asks for a few seconds between calls
    const batch = ids.slice(i, i + MAX_IDS_PER_REQUEST);
    games.push(...parseThings(await bggFetch(`/thing?stats=1&id=${batch.join(",")}`, token)));
  }
  return games;
}

/** Finds a board game id by name: exact match first, then best fuzzy match. */
export async function searchGameId(name: string, token: string | undefined): Promise<number | null> {
  const query = encodeURIComponent(name);
  const exact = parseSearch(await bggFetch(`/search?type=boardgame&exact=1&query=${query}`, token));
  if (exact[0]) return exact[0].id;
  await sleep(2000);
  const fuzzy = parseSearch(await bggFetch(`/search?type=boardgame&query=${query}`, token));
  return fuzzy[0]?.id ?? null;
}
