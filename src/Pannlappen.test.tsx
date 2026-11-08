import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sample from "../data/sample-games.json";
import { App, Browse } from "./App.tsx";
import { parseWordList } from "./lib/customDecks.ts";
import { GameNightProvider } from "./lib/GameNightContext.tsx";
import type { GameLibrary } from "./lib/game.ts";
import { gameReducer, NEW_GAME, tiltOf, wordsForRound, type Action } from "./lib/pannlappen.ts";
import { DECKS, type BuiltInDeck } from "./lib/pannlappenDecks.ts";
import { fakeGameNightServer, GAME_NIGHT_URL } from "./test/fakeGameNight.ts";

const { games } = sample satisfies GameLibrary;

function deck(id: string): BuiltInDeck {
  const found = DECKS.find((d) => d.id === id);
  if (!found) throw new Error(`No deck ${id}`);
  return found;
}

function tilt(beta: number, gamma = 0) {
  act(() => {
    window.dispatchEvent(Object.assign(new Event("deviceorientation"), { alpha: 0, beta, gamma }));
  });
}

const currentWordText = () => screen.getByRole("region", { name: "Spelar" }).querySelector(".pannlappen__word")?.textContent;

describe("Pannlappen", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.localStorage.clear();
    window.location.hash = "#/mobilspel/pannlappen";
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
    expect(within(rail).getByRole("link", { name: /Pannlappen/ })).toHaveAttribute("href", "#/mobilspel/pannlappen");
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

describe("Pannlappen – own categories", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.localStorage.clear();
    window.location.hash = "#/mobilspel/pannlappen";
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const renderShared = () =>
    render(
      <GameNightProvider url={GAME_NIGHT_URL}>
        <App />
      </GameNightProvider>,
    );
  const jargon = { id: "custom-1", title: "Kontorsprat", emoji: "💼", by: "Pontus", words: ["Synergi", "Bolla", "Landa", "Förankra", "Stämma av"] };

  it("are hidden without a shared sheet", () => {
    render(<App />);
    expect(screen.queryByText("Egna kategorier")).not.toBeInTheDocument();
  });

  it("can be made, saved for everyone and played", async () => {
    const server = fakeGameNightServer();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderShared();

    await user.click(await screen.findByRole("button", { name: "Ny kategori" }));
    await user.type(screen.getByRole("textbox", { name: "Namn" }), "Kontorsprat");
    await user.type(screen.getByRole("textbox", { name: /Ord/ }), "Synergi{Enter}Bolla{Enter}Landa{Enter}Förankra");
    expect(screen.getByText(/4 ord – minst 5 behövs/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Spara" })).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: /Ord/ }), "{Enter}Stämma av{Enter}synergi");
    expect(screen.getByText("5 ord")).toBeInTheDocument(); // the duplicate doesn't count
    await user.click(screen.getByRole("button", { name: "Spara" }));

    const mine = screen.getByRole("list", { name: "Egna kategorier" });
    expect(within(mine).getByRole("button", { name: /^Kontorsprat/ })).toHaveTextContent("5 ord");
    await waitFor(() =>
      expect(server.state().customDecks).toEqual([
        expect.objectContaining({ title: "Kontorsprat", emoji: "📝", words: ["Synergi", "Bolla", "Landa", "Förankra", "Stämma av"] }),
      ]),
    );

    await user.click(within(mine).getByRole("button", { name: /^Kontorsprat/ }));
    await screen.findByText("Sätt telefonen i pannan!");
    await act(() => vi.advanceTimersByTimeAsync(3_000));
    await screen.findByRole("region", { name: "Spelar" });
    expect(jargon.words).toContain(currentWordText());
  });

  it("can be filled from an uploaded text file", async () => {
    fakeGameNightServer();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderShared();

    await user.click(await screen.findByRole("button", { name: "Ny kategori" }));
    const file = new File(["Deep dive, Quick win, Circle back, Synergi, Pivot, Alignment"], "Jargong.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText("Ladda upp fil"), file);

    expect(await screen.findByText("6 ord")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Namn" })).toHaveValue("Jargong");
    expect(screen.getByRole("textbox", { name: /Ord/ })).toHaveValue("Deep dive\nQuick win\nCircle back\nSynergi\nPivot\nAlignment");
  });

  it("shows other people's categories and lets anyone change or remove them", async () => {
    const server = fakeGameNightServer();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderShared();
    await screen.findByRole("button", { name: "Ny kategori" });

    server.update({ action: "saveDeck", ...jargon });
    fireEvent(window, new Event("focus")); // what a poll would do
    const mine = await screen.findByRole("list", { name: "Egna kategorier" });
    expect(await within(mine).findByRole("button", { name: /^Kontorsprat/ })).toHaveTextContent("av Pontus · 5 ord");

    await user.click(within(mine).getByRole("button", { name: "Ändra Kontorsprat" }));
    await user.clear(screen.getByRole("textbox", { name: "Namn" }));
    await user.type(screen.getByRole("textbox", { name: "Namn" }), "Konsultsnack");
    await user.click(screen.getByRole("button", { name: "Spara" }));
    await waitFor(() => expect(server.state().customDecks?.map((d) => d.title)).toEqual(["Konsultsnack"]));

    await user.click(screen.getByRole("button", { name: "Ändra Konsultsnack" }));
    await user.click(screen.getByRole("button", { name: "Ta bort" }));
    await user.click(screen.getByRole("button", { name: "Ja, ta bort för alla" }));
    await waitFor(() => expect(server.state().customDecks).toEqual([]));
    expect(screen.queryByRole("button", { name: /^Konsultsnack/ })).not.toBeInTheDocument();
  });
});

describe("parseWordList", () => {
  it("takes one word per line, or commas on a single line", () => {
    expect(parseWordList(" Synergi \n\nBolla\r\nLanda av  något\n")).toEqual(["Synergi", "Bolla", "Landa av något"]);
    expect(parseWordList("Deep dive, Quick win,Pivot")).toEqual(["Deep dive", "Quick win", "Pivot"]);
    expect(parseWordList("Ja, absolut\nNej")).toEqual(["Ja, absolut", "Nej"]);
  });

  it("drops duplicates regardless of case", () => {
    expect(parseWordList("Synergi\nsynergi\nSYNERGI\nBolla")).toEqual(["Synergi", "Bolla"]);
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
