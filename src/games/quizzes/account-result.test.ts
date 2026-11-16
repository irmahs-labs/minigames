import { describe, expect, it } from "vitest";

import { accountResultOf, keepable, mostPoints } from "./account-result";
import { LIFE_PARTNER_QUIZ } from "./life-partner";
import { WITCH_QUIZ } from "./witch";

const NOW = new Date("2026-11-16T12:00:00Z");

describe("which quizzes show on a profile", () => {
  it("sends the witch quiz to the Book of Shadows, and keeps the life partner quiz here", () => {
    expect(WITCH_QUIZ.profile?.url).toBe(
      "https://realms.irmahs.dev/book-of-shadows"
    );
    expect(LIFE_PARTNER_QUIZ.profile).toBeUndefined();
  });
});

describe("keepable", () => {
  const takenAt = "2026-11-16T11:00:00.000Z";

  it("keeps the quiz's own results, dropping the ones at zero", () => {
    expect(
      keepable(WITCH_QUIZ, { scores: { sea: 0, tech: 12 }, takenAt }, NOW)
    ).toEqual({ scores: { tech: 12 }, takenAt: new Date(takenAt) });
  });

  it("refuses results it doesn't have, nothing scored, or more than the answers give", () => {
    const most = mostPoints(WITCH_QUIZ);

    expect(most).toBeGreaterThan(0);
    expect(
      keepable(WITCH_QUIZ, { scores: { necro: 3 }, takenAt }, NOW)
    ).toBeNull();
    expect(
      keepable(WITCH_QUIZ, { scores: { tech: 0 }, takenAt }, NOW)
    ).toBeNull();
    expect(
      keepable(WITCH_QUIZ, { scores: { tech: most, sea: 1 }, takenAt }, NOW)
    ).toBeNull();
    expect(
      keepable(WITCH_QUIZ, { scores: { tech: most }, takenAt }, NOW)
    ).not.toBeNull();
  });

  it("refuses a day it can't read, years back, or ahead of now", () => {
    const tech = { tech: 3 };

    expect(
      keepable(WITCH_QUIZ, { scores: tech, takenAt: "soon" }, NOW)
    ).toBeNull();
    expect(
      keepable(
        WITCH_QUIZ,
        { scores: tech, takenAt: "2023-01-01T00:00:00Z" },
        NOW
      )
    ).toBeNull();
    expect(
      keepable(
        WITCH_QUIZ,
        { scores: tech, takenAt: "2026-11-17T00:00:00Z" },
        NOW
      )
    ).toBeNull();
  });
});

describe("accountResultOf", () => {
  it("names the results, most points first, in both languages", () => {
    const result = accountResultOf(WITCH_QUIZ, {
      scores: { cosmic: 9, tech: 20 },
      takenAt: NOW,
    });

    expect(result.ranked.map((entry) => entry.id)).toEqual(["tech", "cosmic"]);
    expect(result.ranked[0]?.name).toEqual({
      en: "Tech witch",
      fr: expect.any(String),
    });
    expect(result.takenAt).toBe(NOW.toISOString());
  });
});
