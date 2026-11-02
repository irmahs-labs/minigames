import { useLanguage } from "../../lib/language";
import type { Language } from "../../lib/language";
import {
  PLANETS,
  PLAYERS,
  canPlay,
  isDrawn,
  isPlayable,
  planetName,
  playerLabel,
} from "./rules";
import type { Game, Move, Player } from "./rules";

// The flag over a planet filled up with nobody holding three in a row.
const NO_WINNER = "🏳️";

// Shown as text, not as a coloured emoji where a font has one (♀, ♂).
const TEXT_STYLE = "︎";

const classes = (...names: (string | false | null)[]) =>
  names.filter(Boolean).join(" ");

const WORDS = {
  en: {
    conquered: (name: string, by: string) => `${name}, conquered by ${by}`,
    empty: "empty",
    full: (name: string) => `${name}, full with no winner`,
    square: (planet: string, target: string, mark: string) =>
      `${planet}, ${target} square: ${mark}`,
  },
  fr: {
    conquered: (name: string, by: string) => `${name}, conquise par ${by}`,
    empty: "vide",
    full: (name: string) => `${name}, pleine sans vainqueur`,
    square: (planet: string, target: string, mark: string) =>
      `${planet}, case ${target} : ${mark}`,
  },
};

/** A planet as a screen reader hears it: its name, and who holds it. */
const planetLabel = (
  name: string,
  owner: Player | null,
  drawn: boolean,
  language: Language
) => {
  if (owner) {
    return WORDS[language].conquered(name, playerLabel(owner, language));
  }

  return drawn ? WORDS[language].full(name) : name;
};

interface BoardViewProps {
  game: Game;
  onPlay: (move: Move) => void;
  /** No square can be pressed: online, while it is the other player's turn. */
  locked?: boolean;
  /** No planet is lit either: online, before a game has started. */
  quiet?: boolean;
}

/**
 * The nine planets, three by three, each with its own nine squares. An empty
 * square shows the symbol of the planet it sends the next player to; only
 * the squares the next move may take can be pressed.
 */
export const BoardView = ({
  game,
  onPlay,
  locked = false,
  quiet = false,
}: BoardViewProps) => {
  const language = useLanguage();

  return (
    <div className="system">
      {PLANETS.map((planet, board) => {
        const owner = game.conquered[board] ?? null;
        const playable = !quiet && isPlayable(game, board);
        const drawn = isDrawn(game, board);

        return (
          <fieldset
            key={planet.name}
            aria-label={planetLabel(
              planetName(board, language),
              owner,
              drawn,
              language
            )}
            className={classes(
              "planet",
              playable && "planet--open",
              owner && `planet--${owner}`,
              drawn && "planet--drawn",
              !(game.over || playable || owner || drawn) && "planet--waiting"
            )}
          >
            <span aria-hidden="true" className="planet__name">
              {planet.symbol}
              {TEXT_STYLE} {planetName(board, language)}
            </span>
            <div className="planet__cells">
              {PLANETS.map((target, cell) => {
                const mark = game.boards[board]?.[cell] ?? null;

                const last =
                  game.last?.board === board && game.last.cell === cell;

                return (
                  <button
                    key={target.name}
                    type="button"
                    title={planetName(cell, language)}
                    aria-label={WORDS[language].square(
                      planetName(board, language),
                      planetName(cell, language),
                      mark ? playerLabel(mark, language) : WORDS[language].empty
                    )}
                    className={classes(
                      "cell",
                      mark && `cell--${mark}`,
                      last && "cell--last"
                    )}
                    disabled={locked || !canPlay(game, { board, cell })}
                    onClick={() => onPlay({ board, cell })}
                  >
                    {mark ? (
                      PLAYERS[mark].emoji
                    ) : (
                      <span aria-hidden="true" className="cell__planet">
                        {target.symbol}
                        {TEXT_STYLE}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {owner || drawn ? (
              <span aria-hidden="true" className="planet__flag">
                {owner ? PLAYERS[owner].emoji : NO_WINNER}
              </span>
            ) : null}
          </fieldset>
        );
      })}
    </div>
  );
};
