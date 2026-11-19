import { describe, expect, it } from "vitest";

import { BARBIE_QUIZ } from "./barbie";
import { allEras, counts, eraScores, fullMarks, winner } from "./quiz";

const ids = Object.keys(BARBIE_QUIZ.results);

const ofEra = (era: string) =>
  ids.filter((id) => BARBIE_QUIZ.results[id]?.era === era);

/** Every way to choose one or more eras: 1, 2, 3, 1+2, 1+3, 2+3 and all three. */
const choices: string[][] = [];

for (let mask = 1; mask < 2 ** allEras(BARBIE_QUIZ).length; mask += 1) {
  choices.push(
    allEras(BARBIE_QUIZ).filter((_era, bit) => Math.floor(mask / 2 ** bit) % 2)
  );
}

/** For each question, the shown answer worth the most to `id`. */
const bestPicksFor = (id: string, eras: string[]) =>
  BARBIE_QUIZ.questions.map((question) => {
    const shown = question.answers
      .map((answer, i) => ({ answer, i }))
      .filter(({ answer }) => counts(BARBIE_QUIZ, answer, eras));

    const worth = shown.map(({ answer }) => answer.points[id] ?? 0);

    return shown[worth.indexOf(Math.max(...worth))]?.i ?? -1;
  });

describe("which Barbie character are you?", () => {
  it("has twenty heroines, twelve Barbies as herself, and Malibu and Brooklyn", () => {
    expect(allEras(BARBIE_QUIZ)).toEqual([
      "heroines",
      "herself",
      "malibu-brooklyn",
    ]);
    expect(ofEra("heroines")).toHaveLength(20);
    expect(ofEra("herself")).toHaveLength(12);
    expect(ofEra("malibu-brooklyn").toSorted()).toEqual(["brooklyn", "malibu"]);
  });

  it("names each result's films, in English and French", () => {
    for (const result of Object.values(BARBIE_QUIZ.results)) {
      expect(result.about.en).toMatch(/^From .*\(\d{4}(?:–\d{4})?\)\. /u);
      expect(result.about.fr).toMatch(/^Dans .*\(\d{4}(?:–\d{4})?\)\. /u);
    }

    for (const era of BARBIE_QUIZ.eras ?? []) {
      expect(era.name.fr).not.toBe(era.name.en);
      expect(era.about.fr).not.toBe(era.about.en);
    }
  });

  it("has twenty questions of six answers, each in English and French", () => {
    expect(BARBIE_QUIZ.questions).toHaveLength(20);

    for (const question of BARBIE_QUIZ.questions) {
      expect(question.answers).toHaveLength(6);
      expect(question.prompt.fr).not.toBe(question.prompt.en);

      for (const answer of question.answers) {
        expect(answer.text.fr).not.toBe(answer.text.en);
      }
    }
  });

  it("gives points only to results it has", () => {
    for (const question of BARBIE_QUIZ.questions) {
      for (const answer of question.answers) {
        for (const id of Object.keys(answer.points)) {
          expect(ids).toContain(id);
        }
      }
    }
  });

  it("never names one result twice in a question", () => {
    for (const question of BARBIE_QUIZ.questions) {
      const named = question.answers.flatMap((answer) =>
        Object.keys(answer.points)
      );

      expect(new Set(named).size).toBe(named.length);
    }
  });

  it("gives each heroine 2 points an answer, and 1 to one more", () => {
    const heroines = new Set(ofEra("heroines"));

    for (const question of BARBIE_QUIZ.questions) {
      for (const answer of question.answers) {
        const points = Object.entries(answer.points)
          .filter(([id]) => heroines.has(id))
          .map(([, value]) => value);

        expect(points.toSorted()).toEqual([1, 2]);
      }
    }
  });

  it("is fair: every heroine and every Barbie as herself is worth 18 points", () => {
    for (const id of [...ofEra("heroines"), ...ofEra("herself")]) {
      expect(fullMarks(BARBIE_QUIZ, id)).toBe(18);
    }
  });

  it("asks Malibu or Brooklyn in every question", () => {
    for (const question of BARBIE_QUIZ.questions) {
      const named = question.answers.flatMap((answer) =>
        Object.keys(answer.points)
      );

      expect(named).toContain("malibu");
      expect(named).toContain("brooklyn");
    }
  });

  describe.each(choices.map((eras) => [eras.join(" + "), eras] as const))(
    "with %s",
    (_name, eras) => {
      const chosen = ids.filter((id) =>
        eras.includes(BARBIE_QUIZ.results[id]?.era ?? "")
      );

      it("shows at least two answers to every question", () => {
        for (const question of BARBIE_QUIZ.questions) {
          expect(
            question.answers.filter((answer) =>
              counts(BARBIE_QUIZ, answer, eras)
            ).length
          ).toBeGreaterThanOrEqual(2);
        }
      });

      it("scores only the chosen eras' results", () => {
        const scores = eraScores(BARBIE_QUIZ, [0, 1, 2, 3, 4, 5], eras);

        for (const id of Object.keys(scores)) {
          expect(chosen).toContain(id);
        }
      });

      it.each(chosen)("can make you %s", (id) => {
        expect(
          winner(
            BARBIE_QUIZ,
            eraScores(BARBIE_QUIZ, bestPicksFor(id, eras), eras)
          )
        ).toBe(id);
      });
    }
  );
});
