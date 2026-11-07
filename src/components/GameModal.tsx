import { useEffect, useRef } from "react";
import type { Game } from "../lib/game.ts";
import { bggUrl, formatPlayers, formatPlayTime, weightLabel } from "../lib/format.ts";
import { closeGame } from "../lib/route.ts";
import { Cover } from "./Cover.tsx";
import { Rail } from "./Rail.tsx";

type Props = { game: Game; similar: Game[] };

export function GameModal({ game, similar }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock page scroll and close on Escape while open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeGame();
    document.addEventListener("keydown", onKey);
    document.body.classList.add("no-scroll");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, []);

  // New game (e.g. clicked a similar one): start from the top.
  useEffect(() => {
    panelRef.current?.scrollTo?.({ top: 0 });
    closeRef.current?.focus();
  }, [game.id]);

  const stats: [label: string, value: string | null][] = [
    ["Spelare", formatPlayers(game.players)],
    ["Speltid", formatPlayTime(game.playTime)],
    ["Ålder", game.minAge ? `${game.minAge}+` : null],
    ["Svårighet", game.weight ? `${weightLabel(game.weight)} (${game.weight.toFixed(1)}/5)` : null],
    ["BGG-betyg", game.rating ? `${game.rating.toFixed(1)}/10` : null],
    ["BGG-rank", game.rank ? `#${game.rank}` : null],
  ];
  const paragraphs = game.description.split(/\n+/).filter((p) => p.trim() !== "");

  return (
    <div className="modal" onClick={(event) => event.target === event.currentTarget && closeGame()}>
      <div className="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={panelRef}>
        <button className="modal__close" onClick={closeGame} aria-label="Stäng" ref={closeRef}>
          ✕
        </button>

        <header className="modal__header">
          <div className="modal__backdrop" aria-hidden="true">
            <Cover game={game} loading="eager" key={game.id} />
          </div>
          <div className="modal__art">
            <Cover game={game} loading="eager" key={game.id} />
          </div>
          <div>
            <h2 className="modal__title" id="modal-title">
              {game.name}
            </h2>
            {game.year && <p className="modal__year">{game.year}</p>}
            {game.collections.length > 0 && (
              <ul className="tags">
                {game.collections.map((c) => (
                  <li key={c} className="tag tag--accent">
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        <div className="modal__body">
          <dl className="stats">
            {stats
              .filter(([, value]) => value !== null)
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>

          {game.comment && (
            <blockquote className="our-note">
              <p>”{game.comment}”</p>
              {game.owner && <footer>— {game.owner}</footer>}
            </blockquote>
          )}
          {!game.comment && game.owner && <p className="our-note">Ägs av {game.owner}</p>}

          <div className="description">
            {paragraphs.length > 0 ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p>Ingen beskrivning ännu.</p>}
          </div>

          <TagList title="Kategorier" items={game.categories} />
          <TagList title="Mekanismer" items={game.mechanics} />
          <TagList title="Speldesign" items={game.designers} />

          {game.bggId !== null && (
            <a className="button" href={bggUrl(game.bggId)} target="_blank" rel="noreferrer">
              Läs mer på BoardGameGeek ↗
            </a>
          )}
        </div>

        {similar.length > 0 && <Rail rail={{ id: `liknande-${game.id}`, title: "Liknande spel", games: similar }} />}
      </div>
    </div>
  );
}

function TagList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="taglist">
      <h3>{title}</h3>
      <ul className="tags">
        {items.map((item) => (
          <li key={item} className="tag">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
