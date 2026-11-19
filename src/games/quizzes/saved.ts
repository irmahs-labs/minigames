import * as z from "zod/mini";

import { readStored, writeStored } from "../../lib/storage";
import { allEras } from "./quiz";
import type { Quiz, Scores } from "./quiz";

/**
 * A visitor's last go at each quiz, kept in this browser's localStorage under
 * its own key: the points each result scored, and when. A retake replaces it.
 * Nothing leaves the browser.
 */
const savedSchema = z.object({
  /** The eras it was played with, for a quiz with eras. */
  eras: z.optional(z.array(z.string())),
  scores: z.record(z.string(), z.number().check(z.gte(0))),
  takenAt: z.string(),
});

export type Saved = z.infer<typeof savedSchema>;

export const storageKey = (quiz: Quiz) => `minigames:quizzes:${quiz.slug}:v1`;

/**
 * The last result saved for `quiz`, or null for none. Points for results the
 * quiz no longer has are dropped, and a result with none left is no result.
 */
export const loadSaved = (quiz: Quiz): Saved | null => {
  const saved = readStored(
    storageKey(quiz),
    z.nullable(savedSchema),
    () => null
  );

  if (!saved) {
    return null;
  }

  const scores: Scores = Object.fromEntries(
    Object.entries(saved.scores).filter(
      ([id, points]) => quiz.results[id] && points > 0
    )
  );

  return Object.keys(scores).length > 0 ? { ...saved, scores } : null;
};

/**
 * Saves a finished quiz over the last result, with the eras it was played
 * with, if any; `takenAt` is now, but for tests.
 */
export const saveResult = (
  quiz: Quiz,
  scores: Scores,
  takenAt = new Date(),
  eras?: readonly string[]
): Saved => {
  const saved: Saved = { scores, takenAt: takenAt.toISOString() };

  if (eras) {
    saved.eras = [...eras];
  }

  writeStored(storageKey(quiz), saved);

  return saved;
};

const erasSchema = z.array(z.string());

export const erasKey = (quiz: Quiz) => `minigames:quizzes:${quiz.slug}:eras:v1`;

/**
 * The eras this visitor last chose for `quiz`, in the quiz's order: every era
 * until they choose, and again if none they chose is left.
 */
export const loadEras = (quiz: Quiz): string[] => {
  const all = allEras(quiz);
  const chosen = readStored(erasKey(quiz), z.nullable(erasSchema), () => null);
  const kept = all.filter((id) => chosen?.includes(id));

  return kept.length > 0 ? kept : all;
};

/** Keeps the eras chosen for `quiz` in this browser, for next time. */
export const saveEras = (quiz: Quiz, eras: readonly string[]) => {
  writeStored(erasKey(quiz), eras);
};
