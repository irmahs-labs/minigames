import { describe, expect, it } from "vitest";

import {
  letterValue,
  lettersOf,
  meaningOf,
  numbersFor,
  personalYearOf,
  reduce,
} from "./numerology";

describe("reduce", () => {
  it("adds digits down to one", () => {
    expect(reduce(1987)).toBe(7);
    expect(reduce(9)).toBe(9);
    expect(reduce(10)).toBe(1);
  });

  it("keeps the master numbers", () => {
    expect(reduce(29)).toBe(11);
    expect(reduce(22)).toBe(22);
    expect(reduce(1966)).toBe(22);
    expect(reduce(33)).toBe(33);
  });
});

describe("letters", () => {
  it("counts round the alphabet in nines", () => {
    expect(["A", "I", "J", "R", "S", "Z"].map(letterValue)).toEqual([
      1, 9, 1, 9, 1, 8,
    ]);
  });

  it("drops accents, spaces and marks", () => {
    expect(lettersOf("Zoë-Anne d'Arc")).toBe("ZOEANNEDARC");
  });
});

describe("numbersFor", () => {
  it("reduces month, day and year before adding them for the life path", () => {
    // 7 + 14 → 5 + 1990 → 19 → 1: 13 → 4.
    expect(
      numbersFor({ day: 14, month: 7, year: 1990 }, "", 2026).lifePath
    ).toBe(4);
    // 11 + 29 → 11 + 1987 → 7: 29 → 11, a master number.
    expect(
      numbersFor({ day: 29, month: 11, year: 1987 }, "", 2026).lifePath
    ).toBe(11);
  });

  it("splits the name into heart and face", () => {
    const numbers = numbersFor({ day: 1, month: 1, year: 2000 }, "Abe", 2026);

    // A 1 + B 2 + E 5.
    expect(numbers.expression).toBe(8);
    expect(numbers.soulUrge).toBe(6);
    expect(numbers.personality).toBe(2);
    expect(numbers.maturity).toBe(reduce(numbers.lifePath + 8));
  });

  it("leaves the name's numbers out without a name", () => {
    const numbers = numbersFor({ day: 1, month: 1, year: 2000 }, "  ", 2026);

    expect(numbers.expression).toBeNull();
    expect(numbers.soulUrge).toBeNull();
    expect(numbers.maturity).toBeNull();
  });

  it("finds this year's personal year", () => {
    // 7 + 5 + 2026 → 10 → 1: 13 → 4.
    expect(
      numbersFor({ day: 14, month: 7, year: 1990 }, "", 2026).personalYear
    ).toBe(4);
  });
});

describe("meanings", () => {
  it("has one for every number a reduction can give", () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
      expect(meaningOf(n)?.title).toBeTruthy();
      expect(personalYearOf(n)).toBeTruthy();
    }

    expect(meaningOf(10)).toBeNull();
  });
});
