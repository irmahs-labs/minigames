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
  voteNote,
} from "./notes";

const url = process.env.TEST_DATABASE_URL;
const pool = connect(url ?? "postgres://unused");

const ANA = "00000000-0000-4000-8000-00000000000a";
const BEN = "00000000-0000-4000-8000-00000000000b";
const CY = "00000000-0000-4000-8000-00000000000c";

/** Moves every note `hours` into the past. */
const age = async (hours: number) => {
  await pool.query(
    "update hub_sticky_notes set posted_at = posted_at - make_interval(hours => $1)",
    [hours]
  );
};

describe.skipIf(!url)("the sticky board in Postgres", () => {
  beforeEach(async () => {
    await pool.query("truncate hub_sticky_notes cascade");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("starts bare", async () => {
    expect(await readNotes(pool, null)).toEqual([]);
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
      down: 0,
      id: expect.stringMatching(/^\d+$/u),
      mine: 0,
      postedAt: expect.any(String),
      up: 0,
    });

    const notes = await readNotes(pool, null);

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

    const up = await readNotes(pool, null);

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
    expect(await readNotes(pool, null)).toEqual([]);
  });

  it("counts thumbs up and down, and each reader's own", async () => {
    const note = await postNote(pool, ANA, { body: "hi", colour: "blue" }, 5);
    const id = note?.id ?? "";

    expect(await voteNote(pool, BEN, id, 1)).toBe(true);
    expect(await voteNote(pool, CY, id, 1)).toBe(true);
    // Changing a vote replaces it rather than adding one.
    expect(await voteNote(pool, CY, id, -1)).toBe(true);

    expect(await readNotes(pool, BEN)).toMatchObject([
      { down: 1, mine: 1, up: 1 },
    ]);
    expect(await readNotes(pool, CY)).toMatchObject([{ mine: -1 }]);
    expect(await readNotes(pool, null)).toMatchObject([{ mine: 0 }]);
    expect(JSON.stringify(await readNotes(pool, BEN))).not.toContain(BEN);

    expect(await voteNote(pool, CY, id, 0)).toBe(true);
    expect(await readNotes(pool, CY)).toMatchObject([
      { down: 0, mine: 0, up: 1 },
    ]);
  });

  it("takes no vote on a note that is not up, and drops votes with their note", async () => {
    const note = await postNote(pool, ANA, { body: "old", colour: "white" }, 5);
    const id = note?.id ?? "";

    await voteNote(pool, BEN, id, 1);
    await age(25);

    expect(await voteNote(pool, CY, id, 1)).toBe(false);
    expect(await voteNote(pool, BEN, id, 0)).toBe(false);
    expect(await voteNote(pool, BEN, "999999", 1)).toBe(false);

    await sweepNotes(pool);

    const { rows } = await pool.query("select * from hub_sticky_note_votes");

    expect(rows).toEqual([]);
  });
});
