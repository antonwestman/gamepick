import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Spin } from "../lib/gameNight.ts";
import { useGameNight } from "../lib/GameNightContext.tsx";
import { cleanNames, segmentSize, spinTarget } from "../lib/spinner.ts";

const SPIN_MS = 4500;
const PLAYERS_KEY = "gamepick.players";
const COLORS = ["#e5484d", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

type Players = {
  names: string[];
  add: (name: string) => void;
  remove: (name: string) => void;
  lastSpin: Spin | null;
  recordSpin: (winner: string) => void;
  shared: boolean;
};

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

/** Fallback when there's no shared backend (or an old Apps Script): a list kept on this phone. */
function useLocalPlayers(initial: () => string[]): Players {
  const [names, setNames] = useState<string[]>(() => {
    const stored = readStoredPlayers();
    return stored.length > 0 ? stored : initial();
  });
  const [lastSpin, setLastSpin] = useState<Spin | null>(null);
  const update = (next: string[]) => {
    const cleaned = cleanNames(next);
    setNames(cleaned);
    storePlayers(cleaned);
  };
  return {
    names,
    add: (name) => update([...names, name]),
    remove: (name) => update(names.filter((n) => n !== name)),
    lastSpin,
    recordSpin: (winner) => setLastSpin({ id: crypto.randomUUID(), winner, by: "" }),
    shared: false,
  };
}

/** The same spin should land on the same spot on every phone. */
function offsetFor(spinId: string): number {
  const hash = [...spinId].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 1000, 7);
  return hash / 1000 - 0.5;
}

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function StarterSpinner({ onClose }: { onClose: () => void }) {
  const night = useGameNight();
  const local = useLocalPlayers(() => cleanNames([...(night?.tally.values() ?? [])].flat()));
  const players: Players =
    night && night.players !== null
      ? {
          names: night.players,
          add: night.addPlayer,
          remove: night.removePlayer,
          lastSpin: night.spin,
          recordSpin: night.recordSpin,
          shared: true,
        }
      : local;
  const { names, lastSpin } = players;

  const [draft, setDraft] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // A spin that already happened before the dialog opened is shown, not replayed.
  const seenSpinId = useRef(lastSpin?.id ?? null);

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

  // Poll every few seconds while open, so a spin on someone else's phone shows up here quickly.
  const watchClosely = night?.watchClosely;
  useEffect(() => watchClosely?.(), [watchClosely]);

  // A new spin – from this phone or another – animates the wheel onto the winner.
  useEffect(() => {
    if (!lastSpin || lastSpin.id === seenSpinId.current) return;
    seenSpinId.current = lastSpin.id;
    const index = names.findIndex((name) => name.toLowerCase() === lastSpin.winner.toLowerCase());
    if (index === -1 || prefersReducedMotion()) return;
    setRotation((current) => spinTarget(current, names.length, index, offsetFor(lastSpin.id)));
    setSpinning(true);
  }, [lastSpin, names]);

  useEffect(() => {
    if (!spinning) return;
    const timer = window.setTimeout(() => setSpinning(false), SPIN_MS);
    return () => window.clearTimeout(timer);
  }, [spinning]);

  const addName = (event: FormEvent) => {
    event.preventDefault();
    if (draft.trim() !== "") players.add(draft.trim());
    setDraft("");
    inputRef.current?.focus();
  };

  const spin = () => {
    const winner = names[Math.floor(Math.random() * names.length)];
    if (winner !== undefined) players.recordSpin(winner);
  };

  const winnerIsPlaying = lastSpin !== null && names.some((n) => n.toLowerCase() === lastSpin.winner.toLowerCase());

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
          {spinning ? (
            "Snurrar…"
          ) : lastSpin && winnerIsPlaying ? (
            <>
              <strong>{lastSpin.winner}</strong> börjar! 🎉
              {lastSpin.by && <span className="spinner__by"> Snurrat av {lastSpin.by}</span>}
            </>
          ) : names.length < 2 ? (
            "Lägg till minst två spelare."
          ) : (
            "\u00a0"
          )}
        </p>

        <button className="button button--primary spinner__spin" onClick={spin} disabled={spinning || names.length < 2}>
          {lastSpin && winnerIsPlaying ? "Snurra igen" : "Snurra"}
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
                onClick={() => players.remove(name)}
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
        <p className="spinner__note">
          {players.shared ? "Listan och snurren delas med alla." : "Listan sparas bara på den här telefonen."}
        </p>
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
