import { useEffect, useState } from "react";
import type { Game } from "../lib/game.ts";
import { bggUrl, teaser } from "../lib/format.ts";
import { gameHref } from "../lib/route.ts";
import { Cover } from "./Cover.tsx";
import { GameMeta } from "./GameMeta.tsx";

const ROTATE_MS = 9000;

export function Hero({ games }: { games: Game[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // The list can shrink (player filter), so clamp during render instead of syncing state.
  const current = games[index % games.length];

  useEffect(() => {
    if (paused || games.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % games.length), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused, games.length]);

  if (!current) return null;

  return (
    <section
      className="hero"
      aria-label="Utvalt spel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero__backdrop" aria-hidden="true">
        <Cover game={current} loading="eager" key={current.id} />
      </div>
      <div className="hero__content">
        <div className="hero__text">
          {current.featured && <p className="hero__eyebrow">Utvalt</p>}
          <h1 className="hero__title">{current.name}</h1>
          <GameMeta game={current} />
          {current.comment && <p className="hero__comment">”{current.comment}”</p>}
          <p className="hero__teaser">{teaser(current.description)}</p>
          <div className="hero__actions">
            <a className="button button--primary" href={gameHref(current.id)}>
              Läs mer
            </a>
            <a className="button" href={bggUrl(current.id)} target="_blank" rel="noreferrer">
              BoardGameGeek ↗
            </a>
          </div>
        </div>
        <div className="hero__art">
          <Cover game={current} loading="eager" key={current.id} />
        </div>
      </div>
      {games.length > 1 && (
        <div className="hero__dots">
          {games.map((game, i) => (
            <button
              key={game.id}
              className="hero__dot"
              aria-label={`Visa ${game.name}`}
              aria-current={game.id === current.id}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
