import { Leaderboard as Board } from "../../components/leaderboard";
import { useCopy } from "../../lib/language";
import { POINTS } from "./scoring";

const RULES = {
  en: [
    `Win: ${POINTS.square} for each square you placed, ${POINTS.planet} for each planet you claimed, and ${POINTS.victory} for the victory.`,
    "Draw: your squares and planets, with no bonus.",
    `Defeat: −${POINTS.defeat}, and nothing you placed counts. Letting the five-minute clock run out on your turn is a defeat.`,
  ],
  fr: [
    `Victoire : ${POINTS.square} par case posée, ${POINTS.planet} par planète conquise, et ${POINTS.victory} pour la victoire.`,
    "Égalité : vos cases et vos planètes, sans bonus.",
    `Défaite : −${POINTS.defeat}, et rien de ce que vous avez posé ne compte. Laisser filer le chrono de cinq minutes à votre tour, c’est perdre.`,
  ],
};

/** Super Tic-Tac-Toe's leaderboard (src/components/leaderboard.tsx) */
export const Leaderboard = () => (
  <Board url="/api/leaderboard" rules={useCopy(RULES)} />
);
