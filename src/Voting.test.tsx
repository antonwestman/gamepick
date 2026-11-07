import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sample from "../data/sample-games.json";
import { Browse } from "./App.tsx";
import type { GameLibrary } from "./lib/game.ts";
import { applyVote, type Vote } from "./lib/votes.ts";
import { VotesProvider } from "./lib/VotesContext.tsx";

const { games } = sample satisfies GameLibrary;
const VOTES_URL = "https://script.example/exec";

/** An in-memory stand-in for the Apps Script endpoint (apps-script/Code.gs). */
function fakeVotesServer(initial: Vote[] = []) {
  let votes = initial;
  const respond = () => new Response(JSON.stringify({ votes }), { headers: { "Content-Type": "application/json" } });
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    if (url !== VOTES_URL) return new Response("not found", { status: 404 });
    if (init?.method === "POST") votes = applyVote(votes, JSON.parse(String(init.body)));
    return respond();
  });
  return { votes: () => votes };
}

const renderWithVotes = () =>
  render(
    <VotesProvider url={VOTES_URL}>
      <Browse games={games} />
    </VotesProvider>,
  );

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe("voting on what to play", () => {
  it("asks for your name the first time, then puts the game on tonight's list", async () => {
    const server = fakeVotesServer();
    const user = userEvent.setup();
    renderWithVotes();

    const party = screen.getByRole("region", { name: "Party" });
    await user.click(within(party).getByRole("button", { name: "Rösta på Codenames" }));

    const dialog = screen.getByRole("dialog", { name: "Vem röstar?" });
    await user.type(within(dialog).getByRole("textbox", { name: "Ditt namn" }), "Anton");
    await user.click(within(dialog).getByRole("button", { name: "Spara" }));

    const topList = await screen.findByRole("region", { name: /Kvällens topplista/ });
    expect(within(topList).getByRole("link", { name: /Codenames/ })).toBeInTheDocument();
    expect(server.votes()).toEqual([{ gameId: "178900", voter: "Anton" }]);
    expect(screen.getByRole("button", { name: "Röstar som Anton" })).toBeInTheDocument();
  });

  it("shows other people's votes and lets you take yours back", async () => {
    window.localStorage.setItem("gamepick.voter", "Anton");
    const server = fakeVotesServer([
      { gameId: "295947", voter: "Jonas" },
      { gameId: "295947", voter: "Anton" },
    ]);
    const user = userEvent.setup();
    renderWithVotes();

    const topList = await screen.findByRole("region", { name: /Kvällens topplista/ });
    await user.click(within(topList).getByRole("link", { name: /Cascadia/ }));

    const details = screen.getByRole("dialog", { name: "Cascadia" });
    expect(within(details).getByText("Vill spela: Jonas, Anton")).toBeInTheDocument();

    await user.click(within(details).getByRole("button", { name: "Ta bort din röst på Cascadia" }));
    expect(await within(details).findByText("Vill spela: Jonas")).toBeInTheDocument();
    expect(server.votes()).toEqual([{ gameId: "295947", voter: "Jonas" }]);
  });

  it("hides voting entirely when it isn't set up", () => {
    render(<Browse games={games} />);
    expect(screen.queryByRole("button", { name: /Rösta på/ })).not.toBeInTheDocument();
  });
});
