import { useEffect, useMemo, useState } from "react";

import { useConfirm } from "../../lib/use-confirm";
import { BoardView } from "./board-view";
import { EndDialog } from "./end-dialog";
import { HowToPlay } from "./how-to-play";
import { PlanetScore } from "./planet-score";
import { PLAYERS, describe, newGame, play, playerLabel, replay } from "./rules";
import type { Game, Move } from "./rules";
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

/**
 * Two players on one screen, taking turns. The game in progress is kept in
 * this browser, so a reload picks it up where it stopped.
 */
export const LocalGame = () => {
  const [moves, setMoves] = useState(loadMoves);
  const [ending, setEnding] = useState(false);
  const confirm = useConfirm();

  // The saved moves were checked on load, so they always replay.
  const game = useMemo(() => replay(moves) ?? newGame(), [moves]);
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

          <PlanetScore game={game} />

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

          <HowToPlay />
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
    </>
  );
};
