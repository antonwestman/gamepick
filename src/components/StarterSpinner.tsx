import { useEffect, useRef, useState, type FormEvent } from "react";
import { cleanNames, segmentSize, spinTarget } from "../lib/spinner.ts";
import { useVotes } from "../lib/VotesContext.tsx";

const SPIN_MS = 4500;
const PLAYERS_KEY = "gamepick.players";
const COLORS = ["#e5484d", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

type Phase = { kind: "idle" } | { kind: "spinning"; winner: string } | { kind: "done"; winner: string };

function readStoredPlayers(): string[] {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(PLAYERS_KEY) ?? "[]");
    return Array.isArray(stored) ? cleanNames(stored.filter((n): n is string => typeof n === "string")) : [];
  } catch {
    return [];
  }
}

function storePlayers(names: string[]) {
  try {
    window.localStorage.setItem(PLAYERS_KEY, JSON.stringify(names));
  } catch {
    // Not remembered next time – fine.
  }
}

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function StarterSpinner({ onClose }: { onClose: () => void }) {
  const votes = useVotes();
  const [names, setNames] = useState<string[]>(() => {
    const stored = readStoredPlayers();
    if (stored.length > 0) return stored;
    // First time: start with whoever has voted tonight.
    return cleanNames([...(votes?.tally.values() ?? [])].flat());
  });
  const [draft, setDraft] = useState("");
  const [rotation, setRotation] = useState(0);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape, lock page scroll.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [onClose]);

  // The wheel animates with a CSS transition; reveal the winner when it stops.
  useEffect(() => {
    if (phase.kind !== "spinning") return;
    const timer = window.setTimeout(() => setPhase({ kind: "done", winner: phase.winner }), SPIN_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const updateNames = (next: string[]) => {
    const cleaned = cleanNames(next);
    setNames(cleaned);
    storePlayers(cleaned);
    setPhase({ kind: "idle" });
  };

  const addName = (event: FormEvent) => {
    event.preventDefault();
    updateNames([...names, draft]);
    setDraft("");
    inputRef.current?.focus();
  };

  const spin = () => {
    const index = Math.floor(Math.random() * names.length);
    const winner = names[index];
    if (winner === undefined) return;
    setRotation((current) => spinTarget(current, names.length, index, Math.random() - 0.5));
    setPhase(prefersReducedMotion() ? { kind: "done", winner } : { kind: "spinning", winner });
  };

  const spinning = phase.kind === "spinning";

  return (
    <div className="modal modal--small" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="spinner" role="dialog" aria-modal="true" aria-labelledby="spinner-title">
        <button className="modal__close" onClick={onClose} aria-label="Stäng">
          ✕
        </button>
        <h2 id="spinner-title">Vem börjar?</h2>

        <div className="wheel">
          <div className="wheel__pointer" aria-hidden="true" />
          <Wheel names={names} rotation={rotation} animate={spinning} />
        </div>

        <p className="spinner__result" aria-live="polite">
          {phase.kind === "done" ? (
            <>
              <strong>{phase.winner}</strong> börjar! 🎉
            </>
          ) : spinning ? (
            "Snurrar…"
          ) : names.length < 2 ? (
            "Lägg till minst två spelare."
          ) : (
            " "
          )}
        </p>

        <button className="button button--primary spinner__spin" onClick={spin} disabled={spinning || names.length < 2}>
          {phase.kind === "done" ? "Snurra igen" : "Snurra"}
        </button>

        <ul className="spinner__names" aria-label="Spelare">
          {names.map((name) => (
            <li key={name} className="tag">
              {name}
              <button
                type="button"
                className="spinner__remove"
                aria-label={`Ta bort ${name}`}
                disabled={spinning}
                onClick={() => updateNames(names.filter((n) => n !== name))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <form className="spinner__add" onSubmit={addName}>
          <input
            ref={inputRef}
            aria-label="Namn på spelare"
            placeholder="Namn"
            value={draft}
            maxLength={20}
            onChange={(event) => setDraft(event.target.value)}
            disabled={spinning}
          />
          <button type="submit" className="button" disabled={spinning || draft.trim() === ""}>
            Lägg till
          </button>
        </form>
      </div>
    </div>
  );
}

function Wheel({ names, rotation, animate }: { names: string[]; rotation: number; animate: boolean }) {
  const size = segmentSize(Math.max(names.length, 1));
  const point = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return `${(Math.sin(rad) * radius).toFixed(2)} ${(-Math.cos(rad) * radius).toFixed(2)}`;
  };

  return (
    <svg
      className="wheel__disc"
      viewBox="-100 -100 200 200"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: animate ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.85, 0.2, 1)` : "none",
      }}
      aria-hidden="true"
    >
      {names.length === 0 && <circle r="96" fill="#232329" />}
      {names.length === 1 && <circle r="96" fill={COLORS[0]} />}
      {names.length > 1 &&
        names.map((name, i) => (
          <path
            key={name}
            d={`M 0 0 L ${point(i * size, 96)} A 96 96 0 ${size > 180 ? 1 : 0} 1 ${point((i + 1) * size, 96)} Z`}
            fill={COLORS[i % COLORS.length]}
          />
        ))}
      {names.map((name, i) => (
        <text
          key={name}
          transform={`rotate(${(i + 0.5) * size - 90})`}
          x="58"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          className="wheel__label"
        >
          {name.length > 10 ? `${name.slice(0, 9)}…` : name}
        </text>
      ))}
      <circle r="12" fill="#0d0d10" stroke="#f4f4f5" strokeWidth="3" />
    </svg>
  );
}
