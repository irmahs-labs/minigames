import * as z from "zod/mini";

/**
 * What the browser and the server say to each other over the
 * /ws/ouk-chaktrang socket, one JSON object per message. Both sides parse
 * what they receive with these schemas.
 */
const square = z.int().check(z.gte(0), z.lte(63));
const move = z.object({ from: square, to: square });
const side = z.enum(["white", "black"]);

/** From the browser: look for a game, stop looking, or play a move. */
export const clientMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("join") }),
  z.object({ type: z.literal("leave") }),
  z.object({ from: square, to: square, type: z.literal("move") }),
]);

export type ClientMessage = z.infer<typeof clientMessage>;

/** The game a player is in: their side, who they face, and the moves. */
const seat = {
  moves: z.array(move),
  opponent: z.string(),
  you: side,
};

/** From the server: where this account stands, sent whenever it changes. */
export const serverMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("idle") }),
  z.object({
    remainingMs: z.number(),
    type: z.literal("queued"),
    waiting: z.int(),
  }),
  z.object({ type: z.literal("expired") }),
  z.object({ ...seat, remainingMs: z.number(), type: z.literal("room") }),
  z.object({
    ...seat,
    ending: z.enum(["checkmate", "stalemate", "count", "kings", "timeout"]),
    points: z.int(),
    type: z.literal("over"),
    winner: z.nullable(side),
  }),
  z.object({ message: z.string(), type: z.literal("error") }),
]);

export type ServerMessage = z.infer<typeof serverMessage>;

export { parseMessage } from "../../../lib/parse-message";
