import {
  CAPTURE_POINTS,
  fileOf,
  inCheck,
  legalMoves,
  other,
  play,
  rankOf,
} from "./rules";
import type { Game, Kind, Move, Side } from "./rules";

/**
 * The computer opponents. Easy plays almost at random but never misses a free
 * piece; medium looks two moves ahead; hard looks four ahead, with alpha-beta
 * pruning and the most promising moves tried first. All of it runs in the
 * browser, so a bot game never touches the server or the leaderboard.
 */
export type Level = "easy" | "medium" | "hard";

export const LEVELS: readonly Level[] = ["easy", "medium", "hard"];

const DEPTH: Record<Exclude<Level, "easy">, number> = { hard: 4, medium: 2 };

const MATE = 100_000;

/** Material, scaled up so a Trey is 100, plus small nudges for good squares */
const VALUE: Record<Kind, number> = {
  flipped: CAPTURE_POINTS.flipped * 100,
  khun: 0,
  koul: CAPTURE_POINTS.koul * 100,
  neang: CAPTURE_POINTS.neang * 100,
  seh: CAPTURE_POINTS.seh * 100,
  trey: CAPTURE_POINTS.trey * 100,
  tuk: CAPTURE_POINTS.tuk * 100,
};

/** How good the position is for `side`: material, Trey advanced, a centre held */
export const evaluate = (game: Game, side: Side): number => {
  if (game.over) {
    if (game.winner === null) {
      return 0;
    }

    return game.winner === side ? MATE : -MATE;
  }

  let score = 0;

  for (const [square, piece] of game.board.entries()) {
    if (!piece || piece.kind === "khun") {
      continue;
    }

    const centre = 3.5 - Math.abs(3.5 - fileOf(square));

    const advance =
      piece.kind === "trey"
        ? (piece.side === "white" ? rankOf(square) : 7 - rankOf(square)) * 6
        : 0;

    const worth = VALUE[piece.kind] + centre * 4 + advance;

    score += piece.side === side ? worth : -worth;
  }

  if (inCheck(game, other(side))) {
    score += 15;
  }

  return score;
};

/** What a move takes, by value: nothing is 0 */
const victimValue = (game: Game, move: Move) => {
  const victim = game.board[move.to];

  return victim ? VALUE[victim.kind] : 0;
};

/** Captures first, the most valuable victim first: alpha-beta prunes more */
const ordered = (game: Game): Move[] =>
  legalMoves(game).toSorted(
    (a, b) => victimValue(game, b) - victimValue(game, a)
  );

const search = (
  game: Game,
  depth: number,
  alpha: number,
  beta: number,
  side: Side
): number => {
  if (depth === 0 || game.over) {
    // A sooner mate is a better one
    const score = evaluate(game, side);

    return Math.abs(score) >= MATE ? score + Math.sign(score) * depth : score;
  }

  let best = -Infinity;
  let low = alpha;

  for (const move of ordered(game)) {
    const score = -search(
      play(game, move),
      depth - 1,
      -beta,
      -low,
      other(side)
    );

    best = Math.max(best, score);
    low = Math.max(low, score);

    if (low >= beta) {
      break;
    }
  }

  return best;
};

/** The bot's move for the side to play, or null when it has none */
export const chooseMove = (
  game: Game,
  level: Level,
  random: () => number = Math.random
): Move | null => {
  const moves = ordered(game);

  if (moves.length === 0) {
    return null;
  }

  const pick = (list: readonly Move[]) =>
    list[Math.floor(random() * list.length)] ?? null;

  if (level === "easy") {
    // Takes a piece when it can, a third of the time; otherwise anything
    const captures = moves.filter((move) => game.board[move.to]);

    return captures.length > 0 && random() < 1 / 3
      ? pick(captures)
      : pick(moves);
  }

  const side = game.turn;
  let best = -Infinity;
  let bests: Move[] = [];

  for (const move of moves) {
    const score = -search(
      play(game, move),
      DEPTH[level] - 1,
      -Infinity,
      -best + 1,
      other(side)
    );

    if (score > best) {
      best = score;
      bests = [move];
    } else if (score === best) {
      bests.push(move);
    }
  }

  // Equal moves are picked at random, so the bot never plays the same game twice
  return pick(bests);
};
