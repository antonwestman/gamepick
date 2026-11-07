import type { Game } from "../lib/game.ts";
import { gameHref } from "../lib/route.ts";
import { Cover } from "./Cover.tsx";
import { GameMeta } from "./GameMeta.tsx";
import { VoteButton } from "./VoteButton.tsx";

export function GameCard({ game }: { game: Game }) {
  return (
    // The vote button sits beside the link (not inside it): buttons can't be nested in links.
    <div className="card">
      <a className="card__link" href={gameHref(game.id)}>
        <div className="card__art">
          <Cover game={game} />
          {game.rating !== null && <span className="card__rating">★ {game.rating.toFixed(1)}</span>}
        </div>
        <h3 className="card__title">{game.name}</h3>
        <GameMeta game={game} />
      </a>
      <VoteButton game={game} />
    </div>
  );
}
