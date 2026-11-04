import type { Language } from "../../lib/language";

/** One line in each of the site's languages. */
export type Words = Record<Language, string>;

/** Something a quiz can tell you that you are: "Moon witch", and what that means. */
export interface QuizResult {
  name: Words;
  about: Words;
}

/** An answer, and the points it gives each result it leans towards. */
export interface Answer {
  text: Words;
  points: Readonly<Record<string, number>>;
}

export interface Question {
  prompt: Words;
  answers: readonly Answer[];
}

/**
 * A personality quiz: every answer adds points to one or more results, and the
 * result with the most points at the end is the one you are.
 */
export interface Quiz {
  /** Its address under /quizzes: "what-type-of-witch". */
  slug: string;
  title: Words;
  blurb: Words;
  /** Its card's filename, on its pill: "which-witch.txt". */
  legend: string;
  /** Every result by its id; the ids are the keys of an answer's points. */
  results: Readonly<Record<string, QuizResult>>;
  questions: readonly Question[];
}

/** Points per result id, as the answers add them up. */
export type Scores = Record<string, number>;

/** The points from the answer picked for each question, in order. */
export const tally = (quiz: Quiz, picks: readonly number[]) => {
  const scores: Scores = {};

  for (const [i, question] of quiz.questions.entries()) {
    const answer = question.answers[picks[i] ?? -1];

    for (const [id, points] of Object.entries(answer?.points ?? {})) {
      scores[id] = (scores[id] ?? 0) + points;
    }
  }

  return scores;
};

export interface Ranked {
  id: string;
  points: number;
}

/**
 * The results that scored, most points first. A tie goes to the result whose
 * English name comes first alphabetically, so the order is the same in every
 * language.
 */
export const ranked = (quiz: Quiz, scores: Scores): Ranked[] =>
  Object.entries(scores)
    .filter(([id, points]) => quiz.results[id] && points > 0)
    .map(([id, points]) => ({ id, points }))
    .toSorted(
      (a, b) =>
        b.points - a.points ||
        (quiz.results[a.id]?.name.en ?? "").localeCompare(
          quiz.results[b.id]?.name.en ?? "",
          "en"
        )
    );

/** What you are: the result with the most points, or null before any. */
export const winner = (quiz: Quiz, scores: Scores): string | null =>
  ranked(quiz, scores)[0]?.id ?? null;

/** A pie slice: a result, or every result past the biggest few. */
export interface Slice {
  id: string | "other";
  points: number;
  share: number;
}

/** The most slices a pie shows; past that, the smallest fold into "other". */
export const MAX_SLICES = 8;

/**
 * The pie of `scores`, biggest first, each with its share of all the points.
 * More results than fit become the biggest seven and one "other" slice.
 */
export const pieSlices = (quiz: Quiz, scores: Scores): Slice[] => {
  const all = ranked(quiz, scores);
  const total = all.reduce((sum, entry) => sum + entry.points, 0);
  const shown = all.length > MAX_SLICES ? all.slice(0, MAX_SLICES - 1) : all;
  const rest = all.slice(shown.length);

  const slices = shown.map((entry) => ({
    ...entry,
    share: entry.points / total,
  }));

  if (rest.length === 0) {
    return slices;
  }

  const points = rest.reduce((sum, entry) => sum + entry.points, 0);

  return [...slices, { id: "other", points, share: points / total }];
};

/** A share as a whole percentage: 0.316 → 32. */
export const percent = (share: number) => Math.round(share * 100);
