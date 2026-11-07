import { describe, expect, it } from "vitest";
import { clickTimes } from "./spinSound.ts";

describe("clickTimes", () => {
  it("clicks fast at the start and slows down until the wheel stops", () => {
    const times = clickTimes(4.5, 100);
    expect(times).toHaveLength(100);
    expect(times.at(-1)).toBeCloseTo(4.5);

    const gaps = times.slice(1).map((t, i) => t - (times[i] ?? 0));
    expect(gaps[0]).toBeLessThan(0.02); // "frrrr"
    expect(gaps.at(-1)).toBeGreaterThan(0.3); // "…tk"
    expect(gaps.every((gap, i) => i === 0 || gap >= (gaps[i - 1] ?? 0))).toBe(true);
  });
});
