/**
 * Super Tic-Tac-Toe: nine games of tic-tac-toe, one on each planet, laid out
 * as a tic-tac-toe board of their own. Three in a row on a planet conquers it;
 * three conquered planets in a row win the game. The square you play on picks
 * the planet your opponent plays on next, unless that planet is already
 * conquered or full, and then they may play on any planet.
 */
export type Player = "pink" | "purple";

export type Mark = Player | null;

/** A move: which planet (0–8), and which square on it (0–8), row by row. */
export interface Move {
  board: number;
  cell: number;
}

export const PLAYERS: Record<Player, { name: string; emoji: string }> = {
  pink: { emoji: "🌸", name: "Pink" },
  purple: { emoji: "🔮", name: "Purple" },
};

/** A player as the game names them: "Pink 🌸". */
export const playerLabel = (player: Player): string =>
  `${PLAYERS[player].name} ${PLAYERS[player].emoji}`;

export const FIRST: Player = "pink";

/**
 * The planets in board order, row by row. A square sends the next player to
 * the planet in the same place, so each square bears that planet's name.
 */
export const PLANETS = [
  { name: "Mercury", symbol: "☿" },
  { name: "Venus", symbol: "♀" },
  { name: "Mars", symbol: "♂" },
  { name: "Jupiter", symbol: "♃" },
  { name: "Sun & Moon", symbol: "☉" },
  { name: "Saturn", symbol: "♄" },
  { name: "Neptune", symbol: "♆" },
  { name: "Uranus", symbol: "♅" },
  { name: "Pluto", symbol: "♇" },
] as const;

export const SIZE = PLANETS.length;

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export interface Game {
  /** Each planet's nine squares. */
  boards: Mark[][];
  /** Who conquered each planet, if anyone. */
  conquered: Mark[];
  turn: Player;
  /** The planet the next move must go on, or null when any open one will do. */
  forced: number | null;
  /** Who won the whole game, if anyone. */
  winner: Player | null;
  /** Won, or every planet conquered or full with no winner: a draw. */
  over: boolean;
  last: Move | null;
}

/** The player who is not this one. */
export const other = (player: Player): Player =>
  player === "pink" ? "purple" : "pink";

/** Whoever holds three in a row on a 3 × 3 board, if anyone does. */
export const lineWinner = (marks: readonly Mark[]): Player | null => {
  for (const [a, b, c] of LINES) {
    const mark = marks[a];

    if (mark && marks[b] === mark && marks[c] === mark) {
      return mark;
    }
  }

  return null;
};

const emptyBoard = (): Mark[] => Array.from({ length: SIZE }, () => null);

export const newGame = (): Game => ({
  boards: Array.from({ length: SIZE }, emptyBoard),
  conquered: emptyBoard(),
  forced: null,
  last: null,
  over: false,
  turn: FIRST,
  winner: null,
});

/** A planet nobody can play on any more: conquered, or with no empty square. */
export const isClosed = (game: Game, board: number): boolean =>
  game.conquered[board] !== null ||
  (game.boards[board]?.every((mark) => mark !== null) ?? true);

/** A planet filled up with nobody holding three in a row on it. */
export const isDrawn = (game: Game, board: number): boolean =>
  game.conquered[board] === null && isClosed(game, board);

/** Whether the next move may go on this planet. */
export const isPlayable = (game: Game, board: number): boolean =>
  !game.over &&
  !isClosed(game, board) &&
  (game.forced === null || game.forced === board);

export const canPlay = (game: Game, { board, cell }: Move): boolean =>
  isPlayable(game, board) && game.boards[board]?.[cell] === null;

/** The game after a move, or the same game when the move is not allowed. */
export const play = (game: Game, move: Move): Game => {
  if (!canPlay(game, move)) {
    return game;
  }

  const boards = game.boards.map((marks, b) =>
    b === move.board
      ? marks.map((mark, c) => (c === move.cell ? game.turn : mark))
      : marks
  );

  const conquered = game.conquered.map((owner, b) =>
    b === move.board ? lineWinner(boards[b] ?? []) : owner
  );

  const winner = lineWinner(conquered);

  const next: Game = {
    boards,
    conquered,
    forced: null,
    last: move,
    over: false,
    turn: other(game.turn),
    winner,
  };

  const over =
    winner !== null || PLANETS.every((_, board) => isClosed(next, board));

  return {
    ...next,
    forced: isClosed(next, move.cell) ? null : move.cell,
    over,
  };
};

/** A game played out from its moves, or null if any of them is not allowed. */
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

/** How many planets each player holds. */
export const tally = (game: Game): Record<Player, number> => ({
  pink: game.conquered.filter((owner) => owner === "pink").length,
  purple: game.conquered.filter((owner) => owner === "purple").length,
});

const planetName = (board: number) => PLANETS[board]?.name ?? "";

/**
 * What the last move did and where the next one goes, in a line or two:
 * the old game's toasts ("Pink 🌸 wins Mercury", "Mars has been conquered!
 * Visit another planet!") as one running note.
 */
export const describe = (game: Game): string => {
  const { last, turn } = game;

  if (game.winner) {
    return `${playerLabel(game.winner)} conquered three planets in a row.`;
  }

  if (game.over) {
    return "Every planet is conquered or full, with no three in a row.";
  }

  if (!last) {
    return `${playerLabel(turn)} starts, on any planet.`;
  }

  const won = game.conquered[last.board];

  const conquest = won
    ? `${playerLabel(won)} wins ${planetName(last.board)}! `
    : "";

  if (game.forced !== null) {
    return `${conquest}${playerLabel(turn)} plays on ${planetName(game.forced)}.`;
  }

  const target = planetName(last.cell);
  const why = game.conquered[last.cell] ? "has been conquered" : "is full";

  return `${conquest}${target} ${why}, so ${playerLabel(turn)} may visit any planet.`;
};
