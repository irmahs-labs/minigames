/**
 * Ouk Chaktrang (អុកចត្រង្គ), Cambodian chess, as PyChess plays it
 * (pychess.org/variants/cambodian):
 *
 * - An 8×8 board. White moves first. The Trey (fish) start on the third
 *   rank, and each side's Khun (king) stands on the player's left.
 * - Khun: one square any way. Once, on its first move, while it has never
 *   been checked, it may leap like a Seh onto the next rank (d1 to b2 or
 *   f2), never to capture. An enemy Tuk lining up on its rank or file also
 *   takes the leap away.
 * - Neang (lady): one square diagonally; on her first move she may instead
 *   leap two squares straight ahead, never to capture.
 * - Koul (general): one square diagonally or one straight ahead.
 * - Seh (horse): the knight. Tuk (boat): the rook.
 * - Trey (fish): one square ahead, capturing one square diagonally ahead.
 *   On the sixth rank (its own count) it is flipped and moves as a Neang.
 * - Checkmate wins; stalemate is a draw.
 * - Counting: once no unflipped Trey is left, the side with less material
 *   counts its own moves, and reaching the limit is a draw. When it is down
 *   to its lone Khun, the limit comes from what the other side has left
 *   (piece honour counting), otherwise it is 64 (board honour counting).
 *   Two lone Khun draw at once.
 */
export type Side = "white" | "black";

export type Kind =
  | "khun"
  | "neang"
  | "koul"
  | "seh"
  | "tuk"
  | "trey"
  | "flipped";

export interface Piece {
  side: Side;
  kind: Kind;
}

/** A square: 0 is a1, 7 is h1, 63 is h8. */
export type Square = number;

export interface Move {
  from: Square;
  to: Square;
}

/** Counting towards a draw: whose moves count, how far, and how many so far. */
export interface Count {
  side: Side;
  limit: number;
  done: number;
}

export type Ending = "checkmate" | "stalemate" | "count" | "kings" | "timeout";

export interface Game {
  board: (Piece | null)[];
  turn: Side;
  /** May each side's Khun still leap, and its Neang still step two? */
  leap: Record<Side, boolean>;
  double: Record<Side, boolean>;
  count: Count | null;
  over: boolean;
  winner: Side | null;
  ending: Ending | null;
  /** The last move played, to show on the board */
  last: Move | null;
}

export const SIDES: readonly Side[] = ["white", "black"];

export const other = (side: Side): Side =>
  side === "white" ? "black" : "white";

export const fileOf = (square: Square) => square % 8;
export const rankOf = (square: Square) => Math.floor(square / 8);

const at = (file: number, rank: number): Square | null =>
  file >= 0 && file < 8 && rank >= 0 && rank < 8 ? rank * 8 + file : null;

/** "e3" for a square */
export const squareName = (square: Square) =>
  `${"abcdefgh"[fileOf(square)]}${rankOf(square) + 1}`;

const forward = (side: Side) => (side === "white" ? 1 : -1);

const BACK: Record<Side, readonly Kind[]> = {
  black: ["tuk", "seh", "koul", "neang", "khun", "koul", "seh", "tuk"],
  white: ["tuk", "seh", "koul", "khun", "neang", "koul", "seh", "tuk"],
};

export const newGame = (): Game => {
  const board: (Piece | null)[] = Array.from({ length: 64 }, () => null);

  for (let file = 0; file < 8; file += 1) {
    board[file] = { kind: BACK.white[file] ?? "trey", side: "white" };
    board[16 + file] = { kind: "trey", side: "white" };
    board[40 + file] = { kind: "trey", side: "black" };
    board[56 + file] = { kind: BACK.black[file] ?? "trey", side: "black" };
  }

  return {
    board,
    count: null,
    double: { black: true, white: true },
    ending: null,
    last: null,
    leap: { black: true, white: true },
    over: false,
    turn: "white",
    winner: null,
  };
};

const KING_STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

const DIAGONALS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

const KNIGHT = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
] as const;

const LINES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/** The squares a piece on `from` attacks, whether or not they hold anything */
const attacks = (board: Game["board"], from: Square): Square[] => {
  const piece = board[from];

  if (!piece) {
    return [];
  }

  const f = fileOf(from);
  const r = rankOf(from);
  const ahead = forward(piece.side);

  const steps = (list: readonly (readonly [number, number])[]) =>
    list.flatMap(([df, dr]) => {
      const square = at(f + df, r + dr);

      return square === null ? [] : [square];
    });

  switch (piece.kind) {
    case "khun": {
      return steps(KING_STEPS);
    }

    case "neang":
    case "flipped": {
      return steps(DIAGONALS);
    }

    case "koul": {
      return steps([...DIAGONALS, [0, ahead]]);
    }

    case "seh": {
      return steps(KNIGHT);
    }

    case "trey": {
      return steps([
        [1, ahead],
        [-1, ahead],
      ]);
    }

    case "tuk": {
      const seen: Square[] = [];

      for (const [df, dr] of LINES) {
        for (let n = 1; n < 8; n += 1) {
          const square = at(f + df * n, r + dr * n);

          if (square === null) {
            break;
          }

          seen.push(square);

          if (board[square]) {
            break;
          }
        }
      }

      return seen;
    }

    default: {
      return [];
    }
  }
};

/** Whether any piece of `by` attacks `square` */
export const isAttacked = (
  board: Game["board"],
  square: Square,
  by: Side
): boolean =>
  board.some(
    (piece, from) => piece?.side === by && attacks(board, from).includes(square)
  );

const khunOf = (board: Game["board"], side: Side): Square =>
  board.findIndex((piece) => piece?.side === side && piece.kind === "khun");

export const inCheck = (game: Pick<Game, "board">, side: Side): boolean => {
  const khun = khunOf(game.board, side);

  return khun !== -1 && isAttacked(game.board, khun, other(side));
};

/** Every move a piece could make, before checking its own Khun's safety */
const candidates = (game: Game, from: Square): Move[] => {
  const piece = game.board[from];

  if (!piece || piece.side !== game.turn) {
    return [];
  }

  const f = fileOf(from);
  const r = rankOf(from);
  const ahead = forward(piece.side);
  const moves: Move[] = [];

  const add = (to: Square | null, canCapture = true, mustCapture = false) => {
    if (to === null) {
      return;
    }

    const target = game.board[to];

    if (target?.side === piece.side) {
      return;
    }

    if ((target && !canCapture) || (!target && mustCapture)) {
      return;
    }

    moves.push({ from, to });
  };

  if (piece.kind === "trey") {
    add(at(f, r + ahead), false);
    add(at(f + 1, r + ahead), true, true);
    add(at(f - 1, r + ahead), true, true);

    return moves;
  }

  for (const to of attacks(game.board, from)) {
    add(to);
  }

  // The Khun's one leap, onto the next rank, never to capture or out of check
  if (
    piece.kind === "khun" &&
    game.leap[piece.side] &&
    !inCheck(game, piece.side)
  ) {
    for (const df of [-2, 2]) {
      add(at(f + df, r + ahead), false);
    }
  }

  // The Neang's first move may be two squares straight ahead, never a capture
  if (piece.kind === "neang" && game.double[piece.side]) {
    add(at(f, r + 2 * ahead), false);
  }

  return moves;
};

/** The board after a move, with a Trey flipped on its sixth rank */
const moved = (board: Game["board"], { from, to }: Move): Game["board"] => {
  const next = [...board];
  const piece = next[from];

  if (!piece) {
    return next;
  }

  const promotes =
    piece.kind === "trey" && rankOf(to) === (piece.side === "white" ? 5 : 2);

  next[to] = promotes ? { kind: "flipped", side: piece.side } : piece;
  next[from] = null;

  return next;
};

/** Every legal move from a square: those that leave its own Khun safe */
export const movesFrom = (game: Game, from: Square): Move[] =>
  game.over
    ? []
    : candidates(game, from).filter(
        (move) => !inCheck({ board: moved(game.board, move) }, game.turn)
      );

/**
 * Whether the piece a move lands could be taken there at once: what the
 * board shows while a move is being picked.
 */
export const exposedAfter = (game: Game, move: Move): boolean =>
  isAttacked(moved(game.board, move), move.to, other(game.turn));

export const legalMoves = (game: Game): Move[] =>
  game.board.flatMap((_, from) => movesFrom(game, from));

export const isLegal = (game: Game, move: Move): boolean =>
  movesFrom(game, move.from).some((legal) => legal.to === move.to);

/** What a capture is worth on the leaderboard, by the piece taken */
export const CAPTURE_POINTS: Record<Kind, number> = {
  flipped: 2,
  khun: 0,
  koul: 3,
  neang: 2,
  seh: 3,
  trey: 1,
  tuk: 5,
};

/** The piece a move would take, if any */
export const captured = (game: Game, move: Move): Piece | null =>
  game.board[move.to] ?? null;

const material = (board: Game["board"], side: Side) => {
  let sum = 0;

  for (const piece of board) {
    if (piece?.side === side) {
      sum += CAPTURE_POINTS[piece.kind];
    }
  }

  return sum;
};

const piecesOf = (board: Game["board"], side: Side) =>
  board.filter((piece): piece is Piece => piece?.side === side);

/**
 * The piece honour limit when one side has only its Khun: set by what the
 * other side has left, the first matching row of PyChess's table.
 */
export const pieceLimit = (strong: readonly Piece[]): number => {
  const n = (kind: Kind) =>
    strong.filter((piece) => piece.kind === kind).length;

  if (n("tuk") >= 2) {
    return 8;
  }

  if (n("tuk") === 1) {
    return 16;
  }

  if (n("koul") >= 2) {
    return 22;
  }

  if (n("seh") >= 2) {
    return 32;
  }

  if (n("koul") === 1) {
    return 44;
  }

  return 64;
};

/** Starts, keeps or switches the count after a move */
const counted = (game: Game, mover: Side): Count | null => {
  const { board } = game;

  if (board.some((piece) => piece?.kind === "trey")) {
    return null;
  }

  const lone = SIDES.find((side) => piecesOf(board, side).length === 1);

  // Piece honour counting: from the pieces on the board, plus one
  if (lone) {
    const limit = pieceLimit(piecesOf(board, other(lone)));

    if (game.count?.side === lone && game.count.limit === limit) {
      return mover === lone
        ? { ...game.count, done: game.count.done + 1 }
        : game.count;
    }

    const start = board.filter(Boolean).length + 1;

    return { done: start, limit: Math.max(limit, start), side: lone };
  }

  // Board honour counting: the side with less material counts to 64
  const white = material(board, "white");
  const black = material(board, "black");

  if (white === black) {
    return game.count;
  }

  const weak: Side = white < black ? "white" : "black";

  if (game.count?.side === weak) {
    return mover === weak
      ? { ...game.count, done: game.count.done + 1 }
      : game.count;
  }

  return { done: 0, limit: 64, side: weak };
};

/** The game after a legal move; the same game if the move is not legal */
export const play = (game: Game, move: Move): Game => {
  if (!isLegal(game, move)) {
    return game;
  }

  const piece = game.board[move.from];

  if (!piece) {
    return game;
  }

  const board = moved(game.board, move);
  const mover = game.turn;
  const turn = other(mover);
  const leap = { ...game.leap };
  const double = { ...game.double };

  if (piece.kind === "khun") {
    leap[mover] = false;
  }

  if (piece.kind === "neang") {
    double[mover] = false;
  }

  // A checked Khun, or one an enemy Tuk lines up on, loses its leap
  for (const side of SIDES) {
    const khun = khunOf(board, side);

    const lined = board.some(
      (p, square) =>
        p?.side === other(side) &&
        p.kind === "tuk" &&
        (fileOf(square) === fileOf(khun) || rankOf(square) === rankOf(khun))
    );

    if (lined || inCheck({ board }, side)) {
      leap[side] = false;
    }
  }

  const next: Game = {
    board,
    count: null,
    double,
    ending: null,
    last: move,
    leap,
    over: false,
    turn,
    winner: null,
  };

  next.count = counted({ ...next, count: game.count }, mover);

  const replies = legalMoves(next);

  if (replies.length === 0) {
    const mate = inCheck(next, turn);

    return {
      ...next,
      ending: mate ? "checkmate" : "stalemate",
      over: true,
      winner: mate ? mover : null,
    };
  }

  if (board.filter(Boolean).length === 2) {
    return { ...next, ending: "kings", over: true };
  }

  if (next.count && next.count.done >= next.count.limit) {
    return { ...next, ending: "count", over: true };
  }

  return next;
};

/** A game rebuilt from its moves; null if one of them is not legal */
export const replay = (moves: readonly Move[]): Game | null => {
  let game = newGame();

  for (const move of moves) {
    const next = play(game, move);

    if (next === game) {
      return null;
    }

    game = next;
  }

  return game;
};

/** The captures each side made over a game, as the pieces they took, up to the first illegal move */
export const capturesOf = (moves: readonly Move[]): Record<Side, Piece[]> => {
  const taken: Record<Side, Piece[]> = { black: [], white: [] };
  let game = newGame();

  for (const move of moves) {
    const piece = captured(game, move);
    const next = play(game, move);

    if (next === game) {
      break;
    }

    if (piece) {
      taken[game.turn].push(piece);
    }

    game = next;
  }

  return taken;
};
