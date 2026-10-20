import { useEffect, useMemo, useState } from "react";

import { SuperTicTacToeIcon } from "../../components/app-icons";
import { Header } from "../../components/header";
import type { GameProps } from "../../games";
import { Icon } from "../../lib/icon";
import { Link } from "../../lib/router";
import { useConfirm } from "../../lib/use-confirm";
import { BoardView } from "./board-view";
import { EndDialog } from "./end-dialog";
import {
  PLAYERS,
  describe,
  newGame,
  play,
  playerLabel,
  replay,
  tally,
} from "./rules";
import type { Game, Move, Player } from "./rules";
import { loadMoves, saveMoves } from "./state";

/** The big line at the top of the log: whose turn, or how it ended. */
const headlineFor = (game: Game): string => {
  if (game.winner) {
    return `${playerLabel(game.winner)} wins!`;
  }

  if (game.over) {
    return "Nobody wins";
  }

  return `${PLAYERS[game.turn].name}'s ${PLAYERS[game.turn].emoji} turn`;
};

const ORDER: Player[] = ["pink", "purple"];

const SuperTicTacToe = ({ name }: GameProps) => {
  const [moves, setMoves] = useState(loadMoves);
  const [ending, setEnding] = useState(false);
  const confirm = useConfirm();

  // The saved moves were checked on load, so they always replay.
  const game = useMemo(() => replay(moves) ?? newGame(), [moves]);
  const score = tally(game);
  const headline = headlineFor(game);
  const note = describe(game);
  const started = moves.length > 0;

  useEffect(() => saveMoves(moves), [moves]);

  const move = (next: Move) => {
    const after = play(game, next);

    if (after === game) {
      return;
    }

    setMoves([...moves, next]);
    setEnding(after.over);
  };

  const restart = () => {
    setMoves([]);
    setEnding(false);
  };

  return (
    <>
      <Header
        icon={<SuperTicTacToeIcon />}
        name={name}
        href="/super-tic-tac-toe"
      >
        <Link href="/" className="btn">
          <Icon name="back" size={16} />
          all games
        </Link>
      </Header>
      <main className="page">
        <p className="page__sub">conquer three planets in a row</p>

        <div className="layout">
          <section aria-label="The planets" className="panel panel--system">
            <span className="legend">solar.system</span>
            <BoardView game={game} onPlay={move} />
          </section>

          <section aria-labelledby="turn-title" className="panel panel--log">
            <span className="legend">mission.log</span>

            <div className="stack">
              <p className="kicker">{game.over ? "Game over" : "Up next"}</p>
              <h2 id="turn-title" className="display turn">
                {headline}
              </h2>
            </div>
            <p className="turn__note" aria-live="polite">
              {note}
            </p>

            <dl className="score">
              {ORDER.map((player) => (
                <div key={player} className={`score__row score--${player}`}>
                  <dt>{playerLabel(player)}</dt>
                  <dd>
                    {score[player]}{" "}
                    <span>{score[player] === 1 ? "planet" : "planets"}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div>
              <button
                type="button"
                className={game.over ? "btn btn--primary" : "btn"}
                disabled={!started}
                onClick={() =>
                  game.over ? restart() : confirm.press("new", restart)
                }
              >
                {confirm.armed === "new" ? "Sure? New game" : "New game"}
              </button>
            </div>

            <div className="stack">
              <h3 className="field-label">How to play</h3>
              <ol className="how-to">
                <li>
                  Pink 🌸 starts, on any planet. Then Purple 🔮, and so on.
                </li>
                <li>
                  The square you take sends the other player to the planet it is
                  named after.
                </li>
                <li>Three in a row on a planet conquers it.</li>
                <li>
                  Sent to a planet that is conquered or full? Visit any planet.
                </li>
                <li>Conquer three planets in a row to win.</li>
              </ol>
            </div>
            <p className="hint">Saved in this browser only.</p>
          </section>
        </div>

        <EndDialog
          open={ending}
          headline={game.winner ? `${headline} 🎉🎉` : headline}
          note={note}
          onNewGame={restart}
          onClose={() => setEnding(false)}
        />
      </main>
    </>
  );
};

export default SuperTicTacToe;
