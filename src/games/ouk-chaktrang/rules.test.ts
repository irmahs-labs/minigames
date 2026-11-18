import { describe, expect, it } from "vitest";

import {
  capturesOf,
  exposedAfter,
  inCheck,
  isLegal,
  legalMoves,
  movesFrom,
  newGame,
  pieceLimit,
  play,
  replay,
  squareName,
} from "./rules";
import type { Game, Kind, Move, Side } from "./rules";

const sq = (name: string) =>
  (Number(name[1]) - 1) * 8 + "abcdefgh".indexOf(name[0] ?? "a");

const mv = (from: string, to: string): Move => ({ from: sq(from), to: sq(to) });

const targets = (game: Game, from: string) =>
  movesFrom(game, sq(from))
    .map((move) => squareName(move.to))
    .toSorted();

/** A game with only the pieces given, `turn` to move, special moves spent */
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

const playAll = (game: Game, moves: [string, string][]) => {
  let current = game;

  for (const [from, to] of moves) {
    const next = play(current, mv(from, to));

    expect(next, `${from}-${to}`).not.toBe(current);
    current = next;
  }

  return current;
};

/** White pieces of these kinds, for the counting limits */
const whitePieces = (...kinds: Kind[]) =>
  kinds.map((kind) => ({ kind, side: "white" as const }));

describe("the starting position", () => {
  it("puts each side's Khun on its left and the Trey on the third rank", () => {
    const { board, turn } = newGame();
    const at = (name: string) => board[sq(name)];

    expect(turn).toBe("white");
    expect(at("d1")).toEqual({ kind: "khun", side: "white" });
    expect(at("e1")).toEqual({ kind: "neang", side: "white" });
    expect(at("e8")).toEqual({ kind: "khun", side: "black" });
    expect(at("d8")).toEqual({ kind: "neang", side: "black" });
    expect(at("a1")?.kind).toBe("tuk");
    expect(at("b1")?.kind).toBe("seh");
    expect(at("c1")?.kind).toBe("koul");
    expect(at("a3")?.kind).toBe("trey");
    expect(at("h6")).toEqual({ kind: "trey", side: "black" });
    expect(at("a2")).toBeNull();
    expect(board.filter(Boolean)).toHaveLength(32);
  });
});

describe("how the pieces move", () => {
  it("moves a Trey one square ahead, never two", () => {
    expect(targets(newGame(), "c3")).toEqual(["c4"]);
  });

  it("lets a Trey capture one square diagonally ahead only", () => {
    const game = position({
      d1: ["white", "khun"],
      d4: ["white", "trey"],
      d5: ["black", "trey"],
      e5: ["black", "seh"],
      h8: ["black", "khun"],
    });

    expect(targets(game, "d4")).toEqual(["e5"]);
  });

  it("moves a Koul diagonally or one straight ahead", () => {
    const game = position({
      a1: ["white", "khun"],
      d4: ["white", "koul"],
      h8: ["black", "khun"],
    });

    expect(targets(game, "d4")).toEqual(["c3", "c5", "d5", "e3", "e5"]);
  });

  it("moves a Neang one square diagonally", () => {
    const game = position({
      a1: ["white", "khun"],
      d4: ["white", "neang"],
      h8: ["black", "khun"],
    });

    expect(targets(game, "d4")).toEqual(["c3", "c5", "e3", "e5"]);
  });

  it("slides a Tuk until it meets a piece, and takes an enemy one", () => {
    const game = position({
      a1: ["white", "khun"],
      d4: ["white", "tuk"],
      d6: ["black", "trey"],
      f4: ["white", "trey"],
      h8: ["black", "khun"],
    });

    expect(targets(game, "d4")).toEqual([
      "a4",
      "b4",
      "c4",
      "d1",
      "d2",
      "d3",
      "d5",
      "d6",
      "e4",
    ]);
  });

  it("jumps a Seh like a knight", () => {
    // a3 and c3 hold its own Trey
    expect(targets(newGame(), "b1")).toEqual(["d2"]);
  });
});

describe("the special first moves", () => {
  it("lets the Khun leap once onto the next rank, never to capture", () => {
    expect(targets(newGame(), "d1")).toEqual(["b2", "c2", "d2", "e2", "f2"]);

    const leapt = play(newGame(), mv("d1", "f2"));

    expect(leapt.board[sq("f2")]?.kind).toBe("khun");
    expect(leapt.leap.white).toBe(false);
  });

  it("takes the leap away once the Khun has been checked", () => {
    const game = {
      ...position(
        {
          a3: ["white", "trey"],
          d1: ["white", "khun"],
          f5: ["black", "seh"],
          h8: ["black", "khun"],
        },
        "black"
      ),
      leap: { black: true, white: true },
    };

    const checked = play(game, mv("f5", "e3"));

    expect(inCheck(checked, "white")).toBe(true);
    expect(checked.leap.white).toBe(false);
  });

  it("takes the leap away when an enemy Tuk lines up on the Khun", () => {
    const game = {
      ...position(
        {
          a3: ["white", "trey"],
          b3: ["white", "trey"],
          d1: ["white", "khun"],
          h8: ["black", "khun"],
          h7: ["black", "tuk"],
        },
        "black"
      ),
      leap: { black: true, white: true },
    };

    expect(targets({ ...game, turn: "white" }, "d1")).toContain("b2");
    expect(play(game, mv("h7", "h1")).leap.white).toBe(false);
  });

  it("lets the Neang step two squares straight ahead on her first move", () => {
    const start = newGame();

    // The Trey on e3 blocks her at first
    expect(targets(start, "e1")).toEqual(["d2", "f2"]);

    const game = playAll(start, [
      ["e3", "e4"],
      ["a6", "a5"],
    ]);

    expect(targets(game, "e1")).toContain("e3");

    const after = playAll(game, [["e1", "e3"]]);

    expect(after.double.white).toBe(false);
  });
});

describe("what the board warns about", () => {
  it("says when a piece could be taken where it lands", () => {
    const game = position({
      a1: ["white", "khun"],
      c1: ["white", "tuk"],
      d8: ["black", "tuk"],
      h8: ["black", "khun"],
    });

    expect(exposedAfter(game, mv("c1", "d1"))).toBe(true);
    expect(exposedAfter(game, mv("c1", "c4"))).toBe(false);
  });
});

describe("promotion", () => {
  it("flips a Trey that reaches its sixth rank into a Neang-moving piece", () => {
    const game = position({
      a1: ["white", "khun"],
      d5: ["white", "trey"],
      h8: ["black", "khun"],
    });

    const next = play(game, mv("d5", "d6"));

    expect(next.board[sq("d6")]).toEqual({ kind: "flipped", side: "white" });
  });

  it("flips a black Trey on the third rank", () => {
    const game = position(
      {
        a8: ["black", "khun"],
        e4: ["black", "trey"],
        h1: ["white", "khun"],
      },
      "black"
    );

    expect(play(game, mv("e4", "e3")).board[sq("e3")]?.kind).toBe("flipped");
  });
});

describe("check and the end of the game", () => {
  it("never lets a side leave its own Khun in check", () => {
    const game = position({
      d1: ["white", "khun"],
      d2: ["white", "seh"],
      d8: ["black", "tuk"],
      h8: ["black", "khun"],
    });

    // The Seh is pinned to its Khun by the Tuk
    expect(movesFrom(game, sq("d2"))).toEqual([]);
  });

  it("wins by checkmate", () => {
    const game = position({
      a8: ["black", "khun"],
      b6: ["white", "khun"],
      h1: ["white", "tuk"],
    });

    const mated = play(game, mv("h1", "h8"));

    expect(mated.over).toBe(true);
    expect(mated.ending).toBe("checkmate");
    expect(mated.winner).toBe("white");
    expect(legalMoves(mated)).toEqual([]);
  });

  it("draws by stalemate", () => {
    const game = position({
      a6: ["white", "khun"],
      a8: ["black", "khun"],
      h1: ["white", "tuk"],
    });

    const stuck = play(game, mv("h1", "b1"));

    expect(stuck.over).toBe(true);
    expect(stuck.ending).toBe("stalemate");
    expect(stuck.winner).toBeNull();
  });

  it("draws when only the two Khun are left", () => {
    const game = position({
      a1: ["white", "khun"],
      b2: ["black", "tuk"],
      h8: ["black", "khun"],
    });

    const bare = play(game, mv("a1", "b2"));

    expect(bare.over).toBe(true);
    expect(bare.ending).toBe("kings");
  });

  it("refuses an illegal move and plays nothing", () => {
    const game = newGame();

    expect(play(game, mv("c3", "c5"))).toBe(game);
    expect(isLegal(game, mv("a6", "a5"))).toBe(false);
  });
});

describe("counting", () => {
  it("sets the piece honour limit by what the strong side has", () => {
    expect(pieceLimit(whitePieces("khun", "tuk", "tuk"))).toBe(8);
    expect(pieceLimit(whitePieces("khun", "tuk", "seh"))).toBe(16);
    expect(pieceLimit(whitePieces("khun", "koul", "koul"))).toBe(22);
    expect(pieceLimit(whitePieces("khun", "seh", "seh"))).toBe(32);
    expect(pieceLimit(whitePieces("khun", "koul", "neang"))).toBe(44);
    expect(pieceLimit(whitePieces("khun", "seh", "flipped"))).toBe(64);
  });

  it("draws a lone Khun that survives the count", () => {
    // Two Tuk against a lone Khun: 4 pieces plus one, so the count starts at 5 of 8
    let game = position({
      a1: ["white", "khun"],
      a8: ["white", "tuk"],
      b7: ["white", "tuk"],
      e5: ["black", "khun"],
    });

    game = play(game, mv("a1", "a2"));
    expect(game.count).toEqual({ done: 5, limit: 8, side: "black" });

    const moves: [string, string][] = [
      ["e5", "e4"],
      ["a2", "a1"],
      ["e4", "e5"],
      ["a1", "a2"],
      ["e5", "e4"],
    ];

    game = playAll(game, moves);
    expect(game.over).toBe(true);
    expect(game.ending).toBe("count");
    expect(game.winner).toBeNull();
  });
});

describe("replaying a game", () => {
  it("rebuilds a game from its moves, and refuses an illegal one", () => {
    const moves = [mv("c3", "c4"), mv("d6", "d5"), mv("c4", "d5")];

    expect(replay(moves)?.board[sq("d5")]).toEqual({
      kind: "trey",
      side: "white",
    });
    expect(replay([mv("c3", "c5")])).toBeNull();
  });

  it("lists the pieces each side took", () => {
    const taken = capturesOf([mv("c3", "c4"), mv("d6", "d5"), mv("c4", "d5")]);

    expect(taken.white).toEqual([{ kind: "trey", side: "black" }]);
    expect(taken.black).toEqual([]);
  });
});
