import { describe, expect, it } from "vitest";

import { replay } from "./rules";
import type { Game } from "./rules";
import { POINTS, gamePoints } from "./scoring";

/** Pink takes Mercury's top row: three Pink squares, two Purple ones. */
const mercury = (): Game => {
  const game = replay([
    { board: 0, cell: 1 },
    { board: 1, cell: 0 },
    { board: 0, cell: 2 },
    { board: 2, cell: 0 },
    { board: 0, cell: 0 },
  ]);

  if (!game) {
    throw new Error("The moves above are a legal game");
  }

  return game;
};

describe("gamePoints", () => {
  it("gives a draw each player's squares and planets, with no bonus", () => {
    expect(gamePoints(mercury(), null)).toEqual({
      pink: 3 * POINTS.square + POINTS.planet,
      purple: 2 * POINTS.square,
    });
  });

  it("adds the victory bonus for the winner and takes the penalty from the loser", () => {
    expect(gamePoints(mercury(), "pink")).toEqual({
      pink: 3 * POINTS.square + POINTS.planet + POINTS.victory,
      purple: -POINTS.defeat,
    });
  });

  it("costs the loser points even when they held more of the board", () => {
    // Purple wins on Pink's timeout although Pink has the planet.
    const points = gamePoints(mercury(), "purple");

    expect(points.pink).toBe(-POINTS.defeat);
    expect(points.purple).toBe(2 * POINTS.square + POINTS.victory);
  });
});
