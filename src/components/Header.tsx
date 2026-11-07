import { useVotes } from "../lib/VotesContext.tsx";

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  playerCount: number | null;
  onPlayerCountChange: (count: number | null) => void;
};

const PLAYER_COUNTS = [1, 2, 3, 4, 5, 6];

export function Header({ query, onQueryChange, playerCount, onPlayerCountChange }: Props) {
  const votes = useVotes();
  return (
    <header className="header">
      <a className="logo" href="#/">
        game<span>pick</span>
      </a>
      <div className="header__controls">
        <div className="players" role="group" aria-label="Antal spelare">
          <span className="players__label">Vi är</span>
          {PLAYER_COUNTS.map((count) => (
            <button
              key={count}
              className="chip"
              aria-pressed={playerCount === count}
              onClick={() => onPlayerCountChange(playerCount === count ? null : count)}
            >
              {count === 6 ? "6+" : count}
            </button>
          ))}
        </div>
        {votes && (
          <button type="button" className="voter" onClick={votes.changeVoter}>
            {votes.voter ? `Röstar som ${votes.voter}` : "Vem är du?"}
          </button>
        )}
        <input
          className="search"
          type="search"
          placeholder="Sök spel, kategori, designer…"
          aria-label="Sök spel"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
    </header>
  );
}
