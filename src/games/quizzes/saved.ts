import * as z from "zod/mini";

import { readStored, writeStored } from "../../lib/storage";
import type { Quiz, Scores } from "./quiz";

/**
 * A visitor's last go at each quiz, kept in this browser's localStorage under
 * its own key: the points each result scored, and when. A retake replaces it.
 * Nothing leaves the browser.
 */
const savedSchema = z.object({
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

/** Saves a finished quiz over the last result; `takenAt` is now, but for tests. */
export const saveResult = (
  quiz: Quiz,
  scores: Scores,
  takenAt = new Date()
): Saved => {
  const saved = { scores, takenAt: takenAt.toISOString() };

  writeStored(storageKey(quiz), saved);

  return saved;
};
