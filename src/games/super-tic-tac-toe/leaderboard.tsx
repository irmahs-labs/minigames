import { useEffect, useState } from "react";
import * as z from "zod/mini";

import { useCopy } from "../../lib/language";
import { POINTS } from "./scoring";

const COPY = {
  en: {
    defeat: `Defeat: −${POINTS.defeat}, and nothing you placed counts. Letting the five-minute clock run out on your turn is a defeat.`,
    draw: "Draw: your squares and planets, with no bonus.",
    floor: "Nobody drops below 0.",
    how: "How points work",
    loading: "Loading…",
    none: "No online games yet. Win the first one to top the board.",
    player: "Player",
    points: "Points",
    record: "W · L · D",
    recordTitle: "Wins, losses, draws",
    title: "Leaderboard",
    unavailable: "The leaderboard is not available right now.",
    win: `Win: ${POINTS.square} for each square you placed, ${POINTS.planet} for each planet you claimed, and ${POINTS.victory} for the victory.`,
    you: " (you)",
  },
  fr: {
    defeat: `Défaite : −${POINTS.defeat}, et rien de ce que vous avez posé ne compte. Laisser filer le chrono de cinq minutes à votre tour, c’est perdre.`,
    draw: "Égalité : vos cases et vos planètes, sans bonus.",
    floor: "Personne ne descend sous 0.",
    how: "Comment marchent les points",
    loading: "Chargement…",
    none: "Pas encore de partie en ligne. Gagnez la première pour prendre la tête.",
    player: "Joueur",
    points: "Points",
    record: "V · D · N",
    recordTitle: "Victoires, défaites, nuls",
    title: "Classement",
    unavailable: "Le classement n’est pas disponible pour le moment.",
    win: `Victoire : ${POINTS.square} par case posée, ${POINTS.planet} par planète conquise, et ${POINTS.victory} pour la victoire.`,
    you: " (vous)",
  },
};

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

const Row = ({ row, you }: { row: Standing; you: string }) => (
  <tr className={row.you ? "board__you" : undefined}>
    <td className="board__rank">{row.rank}</td>
    <th scope="row">
      {row.name}
      {row.you ? you : ""}
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
  const t = useCopy(COPY);

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
      <span className="legend">leaderboard.csv</span>
      <h2 id="board-title" className="display turn">
        {t.title}
      </h2>

      {board === undefined ? <p className="hint">{t.loading}</p> : null}
      {board === null ? <p className="hint">{t.unavailable}</p> : null}
      {board && board.top.length === 0 ? (
        <p className="turn__note">{t.none}</p>
      ) : null}

      {board && board.top.length > 0 ? (
        <table className="board">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">{t.player}</th>
              <th scope="col">{t.points}</th>
              <th scope="col">
                <abbr title={t.recordTitle}>{t.record}</abbr>
              </th>
            </tr>
          </thead>
          <tbody>
            {board.top.map((row) => (
              <Row
                key={`${row.rank}-${row.name}-${row.points}`}
                row={row}
                you={t.you}
              />
            ))}
          </tbody>
          {board.you ? (
            <tbody className="board__below">
              <Row row={board.you} you={t.you} />
            </tbody>
          ) : null}
        </table>
      ) : null}

      <div className="stack">
        <h3 className="field-label">{t.how}</h3>
        <ul className="how-to">
          <li>{t.win}</li>
          <li>{t.draw}</li>
          <li>{t.defeat}</li>
          <li>{t.floor}</li>
        </ul>
      </div>
    </section>
  );
};
