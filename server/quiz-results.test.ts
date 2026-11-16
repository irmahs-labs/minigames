// @vitest-environment node
// Runs against a real Postgres with the migrations applied, given in
// TEST_DATABASE_URL: the Database workflow sets it, and so can you after
// `npm run db:up`. Without it these tests are skipped.
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { connect } from "./db";
import { readResult, removeResult, saveResult } from "./quiz-results";

const url = process.env.TEST_DATABASE_URL;
const pool = connect(url ?? "postgres://unused");

const ANA = "00000000-0000-4000-8000-00000000000a";
const BEN = "00000000-0000-4000-8000-00000000000b";
const WITCH = "what-type-of-witch";

describe.skipIf(!url)("quiz results in Postgres", () => {
  beforeEach(async () => {
    await pool.query("truncate quizzes_results");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("keeps one result per person and quiz, the last one", async () => {
    const first = new Date("2026-11-10T10:00:00Z");
    const second = new Date("2026-11-16T10:00:00Z");

    expect(await readResult(pool, ANA, WITCH)).toBeNull();

    await saveResult(pool, ANA, WITCH, {
      scores: { moon: 30 },
      takenAt: first,
    });
    await saveResult(pool, ANA, WITCH, {
      scores: { tech: 41, moon: 12 },
      takenAt: second,
    });

    expect(await readResult(pool, ANA, WITCH)).toEqual({
      scores: { moon: 12, tech: 41 },
      takenAt: second,
    });
    expect(await readResult(pool, BEN, WITCH)).toBeNull();
  });

  it("takes a result off, and only that person's", async () => {
    const takenAt = new Date("2026-11-16T10:00:00Z");

    await saveResult(pool, ANA, WITCH, { scores: { sea: 9 }, takenAt });
    await saveResult(pool, BEN, WITCH, { scores: { sea: 9 }, takenAt });
    await removeResult(pool, ANA, WITCH);

    expect(await readResult(pool, ANA, WITCH)).toBeNull();
    expect(await readResult(pool, BEN, WITCH)).not.toBeNull();
  });
});
