import { describe, expect, it } from "vitest";

import {
  aspectBetween,
  chartMatch,
  lunarMatch,
  numberPair,
  numbersMatch,
} from "./compat";
import { lunarYear } from "./lunar-zodiac";
import { numbersFor } from "./numerology";
import { EMPTY_PROFILE, chartFor, readBirth } from "./profile";
import type { Profile } from "./profile";

const chartOf = (fields: Partial<Profile>) => {
  const birth = readBirth({ ...EMPTY_PROFILE, ...fields }, "UTC");

  if (!birth) {
    throw new Error("No birth date");
  }

  return chartFor(birth);
};

describe("aspectBetween", () => {
  it("finds the aspect within its orb, either way round the circle", () => {
    expect(aspectBetween(10, 130)?.name).toBe("trine");
    expect(aspectBetween(357, 3)?.name).toBe("conjunction");
    expect(aspectBetween(0, 95)?.name).toBe("square");
    expect(aspectBetween(0, 178)?.name).toBe("opposition");
    expect(aspectBetween(0, 40)).toBeNull();
  });
});

describe("chartMatch", () => {
  it("scores two charts and gives its reasons, starting with the Suns", () => {
    const match = chartMatch(
      chartOf({ birthDate: "1990-07-14", birthTime: "12:00" }),
      chartOf({ birthDate: "1992-11-03", birthTime: "08:30" }),
      "Sam"
    );

    expect(match.score).toBeGreaterThanOrEqual(3);
    expect(match.score).toBeLessThanOrEqual(98);
    // Cancer and Scorpio: both water.
    expect(match.reasons[0]).toMatchObject({
      title: "Cancer Sun and Scorpio Sun",
      tone: "good",
    });
    expect(match.verdict).not.toBe("");
  });

  it("matches a chart with itself well: every pair meets", () => {
    const chart = chartOf({ birthDate: "1990-07-14" });

    expect(chartMatch(chart, chart, "Me").score).toBeGreaterThan(80);
  });
});

describe("numbers", () => {
  it("pairs numbers by family: 1-5-7, 2-4-8, 3-6-9", () => {
    expect(numberPair(1, 7).score).toBe(90);
    expect(numberPair(4, 4).score).toBe(82);
    expect(numberPair(3, 8).tone).toBe("mixed");
    expect(numberPair(1, 8).tone).toBe("hard");
    // A master 11 counts with the 2s.
    expect(numberPair(11, 4).score).toBe(90);
  });

  it("weighs the life paths double, and adds the names' when both have them", () => {
    const match = numbersMatch(
      numbersFor({ day: 14, month: 7, year: 1990 }, "Abe", 2026),
      numbersFor({ day: 1, month: 1, year: 2000 }, "Eve", 2026),
      "Eve"
    );

    expect(match.reasons.map((reason) => reason.title)).toEqual([
      "Life path 4 and Eve's 4",
      "Expression 8 and 5",
      "Soul urge 6 and 1",
    ]);

    const noNames = numbersMatch(
      numbersFor({ day: 14, month: 7, year: 1990 }, "", 2026),
      numbersFor({ day: 1, month: 1, year: 2000 }, "Eve", 2026),
      "Eve"
    );

    expect(noNames.reasons).toHaveLength(1);
  });
});

describe("lunarMatch", () => {
  it("knows the trines, the secret friends and the clashes", () => {
    // Rat 1984 and Dragon 1988: the same trine.
    expect(lunarMatch(lunarYear(1984), lunarYear(1988)).reasons[0]?.tone).toBe(
      "good"
    );
    // Rat and Ox: secret friends.
    expect(
      lunarMatch(lunarYear(1984), lunarYear(1985)).reasons[0]?.text
    ).toContain("Secret friends");
    // Rat and Horse: a clash.
    expect(lunarMatch(lunarYear(1984), lunarYear(1990)).reasons[0]?.tone).toBe(
      "hard"
    );
    // Rat and Goat: a harmful pair.
    expect(
      lunarMatch(lunarYear(1984), lunarYear(1991)).reasons[0]?.text
    ).toContain("harmful");
  });

  it("adds how the elements get on", () => {
    // Wood (1984) feeds Fire (1987).
    const match = lunarMatch(lunarYear(1984), lunarYear(1987));

    expect(match.reasons[1]).toMatchObject({
      title: "Wood and Fire",
      tone: "good",
    });
    // Water (1992) quenches Fire (1986).
    expect(lunarMatch(lunarYear(1992), lunarYear(1986)).reasons[1]?.tone).toBe(
      "hard"
    );
  });
});
