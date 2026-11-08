import { Fragment, useCallback, useMemo, useState } from "react";
import type { Game } from "./lib/game.ts";
import { buildRails, heroGames, searchGames, similarGames, supportsPlayerCount, type Rail as RailData } from "./lib/rails.ts";
import { rankByVotes } from "./lib/votes.ts";
import { useGameNight } from "./lib/GameNightContext.tsx";
import { useIsPannlappenRoute, useSelectedGameId } from "./lib/route.ts";
import { useLibrary } from "./lib/useLibrary.ts";
import { GameCard } from "./components/GameCard.tsx";
import { GameModal } from "./components/GameModal.tsx";
import { Header } from "./components/Header.tsx";
import { Pannlappen } from "./components/Pannlappen.tsx";
import { Hero } from "./components/Hero.tsx";
import { MobileGamesRail } from "./components/MobileGamesRail.tsx";
import { Rail } from "./components/Rail.tsx";
import { StarterSpinner } from "./components/StarterSpinner.tsx";
import { unlockAudio } from "./lib/spinSound.ts";

export function App() {
  const state = useLibrary();
  const pannlappen = useIsPannlappenRoute();

  if (pannlappen) return <Pannlappen />;
  if (state.status === "loading") return <p className="status">Hämtar spelhyllan…</p>;
  if (state.status === "error") return <p className="status">Kunde inte läsa spelen ({state.message}).</p>;
  return <Browse games={state.library.games} />;
}

export function Browse({ games }: { games: Game[] }) {
  const [query, setQuery] = useState("");
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [spinnerOpen, setSpinnerOpen] = useState(false);
  const selectedId = useSelectedGameId();
  const votes = useGameNight();

  const visible = useMemo(
    () => (playerCount === null ? games : games.filter((g) => supportsPlayerCount(g, playerCount))),
    [games, playerCount],
  );
  const rails = useMemo(() => buildRails(visible), [visible]);
  const results = useMemo(() => searchGames(visible, query), [visible, query]);
  const selected = games.find((g) => g.id === selectedId);

  const voteRail = useMemo((): RailData | null => {
    if (!votes) return null;
    const byId = new Map(visible.map((g) => [g.id, g]));
    const ranked = rankByVotes(votes.tally).flatMap((id) => byId.get(id) ?? []);
    return ranked.length > 0 ? { id: "roster", title: "Kvällens topplista 👍", games: ranked } : null;
  }, [votes, visible]);

  const isSearching = query.trim() !== "";
  const closeSpinner = useCallback(() => setSpinnerOpen(false), []);

  return (
    <>
      <Header
        query={query}
        onQueryChange={setQuery}
        playerCount={playerCount}
        onPlayerCountChange={setPlayerCount}
        onOpenSpinner={() => {
          unlockAudio(); // so spins started on other phones can be heard here
          setSpinnerOpen(true);
        }}
      />
      <main>
        {votes?.error && (
          <p className="banner" role="alert">
            {votes.error}
          </p>
        )}
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
              {voteRail && <Rail rail={voteRail} />}
              {rails.map((rail, i) => (
                <Fragment key={rail.id}>
                  <Rail rail={rail} />
                  {i === 0 && <MobileGamesRail />}
                </Fragment>
              ))}
            </div>
          </>
        )}
      </main>
      <footer className="footer">
        Speldata från <a href="https://boardgamegeek.com">BoardGameGeek</a>.
      </footer>
      {selected && <GameModal game={selected} similar={similarGames(selected, games)} />}
      {spinnerOpen && <StarterSpinner onClose={closeSpinner} />}
    </>
  );
}
