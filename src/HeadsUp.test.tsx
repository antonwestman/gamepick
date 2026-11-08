import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sample from "../data/sample-games.json";
import { App, Browse } from "./App.tsx";
import type { GameLibrary } from "./lib/game.ts";
import { tiltOf } from "./lib/headsUp.ts";
import { DECKS } from "./lib/headsUpDecks.ts";

const { games } = sample satisfies GameLibrary;
const animals = DECKS.find((deck) => deck.id === "djur")?.words ?? [];

function tilt(beta: number, gamma = 0) {
  act(() => {
    window.dispatchEvent(Object.assign(new Event("deviceorientation"), { alpha: 0, beta, gamma }));
  });
}

describe("Heads Up", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.location.hash = "#/mobilspel/heads-up";
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is listed under Mobilspel on the browse page", () => {
    render(<Browse games={games} />);
    const rail = screen.getByRole("region", { name: "Mobilspel" });
    expect(within(rail).getByRole("link", { name: /Heads Up/ })).toHaveAttribute("href", "#/mobilspel/heads-up");
  });

  it("plays a round with taps and shows the score", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Djur/ }));
    expect(screen.getByText("Sätt telefonen i pannan!")).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(3_000));
    const first = screen.getByRole("region", { name: "Spelar" });
    expect(animals).toContain(within(first).getByText(/./, { selector: ".headsup__word" }).textContent);

    await user.click(screen.getByRole("button", { name: "Rätt" }));
    expect(screen.getByRole("status")).toHaveTextContent("Rätt!");
    // Taps during the flash don't count twice.
    await user.click(screen.getByRole("button", { name: "Rätt" }));

    await act(() => vi.advanceTimersByTimeAsync(1_000));
    await user.click(screen.getByRole("button", { name: "Pass" }));

    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(screen.getByRole("heading", { name: "1 rätt!" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      expect.stringContaining("rätt"),
      expect.stringContaining("pass"),
    ]);

    await user.click(screen.getByRole("button", { name: "Byt kategori" }));
    expect(screen.getByRole("button", { name: /Djur/ })).toBeInTheDocument();
  });

  it("counts a nod down as correct and back as pass, once per nod", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Djur/ }));
    await act(() => vi.advanceTimersByTimeAsync(3_000));

    tilt(90); // upright on the forehead
    tilt(150); // screen towards the floor
    tilt(170); // still down – not another answer
    await act(() => vi.advanceTimersByTimeAsync(1_000));
    tilt(90);
    tilt(30); // screen towards the ceiling
    await act(() => vi.advanceTimersByTimeAsync(60_000));

    expect(screen.getByRole("heading", { name: "1 rätt!" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
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
