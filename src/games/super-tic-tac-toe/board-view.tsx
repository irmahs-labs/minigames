import {
  PLANETS,
  PLAYERS,
  canPlay,
  isDrawn,
  isPlayable,
  playerLabel,
} from "./rules";
import type { Game, Move, Player } from "./rules";

// The flag over a planet filled up with nobody holding three in a row.
const NO_WINNER = "🏳️";

// Shown as text, not as a coloured emoji where a font has one (♀, ♂).
const TEXT_STYLE = "︎";

const classes = (...names: (string | false | null)[]) =>
  names.filter(Boolean).join(" ");

/** A planet as a screen reader hears it: its name, and who holds it. */
const planetLabel = (name: string, owner: Player | null, drawn: boolean) => {
  if (owner) {
    return `${name}, conquered by ${playerLabel(owner)}`;
  }

  return drawn ? `${name}, full with no winner` : name;
};

interface BoardViewProps {
  game: Game;
  onPlay: (move: Move) => void;
}

/**
 * The nine planets, three by three, each with its own nine squares. An empty
 * square shows the symbol of the planet it sends the next player to; only
 * the squares the next move may take can be pressed.
 */
export const BoardView = ({ game, onPlay }: BoardViewProps) => (
  <div className="system">
    {PLANETS.map((planet, board) => {
      const owner = game.conquered[board] ?? null;
      const playable = isPlayable(game, board);
      const drawn = isDrawn(game, board);

      return (
        <fieldset
          key={planet.name}
          aria-label={planetLabel(planet.name, owner, drawn)}
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
            {TEXT_STYLE} {planet.name}
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
                  title={target.name}
                  aria-label={`${planet.name}, ${target.name} square: ${
                    mark ? playerLabel(mark) : "empty"
                  }`}
                  className={classes(
                    "cell",
                    mark && `cell--${mark}`,
                    last && "cell--last"
                  )}
                  disabled={!canPlay(game, { board, cell })}
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
