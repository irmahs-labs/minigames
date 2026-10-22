import type { Pool } from "pg";

import type { Note, NoteRequest } from "../src/board/api";
import type { Colour } from "../src/board/rules";

/** The most notes the board shows at once, newest first. */
const SHOWN = 200;

// A note is up for a day from posted_at; LIFETIME_MS in src/board/rules.ts.
const UP = "posted_at > now() - interval '1 day'";

interface NoteRow {
  id: string;
  body: string;
  colour: Colour;
  posted_at: Date;
}

const noteOf = (row: NoteRow): Note => ({
  body: row.body,
  colour: row.colour,
  id: row.id,
  postedAt: row.posted_at.toISOString(),
});

/** Every note up now, newest first. Never who stuck them. */
export const readNotes = async (pool: Pool): Promise<Note[]> => {
  const { rows } = await pool.query<NoteRow>(
    `select id::text, body, colour, posted_at
     from hub_sticky_notes
     where ${UP}
     order by posted_at desc, id desc
     limit ${SHOWN}`
  );

  return rows.map(noteOf);
};

/** How many notes `userId` has up now. */
export const countNotes = async (pool: Pool, userId: string) => {
  const { rows } = await pool.query<{ count: number }>(
    `select count(*)::integer as count
     from hub_sticky_notes
     where user_id = $1 and ${UP}`,
    [userId]
  );

  return rows[0]?.count ?? 0;
};

/**
 * Sticks a note up for `userId`, or nothing when they already have `limit`
 * notes up: null then.
 */
export const postNote = async (
  pool: Pool,
  userId: string,
  { body, colour }: NoteRequest,
  limit: number
): Promise<Note | null> => {
  const { rows } = await pool.query<NoteRow>(
    `insert into hub_sticky_notes (user_id, body, colour)
     select $1, $2, $3
     where (select count(*) from hub_sticky_notes
            where user_id = $1 and ${UP}) < $4
     returning id::text, body, colour, posted_at`,
    [userId, body, colour, limit]
  );

  const [row] = rows;

  return row ? noteOf(row) : null;
};

/** Takes a note down before its day is up; false when there was none. */
export const removeNote = async (pool: Pool, id: string) => {
  const { rowCount } = await pool.query(
    "delete from hub_sticky_notes where id = $1",
    [id]
  );

  return (rowCount ?? 0) > 0;
};

/** Deletes every note whose day is up, with who stuck it. */
export const sweepNotes = async (pool: Pool) => {
  await pool.query(`delete from hub_sticky_notes where not (${UP})`);
};
