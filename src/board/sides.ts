import { NOTE_WIDTH } from "./layout";
import type { Spot } from "./layout";

/**
 * On a wide screen the notes hang in the empty margins either side of the
 * hub's column, never over it. A spot there says which side, and how far
 * across that margin (0 at its outer edge, 1 against the column).
 */

/** The hub's column: .page in styles.css, 1180px at most with 28px padding. */
const PAGE_MAX = 1180;
const PAGE_PAD = 28;

/** Kept clear between a note and the window's edge, or the column. */
const EDGE = 16;

const GAP = 18;

/** Room under the lowest note, to drag notes into. */
const ROOM_BELOW = 140;

export type Side = "left" | "right";

/** Where this browser keeps the notes' spots in the margins. */
export const SIDE_SPOTS_KEY = "minigames:board:sides:v1";

/** Where a margin starts and ends across the page, on a page this wide. */
export const marginOf = (side: Side, width: number) => {
  const column = Math.min(width, PAGE_MAX) - 2 * PAGE_PAD;
  const columnLeft = (width - column) / 2;

  return side === "left"
    ? { end: columnLeft - EDGE, start: EDGE }
    : { end: width - EDGE, start: width - columnLeft + EDGE };
};

/** How far a note's left edge can move across a margin. */
const roomIn = (side: Side, width: number) => {
  const { end, start } = marginOf(side, width);

  return end - start - NOTE_WIDTH;
};

/** Whether a note fits in the margins of a page this wide. */
export const sidesFit = (width: number) => roomIn("left", width) >= 0;

/** A spot's left edge in pixels across the whole page. */
export const sideLeftOf = (spot: Spot, width: number) => {
  const side = spot.side ?? "left";

  return (
    marginOf(side, width).start + spot.x * Math.max(0, roomIn(side, width))
  );
};

/** The spot for a note's left edge at `left` in `side`'s margin. */
const spotIn = (side: Side, left: number, width: number) => {
  const room = Math.max(0, roomIn(side, width));
  const across = left - marginOf(side, width).start;

  return room > 0 ? Math.min(Math.max(across / room, 0), 1) : 0;
};

/**
 * Where notes start, in order, newest first: in columns down both margins,
 * those nearest the hub's column first, each note under whichever column is
 * shortest so far, left before right.
 */
export const startingSideSpots = (
  heights: readonly number[],
  width: number
): Spot[] => {
  const across = Math.max(
    1,
    Math.floor((roomIn("left", width) + NOTE_WIDTH + GAP) / (NOTE_WIDTH + GAP))
  );

  // Inner columns first: against the hub on the left, then on the right.
  const columns = Array.from({ length: across }, (_, step) => {
    const inner = step * (NOTE_WIDTH + GAP);
    const left: Side = "left";
    const right: Side = "right";

    return [
      {
        side: left,
        x: spotIn(left, marginOf(left, width).end - NOTE_WIDTH - inner, width),
      },
      {
        side: right,
        x: spotIn(right, marginOf(right, width).start + inner, width),
      },
    ];
  }).flat();

  const tops: number[] = columns.map(() => 0);

  return heights.map((height) => {
    const index = tops.indexOf(Math.min(...tops));
    const column = columns[index] ?? { side: "left", x: 0 };
    const y = tops[index] ?? 0;

    tops[index] = y + height + GAP;

    return { side: column.side, x: column.x, y, z: 0 };
  });
};

/**
 * The spot a note is dropped at, `left` and `top` in pixels across the
 * page: in whichever margin its middle is nearer, never over the column,
 * never above the page, and no lower than `deepest`.
 */
export const sideSpotAt = (
  { left, top }: { left: number; top: number },
  width: number,
  deepest: number,
  layer: number
): Spot => {
  const side: Side = left + NOTE_WIDTH / 2 < width / 2 ? "left" : "right";

  return {
    side,
    x: spotIn(side, left, width),
    y: Math.round(Math.min(Math.max(top, 0), Math.max(deepest, 0))),
    z: layer,
  };
};

/** How tall the notes reach down the page, with room to drag into. */
export const sidesHeight = (bottoms: readonly number[]) =>
  Math.max(0, ...bottoms) + ROOM_BELOW;
