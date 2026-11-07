import { describe, expect, it } from "vitest";
import { applyVote, rankByVotes, tallyVotes } from "./votes.ts";

describe("tallyVotes", () => {
  it("counts each voter once per game, ignoring name case", () => {
    const tally = tallyVotes([
      { gameId: "13", voter: "Anton" },
      { gameId: "13", voter: "anton" },
      { gameId: "13", voter: "Jonas" },
      { gameId: "822", voter: "Pontus" },
    ]);
    expect(tally.get("13")).toEqual(["Anton", "Jonas"]);
    expect(rankByVotes(tally)).toEqual(["13", "822"]);
  });
});

describe("applyVote", () => {
  it("adds and removes a voter's vote", () => {
    const added = applyVote([], { gameId: "13", voter: "Anton", vote: true });
    expect(added).toEqual([{ gameId: "13", voter: "Anton" }]);
    expect(applyVote(added, { gameId: "13", voter: "ANTON", vote: false })).toEqual([]);
  });
});
