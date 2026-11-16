import type { Pool } from "pg";

import type { Scores } from "../src/games/quizzes/quiz";

/** A result as kept: its points, and when the quiz was finished. */
export interface KeptResult {
  scores: Scores;
  takenAt: Date;
}

interface ResultRow {
  scores: Scores;
  taken_at: Date;
}

/** `userId`'s last result of `quiz`, or null when none is kept. */
export const readResult = async (
  pool: Pool,
  userId: string,
  quiz: string
): Promise<KeptResult | null> => {
  const { rows } = await pool.query<ResultRow>(
    `select scores, taken_at from quizzes_results
     where user_id = $1::uuid and quiz = $2`,
    [userId, quiz]
  );

  const [row] = rows;

  return row ? { scores: row.scores, takenAt: row.taken_at } : null;
};

/** Keeps `userId`'s result of `quiz`, over any kept before. */
export const saveResult = async (
  pool: Pool,
  userId: string,
  quiz: string,
  result: KeptResult
): Promise<void> => {
  await pool.query(
    `insert into quizzes_results (user_id, quiz, scores, taken_at)
     values ($1::uuid, $2, $3::jsonb, $4)
     on conflict (user_id, quiz) do update
       set scores = excluded.scores,
           taken_at = excluded.taken_at,
           saved_at = now()`,
    [userId, quiz, JSON.stringify(result.scores), result.takenAt]
  );
};

/** Takes `userId`'s result of `quiz` off their account. */
export const removeResult = async (
  pool: Pool,
  userId: string,
  quiz: string
): Promise<void> => {
  await pool.query(
    "delete from quizzes_results where user_id = $1::uuid and quiz = $2",
    [userId, quiz]
  );
};
