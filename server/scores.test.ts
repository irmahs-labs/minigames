// @vitest-environment node
// Runs against a real Postgres with the migrations applied, given in
// TEST_DATABASE_URL: the Database workflow sets it, and so can you after
// `npm run db:up`. Without it these tests are skipped.
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { connect } from "./db";
import type { SuperTicTacToeGame as FinishedGame } from "./games";
import type { Account } from "./lobby";
import {
  OUK_CHAKTRANG,
  SUPER_TIC_TAC_TOE,
  TOP,
  readLeaderboard as readBoard,
  recordGame as recordOn,
} from "./scores";

const recordGame = (p: typeof pool, game: FinishedGame) =>
  recordOn(p, SUPER_TIC_TAC_TOE, game);

const readLeaderboard = (p: typeof pool, userId: string | null) =>
  readBoard(p, SUPER_TIC_TAC_TOE, userId);

const url = process.env.TEST_DATABASE_URL;
const pool = connect(url ?? "postgres://unused");

const ana: Account = {
  id: "00000000-0000-4000-8000-00000000000a",
  name: "Ana L.",
};

const ben: Account = {
  id: "00000000-0000-4000-8000-00000000000b",
  name: "Ben",
};

const ANA_PINK = { pink: ana, purple: ben };

const game = (
  winner: FinishedGame["winner"],
  points: FinishedGame["points"],
  players: FinishedGame["players"] = ANA_PINK
): FinishedGame => ({
  ending: winner ? "line" : "full",
  moves: [{ board: 4, cell: 4 }],
  players,
  points,
  winner,
});

// Both suites share the pool; it closes once, after both
afterAll(async () => {
  await pool.end();
});

const totals = async () => {
  const { rows } = await pool.query(
    "select name, points, wins, losses, draws from super_tic_tac_toe_players order by name"
  );

  return rows;
};

describe.skipIf(!url)("the leaderboard in Postgres", () => {
  beforeEach(async () => {
    await pool.query(
      "truncate super_tic_tac_toe_games, super_tic_tac_toe_players"
    );
  });

  it("adds a win, and never takes a total below 0", async () => {
    await recordGame(pool, game("pink", { pink: 40, purple: -25 }));

    expect(await totals()).toEqual([
      { draws: 0, losses: 0, name: "Ana L.", points: 40, wins: 1 },
      { draws: 0, losses: 1, name: "Ben", points: 0, wins: 0 },
    ]);
  });

  it("takes a defeat off a running total", async () => {
    await recordGame(pool, game("pink", { pink: 40, purple: -25 }));
    await recordGame(pool, game("purple", { pink: -25, purple: 30 }));

    expect(await totals()).toEqual([
      { draws: 0, losses: 1, name: "Ana L.", points: 15, wins: 1 },
      { draws: 0, losses: 1, name: "Ben", points: 30, wins: 1 },
    ]);
  });

  it("gives both players a draw's points and counts the draw", async () => {
    await recordGame(pool, game(null, { pink: 12, purple: 9 }));

    expect(await totals()).toEqual([
      { draws: 1, losses: 0, name: "Ana L.", points: 12, wins: 0 },
      { draws: 1, losses: 0, name: "Ben", points: 9, wins: 0 },
    ]);

    const { rows } = await pool.query(
      "select count(*)::integer as n from super_tic_tac_toe_games"
    );

    expect(rows).toEqual([{ n: 1 }]);
  });

  it("ranks by points, shares a rank on a tie, and marks the player asking", async () => {
    const cy: Account = {
      id: "00000000-0000-4000-8000-00000000000c",
      name: "Cy",
    };

    await recordGame(pool, game("pink", { pink: 50, purple: -25 }));
    await recordGame(
      pool,
      game("pink", { pink: 50, purple: -25 }, { pink: cy, purple: ben })
    );

    const board = await readLeaderboard(pool, ben.id);

    expect(
      board.top.map(({ name, rank, you }) => ({ name, rank, you }))
    ).toEqual([
      { name: "Ana L.", rank: 1, you: false },
      { name: "Cy", rank: 1, you: false },
      { name: "Ben", rank: 3, you: true },
    ]);
    expect(board.you).toBeNull();
  });

  it("shows a player below the top where they stand", async () => {
    const ids = Array.from(
      { length: TOP },
      (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`
    );

    await pool.query(
      `insert into super_tic_tac_toe_players (user_id, name, points)
       select id::uuid, 'Player', 100 from unnest($1::text[]) as id`,
      [ids]
    );
    await recordGame(pool, game("pink", { pink: 10, purple: -25 }));

    const board = await readLeaderboard(pool, ana.id);

    expect(board.top).toHaveLength(TOP);
    expect(board.you).toMatchObject({
      name: "Ana L.",
      points: 10,
      rank: TOP + 1,
      you: true,
    });
  });
});

describe.skipIf(!url)("the Ouk Chaktrang leaderboard in Postgres", () => {
  beforeEach(async () => {
    await pool.query("truncate ouk_chaktrang_games, ouk_chaktrang_players");
  });

  it("keeps its own players and games, apart from Super Tic-Tac-Toe's", async () => {
    await recordOn(pool, OUK_CHAKTRANG, {
      ending: "checkmate",
      moves: [{ from: 18, to: 26 }],
      players: { black: ben, white: ana },
      points: { black: 3 - 25, white: 31 },
      winner: "white",
    });

    const board = await readBoard(pool, OUK_CHAKTRANG, ben.id);

    expect(board.top).toMatchObject([
      { losses: 0, name: "Ana L.", points: 31, rank: 1, wins: 1 },
      { losses: 1, name: "Ben", points: 0, rank: 2, you: true },
    ]);

    const { rows } = await pool.query(
      "select winner, ending, white_points, black_points from ouk_chaktrang_games"
    );

    expect(rows).toEqual([
      {
        black_points: -22,
        ending: "checkmate",
        white_points: 31,
        winner: "white",
      },
    ]);
  });
});
