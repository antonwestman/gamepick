import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sample from "../data/sample-games.json";
import { App, Browse } from "./App.tsx";
import type { GameLibrary } from "./lib/game.ts";
import { tiltOf, wordsForRound } from "./lib/headsUp.ts";
import { DECKS, type Deck } from "./lib/headsUpDecks.ts";

const { games } = sample satisfies GameLibrary;

function deck(id: string): Deck {
  const found = DECKS.find((d) => d.id === id);
  if (!found) throw new Error(`No deck ${id}`);
  return found;
}

function tilt(beta: number, gamma = 0) {
  act(() => {
    window.dispatchEvent(Object.assign(new Event("deviceorientation"), { alpha: 0, beta, gamma }));
  });
}

const currentWordText = () => screen.getByRole("region", { name: "Spelar" }).querySelector(".headsup__word")?.textContent;

describe("Heads Up", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.localStorage.clear();
    window.location.hash = "#/mobilspel/heads-up";
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const setup = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const skipCountdown = () => act(() => vi.advanceTimersByTimeAsync(3_000));
  const endRound = () => act(() => vi.advanceTimersByTimeAsync(60_000));

  it("is listed under Mobilspel on the browse page", () => {
    render(<Browse games={games} />);
    const rail = screen.getByRole("region", { name: "Mobilspel" });
    expect(within(rail).getByRole("link", { name: /Heads Up/ })).toHaveAttribute("href", "#/mobilspel/heads-up");
  });

  it("plays a round with taps and shows the score", async () => {
    const user = setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Djur/ }));
    expect(screen.getByText("Sätt telefonen i pannan!")).toBeInTheDocument();

    await skipCountdown();
    expect(deck("djur").words.medium).toContain(currentWordText()); // medium is the default

    await user.click(screen.getByRole("button", { name: "Rätt" }));
    expect(screen.getByRole("status")).toHaveTextContent("Rätt!");
    // Taps during the flash don't count twice.
    await user.click(screen.getByRole("button", { name: "Rätt" }));

    await act(() => vi.advanceTimersByTimeAsync(1_000));
    await user.click(screen.getByRole("button", { name: "Pass" }));

    await endRound();
    expect(screen.getByRole("heading", { name: "1 rätt!" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Ord" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      expect.stringContaining("rätt"),
      expect.stringContaining("pass"),
    ]);

    await user.click(screen.getByRole("button", { name: "Byt kategori" }));
    expect(screen.getByRole("button", { name: /Djur/ })).toBeInTheDocument();
  });

  it("uses the chosen difficulty", async () => {
    const user = setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Svår" }));
    await user.click(screen.getByRole("button", { name: /Corporatejargong/ }));
    await skipCountdown();

    expect(deck("jargong").words.hard).toContain(currentWordText());
  });

  it("lets teams take turns and adds up their scores", async () => {
    const user = setup();
    render(<App />);

    await user.type(screen.getByRole("textbox", { name: "Lagnamn" }), "Nördarna{Enter}");
    await user.click(screen.getByRole("button", { name: "Lägg till lag" })); // empty → "Lag 2"
    expect(screen.getByText(/Nu spelar/)).toHaveTextContent("Nu spelar Nördarna");

    await user.click(screen.getByRole("button", { name: /Yrken/ }));
    expect(screen.getByText("Nördarna")).toBeInTheDocument();
    await skipCountdown();
    await user.click(screen.getByRole("button", { name: "Rätt" }));
    await endRound();

    expect(screen.getByRole("heading", { name: "Nördarna: 1 rätt!" })).toBeInTheDocument();
    const firstWord = within(screen.getByRole("list", { name: "Ord" })).getByRole("listitem").textContent ?? "";

    await user.click(screen.getByRole("button", { name: "Nästa: Lag 2" }));
    await skipCountdown();
    expect(firstWord).not.toContain(currentWordText()); // no repeats within a game
    await user.click(screen.getByRole("button", { name: "Rätt" }));
    await act(() => vi.advanceTimersByTimeAsync(1_000));
    await user.click(screen.getByRole("button", { name: "Rätt" }));
    await endRound();

    const scores = screen.getByRole("table", { name: "Ställning" });
    expect(within(scores).getByRole("row", { name: /Nördarna/ })).toHaveTextContent("1");
    expect(within(scores).getByRole("row", { name: /Lag 2/ })).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: "Nästa: Nördarna" })).toBeInTheDocument();
  });

  it("counts a nod down as correct and back as pass, once per nod", async () => {
    const user = setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Djur/ }));
    await skipCountdown();

    tilt(90); // upright on the forehead
    tilt(150); // screen towards the floor
    tilt(170); // still down – not another answer
    await act(() => vi.advanceTimersByTimeAsync(1_000));
    tilt(90);
    tilt(30); // screen towards the ceiling
    await endRound();

    expect(screen.getByRole("heading", { name: "1 rätt!" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Ord" })).getAllByRole("listitem")).toHaveLength(2);
  });
});

describe("wordsForRound", () => {
  it("skips words already played, until the deck runs low", () => {
    const animals = deck("djur");
    const seen = animals.words.hard.slice(0, 5).map((word) => ({ word, answer: "pass" as const }));
    const words = wordsForRound(animals, "hard", [{ team: null, results: seen }]);
    expect(words).toHaveLength(animals.words.hard.length - 5);

    const almostAll = animals.words.hard.slice(0, 15).map((word) => ({ word, answer: "pass" as const }));
    expect(wordsForRound(animals, "hard", [{ team: null, results: almostAll }])).toHaveLength(
      animals.words.hard.length,
    );
  });
});

describe("tiltOf", () => {
  it("works whichever way the phone is turned", () => {
    expect(tiltOf(90, 0)).toBe("level"); // portrait, upright
    expect(tiltOf(0, 85)).toBe("level"); // landscape, upright
    expect(tiltOf(0, 20)).toBe("up"); // landscape, screen to the ceiling
    expect(tiltOf(160, 10)).toBe("down");
    expect(tiltOf(-170, -30)).toBe("down"); // landscape, screen to the floor
  });
});
