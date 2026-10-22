import * as z from "zod/mini";

import { COLOURS } from "./rules";

/**
 * What the page and the server say to each other about the sticky board.
 * A note never carries who stuck it: the server keeps that to count each
 * person's notes, and never sends it.
 */
const colour = z.enum(COLOURS);

const vote = z.union([z.literal(-1), z.literal(0), z.literal(1)]);

/** POST /api/board/notes: a note to stick up. */
export const noteRequest = z.object({ body: z.string(), colour });

/** PUT /api/board/notes/:id/vote: thumbs up (1), down (-1), or neither (0). */
export const voteRequest = z.object({ vote });

const note = z.object({
  body: z.string(),
  colour,
  /** How many people gave it a thumbs down. */
  down: z.int(),
  id: z.string(),
  /** The reader's own vote on it; 0 when signed out. */
  mine: vote,
  /** When it went up, as an ISO date; it comes down a day later. */
  postedAt: z.string(),
  /** How many people gave it a thumbs up. */
  up: z.int(),
});

/** GET /api/board: every note up now, newest first. */
export const board = z.object({
  /** The reader is a Mini Games admin, who can take notes down. */
  admin: z.boolean(),
  /** How many more notes the reader can stick today; null when signed out. */
  left: z.nullable(z.int()),
  notes: z.array(note),
});

export type NoteRequest = z.infer<typeof noteRequest>;

export type Note = z.infer<typeof note>;

export type Board = z.infer<typeof board>;
