import { useEffect, useState } from "react";
import * as z from "zod/mini";

import { POINTS } from "./scoring";

const standing = z.object({
  draws: z.int(),
  losses: z.int(),
  name: z.string(),
  points: z.int(),
  rank: z.int(),
  wins: z.int(),
  you: z.boolean(),
});

const answer = z.object({
  top: z.array(standing),
  you: z.nullable(standing),
});

type Standing = z.infer<typeof standing>;

type Board = z.infer<typeof answer>;

/** The leaderboard, or null when the server cannot be reached. */
const fetchBoard = async (): Promise<Board | null> => {
  try {
    const response = await fetch("/api/leaderboard");

    if (!response.ok) {
      return null;
    }

    const parsed = answer.safeParse(await response.json());

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

const Row = ({ row }: { row: Standing }) => (
  <tr className={row.you ? "board__you" : undefined}>
    <td className="board__rank">{row.rank}</td>
    <th scope="row">
      {row.name}
      {row.you ? " (you)" : ""}
    </th>
    <td className="board__points">{row.points}</td>
    <td className="board__record">
      {row.wins} · {row.losses} · {row.draws}
    </td>
  </tr>
);

/**
 * The top online players, and where you stand if you are further down.
 * Fetched when shown; the game page gives it a new key when a game ends.
 */
export const Leaderboard = () => {
  // undefined while loading, null when it cannot be had.
  const [board, setBoard] = useState<Board | null | undefined>();

  useEffect(() => {
    let current = true;

    const load = async () => {
      const next = await fetchBoard();

      if (current) {
        setBoard(next);
      }
    };

    void load();

    return () => {
      current = false;
    };
  }, []);

  return (
    <section aria-labelledby="board-title" className="panel panel--board">
      <span className="legend">leaderboard</span>
      <h2 id="board-title" className="display turn">
        Leaderboard
      </h2>

      {board === undefined ? <p className="hint">Loading…</p> : null}
      {board === null ? (
        <p className="hint">The leaderboard is not available right now.</p>
      ) : null}
      {board && board.top.length === 0 ? (
        <p className="turn__note">
          No online games yet. Win the first one to top the board.
        </p>
      ) : null}

      {board && board.top.length > 0 ? (
        <table className="board">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Player</th>
              <th scope="col">Points</th>
              <th scope="col">
                <abbr title="Wins, losses, draws">W · L · D</abbr>
              </th>
            </tr>
          </thead>
          <tbody>
            {board.top.map((row) => (
              <Row key={`${row.rank}-${row.name}-${row.points}`} row={row} />
            ))}
          </tbody>
          {board.you ? (
            <tbody className="board__below">
              <Row row={board.you} />
            </tbody>
          ) : null}
        </table>
      ) : null}

      <div className="stack">
        <h3 className="field-label">How points work</h3>
        <ul className="how-to">
          <li>
            Win: {POINTS.square} for each square you placed, {POINTS.planet} for
            each planet you claimed, and {POINTS.victory} for the victory.
          </li>
          <li>Draw: your squares and planets, with no bonus.</li>
          <li>
            Defeat: −{POINTS.defeat}, and nothing you placed counts. Letting the
            five-minute clock run out on your turn is a defeat.
          </li>
          <li>Nobody drops below 0.</li>
        </ul>
      </div>
    </section>
  );
};
