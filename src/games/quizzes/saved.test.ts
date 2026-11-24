import { afterEach, describe, expect, it } from "vitest";

import { BARBIE_QUIZ } from "./barbie";
import {
  erasKey,
  loadEras,
  loadSaved,
  saveEras,
  saveResult,
  storageKey,
} from "./saved";
import { WITCH_QUIZ } from "./witch";

afterEach(() => window.localStorage.clear());

describe("saved results", () => {
  it("is none until the quiz is taken", () => {
    expect(loadSaved(WITCH_QUIZ)).toBeNull();
  });

  it("reads back what was saved, and a retake replaces it", () => {
    saveResult(WITCH_QUIZ, { green: 5 }, new Date("2026-11-04T10:00:00Z"));
    saveResult(WITCH_QUIZ, { green: 4 }, new Date("2026-11-05T10:00:00Z"));

    expect(loadSaved(WITCH_QUIZ)).toEqual({
      scores: { green: 4 },
      takenAt: "2026-11-05T10:00:00.000Z",
    });
  });

  it("keeps the eras a result was played with", () => {
    saveResult(BARBIE_QUIZ, { malibu: 40 }, new Date("2026-11-19T10:00:00Z"), [
      "malibu-brooklyn",
    ]);

    expect(loadSaved(BARBIE_QUIZ)?.eras).toEqual(["malibu-brooklyn"]);
  });

  it("drops witches the quiz no longer has", () => {
    window.localStorage.setItem(
      storageKey(WITCH_QUIZ),
      JSON.stringify({ scores: { green: 3, unicorn: 9 }, takenAt: "x" })
    );

    expect(loadSaved(WITCH_QUIZ)?.scores).toEqual({ green: 3 });
  });

  it("treats a damaged value as no result", () => {
    window.localStorage.setItem(storageKey(WITCH_QUIZ), "{not json");
    expect(loadSaved(WITCH_QUIZ)).toBeNull();

    window.localStorage.setItem(
      storageKey(WITCH_QUIZ),
      JSON.stringify({ scores: { unicorn: 9 }, takenAt: "x" })
    );
    expect(loadSaved(WITCH_QUIZ)).toBeNull();
  });
});

describe("chosen eras", () => {
  it("are every era until the visitor chooses", () => {
    expect(loadEras(BARBIE_QUIZ)).toEqual([
      "heroines",
      "herself",
      "malibu-brooklyn",
    ]);
  });

  it("read back what was chosen, in the quiz's order", () => {
    saveEras(BARBIE_QUIZ, ["malibu-brooklyn", "heroines"]);

    expect(loadEras(BARBIE_QUIZ)).toEqual(["heroines", "malibu-brooklyn"]);
  });

  it("go back to every era when none chosen is left", () => {
    window.localStorage.setItem(erasKey(BARBIE_QUIZ), JSON.stringify(["gone"]));
    expect(loadEras(BARBIE_QUIZ)).toHaveLength(3);

    window.localStorage.setItem(erasKey(BARBIE_QUIZ), "{not json");
    expect(loadEras(BARBIE_QUIZ)).toHaveLength(3);
  });

  it("are none for a quiz without eras", () => {
    expect(loadEras(WITCH_QUIZ)).toEqual([]);
  });
});
