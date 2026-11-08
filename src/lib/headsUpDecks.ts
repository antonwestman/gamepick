import { DEFAULT_EMOJI, type CustomDeck } from "./customDecks.ts";
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
  { id: "gaming", title: "Gaming", emoji: "🎮" },
  { id: "bradspel", title: "Brädspel", emoji: "♟️" },
  { id: "matte", title: "Matematik", emoji: "🧮" },
  { id: "vaxter", title: "Växter", emoji: "🌿" },
  { id: "historia", title: "Historia", emoji: "🏰" },
  { id: "grekland", title: "Antikens Grekland", emoji: "🏛️" },
  { id: "blandat", title: "Lite av allt", emoji: "🎲" },
] as const;

type DeckId = (typeof DECK_INFO)[number]["id"];

/** Every language must have every deck at every difficulty – the compiler checks the word files. */
export type Words = Record<DeckId, Record<Difficulty, readonly string[]>>;

const WORDS: Record<Language, Words> = { sv: SV, en: EN };

export type BuiltInDeck = {
  kind: "builtIn";
  id: DeckId;
  title: string;
  emoji: string;
  words: Record<Language, Record<Difficulty, readonly string[]>>;
};

/** A player's own category: one word list, whatever language it's written in, used at every difficulty. */
export type PlayerDeck = { kind: "custom"; id: string; title: string; emoji: string; by: string; words: readonly string[] };

export type Deck = BuiltInDeck | PlayerDeck;

export const DECKS: readonly BuiltInDeck[] = DECK_INFO.map((info) => ({
  kind: "builtIn",
  ...info,
  words: { sv: WORDS.sv[info.id], en: WORDS.en[info.id] },
}));

export const playerDeck = (deck: CustomDeck): PlayerDeck => ({
  kind: "custom",
  ...deck,
  emoji: deck.emoji || DEFAULT_EMOJI,
});

/** The words to play: language and difficulty only apply to the built-in decks. */
export function deckWords(deck: Deck, language: Language, difficulty: Difficulty): readonly string[] {
  return deck.kind === "custom" ? deck.words : deck.words[language][difficulty];
}
