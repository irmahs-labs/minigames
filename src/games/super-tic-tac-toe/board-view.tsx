import { PLANETS, PLAYERS, canPlay, isPlayable, playerLabel } from "./rules";
import type { Game, Move } from "./rules";

// Shown as text, not as a coloured emoji where a font has one (♀, ♂).
const TEXT_STYLE = "︎";

const classes = (...names: (string | false | null)[]) =>
  names.filter(Boolean).join(" ");

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

      return (
        <fieldset
          key={planet.name}
          aria-label={
            owner
              ? `${planet.name}, conquered by ${playerLabel(owner)}`
              : planet.name
          }
          className={classes(
            "planet",
            playable && "planet--open",
            owner && `planet--${owner}`,
            !(game.over || playable || owner) && "planet--waiting"
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
          {owner ? (
            <span aria-hidden="true" className="planet__flag">
              {PLAYERS[owner].emoji}
            </span>
          ) : null}
        </fieldset>
      );
    })}
  </div>
);
