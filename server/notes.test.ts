// @vitest-environment node
// Runs against a real Postgres with the migrations applied, given in
// TEST_DATABASE_URL: the Database workflow sets it, and so can you after
// `npm run db:up`. Without it these tests are skipped.
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { connect } from "./db";
import {
  countNotes,
  postNote,
  readNotes,
  removeNote,
  sweepNotes,
} from "./notes";

const url = process.env.TEST_DATABASE_URL;
const pool = connect(url ?? "postgres://unused");

const ANA = "00000000-0000-4000-8000-00000000000a";
const BEN = "00000000-0000-4000-8000-00000000000b";

/** Moves every note `hours` into the past. */
const age = async (hours: number) => {
  await pool.query(
    "update hub_sticky_notes set posted_at = posted_at - make_interval(hours => $1)",
    [hours]
  );
};

describe.skipIf(!url)("the sticky board in Postgres", () => {
  beforeEach(async () => {
    await pool.query("truncate hub_sticky_notes");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("starts bare", async () => {
    expect(await readNotes(pool)).toEqual([]);
    expect(await countNotes(pool, ANA)).toBe(0);
  });

  it("puts notes up newest first, never saying who", async () => {
    await postNote(pool, ANA, { body: "first", colour: "lemon" }, 5);

    const second = await postNote(
      pool,
      BEN,
      { body: "second", colour: "taro" },
      5
    );

    expect(second).toEqual({
      body: "second",
      colour: "taro",
      id: expect.stringMatching(/^\d+$/u),
      postedAt: expect.any(String),
    });

    const notes = await readNotes(pool);

    expect(notes.map((note) => note.body)).toEqual(["second", "first"]);
    expect(JSON.stringify(notes)).not.toContain(ANA);
  });

  it("holds each person to their limit, and only them", async () => {
    await postNote(pool, ANA, { body: "one", colour: "lemon" }, 2);
    await postNote(pool, ANA, { body: "two", colour: "lemon" }, 2);

    expect(
      await postNote(pool, ANA, { body: "three", colour: "lemon" }, 2)
    ).toBeNull();
    expect(
      await postNote(pool, BEN, { body: "mine", colour: "matcha" }, 2)
    ).not.toBeNull();
    expect(await countNotes(pool, ANA)).toBe(2);
  });

  it("takes a note down a day after it went up", async () => {
    await postNote(pool, ANA, { body: "old", colour: "lemon" }, 5);
    await age(25);
    await postNote(pool, ANA, { body: "new", colour: "lemon" }, 5);

    const up = await readNotes(pool);

    expect(up.map((note) => note.body)).toEqual(["new"]);
    // A note that is down no longer counts against the limit.
    expect(await countNotes(pool, ANA)).toBe(1);

    await sweepNotes(pool);

    const { rows } = await pool.query<{ body: string }>(
      "select body from hub_sticky_notes"
    );

    expect(rows).toEqual([{ body: "new" }]);
  });

  it("lets a note be taken down early", async () => {
    const note = await postNote(
      pool,
      BEN,
      { body: "rude", colour: "lemon" },
      5
    );

    expect(await removeNote(pool, note?.id ?? "")).toBe(true);
    expect(await removeNote(pool, note?.id ?? "")).toBe(false);
    expect(await readNotes(pool)).toEqual([]);
  });
});
