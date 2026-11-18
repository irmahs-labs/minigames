import { describe, expect, it } from "vitest";

import { chooseMove } from "./bot";
import { isLegal, newGame, play } from "./rules";
import type { Game, Kind, Side } from "./rules";

const sq = (name: string) =>
  (Number(name[1]) - 1) * 8 + "abcdefgh".indexOf(name[0] ?? "a");

const position = (
  pieces: Record<string, [Side, Kind]>,
  turn: Side = "white"
): Game => {
  const game = newGame();
  const board: Game["board"] = Array.from({ length: 64 }, () => null);

  for (const [name, [side, kind]] of Object.entries(pieces)) {
    board[sq(name)] = { kind, side };
  }

  return {
    ...game,
    board,
    double: { black: false, white: false },
    leap: { black: false, white: false },
    turn,
  };
};

describe("the bots", () => {
  it("always plays a legal move, at every level", () => {
    const game = newGame();

    for (const level of ["easy", "medium", "hard"] as const) {
      const move = chooseMove(game, level, () => 0.42);

      expect(move && isLegal(game, move), level).toBe(true);
    }
  });

  it("takes a free Tuk from medium up", () => {
    const game = position({
      a1: ["white", "khun"],
      d4: ["white", "seh"],
      e6: ["black", "tuk"],
      h8: ["black", "khun"],
    });

    expect(chooseMove(game, "medium")).toEqual({
      from: sq("d4"),
      to: sq("e6"),
    });
  });

  it("finds a mate in one", () => {
    const game = position({
      a8: ["black", "khun"],
      b6: ["white", "khun"],
      h1: ["white", "tuk"],
    });

    for (const level of ["medium", "hard"] as const) {
      const move = chooseMove(game, level);

      expect(move && play(game, move).winner, level).toBe("white");
    }
  });

  it("has no move to make in a finished game", () => {
    const mated = play(
      position({
        a8: ["black", "khun"],
        b6: ["white", "khun"],
        h1: ["white", "tuk"],
      }),
      { from: sq("h1"), to: sq("h8") }
    );

    expect(chooseMove(mated, "hard")).toBeNull();
  });
});
