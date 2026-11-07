import { useMemo, useState } from "react";
import type { Game } from "./lib/game.ts";
import { buildRails, heroGames, searchGames, similarGames, supportsPlayerCount } from "./lib/rails.ts";
import { useSelectedGameId } from "./lib/route.ts";
import { useLibrary } from "./lib/useLibrary.ts";
import { GameCard } from "./components/GameCard.tsx";
import { GameModal } from "./components/GameModal.tsx";
import { Header } from "./components/Header.tsx";
import { Hero } from "./components/Hero.tsx";
import { Rail } from "./components/Rail.tsx";

export function App() {
  const state = useLibrary();

  if (state.status === "loading") return <p className="status">Hämtar spelhyllan…</p>;
  if (state.status === "error") return <p className="status">Kunde inte läsa spelen ({state.message}).</p>;
  return <Browse games={state.library.games} />;
}

export function Browse({ games }: { games: Game[] }) {
  const [query, setQuery] = useState("");
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const selectedId = useSelectedGameId();

  const visible = useMemo(
    () => (playerCount === null ? games : games.filter((g) => supportsPlayerCount(g, playerCount))),
    [games, playerCount],
  );
  const rails = useMemo(() => buildRails(visible), [visible]);
  const results = useMemo(() => searchGames(visible, query), [visible, query]);
  const selected = games.find((g) => g.id === selectedId);

  const isSearching = query.trim() !== "";

  return (
    <>
      <Header
        query={query}
        onQueryChange={setQuery}
        playerCount={playerCount}
        onPlayerCountChange={setPlayerCount}
      />
      <main>
        {isSearching ? (
          <section className="results" aria-label="Sökresultat">
            <h2 className="rail__title">
              {results.length > 0 ? `${results.length} träffar för ”${query.trim()}”` : `Inga träffar för ”${query.trim()}”`}
            </h2>
            <ul className="grid">
              {results.map((game) => (
                <li key={game.id}>
                  <GameCard game={game} />
                </li>
              ))}
            </ul>
          </section>
        ) : visible.length === 0 ? (
          <p className="status">
            {games.length === 0
              ? "Spelhyllan är tom – lägg till spel i Google-arket."
              : `Inga spel för ${playerCount} spelare.`}
          </p>
        ) : (
          <>
            <Hero games={heroGames(visible)} />
            <div className="rails">
              {rails.map((rail) => (
                <Rail key={rail.id} rail={rail} />
              ))}
            </div>
          </>
        )}
      </main>
      <footer className="footer">
        Speldata från <a href="https://boardgamegeek.com">BoardGameGeek</a>.
      </footer>
      {selected && <GameModal game={selected} similar={similarGames(selected, games)} />}
    </>
  );
}
