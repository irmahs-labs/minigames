import { describe, expect, it } from "vitest";

import { carriedMessage, entriesToCarry, isCarriedKey } from "./carry-over";

const empty = () => false;

describe("isCarriedKey", () => {
  it("takes the site's own saved games, the theme and the language", () => {
    expect(isCarriedKey("minigames:wheel-of-fortune:v1")).toBe(true);
    expect(isCarriedKey("minigames:quizzes:witch:v1")).toBe(true);
    expect(isCarriedKey("theme")).toBe(true);
    expect(isCarriedKey("lang")).toBe(true);
  });

  it("leaves anything else behind", () => {
    expect(isCarriedKey("playground:carried-over")).toBe(false);
    expect(isCarriedKey("someone-else")).toBe(false);
    expect(isCarriedKey("xminigames:wheel")).toBe(false);
  });
});

describe("entriesToCarry", () => {
  it("keeps the site's own text entries", () => {
    expect(
      entriesToCarry(
        { "minigames:the-arena:v1": "{}", other: "x", theme: "dark" },
        empty
      )
    ).toEqual([
      ["minigames:the-arena:v1", "{}"],
      ["theme", "dark"],
    ]);
  });

  it("never replaces what the new address already saved", () => {
    expect(
      entriesToCarry(
        { "minigames:wheel-of-fortune:v1": "old", theme: "dark" },
        (key) => key === "theme"
      )
    ).toEqual([["minigames:wheel-of-fortune:v1", "old"]]);
  });
});

describe("carriedMessage", () => {
  it("reads what carry-over.html posts", () => {
    expect(
      carriedMessage.safeParse({
        entries: { "minigames:a": "x" },
        type: "carry-over",
      }).success
    ).toBe(true);
  });

  it("refuses anything else", () => {
    for (const data of [
      null,
      "minigames:a",
      { entries: { "minigames:a": 1 }, type: "carry-over" },
      { entries: { "minigames:a": "x" }, type: "something-else" },
      { type: "carry-over" },
    ]) {
      expect(carriedMessage.safeParse(data).success).toBe(false);
    }
  });
});
