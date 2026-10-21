import { playerLabel, tally } from "./rules";
import type { Game, Player } from "./rules";

const ORDER: Player[] = ["pink", "purple"];

interface PlanetScoreProps {
  game: Game;
  /** Who plays each colour, online; the colour's own name otherwise. */
  names?: Record<Player, string>;
}

/** How many planets each player holds, one coloured row each. */
export const PlanetScore = ({ game, names }: PlanetScoreProps) => {
  const score = tally(game);

  return (
    <dl className="score">
      {ORDER.map((player) => (
        <div key={player} className={`score__row score--${player}`}>
          <dt>
            {names ? `${names[player]} · ` : ""}
            {playerLabel(player)}
          </dt>
          <dd>
            {score[player]}{" "}
            <span>{score[player] === 1 ? "planet" : "planets"}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
};
