import { describe, expect, it } from "vitest";

import { BARBIE_QUIZ } from "./barbie";
import { tally, winner } from "./quiz";

const ids = Object.keys(BARBIE_QUIZ.results);

/** For each question, the answer worth the most to `id` (the first, if none is). */
const bestPicksFor = (id: string) =>
  BARBIE_QUIZ.questions.map((question) => {
    const worth = question.answers.map((answer) => answer.points[id] ?? 0);

    return worth.indexOf(Math.max(...worth));
  });

describe("which Barbie character are you?", () => {
  it("has the fourteen heroines, each with her film", () => {
    expect(ids).toHaveLength(14);

    for (const result of Object.values(BARBIE_QUIZ.results)) {
      expect(result.about.en).toMatch(/^From .*\(20(?:0\d|10)\)\. /u);
      expect(result.about.fr).toMatch(/^Dans .*\(20(?:0\d|10)\)\. /u);
    }
  });

  it("has fourteen questions of six answers, each in English and French", () => {
    expect(BARBIE_QUIZ.questions).toHaveLength(14);

    for (const question of BARBIE_QUIZ.questions) {
      expect(question.answers).toHaveLength(6);
      expect(question.prompt.fr).not.toBe(question.prompt.en);

      for (const answer of question.answers) {
        expect(answer.text.fr).not.toBe(answer.text.en);
      }
    }
  });

  it("gives points only to heroines it has", () => {
    for (const question of BARBIE_QUIZ.questions) {
      for (const answer of question.answers) {
        for (const id of Object.keys(answer.points)) {
          expect(ids).toContain(id);
        }
      }
    }
  });

  it("never names one heroine twice in a question", () => {
    for (const question of BARBIE_QUIZ.questions) {
      const named = question.answers.flatMap((answer) =>
        Object.keys(answer.points)
      );

      expect(new Set(named).size).toBe(named.length);
    }
  });

  it("is fair: every heroine is worth 18 points over all the answers", () => {
    for (const id of ids) {
      const worth = BARBIE_QUIZ.questions.flatMap((question) =>
        question.answers.map((answer) => answer.points[id] ?? 0)
      );

      expect(worth.reduce((sum, points) => sum + points, 0)).toBe(18);
    }
  });

  it("gives 2 points to one heroine an answer, and 1 to one more", () => {
    for (const question of BARBIE_QUIZ.questions) {
      for (const answer of question.answers) {
        expect(Object.values(answer.points).toSorted()).toEqual([1, 2]);
      }
    }
  });

  it.each(ids)("can make you %s", (id) => {
    expect(winner(BARBIE_QUIZ, tally(BARBIE_QUIZ, bestPicksFor(id)))).toBe(id);
  });
});
