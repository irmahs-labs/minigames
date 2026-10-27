import { describe, expect, it } from "vitest";

import { daysUntil, festivalsFrom, festivalsIn } from "./festivals";
import type { FestivalId } from "./festivals";

const daysOf = (year: number, id: FestivalId) => {
  const found = festivalsIn(year).find((entry) => entry.festival.id === id);

  return found ? [found.start, found.end] : null;
};

describe("festivalsIn", () => {
  // Cambodia's public holidays, as the government announced them.
  it.each([
    [2022, "ancestors", "2022-09-24", "2022-09-26"],
    [2023, "ancestors", "2023-10-13", "2023-10-15"],
    [2024, "ancestors", "2024-10-01", "2024-10-03"],
    [2025, "ancestors", "2025-09-21", "2025-09-23"],
    [2023, "water-and-lights", "2023-11-26", "2023-11-28"],
    [2024, "water-and-lights", "2024-11-14", "2024-11-16"],
    [2025, "water-and-lights", "2025-11-04", "2025-11-06"],
    [2024, "songkran", "2024-04-13", "2024-04-16"],
    [2025, "songkran", "2025-04-14", "2025-04-16"],
    [2024, "vesak", "2024-05-22", "2024-05-22"],
    [2025, "vesak", "2025-05-11", "2025-05-11"],
    [2024, "royal-ploughing", "2024-05-26", "2024-05-26"],
    [2025, "royal-ploughing", "2025-05-15", "2025-05-15"],
    [2024, "magha-puja", "2024-02-24", "2024-02-24"],
    [2025, "magha-puja", "2025-02-12", "2025-02-12"],
    [2026, "lunar-new-year", "2026-02-17", "2026-02-17"],
  ] as const)("has %i's %s from %s to %s", (year, id, start, end) => {
    expect(daysOf(year, id)).toEqual([start, end]);
  });

  it("finds all seven, in order", () => {
    const year = festivalsIn(2026);

    expect(year).toHaveLength(7);
    expect(year.map((entry) => entry.start)).toEqual(
      year.map((entry) => entry.start).toSorted()
    );
  });
});

describe("festivalsFrom", () => {
  it("gives each festival once, the next time it comes", () => {
    const coming = festivalsFrom("2026-10-27");

    expect(coming.map((entry) => entry.festival.id)).toEqual([
      "water-and-lights",
      "lunar-new-year",
      "magha-puja",
      "songkran",
      "vesak",
      "royal-ploughing",
      "ancestors",
    ]);
    expect(coming[0]?.start).toBe("2026-11-23");
    expect(coming[1]?.start).toBe("2027-02-06");
  });

  it("keeps a festival under way", () => {
    const [first] = festivalsFrom("2025-09-22");

    expect(first?.festival.id).toBe("ancestors");
    expect(first && daysUntil(first, "2025-09-22")).toBe(0);
    expect(first && daysUntil(first, "2025-09-01")).toBe(20);
  });
});
