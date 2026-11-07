/**
 * The data contract between the build script (scripts/build-data.ts),
 * which writes public/games.json, and the React app, which reads it.
 */

export type Range = { min: number; max: number };

export type Game = {
  /**
   * Used in the URL (#/spel/<id>): the BGG id as text, or a slug of the
   * name for games that aren't on BoardGameGeek.
   */
  id: string;
  /** null when the game isn't on BoardGameGeek – then only sheet data is shown. */
  bggId: number | null;
  name: string;
  year: number | null;
  /** Plain text with paragraph breaks as "\n". */
  description: string;
  image: string | null;
  thumbnail: string | null;
  players: Range | null;
  /** Minutes. */
  playTime: Range | null;
  minAge: number | null;
  /** BGG average user rating, 1–10. */
  rating: number | null;
  /** BGG complexity, 1 (light) – 5 (heavy). */
  weight: number | null;
  /** BGG overall board game rank. */
  rank: number | null;
  categories: string[];
  mechanics: string[];
  designers: string[];

  // From our spreadsheet
  collections: string[];
  featured: boolean;
  owner: string | null;
  comment: string | null;
};

export type GameLibrary = {
  generatedAt: string;
  games: Game[];
};
