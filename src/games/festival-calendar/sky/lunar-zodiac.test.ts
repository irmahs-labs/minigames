import { describe, expect, it } from "vitest";

import {
  ANIMALS,
  allies,
  clash,
  hourAnimal,
  hoursOf,
  lunarNewYear,
  lunarYear,
  lunarYearOf,
  cycleName,
  dayPillarOf,
  secretFriend,
  yearsOf,
} from "./lunar-zodiac";

const named = (id: string) => {
  const animal = ANIMALS.find((entry) => entry.id === id);

  if (!animal) {
    throw new Error(`No ${id}`);
  }

  return animal;
};

describe("lunarNewYear", () => {
  it.each([
    // China kept summer time in the 1940s; the calendar never did.
    [1944, "1944-01-25"],
    [1950, "1950-02-17"],
    [1961, "1961-02-15"],
    [1966, "1966-01-21"],
    [1980, "1980-02-16"],
    [1984, "1984-02-02"],
    // The solstice and the new moon fall on the same Beijing day.
    [1985, "1985-02-20"],
    [1987, "1987-01-29"],
    [1988, "1988-02-17"],
    [1989, "1989-02-06"],
    [1990, "1990-01-27"],
    [1995, "1995-01-31"],
    [2000, "2000-02-05"],
    [2001, "2001-01-24"],
    [2005, "2005-02-09"],
    [2010, "2010-02-14"],
    [2015, "2015-02-19"],
    [2019, "2019-02-05"],
    [2020, "2020-01-25"],
    [2021, "2021-02-12"],
    [2022, "2022-02-01"],
    [2023, "2023-01-22"],
    [2024, "2024-02-10"],
    [2025, "2025-01-29"],
    [2026, "2026-02-17"],
    [2027, "2027-02-06"],
    [2028, "2028-01-26"],
    [2030, "2030-02-03"],
    [2033, "2033-01-31"],
    // A leap month after the solstice of 2033 puts it a month on.
    [2034, "2034-02-19"],
  ])("falls in %i on %s", (year, day) => {
    expect(lunarNewYear(year)).toBe(day);
  });
});

describe("lunarYear", () => {
  it("runs the animals and the elements round", () => {
    expect(lunarYear(2026)).toMatchObject({
      animal: { name: "Horse" },
      element: "Fire",
      polarity: "Yang",
    });
    expect(lunarYear(1984)).toMatchObject({
      animal: { name: "Rat" },
      element: "Wood",
    });
    expect(lunarYear(1987)).toMatchObject({
      animal: { name: "Rabbit" },
      element: "Fire",
      polarity: "Yin",
    });
  });

  it("changes animal on 1 January, kept simple", () => {
    expect(lunarYearOf("2023-12-31").animal.name).toBe("Rabbit");
    expect(lunarYearOf("2024-01-02").animal.name).toBe("Dragon");
    expect(lunarYearOf("1990-01-26").animal.name).toBe("Horse");
    expect(lunarYearOf("1990-07-14")).toMatchObject({
      animal: { name: "Horse" },
      element: "Metal",
    });
  });
});

describe("cycleName", () => {
  it("names a year by its stem and branch, sixty years round", () => {
    expect(cycleName(lunarYear(1984))).toBe("甲子 jiǎzǐ");
    expect(cycleName(lunarYear(2026))).toBe("丙午 bǐngwǔ");
    expect(cycleName(lunarYear(1990))).toBe("庚午 gēngwǔ");
    expect(lunarYear(1984).cycle).toBe(1);
    expect(lunarYear(2026).cycle).toBe(43);
    expect(lunarYear(2043).cycle).toBe(60);
    expect(lunarYear(2044).cycle).toBe(1);
  });
});

const pillarName = (day: string) => {
  const { stem, animal } = dayPillarOf(day);

  return `${stem.hanzi}${animal.branch.hanzi}`;
};

describe("dayPillarOf", () => {
  it("counts the days round the sixty", () => {
    expect(pillarName("2000-01-01")).toBe("戊午");
    expect(pillarName("2000-01-02")).toBe("己未");
    expect(pillarName("2024-02-10")).toBe("甲辰");
    expect(pillarName("2000-03-01")).toBe(pillarName("2000-01-01"));
    expect(dayPillarOf("1990-01-26").stem).toMatchObject({
      element: expect.any(String),
      polarity: expect.any(String),
    });
  });
});

describe("hours", () => {
  it("gives each two hours its animal, the Rat across midnight", () => {
    expect(hourAnimal(23).name).toBe("Rat");
    expect(hourAnimal(0).name).toBe("Rat");
    expect(hourAnimal(1).name).toBe("Ox");
    expect(hourAnimal(12).name).toBe("Horse");
    expect(hoursOf(named("rat"))).toBe("23:00–00:59");
    expect(hoursOf(named("horse"))).toBe("11:00–12:59");
  });
});

describe("matches", () => {
  it("finds the allies, the secret friend and the clash", () => {
    expect(allies(named("rat")).map((animal) => animal.name)).toEqual([
      "Dragon",
      "Monkey",
    ]);
    expect(secretFriend(named("rat")).name).toBe("Ox");
    expect(secretFriend(named("tiger")).name).toBe("Pig");
    expect(secretFriend(named("horse")).name).toBe("Goat");
    expect(clash(named("rat")).name).toBe("Horse");
  });

  it("lists an animal's recent years", () => {
    expect(yearsOf(named("horse"), 2026)).toEqual([
      1978, 1990, 2002, 2014, 2026, 2038,
    ]);
    expect(yearsOf(named("goat"), 2026)).toEqual([
      1967, 1979, 1991, 2003, 2015, 2027,
    ]);
  });
});
