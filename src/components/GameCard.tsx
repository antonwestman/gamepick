import type { Game } from "../lib/game.ts";
import { gameHref } from "../lib/route.ts";
import { Cover } from "./Cover.tsx";
import { GameMeta } from "./GameMeta.tsx";

export function GameCard({ game }: { game: Game }) {
  return (
    <a className="card" href={gameHref(game.id)}>
      <div className="card__art">
        <Cover game={game} />
        {game.rating !== null && <span className="card__rating">★ {game.rating.toFixed(1)}</span>}
      </div>
      <h3 className="card__title">{game.name}</h3>
      <GameMeta game={game} />
    </a>
  );
}
