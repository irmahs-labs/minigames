import { useLanguage } from "../../lib/language";
import { playerLabel, tally } from "./rules";
import type { Game, Player } from "./rules";

const ORDER: Player[] = ["pink", "purple"];

/** "planet" or "planets"; French takes the singular for 0 and 1. */
const planetsWord = (count: number, french: boolean) => {
  if (french) {
    return count <= 1 ? "planète" : "planètes";
  }

  return count === 1 ? "planet" : "planets";
};

interface PlanetScoreProps {
  game: Game;
  /** Who plays each colour, online; the colour's own name otherwise. */
  names?: Record<Player, string>;
}

/** How many planets each player holds, one coloured row each. */
export const PlanetScore = ({ game, names }: PlanetScoreProps) => {
  const score = tally(game);
  const french = useLanguage() === "fr";

  return (
    <dl className="score">
      {ORDER.map((player) => (
        <div key={player} className={`score__row score--${player}`}>
          <dt>
            {names ? `${names[player]} · ` : ""}
            {playerLabel(player, french ? "fr" : "en")}
          </dt>
          <dd>
            {score[player]} <span>{planetsWord(score[player], french)}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
};
