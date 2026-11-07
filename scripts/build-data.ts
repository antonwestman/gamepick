/**
 * Builds public/games.json from the Google Sheet + BoardGameGeek.
 *
 *   npm run data          # real data (needs network; BGG_TOKEN recommended)
 *   npm run data:sample   # offline sample data for local development
 *
 * Env:
 *   SHEET_ID       Google Sheet id (default: our Gamepick sheet)
 *   SHEET_GID      Tab id (default: 0, the first tab)
 *   SHEET_CSV_URL  Overrides the two above with any CSV url
 *   BGG_TOKEN      BoardGameGeek XML API token
 */
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import type { GameLibrary } from "../src/lib/game.ts";
import { fetchGames, searchGameId } from "./bgg.ts";
import { mergeEntries } from "./merge.ts";
import { parseSheet, type SheetEntry } from "./sheet.ts";

const OUT_DIR = new URL("../public/", import.meta.url);
const OUT_FILE = new URL("games.json", OUT_DIR);

const DEFAULT_SHEET_ID = "1--3GD0zPWlafjrLmjbLZtgXXrOFs-vxRVBwqlj4h2Y8";

function sheetCsvUrl(): string {
  if (process.env.SHEET_CSV_URL) return process.env.SHEET_CSV_URL;
  const id = process.env.SHEET_ID || DEFAULT_SHEET_ID;
  const gid = process.env.SHEET_GID || "0";
  // /export keeps every cell as typed; /gviz drops "minority type" values in a column.
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

async function fetchSheet(): Promise<string> {
  const response = await fetch(sheetCsvUrl(), { redirect: "follow" });
  const text = await response.text();
  if (!response.ok || text.trimStart().startsWith("<")) {
    throw new Error(
      `Could not read the sheet as CSV (HTTP ${response.status}). ` +
        `Is it shared as "Anyone with the link → Viewer"?`,
    );
  }
  return text;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (process.argv.includes("--sample")) {
    await copyFile(new URL("../data/sample-games.json", import.meta.url), OUT_FILE);
    console.log("Wrote sample data to public/games.json");
    return;
  }

  const token = process.env.BGG_TOKEN || undefined;
  if (!token) console.warn("⚠ BGG_TOKEN is not set – BGG may reject the requests.");

  const entries = parseSheet(await fetchSheet());
  console.log(`Sheet: ${entries.length} rows`);

  const resolved: SheetEntry[] = [];
  for (const entry of entries) {
    if (entry.bggId !== null || entry.name === null) {
      resolved.push(entry);
      continue;
    }
    const id = await searchGameId(entry.name, token);
    if (id === null) {
      console.warn(`⚠ No exact BGG match for "${entry.name}" – showing sheet data only. Add its bgg_id to fix.`);
    } else {
      console.log(`  "${entry.name}" → bgg_id ${id} (add it to the sheet to skip the search)`);
    }
    resolved.push({ ...entry, bggId: id });
  }

  const ids = [...new Set(resolved.flatMap((entry) => (entry.bggId === null ? [] : [entry.bggId])))];
  const bggGames = await fetchGames(ids, token);
  const missing = ids.filter((id) => !bggGames.some((game) => game.bggId === id));
  if (missing.length > 0) console.warn(`⚠ BGG returned nothing for ids: ${missing.join(", ")}`);

  const library: GameLibrary = {
    generatedAt: new Date().toISOString(),
    games: mergeEntries(resolved, bggGames),
  };
  await writeFile(OUT_FILE, JSON.stringify(library));
  console.log(`Wrote ${library.games.length} games to public/games.json`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
