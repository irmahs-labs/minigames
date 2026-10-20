import { describe as group, expect, it } from "vitest";

import {
  canPlay,
  describe,
  isClosed,
  isDrawn,
  lineWinner,
  newGame,
  play,
  replay,
  tally,
} from "./rules";
import type { Game, Mark, Move } from "./rules";

const P = "pink";
const U = "purple";
const _ = null;

const run = (...moves: [number, number][]): Game => {
  let game = newGame();

  for (const [board, cell] of moves) {
    game = play(game, { board, cell });
  }

  return game;
};

/** Pink takes Mercury's top row, with Purple sent back each time. */
const PINK_TAKES_MERCURY: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, 2],
  [2, 0],
  [0, 0],
];

/** A game with the given planets' owners, every other planet empty. */
const withConquered = (conquered: Mark[], changes: Partial<Game>): Game => ({
  ...newGame(),
  conquered,
  ...changes,
});

group("lineWinner", () => {
  it("finds three in a row, column or diagonal", () => {
    expect(lineWinner([P, P, P, _, _, _, _, _, _])).toBe(P);
    expect(lineWinner([U, _, _, U, _, _, U, _, _])).toBe(U);
    expect(lineWinner([_, _, P, _, P, _, P, _, _])).toBe(P);
    expect(lineWinner([P, U, P, P, U, U, U, P, P])).toBeNull();
  });
});

group("newGame", () => {
  it("starts with Pink, on any planet", () => {
    const game = newGame();

    expect(game.turn).toBe(P);
    expect(game.forced).toBeNull();
    expect(game.over).toBe(false);
    expect(describe(game)).toBe("Pink 🌸 starts, on any planet.");
  });
});

group("play", () => {
  it("marks the square and sends the other player to its planet", () => {
    const game = run([4, 2]);

    expect(game.boards[4]?.[2]).toBe(P);
    expect(game.turn).toBe(U);
    expect(game.forced).toBe(2);
    expect(describe(game)).toBe("Purple 🔮 plays on Mars.");
  });

  it("refuses a move off the planet it was sent to, or on a taken square", () => {
    const game = run([4, 2]);

    expect(canPlay(game, { board: 3, cell: 0 })).toBe(false);
    expect(play(game, { board: 3, cell: 0 })).toBe(game);

    const next = run([4, 2], [2, 4]);

    expect(play(next, { board: 4, cell: 2 })).toBe(next);
  });

  it("conquers a planet with three in a row and locks it", () => {
    const game = run(...PINK_TAKES_MERCURY);

    expect(game.conquered[0]).toBe(P);
    expect(isClosed(game, 0)).toBe(true);
    expect(isDrawn(game, 0)).toBe(false);
    expect(canPlay(game, { board: 0, cell: 8 })).toBe(false);
    expect(tally(game)).toEqual({ pink: 1, purple: 0 });
  });

  it("lets the next player go anywhere when sent to a conquered planet", () => {
    const game = run(...PINK_TAKES_MERCURY);

    expect(game.forced).toBeNull();
    expect(describe(game)).toBe(
      "Pink 🌸 wins Mercury! Mercury has been conquered, so Purple 🔮 may visit any planet."
    );

    const next = run(...PINK_TAKES_MERCURY, [5, 4], [4, 0]);

    expect(next.forced).toBeNull();
    expect(canPlay(next, { board: 8, cell: 8 })).toBe(true);
  });

  it("lets the next player go anywhere when sent to a full planet", () => {
    const full: Mark[] = [P, U, P, P, U, U, U, P, U];

    const game: Game = {
      ...newGame(),
      boards: newGame().boards.map((marks, b) => (b === 0 ? full : marks)),
    };

    expect(isClosed(game, 0)).toBe(true);
    expect(isDrawn(game, 0)).toBe(true);

    const next = play(game, { board: 4, cell: 0 });

    expect(next.forced).toBeNull();
    expect(describe(next)).toBe(
      "Mercury is full, so Purple 🔮 may visit any planet."
    );
  });

  it("wins the game with three planets in a row", () => {
    const game = withConquered([P, P, _, _, _, _, _, _, _], {
      boards: newGame().boards.map((marks, b) =>
        b === 2 ? [P, P, _, U, U, _, _, _, _] : marks
      ),
      forced: 2,
    });

    const won = play(game, { board: 2, cell: 2 });

    expect(won.conquered[2]).toBe(P);
    expect(won.winner).toBe(P);
    expect(won.over).toBe(true);
    expect(canPlay(won, { board: 5, cell: 5 })).toBe(false);
    expect(describe(won)).toBe("Pink 🌸 conquered three planets in a row.");
  });

  it("ends in a draw when every planet is closed with no line", () => {
    const game = withConquered([P, U, P, P, U, U, U, P, _], {
      boards: newGame().boards.map((marks, b) =>
        b === 8 ? [P, U, P, P, U, U, U, P, _] : marks
      ),
      forced: 8,
    });

    const drawn = play(game, { board: 8, cell: 8 });

    expect(drawn.conquered[8]).toBeNull();
    expect(drawn.winner).toBeNull();
    expect(drawn.over).toBe(true);
    expect(describe(drawn)).toBe(
      "Every planet is conquered or full, with no three in a row."
    );
  });
});

group("replay", () => {
  it("plays the moves out", () => {
    const moves: Move[] = PINK_TAKES_MERCURY.map(([board, cell]) => ({
      board,
      cell,
    }));

    expect(replay(moves)).toEqual(run(...PINK_TAKES_MERCURY));
  });

  it("gives up on a move that is not allowed", () => {
    expect(
      replay([
        { board: 4, cell: 2 },
        { board: 3, cell: 0 },
      ])
    ).toBeNull();
  });
});
