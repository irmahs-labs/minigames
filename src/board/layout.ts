import * as z from "zod/mini";

/**
 * Where each note sits on the corkboard. Notes start in tidy columns,
 * newest first; anyone can drag them anywhere on the board, and their browser
 * remembers where (`minigames:board:spots:v1`). Nobody else sees how you
 * arranged yours.
 */

/** A note's width on the board, in pixels; .sticky in styles.css. */
export const NOTE_WIDTH = 190;

const GAP = 18;

/** Room under the lowest note, to drag notes into. */
const ROOM_BELOW = 140;

/** The board is never shorter than this. */
const MIN_HEIGHT = 320;

/**
 * A note's height, guessed from its words so the starting layout needs no
 * measuring: its padding, time and thumbs, then a line for every 19
 * characters (a little fewer than fit, so guesses run tall, not short).
 */
const CHARS_PER_LINE = 19;
const LINE_HEIGHT = 22;
const FRAME_HEIGHT = 84;
const MIN_NOTE_HEIGHT = 140;

/** How tall a note with these words stands; `extra` for buttons under it. */
export const heightOf = (body: string, extra = 0) => {
  const lines = body
    .split("\n")
    .reduce(
      (count, line) =>
        count + Math.max(1, Math.ceil([...line].length / CHARS_PER_LINE)),
      0
    );

  return Math.max(MIN_NOTE_HEIGHT, FRAME_HEIGHT + lines * LINE_HEIGHT) + extra;
};

/**
 * A note's place: `x` from 0 (left edge) to 1 (right edge), so it stays on
 * the board when the window narrows; `y` in pixels from the top; and `z`,
 * which is higher the more recently it was moved, so it lies on top.
 */
const spot = z.object({
  /** On a wide screen, the margin it hangs in; src/board/sides.ts. */
  side: z.optional(z.enum(["left", "right"])),
  x: z.number().check(z.gte(0), z.lte(1)),
  y: z.number().check(z.gte(0)),
  z: z.int().check(z.gte(0)),
});

export type Spot = z.infer<typeof spot>;

export const spotsSchema = z.record(z.string(), spot);

export type Spots = Record<string, Spot>;

export const SPOTS_KEY = "minigames:board:spots:v1";

/** How far a note's left edge can go on a board this wide. */
const roomOn = (width: number) => Math.max(0, width - NOTE_WIDTH);

/**
 * Where notes start, in order, newest first: as many columns as the board
 * holds, each note under whichever column is shortest so far.
 */
export const startingSpots = (
  heights: readonly number[],
  width: number
): Spot[] => {
  const columns = Math.max(1, Math.floor((width + GAP) / (NOTE_WIDTH + GAP)));

  const tops: number[] = Array.from({ length: columns }, () => 0);
  const room = roomOn(width);

  return heights.map((height) => {
    const column = tops.indexOf(Math.min(...tops));
    const left = column * (NOTE_WIDTH + GAP);
    const y = tops[column] ?? 0;

    tops[column] = y + height + GAP;

    return { x: room > 0 ? Math.min(1, left / room) : 0, y, z: 0 };
  });
};

/** A spot's left edge in pixels, on a board this wide. */
export const leftOf = ({ x }: Spot, width: number) => x * roomOn(width);

/**
 * The spot a note is dropped at, `left` and `top` in pixels, kept on the
 * board: never off its sides or above it, and no lower than `deepest`.
 */
export const spotAt = (
  { left, top }: { left: number; top: number },
  width: number,
  deepest: number,
  layer: number
): Spot => {
  const room = roomOn(width);
  const kept = Math.min(Math.max(left, 0), room);

  return {
    x: room > 0 ? kept / room : 0,
    y: Math.round(Math.min(Math.max(top, 0), Math.max(deepest, 0))),
    z: layer,
  };
};

/** How tall the board is: down to the lowest note, and room to drag into. */
export const boardHeight = (bottoms: readonly number[]) =>
  Math.max(MIN_HEIGHT, ...bottoms.map((bottom) => bottom + ROOM_BELOW));

/** The deepest a note's top can go: a little below the lowest of the others. */
export const deepestFor = (otherBottoms: readonly number[]) =>
  Math.max(0, ...otherBottoms) + GAP;

/** The layer to put a moved note on: above every other. */
export const topLayer = (spots: readonly Spot[]) =>
  Math.max(0, ...spots.map((place) => place.z)) + 1;

/** Only the spots of notes still up, so a browser forgets notes that came down. */
export const keepUp = (spots: Spots, ids: readonly string[]): Spots =>
  Object.fromEntries(
    ids.flatMap((id) => {
      const place = spots[id];

      return place ? [[id, place]] : [];
    })
  );
