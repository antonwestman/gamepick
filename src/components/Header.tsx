type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  playerCount: number | null;
  onPlayerCountChange: (count: number | null) => void;
};

const PLAYER_COUNTS = [1, 2, 3, 4, 5, 6];

export function Header({ query, onQueryChange, playerCount, onPlayerCountChange }: Props) {
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
