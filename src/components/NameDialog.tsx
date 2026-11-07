import { useEffect, useRef, useState, type FormEvent } from "react";

type Props = { initialName: string; onSave: (name: string) => void; onCancel: () => void };

export function NameDialog({ initialName, onSave, onCancel }: Props) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed !== "") onSave(trimmed);
  };

  return (
    <div className="modal modal--small" onClick={(event) => event.target === event.currentTarget && onCancel()}>
      <form className="name-dialog" role="dialog" aria-modal="true" aria-labelledby="name-title" onSubmit={submit}>
        <h2 id="name-title">Vem röstar?</h2>
        <p>Skriv ditt namn så vet alla vem som vill spela vad.</p>
        <input
          ref={inputRef}
          aria-label="Ditt namn"
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          autoComplete="given-name"
        />
        <div className="name-dialog__actions">
          <button type="button" className="button" onClick={onCancel}>
            Avbryt
          </button>
          <button type="submit" className="button button--primary" disabled={name.trim() === ""}>
            Spara
          </button>
        </div>
      </form>
    </div>
  );
}
