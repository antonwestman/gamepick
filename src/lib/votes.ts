/** Pure helpers for votes. Fetching/sending lives in gameNight.ts. */

export type Vote = { gameId: string; voter: string };

/** gameId → names of everyone who voted for it */
export type Tally = Map<string, string[]>;

export function tallyVotes(votes: Vote[]): Tally {
  const tally: Tally = new Map();
  for (const { gameId, voter } of votes) {
    const voters = tally.get(gameId) ?? [];
    if (!voters.some((v) => v.toLowerCase() === voter.toLowerCase())) voters.push(voter);
    tally.set(gameId, voters);
  }
  return tally;
}

/** Game ids with at least one vote, most votes first (stable for ties). */
export function rankByVotes(tally: Tally): string[] {
  return [...tally]
    .filter(([, voters]) => voters.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([gameId]) => gameId);
}

export function applyVote(votes: Vote[], change: Vote & { vote: boolean }): Vote[] {
  const same = (v: Vote) => v.gameId === change.gameId && v.voter.toLowerCase() === change.voter.toLowerCase();
  const without = votes.filter((v) => !same(v));
  return change.vote ? [...without, { gameId: change.gameId, voter: change.voter }] : without;
}
