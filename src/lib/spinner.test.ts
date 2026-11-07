import { describe, expect, it } from "vitest";
import { cleanNames, spinTarget, winnerAt } from "./spinner.ts";

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
