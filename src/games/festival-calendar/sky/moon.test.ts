import { describe, expect, it } from "vitest";

import {
  fullMoonName,
  inBetweenPhase,
  moonMonth,
  moonNow,
  phaseOn,
  quartersBetween,
} from "./moon";

describe("moonMonth", () => {
  it("puts each exact phase on its own day", () => {
    expect(
      moonMonth(2026, 10, "UTC")
        .filter((day) => day.exact)
        .map((day) => [day.key, day.phase])
    ).toEqual([
      ["2026-10-03", "Last Quarter"],
      ["2026-10-10", "New Moon"],
      ["2026-10-18", "First Quarter"],
      ["2026-10-26", "Full Moon"],
    ]);
  });

  it("names the days between by the Moon's angle", () => {
    const days = moonMonth(2026, 10, "UTC");

    expect(days).toHaveLength(31);
    expect(days[11]?.phase).toBe("Waxing Crescent");
    expect(days[21]?.phase).toBe("Waxing Gibbous");
    expect(days[28]?.phase).toBe("Waning Gibbous");
    expect(days[5]?.phase).toBe("Waning Crescent");
  });

  it("moves a phase to the day it falls on where you are", () => {
    // The full moon is at 04:12 UTC on 26 October: still the 25th in Los Angeles.
    const pacific = moonMonth(2026, 10, "America/Los_Angeles");

    expect(pacific[24]?.phase).toBe("Full Moon");
    expect(pacific[25]?.phase).toBe("Waning Gibbous");
  });
});

describe("phaseOn", () => {
  it("agrees with the month's calendar", () => {
    expect(phaseOn(new Date("2026-10-26T20:00:00Z"), "UTC").phase).toBe(
      "Full Moon"
    );
    expect(phaseOn(new Date("2026-10-26T20:00:00Z"), "Asia/Tokyo").phase).toBe(
      "Waning Gibbous"
    );
  });
});

describe("fullMoonName", () => {
  const names = quartersBetween(
    new Date("2026-01-01T00:00:00Z"),
    new Date("2027-01-01T00:00:00Z")
  )
    .filter((quarter) => quarter.phase === "Full Moon")
    .map((quarter) => fullMoonName(quarter.time, "UTC"));

  it("names every full moon of 2026", () => {
    expect(names).toEqual([
      "Wolf Moon",
      "Snow Moon",
      "Worm Moon",
      "Pink Moon",
      "Flower Moon",
      "Blue Moon",
      "Strawberry Moon",
      "Buck Moon",
      "Sturgeon Moon",
      "Harvest Moon",
      "Hunter's Moon",
      "Beaver Moon",
      "Cold Moon",
    ]);
  });
});

describe("inBetweenPhase", () => {
  it("splits the cycle into four", () => {
    expect(inBetweenPhase(10)).toBe("Waxing Crescent");
    expect(inBetweenPhase(100)).toBe("Waxing Gibbous");
    expect(inBetweenPhase(190)).toBe("Waning Gibbous");
    expect(inBetweenPhase(300)).toBe("Waning Crescent");
  });
});

describe("moonNow", () => {
  it("is all lit at the full moon and dark at the new", () => {
    expect(
      moonNow(new Date("2026-10-26T04:12:00Z")).illumination
    ).toBeGreaterThan(0.99);
    expect(moonNow(new Date("2026-10-10T15:50:00Z")).illumination).toBeLessThan(
      0.01
    );
  });
});
