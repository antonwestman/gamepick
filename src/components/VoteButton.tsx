import type { Game } from "../lib/game.ts";
import { useVotes } from "../lib/VotesContext.tsx";

type Props = { game: Game; variant?: "compact" | "large" };

export function VoteButton({ game, variant = "compact" }: Props) {
  const votes = useVotes();
  if (!votes) return null;

  const count = votes.tally.get(game.id)?.length ?? 0;
  const voted = votes.hasVoted(game.id);
  const label = voted ? `Ta bort din röst på ${game.name}` : `Rösta på ${game.name}`;

  return (
    <button
      type="button"
      className={`vote vote--${variant}`}
      aria-pressed={voted}
      aria-label={label}
      title={label}
      onClick={() => votes.toggleVote(game.id)}
    >
      <span aria-hidden="true">👍</span>
      {variant === "large" ? <span>{voted ? "Du vill spela" : "Jag vill spela"}</span> : null}
      {count > 0 && <span className="vote__count">{count}</span>}
    </button>
  );
}
