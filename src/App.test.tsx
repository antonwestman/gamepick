import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import sample from "../data/sample-games.json";
import { Browse } from "./App.tsx";
import type { GameLibrary } from "./lib/game.ts";

const { games } = sample satisfies GameLibrary;

describe("browsing the game shelf", () => {
  it("shows a featured game in the hero and our collections as rails", () => {
    render(<Browse games={games} />);

    const hero = screen.getByRole("region", { name: "Utvalt spel" });
    expect(within(hero).getByRole("heading", { level: 1 })).toHaveTextContent("Wingspan");

    for (const collection of ["Senast tillagda", "Favoriter", "Tunga kvällar", "Snabba spel – högst 30 min"]) {
      expect(screen.getByRole("region", { name: collection })).toBeInTheDocument();
    }
  });

  it("opens a game's details from a rail and closes them again", async () => {
    const user = userEvent.setup();
    render(<Browse games={games} />);

    const party = screen.getByRole("region", { name: "Party" });
    await user.click(within(party).getByRole("link", { name: /Codenames/ }));

    const dialog = await screen.findByRole("dialog", { name: "Codenames" });
    expect(within(dialog).getByText("2–8 spelare")).toBeInTheDocument();
    expect(within(dialog).getByText(/spymasters give one-word clues/)).toBeInTheDocument();
    expect(within(dialog).getByRole("region", { name: "Liknande spel" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Stäng" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hides games that don't fit the number of players", async () => {
    const user = userEvent.setup();
    render(<Browse games={games} />);

    await user.click(screen.getByRole("button", { name: "6+" }));

    const newest = screen.getByRole("region", { name: "Senast tillagda" });
    expect(within(newest).getByRole("link", { name: /Codenames/ })).toBeInTheDocument();
    expect(within(newest).queryByRole("link", { name: /Patchwork/ })).not.toBeInTheDocument();
  });

  it("searches by name, category and designer", async () => {
    const user = userEvent.setup();
    render(<Browse games={games} />);

    await user.type(screen.getByRole("searchbox", { name: "Sök spel" }), "rosenberg");

    const results = screen.getByRole("region", { name: "Sökresultat" });
    expect(within(results).getAllByRole("link").map((link) => link.textContent)).toEqual([
      expect.stringContaining("Patchwork"),
    ]);
  });
});
