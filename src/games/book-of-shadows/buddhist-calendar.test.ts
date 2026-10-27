import { describe, expect, it } from "vitest";

import {
  daysUntil,
  festivalOn,
  festivalsIn,
  lunarDateName,
  lunarDateOf,
  nextFestival,
} from "./buddhist-calendar";
import type { FestivalId } from "./buddhist-calendar";

const daysOf = (year: number, id: FestivalId) => {
  const found = festivalsIn(year).find((entry) => entry.festival.id === id);

  return found ? [found.start, found.end] : null;
};

const nameOf = (key: string) => {
  const date = lunarDateOf(key);

  return date ? lunarDateName(date) : null;
};

const holy = (key: string) => lunarDateOf(key)?.holy;

describe("lunarDateOf", () => {
  it("gives a day its place in the lunar month", () => {
    expect(nameOf("2024-10-02")).toBe("15 waning Phatrabot");
    expect(nameOf("2024-11-15")).toBe("15 waxing Kadeuk");
    expect(nameOf("2024-05-22")).toBe("15 waxing Pisakh");
    expect(lunarDateOf("2024-05-22")?.era).toBe(2567);
    expect(lunarDateOf("2024-05-23")?.era).toBe(2568);
  });

  it("keeps the holy days: the 8th, the 15th and the month's last", () => {
    expect(holy("2024-11-15")).toBe(true);
    expect(holy("2024-10-02")).toBe(true);
    expect(holy("2024-10-01")).toBe(false);

    const month = Array.from({ length: 31 }, (_, i) =>
      lunarDateOf(`2026-10-${String(i + 1).padStart(2, "0")}`)
    ).filter((date) => date?.holy);

    expect(month.length).toBeGreaterThanOrEqual(4);
    expect(month.every((date) => date && [8, 14, 15].includes(date.day))).toBe(
      true
    );
  });

  it("reads the last day of a year", () => {
    expect(lunarDateOf("2026-12-31")).not.toBeNull();
    expect(lunarDateOf("not a day")).toBeNull();
  });
});

describe("festivalsIn", () => {
  // Cambodia's public holidays, as the government announced them.
  it.each([
    [2022, "pchum-ben", "2022-09-24", "2022-09-26"],
    [2023, "pchum-ben", "2023-10-13", "2023-10-15"],
    [2024, "pchum-ben", "2024-10-01", "2024-10-03"],
    [2025, "pchum-ben", "2025-09-21", "2025-09-23"],
    [2023, "bon-om-touk", "2023-11-26", "2023-11-28"],
    [2024, "bon-om-touk", "2024-11-14", "2024-11-16"],
    [2025, "bon-om-touk", "2025-11-04", "2025-11-06"],
    [2024, "khmer-new-year", "2024-04-13", "2024-04-16"],
    [2025, "khmer-new-year", "2025-04-14", "2025-04-16"],
    [2024, "visak-bochea", "2024-05-22", "2024-05-22"],
    [2025, "visak-bochea", "2025-05-11", "2025-05-11"],
    [2024, "royal-ploughing", "2024-05-26", "2024-05-26"],
    [2025, "royal-ploughing", "2025-05-15", "2025-05-15"],
    [2024, "meak-bochea", "2024-02-24", "2024-02-24"],
    [2025, "meak-bochea", "2025-02-12", "2025-02-12"],
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

describe("festivalOn", () => {
  it("finds the festival on any of its days", () => {
    expect(festivalOn("2024-10-01")?.name).toBe("Pchum Ben");
    expect(festivalOn("2024-10-03")?.name).toBe("Pchum Ben");
    expect(festivalOn("2024-10-04")).toBeNull();
  });
});

describe("nextFestival", () => {
  it("looks into next year when this one's are past", () => {
    expect(nextFestival("2026-10-27")?.start).toBe("2026-11-23");
    expect(nextFestival("2026-12-01")?.festival.id).toBe("lunar-new-year");
  });

  it("keeps a festival under way", () => {
    const now = nextFestival("2025-09-22");

    expect(now?.festival.id).toBe("pchum-ben");
    expect(now && daysUntil(now, "2025-09-22")).toBe(0);
    expect(now && daysUntil(now, "2025-09-01")).toBe(20);
  });
});
