import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { NameDialog } from "../components/NameDialog.tsx";
import { applyVote, fetchVotes, sendVote, tallyVotes, type Tally, type Vote } from "./votes.ts";

export type VotesApi = {
  tally: Tally;
  voter: string | null;
  changeVoter: () => void;
  hasVoted: (gameId: string) => boolean;
  toggleVote: (gameId: string) => void;
  error: string | null;
};

const VotesContext = createContext<VotesApi | null>(null);

/** null when voting isn't configured (no VITE_VOTES_URL) – then the UI hides all vote controls. */
export const useVotes = () => useContext(VotesContext);

const POLL_MS = 15_000;
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

export function VotesProvider({ url, children }: { url: string | null; children: ReactNode }) {
  if (!url) return <>{children}</>;
  return <ConnectedVotes url={url}>{children}</ConnectedVotes>;
}

function ConnectedVotes({ url, children }: { url: string; children: ReactNode }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voter, setVoter] = useState<string | null>(readStoredVoter);
  const [error, setError] = useState<string | null>(null);
  const [namePrompt, setNamePrompt] = useState<NamePrompt>({ open: false });

  const refresh = useCallback(() => {
    fetchVotes(url)
      .then((fresh) => {
        setVotes(fresh);
        setError(null);
      })
      .catch(() => setError("Kunde inte hämta rösterna."));
  }, [url]);

  // Keep everyone's screen in sync: poll, and refresh when the tab comes back.
  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const tally = useMemo(() => tallyVotes(votes), [votes]);

  const vote = useCallback(
    (name: string, gameId: string, wantsVote: boolean) => {
      const change = { gameId, voter: name, vote: wantsVote };
      setVotes((current) => applyVote(current, change)); // optimistic
      sendVote(url, change)
        .then((fresh) => {
          setVotes(fresh);
          setError(null);
        })
        .catch(() => {
          setError("Rösten kunde inte sparas – försök igen.");
          refresh();
        });
    },
    [url, refresh],
  );

  const api = useMemo((): VotesApi => {
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
        else vote(voter, gameId, !hasVoted(gameId));
      },
    };
  }, [tally, voter, error, vote]);

  const saveName = (name: string) => {
    storeVoter(name);
    setVoter(name);
    if (namePrompt.open && namePrompt.thenVoteFor !== null) vote(name, namePrompt.thenVoteFor, true);
    setNamePrompt({ open: false });
  };

  return (
    <VotesContext.Provider value={api}>
      {children}
      {namePrompt.open && (
        <NameDialog initialName={voter ?? ""} onSave={saveName} onCancel={() => setNamePrompt({ open: false })} />
      )}
    </VotesContext.Provider>
  );
}
