import { describe, expect, it } from "vitest";

import { chineseDaysOf, chineseMonths } from "./chinese";

describe("the Chinese calendar", () => {
  // The Hong Kong Observatory's dates.
  it.each([
    [2024, "2024-02-10"],
    [2025, "2025-01-29"],
    [2026, "2026-02-17"],
    [2027, "2027-02-06"],
    [2028, "2028-01-26"],
    [2030, "2030-02-03"],
  ])("starts %i on %s", (year, day) => {
    expect(chineseMonths(year)[0]).toBe(day);
  });

  it("leaves out the leap month: 2025 had two sixth months", () => {
    const months = chineseMonths(2025);

    expect(months).toHaveLength(12);
    // The seventh month starts after the leap sixth, on 23 August.
    expect(months[6]).toBe("2025-08-23");
  });

  it("finds a month's day in the Gregorian year it falls in", () => {
    expect(chineseDaysOf(2027, 1, 15)).toEqual(["2027-02-20"]);
    expect(chineseDaysOf(2027, 8, 15)).toEqual(["2027-09-15"]);
    // A twelfth month starts twice in 2027: the 2026 year's, then its own.
    expect(chineseDaysOf(2027, 12, 1)).toEqual(["2027-01-08", "2027-12-28"]);
  });
});
