import { describe, expect, it } from "vitest";

import { isBlend, outcome, tally, winner } from "./quiz";
import { WITCH_QUIZ } from "./witch";

const ids = Object.keys(WITCH_QUIZ.results);

/** For each question, the answer worth the most to `id` (the first, if none is). */
const bestPicksFor = (id: string) =>
  WITCH_QUIZ.questions.map((question) => {
    const worth = question.answers.map((answer) => answer.points[id] ?? 0);

    return worth.indexOf(Math.max(...worth));
  });

describe("what type of witch are you?", () => {
  it("has the eight witches, and the Eclectic witch for a bit of everything", () => {
    expect(ids).toEqual([
      "adventure",
      "chaos",
      "green",
      "hearth",
      "hedge",
      "kitchen",
      "love",
      "tinkering",
    ]);
    expect(WITCH_QUIZ.blend?.result.name.en).toBe("Eclectic witch");
  });

  it("names no country in any answer", () => {
    const countries =
      /Iceland|Italy|Hawaii|Finland|Islande|Italie|Hawaï|Finlande/u;

    for (const question of WITCH_QUIZ.questions) {
      for (const answer of question.answers) {
        expect(answer.text.en).not.toMatch(countries);
        expect(answer.text.fr).not.toMatch(countries);
      }
    }
  });

  it("has thirty-two questions of six answers, each in English and French", () => {
    expect(WITCH_QUIZ.questions).toHaveLength(32);

    for (const question of WITCH_QUIZ.questions) {
      expect(question.answers).toHaveLength(6);
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

  it("is fair: every witch is worth 55 points over all the answers", () => {
    for (const id of ids) {
      const worth = WITCH_QUIZ.questions.flatMap((question) =>
        question.answers.map((answer) => answer.points[id] ?? 0)
      );

      expect(worth.reduce((sum, points) => sum + points, 0)).toBe(55);
    }
  });

  it("gives 2 points to one witch an answer, and 1 to at most one more", () => {
    for (const question of WITCH_QUIZ.questions) {
      for (const answer of question.answers) {
        expect(Object.values(answer.points).toSorted()).toSatisfy(
          (points: number[]) =>
            points.join(",") === "2" || points.join(",") === "1,2"
        );
      }
    }
  });

  it.each(ids)("can make you a %s witch", (id) => {
    const scores = tally(WITCH_QUIZ, bestPicksFor(id));

    expect(winner(WITCH_QUIZ, scores)).toBe(id);
    expect(outcome(WITCH_QUIZ, scores)).toBe(WITCH_QUIZ.results[id]);
  });

  it("makes you the Eclectic witch when the top three are within a point", () => {
    const even = { chaos: 9, green: 10, kitchen: 10, love: 4 };
    const clear = { chaos: 8, green: 10, kitchen: 10, love: 4 };

    expect(isBlend(WITCH_QUIZ, even)).toBe(true);
    expect(outcome(WITCH_QUIZ, even)).toBe(WITCH_QUIZ.blend?.result);
    expect(isBlend(WITCH_QUIZ, clear)).toBe(false);
    expect(outcome(WITCH_QUIZ, clear)?.name.en).toBe("Green witch");
  });
});
