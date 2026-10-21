import type { Pool } from "pg";

import { inTransaction } from "./db";
import type { FinishedGame } from "./lobby";

const COLOURS = ["pink", "purple"] as const;

/** How many players the leaderboard lists. */
export const TOP = 20;

export interface Standing {
  rank: number;
  name: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  /** This row is the player asking. */
  you: boolean;
}

export interface Leaderboard {
  top: Standing[];
  /** The player asking, when they have played but are not in the top. */
  you: Standing | null;
}

/**
 * Puts a finished game on the leaderboard: the game itself, and each player's
 * new total, which never drops below 0. One transaction, so a game is never
 * half counted.
 */
export const recordGame = (pool: Pool, game: FinishedGame) =>
  inTransaction(pool, async (client) => {
    await client.query(
      `insert into games
         (pink_id, purple_id, winner, ending, moves, pink_points, purple_points)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        game.players.pink.id,
        game.players.purple.id,
        game.winner,
        game.ending,
        JSON.stringify(game.moves),
        game.points.pink,
        game.points.purple,
      ]
    );

    // One connection runs its queries in order, so these two never race.
    await Promise.all(
      COLOURS.map((colour) => {
        const { id, name } = game.players[colour];
        const won = game.winner === colour ? 1 : 0;
        const drew = game.winner === null ? 1 : 0;

        return client.query(
          `insert into players as p (user_id, name, points, wins, losses, draws)
           values ($1, $2, greatest(0, $3::integer), $4, $5, $6)
           on conflict (user_id) do update set
             name = excluded.name,
             points = greatest(0, p.points + $3::integer),
             wins = p.wins + excluded.wins,
             losses = p.losses + excluded.losses,
             draws = p.draws + excluded.draws,
             updated_at = now()`,
          [id, name, game.points[colour], won, 1 - won - drew, drew]
        );
      })
    );
  });

const STANDINGS = `
  select rank() over (order by points desc)::integer as rank,
         name, points, wins, losses, draws,
         coalesce(user_id = $1::uuid, false) as you,
         updated_at
  from players`;

/**
 * The top players by points; most wins first on a tie, then whoever got
 * there first. Players with equal points share a rank. With `userId`, also
 * where that player stands if they are further down.
 */
export const readLeaderboard = async (
  pool: Pool,
  userId: string | null
): Promise<Leaderboard> => {
  const top = await pool.query<Standing>(
    `select rank, name, points, wins, losses, draws, you
     from (${STANDINGS}) standings
     order by points desc, wins desc, updated_at asc
     limit ${TOP}`,
    [userId]
  );

  if (!userId || top.rows.some((row) => row.you)) {
    return { top: top.rows, you: null };
  }

  const you = await pool.query<Standing>(
    `select rank, name, points, wins, losses, draws, you
     from (${STANDINGS}) standings
     where you`,
    [userId]
  );

  return { top: top.rows, you: you.rows[0] ?? null };
};
