import { describe, expect, it } from "vitest";

import { LIFE_PARTNER_QUIZ } from "./life-partner";
import { tally, winner } from "./quiz";

/** The answer giving `id` points, in each question. */
const answerFor = (question: number, id: string) =>
  LIFE_PARTNER_QUIZ.questions[question]?.answers.findIndex(
    (answer) => answer.points[id]
  ) ?? -1;

/** The verdict for one kind of answer (one, think, run) per question. */
const verdict = (...kinds: string[]) =>
  winner(
    LIFE_PARTNER_QUIZ,
    tally(
      LIFE_PARTNER_QUIZ,
      kinds.map((id, question) => answerFor(question, id))
    )
  );

describe("are they your life partner?", () => {
  it("has five questions, each in English and French", () => {
    expect(LIFE_PARTNER_QUIZ.questions).toHaveLength(5);

    for (const question of LIFE_PARTNER_QUIZ.questions) {
      expect(question.prompt.fr).not.toBe(question.prompt.en);

      for (const answer of question.answers) {
        expect(answer.text.fr).not.toBe(answer.text.en);
      }
    }
  });

  it("has a green answer, an unsure one and a red flag in every question", () => {
    for (const question of LIFE_PARTNER_QUIZ.questions) {
      expect(question.answers).toHaveLength(3);
      expect(question.answers.map((answer) => answer.points)).toEqual(
        expect.arrayContaining([{ one: 1 }, { think: 1 }, { run: 2 }])
      );
    }
  });

  it("calls them the one when every answer is green", () => {
    expect(verdict("one", "one", "one", "one", "one")).toBe("one");
  });

  it("still calls them the one past a single doubt", () => {
    expect(verdict("one", "one", "one", "one", "run")).toBe("one");
    expect(verdict("one", "think", "one", "run", "one")).toBe("one");
  });

  it("gives food for thought when unsure", () => {
    expect(verdict("think", "think", "think", "think", "think")).toBe("think");
    expect(verdict("one", "think", "think", "one", "think")).toBe("think");
  });

  it("gives food for thought when everything ties", () => {
    expect(verdict("one", "one", "think", "think", "run")).toBe("think");
  });

  it("counts a red flag double", () => {
    expect(verdict("one", "one", "one", "run", "run")).toBe("run");
    expect(verdict("run", "run", "run", "run", "run")).toBe("run");
  });
});
