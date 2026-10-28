// @vitest-environment node
// Runs against a real Postgres with the migrations applied, given in
// TEST_DATABASE_URL: the Database workflow sets it, and so can you after
// `npm run db:up`. Without it these tests are skipped.
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { connect } from "./db";
import {
  readBrewers,
  readBrews,
  readLatest,
  readSoloFinds,
  recordBrew,
  recordSoloBrew,
  resetSolo,
} from "./potions";

const url = process.env.TEST_DATABASE_URL;
const pool = connect(url ?? "postgres://unused");

const ana = { id: "00000000-0000-4000-8000-00000000000a", name: "Ana L." };
const ben = { id: "00000000-0000-4000-8000-00000000000b", name: "Ben" };

describe.skipIf(!url)("the recipe book in Postgres", () => {
  beforeEach(async () => {
    await pool.query(
      "truncate booster_potion_brews, booster_potion_solo_brews"
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  it("starts with nobody having brewed anything", async () => {
    expect(await readBrews(pool, null)).toEqual(new Map());
  });

  it("puts the first brewer's name on a potion", async () => {
    expect(await recordBrew(pool, "Ember's Embrace", ana)).toEqual({
      brewers: {
        at: expect.any(String),
        by: "Ana L.",
        count: 1,
        last: null,
        yours: true,
      },
      first: true,
      isNew: true,
    });
  });

  it("keeps the first name, and counts everyone after", async () => {
    await recordBrew(pool, "Ember's Embrace", ana);

    expect(await recordBrew(pool, "Ember's Embrace", ben)).toEqual({
      brewers: {
        at: expect.any(String),
        by: "Ana L.",
        count: 2,
        last: { at: expect.any(String), name: "Ben" },
        yours: true,
      },
      first: false,
      isNew: true,
    });
  });

  it("counts a player once, however often they brew it", async () => {
    await recordBrew(pool, "Ember's Embrace", ana);

    expect(await recordBrew(pool, "Ember's Embrace", ana)).toEqual({
      brewers: {
        at: expect.any(String),
        by: "Ana L.",
        count: 1,
        last: { at: expect.any(String), name: "Ana L." },
        yours: true,
      },
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
        [
          "Ember's Embrace",
          {
            at: expect.any(String),
            by: "Ana L.",
            count: 2,
            last: { at: expect.any(String), name: "Ben" },
            yours: true,
          },
        ],
        [
          "Autumn Hearth",
          {
            at: expect.any(String),
            by: "Ben",
            count: 1,
            last: null,
            yours: false,
          },
        ],
      ])
    );
    const signedOut = await readBrews(pool, null);

    expect(signedOut.get("Ember's Embrace")).toMatchObject({
      by: "Ana L.",
      count: 2,
      last: { name: "Ben" },
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

  it("dates the first brew, and keeps the last one by anyone", async () => {
    const first = await recordBrew(pool, "Moonwater", ana);

    expect(Date.parse(first.brewers.at)).not.toBeNaN();
    expect(first.brewers.last).toBeNull();

    await recordBrew(pool, "Moonwater", ben);

    const second = await recordBrew(pool, "Moonwater", ana);

    expect(second.brewers.by).toBe("Ana L.");
    expect(second.brewers.at).toBe(first.brewers.at);
    expect(second.brewers.last?.name).toBe("Ana L.");

    const log = await readBrews(pool, null);

    expect(log.get("Moonwater")?.last?.name).toBe("Ana L.");
  });

  it("shows a player's new name on every page they are on", async () => {
    await recordBrew(pool, "Ember's Embrace", ana);
    await recordBrew(pool, "Moonwater", ana);
    await recordBrew(pool, "Moonwater", { ...ana, name: "Ana LM." });

    const brewers = await readBrewers(pool, "Ember's Embrace");

    expect(brewers.map((brewer) => brewer.name)).toEqual(["Ana LM."]);
  });

  it("keeps each player's own book apart from the shared one", async () => {
    expect(await recordSoloBrew(pool, ana.id, "Autumn Hearth")).toMatchObject({
      isNew: true,
    });

    const again = await recordSoloBrew(pool, ana.id, "Autumn Hearth");
    const finds = await readSoloFinds(pool, ana.id);

    expect(again.isNew).toBe(false);
    expect([...finds.keys()]).toEqual(["Autumn Hearth"]);
    expect(finds.get("Autumn Hearth")).toBe(again.foundAt);
    expect(await readSoloFinds(pool, ben.id)).toEqual(new Map());
    expect(await readBrews(pool, ana.id)).toEqual(new Map());
  });

  it("starts one player's own book over, and nobody else's", async () => {
    await recordSoloBrew(pool, ana.id, "Autumn Hearth");
    await recordSoloBrew(pool, ben.id, "Autumn Hearth");
    await resetSolo(pool, ana.id);

    expect(await readSoloFinds(pool, ana.id)).toEqual(new Map());
    const bens = await readSoloFinds(pool, ben.id);

    expect(bens.size).toBe(1);
  });
});
