import * as z from "zod/mini";
// zod's catch(): a schema that falls back to a value, named so it does not read
// as a Promise.
import { catch as withFallback } from "zod/mini";

import { readStored, writeStored } from "../../lib/storage";
import { SIZE, replay } from "./rules";
import type { Move } from "./rules";

export const STORAGE_KEY = "minigames:super-tic-tac-toe:v1";

const index = z.int().check(z.gte(0), z.lte(SIZE - 1));

/**
 * The game in progress, kept in this browser's localStorage as the moves
 * played so far: the board, the turn and who holds what all follow from
 * them. Nothing leaves the browser.
 */
export const savedGameSchema = z.object({
  moves: withFallback(
    z
      .array(z.object({ board: index, cell: index }))
      .check(z.maxLength(SIZE * SIZE)),
    []
  ),
});

/** The saved moves, or none when they do not make a game that can be played. */
export const loadMoves = (): Move[] => {
  const { moves } = readStored(STORAGE_KEY, savedGameSchema, () => ({
    moves: [],
  }));

  return replay(moves) ? moves : [];
};

export const saveMoves = (moves: readonly Move[]) =>
  writeStored(STORAGE_KEY, { moves });
