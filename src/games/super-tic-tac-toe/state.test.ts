import { beforeEach, describe, expect, it } from "vitest";

import { STORAGE_KEY, loadMoves, saveMoves } from "./state";

describe("loadMoves", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts with no moves on a first visit", () => {
    expect(loadMoves()).toEqual([]);
  });

  it("brings back the moves it saved", () => {
    const moves = [
      { board: 4, cell: 2 },
      { board: 2, cell: 4 },
    ];

    saveMoves(moves);

    expect(loadMoves()).toEqual(moves);
  });

  it("starts over when the saved moves are not a game", () => {
    // Purple was sent to Mars and played on Jupiter instead.
    saveMoves([
      { board: 4, cell: 2 },
      { board: 3, cell: 0 },
    ]);

    expect(loadMoves()).toEqual([]);
  });

  it("starts over when the saved value is damaged", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadMoves()).toEqual([]);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ moves: [{ board: 9, cell: 0 }] })
    );
    expect(loadMoves()).toEqual([]);
  });
});
