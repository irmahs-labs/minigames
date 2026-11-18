import { describe, expect, it } from "vitest";

import type { Move } from "./rules";
import { POINTS, capturePoints, gamePoints } from "./scoring";

const sq = (name: string) =>
  (Number(name[1]) - 1) * 8 + "abcdefgh".indexOf(name[0] ?? "a");

const mv = (from: string, to: string): Move => ({ from: sq(from), to: sq(to) });

// White's Trey takes a Trey, then Black's Trey takes it back
const GAME = [mv("c3", "c4"), mv("d6", "d5"), mv("c4", "d5"), mv("e6", "d5")];

describe("scoring", () => {
  it("counts each capture by the piece taken", () => {
    expect(capturePoints(GAME, "white")).toBe(1);
    expect(capturePoints(GAME, "black")).toBe(1);
  });

  it("adds the victory bonus, and takes the defeat penalty off the loser's captures", () => {
    expect(gamePoints(GAME, "white")).toEqual({
      black: 1 - POINTS.defeat,
      white: 1 + POINTS.victory,
    });
  });

  it("gives both sides their captures in a draw", () => {
    expect(gamePoints(GAME, null)).toEqual({ black: 1, white: 1 });
  });
});
