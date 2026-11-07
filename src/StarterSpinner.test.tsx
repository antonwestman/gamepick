import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sample from "../data/sample-games.json";
import { Browse } from "./App.tsx";
import type { GameLibrary } from "./lib/game.ts";
import { GameNightProvider } from "./lib/GameNightContext.tsx";
import { fakeGameNightServer, GAME_NIGHT_URL } from "./test/fakeGameNight.ts";

const { games } = sample satisfies GameLibrary;

beforeEach(() => {
  window.localStorage.clear();
  // Skip the 4.5 s animation so the result shows straight away.
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce") }));
});
afterEach(() => vi.unstubAllGlobals());

describe("Vem börjar?", () => {
  it("picks a starting player from the names you add", async () => {
    const user = userEvent.setup();
    render(<Browse games={games} />);

    await user.click(screen.getByRole("button", { name: "🎯 Vem börjar?" }));
    const dialog = screen.getByRole("dialog", { name: "Vem börjar?" });
    const spinButton = within(dialog).getByRole("button", { name: "Snurra" });
    expect(spinButton).toBeDisabled();

    for (const name of ["Anton", "Jonas", "Pontus", "Kim"]) {
      await user.type(within(dialog).getByRole("textbox", { name: "Namn på spelare" }), `${name}{Enter}`);
    }
    await user.click(spinButton);

    expect(within(dialog).getByText(/börjar!/)).toHaveTextContent(/^(Anton|Jonas|Pontus|Kim) börjar!/);
    expect(within(dialog).getByRole("button", { name: "Snurra igen" })).toBeEnabled();
  });

  it("remembers the players for next time and lets you remove someone", async () => {
    window.localStorage.setItem("gamepick.players", JSON.stringify(["Anton", "Jonas"]));
    const user = userEvent.setup();
    render(<Browse games={games} />);

    await user.click(screen.getByRole("button", { name: "🎯 Vem börjar?" }));
    const players = screen.getByRole("list", { name: "Spelare" });
    expect(within(players).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Anton×", "Jonas×"]);

    await user.click(within(players).getByRole("button", { name: "Ta bort Jonas" }));
    expect(screen.getByText("Lägg till minst två spelare.")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("gamepick.players") ?? "")).toEqual(["Anton"]);
  });
});

describe("Vem börjar? shared between phones", () => {
  const renderShared = () =>
    render(
      <GameNightProvider url={GAME_NIGHT_URL}>
        <Browse games={games} />
      </GameNightProvider>,
    );

  it("saves players and the spin for everyone", async () => {
    const server = fakeGameNightServer();
    const user = userEvent.setup();
    renderShared();

    await user.click(screen.getByRole("button", { name: "🎯 Vem börjar?" }));
    const dialog = screen.getByRole("dialog", { name: "Vem börjar?" });
    expect(within(dialog).getByText("Listan och snurren delas med alla.")).toBeInTheDocument();

    for (const name of ["Anton", "Oskar"]) {
      await user.type(within(dialog).getByRole("textbox", { name: "Namn på spelare" }), `${name}{Enter}`);
    }
    await waitFor(() => expect(server.state().players).toEqual(["Anton", "Oskar"]));

    await user.click(within(dialog).getByRole("button", { name: "Snurra" }));
    await waitFor(() => expect(server.state().spin?.winner).toMatch(/^(Anton|Oskar)$/));
    expect(within(dialog).getByText(/börjar!/)).toHaveTextContent(`${server.state().spin?.winner} börjar!`);
  });

  it("shows a spin made on someone else's phone", async () => {
    const server = fakeGameNightServer({ players: ["Anton", "Oskar", "Jonas"] });
    const user = userEvent.setup();
    renderShared();

    await user.click(screen.getByRole("button", { name: "🎯 Vem börjar?" }));
    const dialog = screen.getByRole("dialog", { name: "Vem börjar?" });
    await within(dialog).findByRole("button", { name: "Ta bort Oskar" });

    server.update({ action: "spin", id: "from-oskars-phone", winner: "Oskar", by: "Jonas" });
    fireEvent(window, new Event("focus")); // what a poll would do

    expect(await within(dialog).findByText("Snurrat av Jonas", { exact: false })).toBeInTheDocument();
    expect(within(dialog).getByText(/börjar!/)).toHaveTextContent(/^Oskar börjar!/);
  });

  it("keeps a list per phone while the Apps Script hasn't been updated", async () => {
    fakeGameNightServer({}, { shared: false });
    const user = userEvent.setup();
    renderShared();

    await user.click(screen.getByRole("button", { name: "🎯 Vem börjar?" }));
    expect(await screen.findByText("Listan sparas bara på den här telefonen.")).toBeInTheDocument();
  });
});
