import { useState, type ChangeEvent, type FormEvent } from "react";
import { DECK_LIMITS, DEFAULT_EMOJI, newDeckId, parseWordList, type CustomDeck } from "../lib/customDecks.ts";
import type { PlayerDeck } from "../lib/pannlappenDecks.ts";

type Props = {
  /** null when making a new category. */
  deck: PlayerDeck | null;
  onSave: (deck: Omit<CustomDeck, "by">) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export function CustomDeckEditor({ deck, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(deck?.title ?? "");
  const [emoji, setEmoji] = useState(deck?.emoji ?? "");
  const [text, setText] = useState(deck?.words.join("\n") ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const words = parseWordList(text);
  const tooFew = words.length < DECK_LIMITS.minWords;
  const canSave = title.trim() !== "" && !tooFew;

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // so the same file can be picked again
    if (!file) return;
    if (file.size > 100_000) {
      setFileError("Filen är för stor – max 100 kB.");
      return;
    }
    setFileError(null);
    const uploaded = parseWordList(await file.text());
    setText((current) => [...parseWordList(current), ...uploaded].join("\n"));
    if (title.trim() === "") setTitle(file.name.replace(/\.[^.]+$/, "").slice(0, DECK_LIMITS.title));
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    onSave({ id: deck?.id ?? newDeckId(), title: title.trim(), emoji: emoji.trim() || DEFAULT_EMOJI, words });
    onClose();
  };

  return (
    <form className="pannlappen__pick pannlappen__editor" onSubmit={save} aria-labelledby="deck-editor-title">
      <button type="button" className="pannlappen__back" onClick={onClose}>
        ‹ Tillbaka
      </button>
      <h1 id="deck-editor-title">{deck ? "Ändra kategori" : "Ny kategori"}</h1>
      <p className="pannlappen__how">Kategorin sparas i gamepick-arket och syns för alla. Samma ord används på alla svårighetsnivåer.</p>

      <div className="pannlappen__editor-row">
        <label className="pannlappen__field pannlappen__field--emoji">
          <span className="pannlappen__label">Emoji</span>
          <input value={emoji} placeholder={DEFAULT_EMOJI} maxLength={DECK_LIMITS.emoji} onChange={(e) => setEmoji(e.target.value)} />
        </label>
        <label className="pannlappen__field">
          <span className="pannlappen__label">Namn</span>
          <input
            value={title}
            placeholder="Kontorsbingo"
            maxLength={DECK_LIMITS.title}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
      </div>

      <label className="pannlappen__field">
        <span className="pannlappen__label">Ord – ett per rad</span>
        <textarea
          value={text}
          rows={12}
          placeholder={"Synergi\nLåt oss ta det offline\nVi återkopplar"}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="pannlappen__editor-meta">
        <p className="pannlappen__note-small" aria-live="polite">
          {words.length} ord
          {tooFew && ` – minst ${DECK_LIMITS.minWords} behövs`}
          {words.length === DECK_LIMITS.maxWords && ` (max ${DECK_LIMITS.maxWords})`}
        </p>
        <label className="chip pannlappen__upload">
          Ladda upp fil
          <input type="file" accept=".txt,.csv,text/plain,text/csv" onChange={(e) => void upload(e)} />
        </label>
      </div>
      {fileError && (
        <p className="pannlappen__note-small" role="alert">
          {fileError}
        </p>
      )}
      <p className="pannlappen__note-small">Textfil med ett ord per rad, eller kommaseparerat på en rad.</p>

      <div className="pannlappen__actions">
        <button type="submit" className="button button--primary" disabled={!canSave}>
          Spara
        </button>
        {deck &&
          (confirmingDelete ? (
            <button
              type="button"
              className="button"
              onClick={() => {
                onDelete(deck.id);
                onClose();
              }}
            >
              Ja, ta bort för alla
            </button>
          ) : (
            <button type="button" className="button" onClick={() => setConfirmingDelete(true)}>
              Ta bort
            </button>
          ))}
      </div>
    </form>
  );
}
