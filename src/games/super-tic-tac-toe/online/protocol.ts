import * as z from "zod/mini";

import { SIZE } from "../rules";

/**
 * What the browser and the server say to each other over the /ws socket,
 * one JSON object per message. Both sides parse what they receive with these
 * schemas, so a page left open across a deploy gets an error, not a crash.
 */
const index = z.int().check(z.gte(0), z.lte(SIZE - 1));
const move = z.object({ board: index, cell: index });
const player = z.enum(["pink", "purple"]);

/** From the browser: look for a game, stop looking, or play a square. */
export const clientMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("join") }),
  z.object({ type: z.literal("leave") }),
  z.object({ board: index, cell: index, type: z.literal("move") }),
]);

export type ClientMessage = z.infer<typeof clientMessage>;

/** The game a player is in: their colour, who they face, and the moves. */
const seat = {
  moves: z.array(move),
  opponent: z.string(),
  you: player,
};

/** From the server: where this account stands, sent whenever it changes. */
export const serverMessage = z.discriminatedUnion("type", [
  // Neither looking for a game nor in one.
  z.object({ type: z.literal("idle") }),
  // In the queue; `waiting` counts everyone in it, this player included.
  z.object({
    remainingMs: z.number(),
    type: z.literal("queued"),
    waiting: z.int(),
  }),
  // Five minutes in the queue and nobody came.
  z.object({ type: z.literal("expired") }),
  // In a game: sent when it starts, after every move, and on reconnecting.
  z.object({ ...seat, remainingMs: z.number(), type: z.literal("room") }),
  // The game is over; `points` is what it was worth to this player.
  z.object({
    ...seat,
    ending: z.enum(["line", "full", "timeout"]),
    points: z.int(),
    type: z.literal("over"),
    winner: z.nullable(player),
  }),
  z.object({ message: z.string(), type: z.literal("error") }),
]);

export type ServerMessage = z.infer<typeof serverMessage>;

/** A received text frame as a message of the given schema, or null if it is not one. */
export const parseMessage = <T>(
  schema: z.ZodMiniType<T>,
  frame: string
): T | null => {
  try {
    const result = schema.safeParse(JSON.parse(frame));

    return result.success ? result.data : null;
  } catch {
    return null;
  }
};
