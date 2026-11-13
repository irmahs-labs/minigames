import { describe, expect, it } from "vitest";

import { DAY, NIGHT, OPENING, victimsOf } from "./events";
import { isOver, simulate } from "./simulation";
import type { Contestant, Random } from "./simulation";

/** A seeded generator (Park and Miller's), so each game can be played again. */
const seeded = (seed: number): Random => {
  let state = seed;

  return () => {
    state = (state * 16_807) % 2_147_483_647;

    return (state - 1) / 2_147_483_646;
  };
};

/** `districts` districts of `each` contestants. */
const castOf = (districts: number, each: number): Contestant[] =>
  Array.from({ length: districts * each }, (_, i) => ({
    district: Math.floor(i / each) + 1,
    id: `c${i}`,
    name: `Name ${i}`,
  }));

const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);

describe("the games", () => {
  it.each([
    [1, 2],
    [2, 1],
    [6, 2],
    [12, 2],
    [12, 4],
  ])("always end with one victor: %i districts of %i", (districts, each) => {
    const cast = castOf(districts, each);

    for (const seed of SEEDS) {
      const games = simulate(cast, { together: false }, seeded(seed));

      expect(games.victors).toHaveLength(1);
      expect(games.fallen).toHaveLength(cast.length - 1);
      expect(new Set(games.fallen).size).toBe(games.fallen.length);
      expect(games.fallen).not.toContain(games.victors[0]);
    }
  });

  it("goes day 1, night 1, day 2, night 2…", () => {
    const { phases } = simulate(castOf(8, 2), { together: false }, seeded(7));

    expect(
      phases.slice(0, 4).map(({ kind, number }) => `${kind} ${number}`)
    ).toEqual(["day 1", "night 1", "day 2", "night 2"]);
  });

  it("takes a life every day, and gives everyone standing one thing to do", () => {
    const cast = castOf(12, 2);

    for (const seed of SEEDS.slice(0, 50)) {
      let standing = cast.length;

      for (const phase of simulate(cast, { together: false }, seeded(seed))
        .phases) {
        if (phase.kind === "day") {
          expect(phase.fallen.length).toBeGreaterThan(0);
        }

        const everyone = phase.happenings.flatMap(({ who }) => who);

        expect(everyone).toHaveLength(standing);
        expect(new Set(everyone).size).toBe(standing);
        standing -= phase.fallen.length;
      }
    }
  });

  it("credits each kill to its killer", () => {
    for (const seed of SEEDS.slice(0, 50)) {
      const games = simulate(castOf(6, 2), { together: false }, seeded(seed));

      const killings = games.phases
        .flatMap(({ happenings }) => happenings)
        .reduce((sum, { template }) => sum + template.kills.length, 0);

      expect(Object.values(games.kills).reduce((sum, n) => sum + n, 0)).toBe(
        killings
      );
    }
  });

  it("can end with district-mates winning together", () => {
    let together = 0;

    for (const seed of SEEDS) {
      const games = simulate(castOf(6, 2), { together: true }, seeded(seed));

      const districts = new Set(
        games.victors.map(
          (id) => castOf(6, 2).find((one) => one.id === id)?.district
        )
      );

      expect(districts.size).toBe(1);
      together += games.victors.length > 1 ? 1 : 0;
    }

    // Two from one district are the last two standing often enough.
    expect(together).toBeGreaterThan(10);
  });

  it("is over with one left, or with only district-mates left when they may win together", () => {
    const [a, b, c] = castOf(2, 2);

    expect(a && isOver([a], { together: false })).toBe(true);
    expect(a && b && isOver([a, b], { together: false })).toBe(false);
    expect(a && b && isOver([a, b], { together: true })).toBe(true);
    expect(a && c && isOver([a, c], { together: true })).toBe(false);
  });
});

describe("the events", () => {
  it.each([
    ["the opening", OPENING],
    ["the day", DAY],
    ["the night", NIGHT],
  ])("in %s, have a line for each place, in English and French", (_, pool) => {
    for (const template of pool) {
      for (const text of [template.text.en, template.text.fr]) {
        for (let place = 1; place <= 3; place += 1) {
          expect(text.includes(`{${place}}`), text).toBe(
            place <= template.size
          );
        }
      }

      for (const victim of victimsOf(template)) {
        expect(victim).toBeLessThan(template.size);
      }
    }
  });

  it("have calm and deadly events for one, in every phase", () => {
    for (const pool of [OPENING, DAY, NIGHT]) {
      expect(pool.some((t) => t.size === 1 && victimsOf(t).length === 0)).toBe(
        true
      );
      expect(pool.some((t) => t.size === 1 && victimsOf(t).length === 1)).toBe(
        true
      );
    }
  });
});
