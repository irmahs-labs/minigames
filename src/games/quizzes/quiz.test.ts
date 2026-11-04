import { describe, expect, it } from "vitest";

import { percent, pieSlices, ranked, tally, winner } from "./quiz";
import type { Quiz } from "./quiz";

const words = (en: string) => ({ en, fr: en });

const result = (name: string) => ({ about: words(""), name: words(name) });

const QUIZ: Quiz = {
  blurb: words(""),
  legend: "test.txt",
  questions: [
    {
      answers: [
        { points: { b: 2, c: 1 }, text: words("one") },
        { points: { a: 2 }, text: words("two") },
      ],
      prompt: words("first"),
    },
    {
      answers: [
        { points: { a: 1 }, text: words("one") },
        { points: { b: 1, d: 1 }, text: words("two") },
      ],
      prompt: words("second"),
    },
  ],
  results: {
    a: result("Apple"),
    b: result("Banana"),
    c: result("Cherry"),
    d: result("Date"),
    e: result("Elderberry"),
    f: result("Fig"),
    g: result("Grape"),
    h: result("Honeydew"),
    i: result("Kiwi"),
  },
  slug: "test",
  title: words("Test"),
};

describe("tally", () => {
  it("adds up the points of each picked answer", () => {
    expect(tally(QUIZ, [0, 1])).toEqual({ b: 3, c: 1, d: 1 });
    expect(tally(QUIZ, [1, 0])).toEqual({ a: 3 });
  });
});

describe("ranked", () => {
  it("puts the most points first", () => {
    expect(ranked(QUIZ, { a: 1, b: 3, c: 2 }).map((entry) => entry.id)).toEqual(
      ["b", "c", "a"]
    );
  });

  it("breaks a tie by the English name, alphabetically", () => {
    expect(ranked(QUIZ, { a: 2, b: 2, c: 2 }).map((entry) => entry.id)).toEqual(
      ["a", "b", "c"]
    );
    expect(ranked(QUIZ, { a: 2, c: 2, d: 1 }).map((entry) => entry.id)).toEqual(
      ["a", "c", "d"]
    );
  });

  it("leaves out results with no points and ids the quiz does not have", () => {
    expect(ranked(QUIZ, { a: 0, b: 1, zz: 5 })).toEqual([
      { id: "b", points: 1 },
    ]);
  });
});

describe("winner", () => {
  it("is the top result, the first alphabetically on a tie", () => {
    expect(winner(QUIZ, { a: 1, b: 3 })).toBe("b");
    expect(winner(QUIZ, { b: 3, c: 3 })).toBe("b");
  });

  it("is null before any points", () => {
    expect(winner(QUIZ, {})).toBeNull();
  });
});

describe("pieSlices", () => {
  it("gives each result its share of the points", () => {
    expect(pieSlices(QUIZ, { a: 1, b: 3 })).toEqual([
      { id: "b", points: 3, share: 0.75 },
      { id: "a", points: 1, share: 0.25 },
    ]);
  });

  it("keeps eight results as eight slices", () => {
    const slices = pieSlices(QUIZ, {
      a: 8,
      b: 7,
      c: 6,
      d: 5,
      e: 4,
      f: 3,
      g: 2,
      h: 1,
    });

    expect(slices.map((slice) => slice.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
    ]);
  });

  it("folds everything past the biggest seven into one other slice", () => {
    const slices = pieSlices(QUIZ, {
      a: 9,
      b: 8,
      c: 7,
      d: 6,
      e: 5,
      f: 4,
      g: 3,
      h: 2,
      i: 1,
    });

    expect(slices.map((slice) => slice.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "other",
    ]);
    expect(slices.at(-1)?.points).toBe(3);
    expect(slices.reduce((sum, slice) => sum + slice.share, 0)).toBeCloseTo(1);
  });
});

describe("percent", () => {
  it("rounds a share to a whole percentage", () => {
    expect(percent(0.316)).toBe(32);
    expect(percent(1)).toBe(100);
  });
});
