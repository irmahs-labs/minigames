// @vitest-environment node
// Runs against a real Postgres with the migrations applied, given in
// TEST_DATABASE_URL: the Database workflow sets it, and so can you after
// `npm run db:up`. Without it these tests are skipped.
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { connect } from "./db";
import { readBrewers, readBrews, readLatest, recordBrew } from "./potions";

const url = process.env.TEST_DATABASE_URL;
const pool = connect(url ?? "postgres://unused");

const ana = { id: "00000000-0000-4000-8000-00000000000a", name: "Ana L." };
const ben = { id: "00000000-0000-4000-8000-00000000000b", name: "Ben" };

describe.skipIf(!url)("the recipe book in Postgres", () => {
  beforeEach(async () => {
    await pool.query("truncate booster_potion_brews");
  });

  afterAll(async () => {
    await pool.end();
  });

  it("starts with nobody having brewed anything", async () => {
    expect(await readBrews(pool, null)).toEqual(new Map());
  });

  it("puts the first brewer's name on a potion", async () => {
    expect(await recordBrew(pool, "Ember's Embrace", ana)).toEqual({
      brewers: { by: "Ana L.", count: 1, yours: true },
      first: true,
      isNew: true,
    });
  });

  it("keeps the first name, and counts everyone after", async () => {
    await recordBrew(pool, "Ember's Embrace", ana);

    expect(await recordBrew(pool, "Ember's Embrace", ben)).toEqual({
      brewers: { by: "Ana L.", count: 2, yours: true },
      first: false,
      isNew: true,
    });
  });

  it("counts a player once, however often they brew it", async () => {
    await recordBrew(pool, "Ember's Embrace", ana);

    expect(await recordBrew(pool, "Ember's Embrace", ana)).toEqual({
      brewers: { by: "Ana L.", count: 1, yours: true },
      first: false,
      isNew: false,
    });
  });

  it("reads every brewed potion, and which are the asker's", async () => {
    await recordBrew(pool, "Ember's Embrace", ana);
    await recordBrew(pool, "Autumn Hearth", ben);
    await recordBrew(pool, "Ember's Embrace", ben);

    expect(await readBrews(pool, ana.id)).toEqual(
      new Map([
        ["Ember's Embrace", { by: "Ana L.", count: 2, yours: true }],
        ["Autumn Hearth", { by: "Ben", count: 1, yours: false }],
      ])
    );
    const signedOut = await readBrews(pool, null);

    expect(signedOut.get("Ember's Embrace")).toEqual({
      by: "Ana L.",
      count: 2,
      yours: false,
    });
  });

  it("keeps the last brew, a repeat included", async () => {
    expect(await readLatest(pool)).toBeNull();

    await recordBrew(pool, "Ember's Embrace", ana);
    await recordBrew(pool, "Autumn Hearth", ben);
    await recordBrew(pool, "Ember's Embrace", ana);

    expect(await readLatest(pool)).toMatchObject({
      name: "Ana L.",
      potion: "Ember's Embrace",
    });
  });

  it("lists everyone who brewed a potion, first first", async () => {
    await recordBrew(pool, "Ember's Embrace", ben);
    await recordBrew(pool, "Ember's Embrace", ana);
    await recordBrew(pool, "Ember's Embrace", ben);

    const brewers = await readBrewers(pool, "Ember's Embrace");

    expect(brewers.map((brewer) => brewer.name)).toEqual(["Ben", "Ana L."]);
    expect(Date.parse(brewers[0]?.at ?? "")).not.toBeNaN();
  });
});
