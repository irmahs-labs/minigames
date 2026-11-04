import { describe, expect, it } from "vitest";

import { tally, winner } from "./quiz";
import { WITCH_QUIZ } from "./witch";

const ids = Object.keys(WITCH_QUIZ.results);

/** For each question, the answer worth the most to `id` (the first, if none is). */
const bestPicksFor = (id: string) =>
  WITCH_QUIZ.questions.map((question) => {
    const worth = question.answers.map((answer) => answer.points[id] ?? 0);

    return worth.indexOf(Math.max(...worth));
  });

describe("what type of witch are you?", () => {
  it("has the sixteen witches", () => {
    expect(ids).toHaveLength(16);
  });

  it("has twelve questions of four answers, each in English and French", () => {
    expect(WITCH_QUIZ.questions).toHaveLength(12);

    for (const question of WITCH_QUIZ.questions) {
      expect(question.answers).toHaveLength(4);
      expect(question.prompt.fr).not.toBe(question.prompt.en);

      for (const answer of question.answers) {
        expect(answer.text.fr).not.toBe(answer.text.en);
      }
    }
  });

  it("gives points only to witches it has", () => {
    for (const question of WITCH_QUIZ.questions) {
      for (const answer of question.answers) {
        for (const id of Object.keys(answer.points)) {
          expect(ids).toContain(id);
        }
      }
    }
  });

  it("never names one witch twice in a question", () => {
    for (const question of WITCH_QUIZ.questions) {
      const named = question.answers.flatMap((answer) =>
        Object.keys(answer.points)
      );

      expect(new Set(named).size).toBe(named.length);
    }
  });

  it("is fair: every witch is worth 2 in three answers and 1 in three more", () => {
    for (const id of ids) {
      const worth = WITCH_QUIZ.questions.flatMap((question) =>
        question.answers.flatMap((answer) => answer.points[id] ?? [])
      );

      expect(worth.toSorted()).toEqual([1, 1, 1, 2, 2, 2]);
    }
  });

  it.each(ids)("can make you a %s witch", (id) => {
    expect(winner(WITCH_QUIZ, tally(WITCH_QUIZ, bestPicksFor(id)))).toBe(id);
  });
});
