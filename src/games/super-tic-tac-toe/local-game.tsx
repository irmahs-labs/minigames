import { useEffect, useMemo, useState } from "react";

import { useCopy, useLanguage } from "../../lib/language";
import type { Language } from "../../lib/language";
import { useConfirm } from "../../lib/use-confirm";
import { BoardView } from "./board-view";
import { EndDialog } from "./end-dialog";
import { HowToPlay } from "./how-to-play";
import { PlanetScore } from "./planet-score";
import {
  PLAYERS,
  describe,
  newGame,
  play,
  playerLabel,
  playerName,
  replay,
} from "./rules";
import type { Game, Move } from "./rules";
import { loadMoves, saveMoves } from "./state";

const COPY = {
  en: {
    newGame: "New game",
    noWinner: "Nobody wins",
    over: "Game over",
    planets: "The planets",
    saved: "Saved in this browser only.",
    sure: "Sure? New game",
    turn: (name: string, emoji: string) => `${name}'s ${emoji} turn`,
    upNext: "Up next",
    wins: (player: string) => `${player} wins!`,
  },
  fr: {
    newGame: "Nouvelle partie",
    noWinner: "Personne ne gagne",
    over: "Partie terminée",
    planets: "Les planètes",
    saved: "Enregistré dans ce navigateur uniquement.",
    sure: "Sûr ? Nouvelle partie",
    turn: (name: string, emoji: string) => `Au tour de ${name} ${emoji}`,
    upNext: "À suivre",
    wins: (player: string) => `${player} gagne !`,
  },
};

/** The big line at the top of the log: whose turn, or how it ended. */
const headlineFor = (game: Game, language: Language): string => {
  const t = COPY[language];

  if (game.winner) {
    return t.wins(playerLabel(game.winner, language));
  }

  if (game.over) {
    return t.noWinner;
  }

  return t.turn(playerName(game.turn, language), PLAYERS[game.turn].emoji);
};

/**
 * Two players on one screen, taking turns. The game in progress is kept in
 * this browser, so a reload picks it up where it stopped.
 */
export const LocalGame = () => {
  const [moves, setMoves] = useState(loadMoves);
  const [ending, setEnding] = useState(false);
  const confirm = useConfirm();
  const language = useLanguage();
  const t = useCopy(COPY);

  // The saved moves were checked on load, so they always replay.
  const game = useMemo(() => replay(moves) ?? newGame(), [moves]);
  const headline = headlineFor(game, language);
  const note = describe(game, language);
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
        <section aria-label={t.planets} className="panel panel--system">
          <span className="legend">solar.sys</span>
          <BoardView game={game} onPlay={move} />
        </section>

        <section aria-labelledby="turn-title" className="panel panel--log">
          <span className="legend">mission.log</span>

          <div className="stack">
            <p className="kicker">{game.over ? t.over : t.upNext}</p>
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
              {confirm.armed === "new" ? t.sure : t.newGame}
            </button>
          </div>

          <HowToPlay />
          <p className="hint">{t.saved}</p>
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
