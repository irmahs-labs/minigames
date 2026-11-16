import * as z from "zod/mini";

import { ranked } from "./quiz";
import type { Quiz, Scores } from "./quiz";

/**
 * A quiz's result kept on a signed-in visitor's account, for a quiz with a
 * `profile` elsewhere on irmahs.dev: the witch quiz's shows on their Book of
 * Shadows on Realms, whose server asks this one for it with their cookie.
 * Signed out, a result stays in the browser only (saved.ts).
 */

/** The most points any one result can be given; far past what a quiz gives. */
const MOST_POINTS = 10_000;

const scores = z.record(
  z.string(),
  z.int().check(z.gte(0), z.lte(MOST_POINTS))
);

/** PUT /api/quizzes/:slug/result: the points from a finished quiz, and when. */
export const resultRequest = z.object({ scores, takenAt: z.string() });

export type ResultRequest = z.infer<typeof resultRequest>;

const words = z.object({ en: z.string(), fr: z.string() });

/** A result that scored, with its words, so a profile elsewhere can show it. */
const rankedResult = z.object({
  about: words,
  id: z.string(),
  name: words,
  points: z.int(),
});

const accountResult = z.object({
  /** The results that scored, most points first: the first is the result. */
  ranked: z.array(rankedResult),
  scores,
  /** When the quiz was finished, as an ISO date. */
  takenAt: z.string(),
});

/** GET, PUT and DELETE /api/quizzes/:slug/result: the result kept, if any. */
export const resultAnswer = z.object({
  result: z.nullable(accountResult),
  signedIn: z.boolean(),
});

export type ResultAnswer = z.infer<typeof resultAnswer>;

export type AccountResult = NonNullable<ResultAnswer["result"]>;

/** The most points the answers can give in all: the most any one answer gives, per question. */
export const mostPoints = (quiz: Quiz): number =>
  quiz.questions.reduce(
    (sum, question) =>
      sum +
      Math.max(
        0,
        ...question.answers.map((answer) =>
          Object.values(answer.points).reduce((a, b) => a + b, 0)
        )
      ),
    0
  );

/** How long before now a result's day may be, when one taken earlier is added. */
const OLDEST_MS = 2 * 365 * 24 * 60 * 60 * 1000;

/** How far ahead of the server a device's clock may run. */
const AHEAD_MS = 5 * 60 * 1000;

/**
 * The scores and day a request may keep, or null: only the quiz's own
 * results, at least one point, no more points than its answers can give,
 * and a day no more than two years back and not ahead of now.
 */
export const keepable = (
  quiz: Quiz,
  request: ResultRequest,
  now = new Date()
): { scores: Scores; takenAt: Date } | null => {
  const entries = Object.entries(request.scores).filter(
    ([, points]) => points > 0
  );

  const total = entries.reduce((sum, [, points]) => sum + points, 0);
  const takenAt = new Date(request.takenAt);
  const age = now.getTime() - takenAt.getTime();

  if (
    entries.length === 0 ||
    entries.some(([id]) => !Object.hasOwn(quiz.results, id)) ||
    total > mostPoints(quiz) ||
    Number.isNaN(age) ||
    age > OLDEST_MS ||
    age < -AHEAD_MS
  ) {
    return null;
  }

  return { scores: Object.fromEntries(entries), takenAt };
};

/** A kept result as the answer gives it, its results named in both languages. */
export const accountResultOf = (
  quiz: Quiz,
  kept: { scores: Scores; takenAt: Date }
): AccountResult => ({
  ranked: ranked(quiz, kept.scores).flatMap(({ id, points }) => {
    const result = quiz.results[id];

    return result
      ? [{ about: result.about, id, name: result.name, points }]
      : [];
  }),
  scores: kept.scores,
  takenAt: kept.takenAt.toISOString(),
});
