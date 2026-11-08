import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sample from "../data/sample-games.json";
import { App, Browse } from "./App.tsx";
import type { GameLibrary } from "./lib/game.ts";
import { gameReducer, NEW_GAME, tiltOf, wordsForRound, type Action } from "./lib/headsUp.ts";
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
  /** Waits for each screen like a player would – the round starts after an async permission check. */
  const skipCountdown = async () => {
    await screen.findByText("Sätt telefonen i pannan!");
    await act(() => vi.advanceTimersByTimeAsync(3_000));
    await screen.findByRole("region", { name: "Spelar" });
  };
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
    await skipCountdown();
    expect(deck("djur").words.sv.medium).toContain(currentWordText()); // medium is the default

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

    expect(deck("jargong").words.sv.hard).toContain(currentWordText());
  });

  it("plays in English when chosen, and remembers it", async () => {
    const user = setup();
    const { unmount } = render(<App />);

    expect(screen.getByRole("button", { name: "Svenska" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "English" }));
    unmount();

    render(<App />);
    await user.click(screen.getByRole("button", { name: /Djur/ }));
    await skipCountdown();
    expect(deck("djur").words.en.medium).toContain(currentWordText());
  });

  it("lets teams take turns and adds up their scores", async () => {
    const user = setup();
    render(<App />);

    await user.type(screen.getByRole("textbox", { name: "Lagnamn" }), "Nördarna{Enter}");
    await user.click(screen.getByRole("button", { name: "Lägg till lag" })); // empty → "Lag 2"
    expect(screen.getByText(/Nu spelar/)).toHaveTextContent("Nu spelar Nördarna");

    await user.click(screen.getByRole("button", { name: /Yrken/ }));
    expect(await screen.findByText("Nördarna")).toBeInTheDocument();
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

  it("runs out of a deck instead of repeating words", async () => {
    const user = setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Djur/ }));
    await skipCountdown();

    const words = new Set<string>();
    for (const _ of deck("djur").words.sv.medium) {
      words.add(currentWordText() ?? "");
      await user.click(screen.getByRole("button", { name: "Rätt" }));
      await act(() => vi.advanceTimersByTimeAsync(800));
    }
    expect(words.size).toBe(deck("djur").words.sv.medium.length);

    expect(screen.getByRole("heading", { name: "20 rätt!" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Spela igen" })).not.toBeInTheDocument();
    expect(screen.getByText(/Slut på ord i Djur/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Byt kategori" }));
    expect(screen.getByRole("button", { name: /Djur/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Nytt spel/ }));
    expect(screen.getByRole("button", { name: /Djur/ })).toBeEnabled();
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

describe("seen words", () => {
  const animals = deck("djur");
  const play = (...actions: Action[]) => actions.reduce(gameReducer, NEW_GAME);
  const start: Action = { type: "start", deck: animals, team: null, words: ["Älg", "Haj", "Uggla"], now: 0 };

  it("counts the word on screen when time runs out", () => {
    const game = play(start, { type: "begin" }, { type: "answer", answer: "correct", now: 0 }, { type: "unflash" }, {
      type: "timeUp",
    });
    expect(game.seen).toEqual(["Älg", "Haj"]);
    expect(game.played).toHaveLength(1);
  });

  it("counts words from an abandoned round, without scoring it", () => {
    const game = play(start, { type: "begin" }, { type: "answer", answer: "pass", now: 0 }, { type: "quit" });
    expect(game.seen).toEqual(["Älg", "Haj"]);
    expect(game.played).toEqual([]);
  });

  it("never offers a seen word again, even when few are left", () => {
    const all = animals.words.sv.hard;
    expect(wordsForRound(animals, "sv", "hard", all.slice(0, 17))).toEqual(expect.arrayContaining(all.slice(17)));
    expect(wordsForRound(animals, "sv", "hard", all.slice(0, 17))).toHaveLength(3);
    expect(wordsForRound(animals, "sv", "hard", all)).toEqual([]);
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
