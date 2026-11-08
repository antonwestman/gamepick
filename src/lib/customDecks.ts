/** Pannlappen categories made by players, shared through the sheet (apps-script/Code.gs). */
export type CustomDeck = { id: string; title: string; emoji: string; by: string; words: string[] };

/** Same limits as the Apps Script, so the form can say what will happen before saving. */
export const DECK_LIMITS = { title: 30, emoji: 8, word: 40, minWords: 5, maxWords: 300 } as const;

export const DEFAULT_EMOJI = "📝";

/**
 * Words from pasted text or an uploaded file: one per line, or comma-separated
 * when it's all on one line. Trimmed, de-duplicated (ignoring case) and capped.
 */
export function parseWordList(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const parts = lines.filter((line) => line.trim() !== "").length === 1 ? text.split(",") : lines;
  const seen = new Set<string>();
  const words: string[] = [];
  for (const part of parts) {
    const word = part.trim().replace(/\s+/g, " ").slice(0, DECK_LIMITS.word);
    const key = word.toLowerCase();
    if (word === "" || seen.has(key)) continue;
    seen.add(key);
    words.push(word);
  }
  return words.slice(0, DECK_LIMITS.maxWords);
}

export const newDeckId = () => `custom-${crypto.randomUUID()}`;
