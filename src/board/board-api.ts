import { board } from "./api";
import type { Board, NoteRequest } from "./api";
import type { Vote } from "./rules";

/** The board the server answers `path` with, or null when it can't be reached. */
const boardAt = async (
  path: string,
  init?: RequestInit
): Promise<Board | null> => {
  try {
    const response = await fetch(path, init);

    if (!response.ok) {
      return null;
    }

    const parsed = board.safeParse(await response.json());

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

/** The board as the server shows this reader, or null when it can't be reached. */
export const fetchBoard = () => boardAt("/api/board");

export type Stuck = { ok: true; board: Board } | { ok: false; message: string };

/** Sticks a note up, and the board with it on. */
export const stickNote = async (note: NoteRequest): Promise<Stuck> => {
  try {
    const response = await fetch("/api/board/notes", {
      body: JSON.stringify(note),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      // The server says why in a sentence: sign in, that's enough for today.
      const message = await response.text();

      return { message: message || "The note didn't go up.", ok: false };
    }

    const parsed = board.safeParse(await response.json());

    return parsed.success
      ? { board: parsed.data, ok: true }
      : { message: "The board's answer made no sense.", ok: false };
  } catch {
    return { message: "The board can't be reached right now.", ok: false };
  }
};

/** Gives a thumbs up (1), down (-1) or neither (0); the board after, or null. */
export const voteOnNote = (id: string, vote: Vote) =>
  boardAt(`/api/board/notes/${encodeURIComponent(id)}/vote`, {
    body: JSON.stringify({ vote }),
    headers: { "content-type": "application/json" },
    method: "PUT",
  });

/** Takes a note down, for an admin; false when it did not happen. */
export const takeDownNote = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/board/notes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch {
    return false;
  }
};
