import { afterEach, describe, expect, it } from "vitest";

import { loadSaved, saveResult, storageKey } from "./saved";
import { WITCH_QUIZ } from "./witch";

afterEach(() => window.localStorage.clear());

describe("saved results", () => {
  it("is none until the quiz is taken", () => {
    expect(loadSaved(WITCH_QUIZ)).toBeNull();
  });

  it("reads back what was saved, and a retake replaces it", () => {
    saveResult(WITCH_QUIZ, { moon: 5 }, new Date("2026-11-04T10:00:00Z"));
    saveResult(WITCH_QUIZ, { sea: 4 }, new Date("2026-11-05T10:00:00Z"));

    expect(loadSaved(WITCH_QUIZ)).toEqual({
      scores: { sea: 4 },
      takenAt: "2026-11-05T10:00:00.000Z",
    });
  });

  it("drops witches the quiz no longer has", () => {
    window.localStorage.setItem(
      storageKey(WITCH_QUIZ),
      JSON.stringify({ scores: { moon: 3, unicorn: 9 }, takenAt: "x" })
    );

    expect(loadSaved(WITCH_QUIZ)?.scores).toEqual({ moon: 3 });
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
