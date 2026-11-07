import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sample from "../data/sample-games.json";
import { Browse } from "./App.tsx";
import type { GameLibrary } from "./lib/game.ts";

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
