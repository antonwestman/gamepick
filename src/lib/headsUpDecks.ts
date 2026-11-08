import { EN } from "./headsUpWords.en.ts";
import { SV } from "./headsUpWords.sv.ts";

export const DIFFICULTIES = [
  { id: "easy", label: "Lätt" },
  { id: "medium", label: "Medel" },
  { id: "hard", label: "Svår" },
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number]["id"];

export const LANGUAGES = [
  { id: "sv", label: "Svenska" },
  { id: "en", label: "English" },
] as const;

export type Language = (typeof LANGUAGES)[number]["id"];

const DECK_INFO = [
  { id: "djur", title: "Djur", emoji: "🦒" },
  { id: "gor-som", title: "Gör som jag", emoji: "🕺" },
  { id: "yrken", title: "Yrken", emoji: "👩‍🚒" },
  { id: "mat", title: "Mat & dryck", emoji: "🍕" },
  { id: "film", title: "Film & tv", emoji: "🎬" },
  { id: "saker", title: "Saker hemma", emoji: "🛋️" },
  { id: "platser", title: "Platser", emoji: "🗺️" },
  { id: "jargong", title: "Corporatejargong", emoji: "💼" },
  { id: "blandat", title: "Lite av allt", emoji: "🎲" },
] as const;

type DeckId = (typeof DECK_INFO)[number]["id"];

/** Every language must have every deck at every difficulty – the compiler checks the word files. */
export type Words = Record<DeckId, Record<Difficulty, readonly string[]>>;

const WORDS: Record<Language, Words> = { sv: SV, en: EN };

export type Deck = {
  id: DeckId;
  title: string;
  emoji: string;
  words: Record<Language, Record<Difficulty, readonly string[]>>;
};

export const DECKS: readonly Deck[] = DECK_INFO.map((info) => ({
  ...info,
  words: { sv: WORDS.sv[info.id], en: WORDS.en[info.id] },
}));
