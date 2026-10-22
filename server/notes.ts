import type { Pool } from "pg";

import type { Note, NoteRequest } from "../src/board/api";
import type { Colour, Vote } from "../src/board/rules";

/** The most notes the board shows at once, newest first. */
const SHOWN = 200;

// A note is up for a day from posted_at; LIFETIME_MS in src/board/rules.ts.
const UP = "posted_at > now() - interval '1 day'";

interface NoteRow {
  id: string;
  body: string;
  colour: Colour;
  posted_at: Date;
  up: number;
  down: number;
  mine: Vote;
}

const noteOf = (row: NoteRow): Note => ({
  body: row.body,
  colour: row.colour,
  down: row.down,
  id: row.id,
  mine: row.mine,
  postedAt: row.posted_at.toISOString(),
  up: row.up,
});

/**
 * Every note up now, newest first, with its thumbs up and down and the
 * vote `userId` gave it. Never who stuck a note or who voted.
 */
export const readNotes = async (
  pool: Pool,
  userId: string | null
): Promise<Note[]> => {
  const { rows } = await pool.query<NoteRow>(
    `select note.id::text, note.body, note.colour, note.posted_at,
            count(*) filter (where vote.vote = 1)::integer as up,
            count(*) filter (where vote.vote = -1)::integer as down,
            coalesce(max(vote.vote) filter (where vote.user_id = $1::uuid), 0)::integer
              as mine
     from hub_sticky_notes note
     left join hub_sticky_note_votes vote on vote.note_id = note.id
     where note.${UP}
     group by note.id
     order by note.posted_at desc, note.id desc
     limit ${SHOWN}`,
    [userId]
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
     returning id::text, body, colour, posted_at, 0 as up, 0 as down, 0 as mine`,
    [userId, body, colour, limit]
  );

  const [row] = rows;

  return row ? noteOf(row) : null;
};

/**
 * Gives `userId`'s vote on a note that is up: 1 or -1, or 0 to take it
 * back. False when there is no such note up.
 */
export const voteNote = async (
  pool: Pool,
  userId: string,
  id: string,
  vote: Vote
) => {
  if (vote === 0) {
    await pool.query(
      "delete from hub_sticky_note_votes where note_id = $1 and user_id = $2",
      [id, userId]
    );

    const { rowCount } = await pool.query(
      `select 1 from hub_sticky_notes where id = $1 and ${UP}`,
      [id]
    );

    return (rowCount ?? 0) > 0;
  }

  const { rowCount } = await pool.query(
    `insert into hub_sticky_note_votes (note_id, user_id, vote)
     select id, $2, $3 from hub_sticky_notes where id = $1 and ${UP}
     on conflict (note_id, user_id) do update set vote = excluded.vote`,
    [id, userId, vote]
  );

  return (rowCount ?? 0) > 0;
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
