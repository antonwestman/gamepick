import { describe, expect, it } from "vitest";
import { cleanNames, newSpinId, scheduleSpin, SHARED_LEAD_MS, SPIN_MS, spinStartAt, spinTarget, winnerAt } from "./spinner.ts";

describe("spinTarget", () => {
  it("always stops on the chosen player, whatever the start angle and offset", () => {
    for (const count of [1, 2, 3, 4, 7]) {
      for (let winner = 0; winner < count; winner++) {
        for (const current of [0, 123, 3600 + 17]) {
          for (const offset of [-0.5, 0, 0.49]) {
            const target = spinTarget(current, count, winner, offset);
            expect(winnerAt(target, count)).toBe(winner);
            expect(target - current).toBeGreaterThanOrEqual(5 * 360);
          }
        }
      }
    }
  });
});

describe("cleanNames", () => {
  it("drops blanks and duplicates but keeps the order", () => {
    expect(cleanNames([" Anton", "", "jonas", "anton", "Pontus "])).toEqual(["Anton", "jonas", "Pontus"]);
  });
});

describe("spin timing", () => {
  it("carries the start time in the spin id", () => {
    expect(spinStartAt(newSpinId(1_794_000_000_000))).toBe(1_794_000_000_000);
    expect(spinStartAt("a-plain-uuid")).toBeNull();
  });

  it("counts down before the start, catches up after it, and stops on time", () => {
    const startAt = 1_000_000;
    expect(scheduleSpin(startAt, startAt - 2000)).toEqual({ kind: "wait", waitMs: 2000 });
    expect(scheduleSpin(startAt, startAt + 1000)).toEqual({ kind: "spin", durationMs: SPIN_MS - 1000 });
    expect(scheduleSpin(startAt, startAt + SPIN_MS)).toEqual({ kind: "over" });
  });

  it("never waits longer than the lead, even if the spinner's clock is ahead", () => {
    expect(scheduleSpin(1_000_000 + 60_000, 1_000_000)).toEqual({ kind: "wait", waitMs: SHARED_LEAD_MS });
  });
});
