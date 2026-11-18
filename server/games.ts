import * as ouk from "../src/games/ouk-chaktrang/rules";
import { gamePoints as oukPoints } from "../src/games/ouk-chaktrang/scoring";
import * as sttt from "../src/games/super-tic-tac-toe/rules";
import { gamePoints as stttPoints } from "../src/games/super-tic-tac-toe/scoring";
import type { Ending as StttEnding } from "../src/games/super-tic-tac-toe/scoring";
import type { FinishedGame, Rules } from "./lobby";

/** Super Tic-Tac-Toe, as a lobby plays it: Pink moves first. */
export const superTicTacToe: Rules<
  sttt.Game,
  sttt.Move,
  sttt.Player,
  StttEnding
> = {
  newGame: sttt.newGame,
  other: sttt.other,
  play: sttt.play,
  points: (game, _moves, winner) => stttPoints(game, winner),
  refused: "That square cannot be played.",
  result: (game) => ({
    ending: game.winner ? "line" : "full",
    over: game.over,
    winner: game.winner,
  }),
  sides: ["pink", "purple"],
  timeout: "timeout",
  turn: (game) => game.turn,
};

export type SuperTicTacToeGame = FinishedGame<
  sttt.Move,
  sttt.Player,
  StttEnding
>;

/** Ouk Chaktrang, as a lobby plays it: White (the Tevada) moves first. */
export const oukChaktrang: Rules<ouk.Game, ouk.Move, ouk.Side, ouk.Ending> = {
  newGame: ouk.newGame,
  other: ouk.other,
  play: ouk.play,
  points: (_game, moves, winner) => oukPoints(moves, winner),
  refused: "That move cannot be played.",
  result: (game) => ({
    ending: game.ending ?? "stalemate",
    over: game.over,
    winner: game.winner,
  }),
  sides: ["white", "black"],
  timeout: "timeout",
  turn: (game) => game.turn,
};

export type OukChaktrangGame = FinishedGame<ouk.Move, ouk.Side, ouk.Ending>;
