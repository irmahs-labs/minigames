import { useEffect, useRef } from "react";

import { useCopy, useLanguage } from "../../lib/language";
import type { Language } from "../../lib/language";
import { kindName, sideName } from "./names";
import { PieceIcon } from "./pieces";
import type { Theme } from "./pieces";
import { CAPTURE_POINTS, capturesOf, inCheck } from "./rules";
import type { Ending, Game, Move, Side } from "./rules";
import { POINTS, capturePoints } from "./scoring";
import { playCrunch } from "./sound";

const COPY = {
  en: {
    captured: "Captured",
    check: "Check!",
    counting: (side: string, done: number, limit: number) =>
      `${side} counts: ${done} of ${limit}. Reaching ${limit} is a draw.`,
    endings: {
      checkmate: "Checkmate.",
      count: "The count ran out: a draw.",
      kings: "Only the two Khun are left: a draw.",
      stalemate: "Stalemate: no legal move, and no check. A draw.",
      timeout: "The clock ran out.",
    } satisfies Record<Ending, string>,
    none: "nothing yet",
    rules: [
      `Win: ${POINTS.victory} points, plus what you captured.`,
      "Draw: what you captured.",
      `Defeat: −${POINTS.defeat}, but you keep what you captured. Letting the five-minute clock run out on your turn is a defeat.`,
      `Each capture: Tuk ${CAPTURE_POINTS.tuk}, Seh ${CAPTURE_POINTS.seh}, Koul ${CAPTURE_POINTS.koul}, Neang or flipped Trey ${CAPTURE_POINTS.neang}, Trey ${CAPTURE_POINTS.trey}.`,
    ],
    toMove: (side: string) => `${side} to move`,
    wins: (side: string) => `${side} wins!`,
    worth: (n: number) => `${n} ${n === 1 ? "point" : "points"}`,
  },
  fr: {
    captured: "Prises",
    check: "Échec !",
    counting: (side: string, done: number, limit: number) =>
      `${side} compte : ${done} sur ${limit}. Arriver à ${limit}, c’est la nulle.`,
    endings: {
      checkmate: "Échec et mat.",
      count: "Le compte est arrivé au bout : match nul.",
      kings: "Il ne reste que les deux Khun : match nul.",
      stalemate: "Pat : aucun coup possible, sans échec. Match nul.",
      timeout: "Le chrono est arrivé au bout.",
    } satisfies Record<Ending, string>,
    none: "rien encore",
    rules: [
      `Victoire : ${POINTS.victory} points, plus vos prises.`,
      "Match nul : vos prises.",
      `Défaite : −${POINTS.defeat}, mais vous gardez vos prises. Laisser filer le chrono de cinq minutes à votre tour, c’est perdre.`,
      `Chaque prise : Tuk ${CAPTURE_POINTS.tuk}, Seh ${CAPTURE_POINTS.seh}, Koul ${CAPTURE_POINTS.koul}, Neang ou Trey retourné ${CAPTURE_POINTS.neang}, Trey ${CAPTURE_POINTS.trey}.`,
    ],
    toMove: (side: string) => `Au tour de ${side}`,
    wins: (side: string) => `${side} gagne !`,
    worth: (n: number) => `${n} ${n <= 1 ? "point" : "points"}`,
  },
};

/** How points work on the leaderboard, in a language */
export const pointRules = (language: Language) => COPY[language].rules;

/** The headline for a position: whose move, or who won */
export const headlineFor = (game: Game, theme: Theme, language: Language) => {
  const t = COPY[language];

  if (game.over) {
    return game.winner
      ? t.wins(sideName(game.winner, theme, language))
      : t.endings[game.ending ?? "stalemate"];
  }

  return t.toMove(sideName(game.turn, theme, language));
};

/** A sentence under the headline: check, the count, or how the game ended */
export const noteFor = (game: Game, theme: Theme, language: Language) => {
  const t = COPY[language];

  if (game.over) {
    return game.ending ? t.endings[game.ending] : "";
  }

  const parts = [inCheck(game, game.turn) ? t.check : ""];

  if (game.count) {
    parts.push(
      t.counting(
        sideName(game.count.side, theme, language),
        game.count.done,
        game.count.limit
      )
    );
  }

  return parts.filter(Boolean).join(" ");
};

/** Plays the crunch whenever a move takes a piece, if the sound is on */
export const useCaptureSound = (game: Game, on: boolean) => {
  const pieces = game.board.filter(Boolean).length;
  const before = useRef(pieces);

  useEffect(() => {
    if (on && pieces < before.current) {
      playCrunch();
    }

    before.current = pieces;
  }, [pieces, on]);
};

/** What each side has taken so far, and what it is worth */
export const Captures = ({
  moves,
  theme,
}: {
  moves: readonly Move[];
  theme: Theme;
}) => {
  const t = useCopy(COPY);
  const language = useLanguage();
  const taken = capturesOf(moves);

  return (
    <div className="stack ouk-captures">
      <h3 className="field-label">{t.captured}</h3>
      {(["white", "black"] as const).map((side: Side) => {
        const pieces = taken[side];
        const worth = capturePoints(moves, side);

        return (
          <div key={side} className="ouk-captures__row">
            <span className="ouk-captures__side">
              {sideName(side, theme, language)}
            </span>
            <span className="ouk-captures__pieces">
              {pieces.length === 0 ? (
                <span className="hint">{t.none}</span>
              ) : (
                pieces.map((piece, i) => (
                  <span
                    // The same piece can be taken twice: its place keeps it apart
                    key={`${piece.kind}-${i}`}
                    title={kindName(piece.kind, language)}
                  >
                    <PieceIcon piece={piece} theme={theme} size={24} />
                  </span>
                ))
              )}
            </span>
            <span className="ouk-captures__worth">{t.worth(worth)}</span>
          </div>
        );
      })}
    </div>
  );
};
