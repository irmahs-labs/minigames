import { beforeEach, describe, expect, it } from "vitest";

import { STORAGE_KEY, loadFound, saveFound } from "./state";

describe("loadFound", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts with an empty recipe book on a first visit", () => {
    expect(loadFound()).toEqual([]);
  });

  it("brings back the potions it saved, in order", () => {
    saveFound(["Mystic Dawn", "Whispering Woods"]);

    expect(loadFound()).toEqual(["Mystic Dawn", "Whispering Woods"]);
  });

  it("drops potions that are not in the book, and repeats", () => {
    saveFound(["Mystic Dawn", "Love Potion", "Mystic Dawn"]);

    expect(loadFound()).toEqual(["Mystic Dawn"]);
  });

  it("starts over when the saved value is damaged", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadFound()).toEqual([]);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ found: 3 }));
    expect(loadFound()).toEqual([]);
  });
});
