import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { useCopy, useLanguage } from "../../lib/language";
import { kindName, sideName } from "./names";
import { PieceIcon } from "./pieces";
import type { Theme } from "./pieces";
import { exposedAfter, inCheck, movesFrom, squareName } from "./rules";
import type { Game, Move, Piece, Side, Square } from "./rules";

const COPY = {
  en: {
    board: "The board",
    confirm: (square: string) =>
      `Tap ${square} again to play there, or pick another square.`,
    danger: "It could be taken there.",
    empty: "empty",
    pick: "Pick a piece to see where it can go.",
    target: "a move",
  },
  fr: {
    board: "Le plateau",
    confirm: (square: string) =>
      `Touchez encore ${square} pour y jouer, ou choisissez une autre case.`,
    danger: "Elle pourrait y être prise.",
    empty: "vide",
    pick: "Choisissez une pièce pour voir où elle peut aller.",
    target: "un coup",
  },
};

/** How far a press moves, in pixels, before it is a drag */
const DRAG_PX = 6;

/** The sides whose Khun is in check now */
const sidesInCheck = (game: Game): Side[] =>
  (["white", "black"] as const).filter((side) => inCheck(game, side));

/** A piece being dragged: where it came from, and where it is on the board */
interface Drag {
  from: Square;
  pointer: number;
  startX: number;
  startY: number;
  moving: boolean;
  over: Square | null;
  /** The piece's top-left corner and size, in pixels inside the board */
  left: number;
  top: number;
  size: number;
}

/** What is picked, for the position it was picked in */
interface Pick {
  game: Game;
  selected: Square | null;
  pending: Square | null;
}

interface SquareProps {
  square: Square;
  piece: Piece | null;
  theme: Theme;
  label: string;
  classes: string;
  selected: boolean;
  lifted: boolean;
  onTap: (square: Square) => void;
  onPress: (square: Square, event: ReactPointerEvent) => void;
  onHover: (square: Square | null) => void;
}

const SquareButton = ({
  square,
  piece,
  theme,
  label,
  classes,
  selected,
  lifted,
  onTap,
  onPress,
  onHover,
}: SquareProps) => (
  <button
    type="button"
    className={classes}
    aria-label={label}
    aria-pressed={selected}
    data-square={squareName(square)}
    onClick={() => onTap(square)}
    onPointerDown={(event) => onPress(square, event)}
    onPointerEnter={() => onHover(square)}
    onPointerLeave={() => onHover(null)}
  >
    {piece && !lifted ? <PieceIcon piece={piece} theme={theme} /> : null}
  </button>
);

/**
 * The ranks down the left edge and the files along the bottom, drawn over
 * the board apart from the squares, whose names already say them.
 */
const Coordinates = ({ flipped }: { flipped: boolean }) => (
  <div className="ouk-coords" aria-hidden="true">
    {Array.from({ length: 8 }, (_, row) => (
      <span
        key={`rank-${row}`}
        className="ouk-coords__rank"
        style={{ gridColumn: 1, gridRow: row + 1 }}
      >
        {flipped ? row + 1 : 8 - row}
      </span>
    ))}
    {Array.from({ length: 8 }, (_, column) => (
      <span
        key={`file-${column}`}
        className="ouk-coords__file"
        style={{ gridColumn: column + 1, gridRow: 8 }}
      >
        {"abcdefgh"[flipped ? 7 - column : column]}
      </span>
    ))}
  </div>
);

/** The square under a point on the screen, as the board is drawn */
const squareAt = (
  x: number,
  y: number,
  box: DOMRect,
  flipped: boolean
): Square | null => {
  const column = Math.floor(((x - box.left) / box.width) * 8);
  const row = Math.floor(((y - box.top) / box.height) * 8);

  if (column < 0 || column > 7 || row < 0 || row > 7) {
    return null;
  }

  return flipped ? row * 8 + (7 - column) : (7 - row) * 8 + column;
};

/**
 * Dragging a piece: a press becomes a drag once it has moved a few pixels;
 * the piece follows the pointer, and dropping it on a square plays there
 * when `canDrop` says it may. A drop is not also a tap: `wasDrop` says so
 * once, to the tap that follows it.
 */
const useDrag = (
  flipped: boolean,
  canDrop: (move: Move) => boolean,
  onDrop: (move: Move) => void
) => {
  const [drag, setDrag] = useState<Drag | null>(null);
  const dropped = useRef(false);

  const start = (square: Square, event: ReactPointerEvent) =>
    setDrag({
      from: square,
      left: 0,
      moving: false,
      over: null,
      pointer: event.pointerId,
      size: 0,
      startX: event.clientX,
      startY: event.clientY,
      top: 0,
    });

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || event.pointerId !== drag.pointer) {
      return;
    }

    const box = event.currentTarget.getBoundingClientRect();

    const far =
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) >
      DRAG_PX;

    if (far && !drag.moving) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const size = box.width / 8;

    setDrag({
      ...drag,
      left: event.clientX - box.left - size / 2,
      moving: drag.moving || far,
      over: squareAt(event.clientX, event.clientY, box, flipped),
      size,
      top: event.clientY - box.top - size / 2,
    });
  };

  const release = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || event.pointerId !== drag.pointer) {
      return;
    }

    const box = event.currentTarget.getBoundingClientRect();
    const to = squareAt(event.clientX, event.clientY, box, flipped);

    // Dropped back where it started: that was a tap with a wobble
    if (drag.moving && to !== drag.from) {
      dropped.current = true;

      if (to !== null && canDrop({ from: drag.from, to })) {
        onDrop({ from: drag.from, to });
      }
    }

    setDrag(null);
  };

  const wasDrop = () => {
    const was = dropped.current;

    dropped.current = false;

    return was;
  };

  return {
    handleCancel: () => setDrag(null),
    handleMove: move,
    handleRelease: release,
    moving: drag?.moving ? drag : null,
    start,
    wasDrop,
  };
};

/** The square whose danger shows, and the move that would land there */
const focusOf = (
  dragging: Drag | null,
  pending: Square | null,
  hovered: Square | null,
  selected: Square | null
) => ({
  from: dragging ? dragging.from : selected,
  looking: dragging ? dragging.over : (pending ?? hovered),
});

/** What the line under the board says: pick a piece, or confirm the square */
const statusOf = (
  canMove: boolean,
  pending: Square | null,
  danger: boolean,
  t: (typeof COPY)["en"]
) => {
  if (pending === null) {
    return canMove ? t.pick : "";
  }

  return `${t.confirm(squareName(pending))}${danger ? ` ${t.danger}` : ""}`;
};

interface BoardProps {
  game: Game;
  theme: Theme;
  /** The sides the person at this screen moves: both on one screen */
  movable: readonly Side[];
  /** Black at the bottom, for whoever plays Black */
  flipped?: boolean;
  /** No moves now: the other side's turn, or the game is over */
  locked?: boolean;
  onMove: (move: Move) => void;
}

/**
 * The board. Tap a piece to see where it can go; tap a square, then tap it
 * again to play there. Or drag the piece and drop it. While a square is
 * picked, hovered or dragged over, it turns red if the piece could be taken
 * there.
 */
export const Board = ({
  game,
  theme,
  movable,
  flipped = false,
  locked = false,
  onMove,
}: BoardProps) => {
  const t = useCopy(COPY);
  const language = useLanguage();
  const [pick, setPick] = useState<Pick | null>(null);
  const [hovered, setHovered] = useState<Square | null>(null);

  // A pick made in another position no longer counts
  const current = pick?.game === game ? pick : null;
  const selected = current?.selected ?? null;
  const pending = current?.pending ?? null;
  const choose = (next: Omit<Pick, "game">) => setPick({ ...next, game });

  const canMove = !locked && !game.over && movable.includes(game.turn);

  const legal = (move: Move) =>
    canMove && movesFrom(game, move.from).some((each) => each.to === move.to);

  const mine = (square: Square) =>
    canMove && game.board[square]?.side === game.turn;

  const drag = useDrag(flipped, legal, (move) => {
    onMove(move);
    setPick(null);
  });

  // The square whose danger is shown: dragged over, picked, or hovered; the
  // piece moving is the one dragged, or else the one picked
  const { from, looking } = focusOf(drag.moving, pending, hovered, selected);
  const targets = canMove && from !== null ? movesFrom(game, from) : [];

  const isTarget = (square: Square) =>
    targets.some((move) => move.to === square);

  const danger =
    from !== null && looking !== null && isTarget(looking)
      ? exposedAfter(game, { from, to: looking })
      : false;

  const tap = (square: Square) => {
    if (drag.wasDrop() || !canMove) {
      return;
    }

    if (pending === square && selected !== null) {
      onMove({ from: selected, to: square });
      setPick(null);

      return;
    }

    if (isTarget(square)) {
      choose({ pending: square, selected });

      return;
    }

    choose({
      pending: null,
      selected: mine(square) && selected !== square ? square : null,
    });
  };

  const press = (square: Square, event: ReactPointerEvent) => {
    if (!mine(square) || event.button !== 0) {
      return;
    }

    // Only a possible drag: the tap that follows picks the piece
    drag.start(square, event);
  };

  const inCheckNow = sidesInCheck(game);
  const dragging = drag.moving;
  const ghost = dragging ? game.board[dragging.from] : null;
  const rows = Array.from({ length: 8 }, (_, i) => (flipped ? i : 7 - i));
  const columns = Array.from({ length: 8 }, (_, i) => (flipped ? 7 - i : i));

  const label = (square: Square) => {
    const piece = game.board[square];

    const what = piece
      ? `${sideName(piece.side, theme, language)} ${kindName(piece.kind, language)}`
      : t.empty;

    return `${squareName(square)}, ${what}${isTarget(square) ? `, ${t.target}` : ""}`;
  };

  const classesOf = (square: Square, rank: number, file: number) => {
    const piece = game.board[square];
    const target = isTarget(square);

    return [
      "ouk-square",
      (rank + file) % 2 === 0 ? "is-dark" : "is-light",
      selected === square && "is-selected",
      target && piece && "is-capture",
      target && !piece && "is-target",
      pending === square && "is-pending",
      looking === square && danger && "is-danger",
      dragging?.over === square && "is-over",
      (game.last?.from === square || game.last?.to === square) && "is-last",
      piece?.kind === "khun" && inCheckNow.includes(piece.side) && "is-check",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const status = statusOf(canMove, pending, danger, t);

  return (
    <div className="ouk-board-wrap">
      <section aria-label={t.board}>
        <div
          className={`ouk-board ouk-board--${theme}${dragging ? " is-dragging" : ""}`}
          onPointerMove={drag.handleMove}
          onPointerUp={drag.handleRelease}
          onPointerCancel={drag.handleCancel}
        >
          {rows.map((rank) => (
            <div key={rank} className="ouk-board__row">
              {columns.map((file) => {
                const square = rank * 8 + file;

                return (
                  <SquareButton
                    key={square}
                    square={square}
                    piece={game.board[square] ?? null}
                    theme={theme}
                    label={label(square)}
                    classes={classesOf(square, rank, file)}
                    selected={selected === square}
                    lifted={dragging?.from === square}
                    onTap={tap}
                    onPress={press}
                    onHover={setHovered}
                  />
                );
              })}
            </div>
          ))}

          <Coordinates flipped={flipped} />

          {ghost && dragging ? (
            <div
              className="ouk-ghost"
              aria-hidden="true"
              style={{
                height: dragging.size,
                left: dragging.left,
                top: dragging.top,
                width: dragging.size,
              }}
            >
              <PieceIcon piece={ghost} theme={theme} />
            </div>
          ) : null}
        </div>
      </section>
      <p className="hint ouk-board__status" aria-live="polite">
        {status}
      </p>
    </div>
  );
};
