import { describe, expect, it } from "vitest";

import { fitLabel, landingRotation, randomIndex, sliceAt } from "./wheel";

describe("landingRotation", () => {
  it("lands on the slice it was asked for, from any start and any offset", () => {
    for (const count of [2, 3, 4, 8, 11, 16]) {
      for (let index = 0; index < count; index += 1) {
        for (const start of [0, 90, 725.5, -40]) {
          for (const offset of [-0.5, 0, 0.5]) {
            const rotation = landingRotation(start, index, count, offset);
            expect(sliceAt(rotation, count)).toBe(index);
          }
        }
      }
    }
  });

  it("always turns forward, by at least six full turns", () => {
    const rotation = landingRotation(1000, 3, 8, 0);
    expect(rotation - 1000).toBeGreaterThanOrEqual(6 * 360);
    expect(rotation - 1000).toBeLessThan(7 * 360);
  });
});

describe("randomIndex", () => {
  it("stays in range and reaches every index", () => {
    const seen = new Set<number>();

    for (let i = 0; i < 500; i += 1) {
      const index = randomIndex(5);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(5);
      seen.add(index);
    }

    expect(seen.size).toBe(5);
  });
});

describe("fitLabel", () => {
  it("keeps short labels and cuts long ones with an ellipsis", () => {
    expect(fitLabel("Free", 10)).toBe("Free");
    expect(fitLabel("Buy one get one", 8)).toBe("Buy one…");
  });
});
