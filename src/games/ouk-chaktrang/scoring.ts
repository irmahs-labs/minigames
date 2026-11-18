import { CAPTURE_POINTS, capturesOf, other } from "./rules";
import type { Move, Side } from "./rules";

/** What an online game is worth on the leaderboard, besides its captures */
export const POINTS = {
  /** Lost by a defeat; the loser still keeps what they captured */
  defeat: 25,
  /** Added for winning the game */
  victory: 30,
} as const;

/** What a side's captures in a game are worth: each piece by its kind */
export const capturePoints = (moves: readonly Move[], side: Side): number =>
  capturesOf(moves)[side].reduce(
    (sum, piece) => sum + CAPTURE_POINTS[piece.kind],
    0
  );

/**
 * Each side's points for one finished game: everyone keeps what their
 * captures are worth; the winner adds the victory bonus, the loser loses the
 * defeat penalty. A total never drops below 0; the database sees to that.
 */
export const gamePoints = (
  moves: readonly Move[],
  winner: Side | null
): Record<Side, number> => {
  const points: Record<Side, number> = {
    black: capturePoints(moves, "black"),
    white: capturePoints(moves, "white"),
  };

  if (winner) {
    points[winner] += POINTS.victory;
    points[other(winner)] -= POINTS.defeat;
  }

  return points;
};
