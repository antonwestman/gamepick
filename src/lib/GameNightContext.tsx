import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NameDialog } from "../components/NameDialog.tsx";
import type { CustomDeck } from "./customDecks.ts";
import { applyChange, emptyState, fetchState, sendChange, type Change, type GameNightState, type Spin } from "./gameNight.ts";
import { newSpinId, SHARED_LEAD_MS } from "./spinner.ts";
import { tallyVotes, type Tally } from "./votes.ts";

export type GameNightApi = {
  // Votes
  tally: Tally;
  voter: string | null;
  changeVoter: () => void;
  hasVoted: (gameId: string) => boolean;
  toggleVote: (gameId: string) => void;
  // "Vem börjar?" – null when the deployed Apps Script is too old to share players.
  players: string[] | null;
  addPlayer: (name: string) => void;
  removePlayer: (name: string) => void;
  spin: Spin | null;
  recordSpin: (winner: string) => void;
  // Pannlappen – null when the deployed Apps Script is too old to store categories.
  customDecks: CustomDeck[] | null;
  /** Creates or replaces the deck with this id. `by` is filled in with the voter's name. */
  saveDeck: (deck: Omit<CustomDeck, "by">) => void;
  deleteDeck: (id: string) => void;
  /** Poll often while something live (the spinner) is on screen. Returns the cleanup. */
  watchClosely: () => () => void;

  error: string | null;
};

const GameNightContext = createContext<GameNightApi | null>(null);

/** null when the shared backend isn't configured (no VITE_VOTES_URL) – voting is then hidden. */
export const useGameNight = () => useContext(GameNightContext);

const POLL_MS = 15_000;
/** While the spinner is open: fast enough that a shared spin's countdown is seen in time. */
const CLOSE_POLL_MS = 1_000;
const VOTER_KEY = "gamepick.voter";

function readStoredVoter(): string | null {
  try {
    return window.localStorage.getItem(VOTER_KEY);
  } catch {
    return null;
  }
}

function storeVoter(name: string) {
  try {
    window.localStorage.setItem(VOTER_KEY, name);
  } catch {
    // Private mode etc. – the name just won't be remembered.
  }
}

type NamePrompt = { open: false } | { open: true; thenVoteFor: string | null };

export function GameNightProvider({ url, children }: { url: string | null; children: ReactNode }) {
  if (!url) return <>{children}</>;
  return <ConnectedGameNight url={url}>{children}</ConnectedGameNight>;
}

function ConnectedGameNight({ url, children }: { url: string; children: ReactNode }) {
  const [state, setState] = useState<GameNightState>(emptyState);
  const [voter, setVoter] = useState<string | null>(readStoredVoter);
  const [error, setError] = useState<string | null>(null);
  const [namePrompt, setNamePrompt] = useState<NamePrompt>({ open: false });
  const [closeWatchers, setCloseWatchers] = useState(0);

  const inFlight = useRef(false);
  const refresh = useCallback(() => {
    if (inFlight.current) return; // Apps Script can be slower than our poll interval
    inFlight.current = true;
    fetchState(url)
      .then((fresh) => {
        setState(fresh);
        setError(null);
      })
      .catch(() => setError("Kunde inte hämta rösterna."))
      .finally(() => {
        inFlight.current = false;
      });
  }, [url]);

  // Keep everyone's screen in sync: poll, and refresh when the app comes back.
  const pollMs = closeWatchers > 0 ? CLOSE_POLL_MS : POLL_MS;
  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, pollMs);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh, pollMs]);

  const send = useCallback(
    (change: Change) => {
      setState((current) => applyChange(current, change)); // optimistic
      sendChange(url, change)
        .then((fresh) => {
          setState(fresh);
          setError(null);
        })
        .catch(() => {
          setError("Ändringen kunde inte sparas – försök igen.");
          refresh();
        });
    },
    [url, refresh],
  );

  const watchClosely = useCallback(() => {
    setCloseWatchers((n) => n + 1);
    return () => setCloseWatchers((n) => n - 1);
  }, []);

  const tally = useMemo(() => tallyVotes(state.votes), [state.votes]);

  const api = useMemo((): GameNightApi => {
    const hasVoted = (gameId: string) =>
      voter !== null && (tally.get(gameId) ?? []).some((v) => v.toLowerCase() === voter.toLowerCase());
    return {
      tally,
      voter,
      error,
      hasVoted,
      changeVoter: () => setNamePrompt({ open: true, thenVoteFor: null }),
      toggleVote: (gameId) => {
        if (voter === null) setNamePrompt({ open: true, thenVoteFor: gameId });
        else send({ action: "vote", gameId, voter, vote: !hasVoted(gameId) });
      },
      players: state.players,
      addPlayer: (name) => send({ action: "addPlayer", name }),
      removePlayer: (name) => send({ action: "removePlayer", name }),
      spin: state.spin,
      recordSpin: (winner) =>
        send({ action: "spin", id: newSpinId(Date.now() + SHARED_LEAD_MS), winner, by: voter ?? "" }),
      customDecks: state.customDecks,
      saveDeck: (deck) => send({ action: "saveDeck", ...deck, by: voter ?? "" }),
      deleteDeck: (id) => send({ action: "deleteDeck", id }),
      watchClosely,
    };
  }, [tally, voter, error, state.players, state.spin, state.customDecks, send, watchClosely]);

  const saveName = (name: string) => {
    storeVoter(name);
    setVoter(name);
    if (namePrompt.open && namePrompt.thenVoteFor !== null) {
      send({ action: "vote", gameId: namePrompt.thenVoteFor, voter: name, vote: true });
    }
    setNamePrompt({ open: false });
  };

  return (
    <GameNightContext.Provider value={api}>
      {children}
      {namePrompt.open && (
        <NameDialog initialName={voter ?? ""} onSave={saveName} onCancel={() => setNamePrompt({ open: false })} />
      )}
    </GameNightContext.Provider>
  );
}
