import { SIZE, other, tally } from "./rules";
import type { Game, Player } from "./rules";

/** What an online game is worth on the leaderboard. */
export const POINTS = {
  /** Lost by a defeat, whatever the loser placed or claimed. */
  defeat: 25,
  /** For each planet the player claimed. */
  planet: 5,
  /** For each square the player placed. */
  square: 1,
  /** Added for winning the game. */
  victory: 25,
} as const;

/**
 * How a game ended: three planets in a row, every planet closed with no
 * line, or the player whose turn it was letting the room's clock run out.
 */
export type Ending = "line" | "full" | "timeout";

const squaresOf = (game: Game, player: Player): number => {
  let count = 0;

  for (let board = 0; board < SIZE; board += 1) {
    count += game.boards[board]?.filter((mark) => mark === player).length ?? 0;
  }

  return count;
};

/**
 * Each player's points for one finished game. The winner scores their
 * squares, their planets and the victory bonus; the loser loses the defeat
 * penalty and nothing they placed counts, so a defeat always costs points.
 * A draw scores both players' squares and planets, with no bonus. A total
 * never drops below 0; the database sees to that when it adds these up.
 */
export const gamePoints = (
  game: Game,
  winner: Player | null
): Record<Player, number> => {
  const planets = tally(game);

  const earned = (player: Player) =>
    squaresOf(game, player) * POINTS.square + planets[player] * POINTS.planet;

  if (winner === null) {
    return { pink: earned("pink"), purple: earned("purple") };
  }

  const points: Record<Player, number> = { pink: 0, purple: 0 };

  points[winner] = earned(winner) + POINTS.victory;
  points[other(winner)] = -POINTS.defeat;

  return points;
};
