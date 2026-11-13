import { beforeEach, describe, expect, it } from "vitest";

import {
  MAX_DISTRICTS,
  MAX_PER_DISTRICT,
  SAMPLE_NAMES,
  castReducer,
  contestantsOf,
  loadCast,
  newCast,
  notReady,
  saveCast,
} from "./cast";
import type { Cast, CastAction } from "./cast";

const apply = (cast: Cast, ...actions: CastAction[]) => {
  let next = cast;

  for (const action of actions) {
    next = castReducer(next, action);
  }

  return next;
};

describe("the cast", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts with two districts of two empty places, and can't start yet", () => {
    const cast = newCast();

    expect(cast.districts).toHaveLength(2);
    expect(contestantsOf(cast)).toEqual([]);
    expect(notReady(cast)).toBe("too-few");
  });

  it("is ready with two names, from any districts", () => {
    const cast = apply(
      newCast(),
      { district: 0, name: "Ana", place: 0, type: "rename" },
      { district: 0, name: "  Ben ", place: 1, type: "rename" }
    );

    expect(contestantsOf(cast)).toEqual([
      { district: 1, id: "1-1", name: "Ana" },
      { district: 1, id: "1-2", name: "Ben" },
    ]);
    expect(notReady(cast)).toBeNull();
    // District-mates can't win together with no one to beat.
    expect(notReady(apply(cast, { together: true, type: "together" }))).toBe(
      "one-district"
    );
  });

  it("holds at most 12 districts of at most 4 places, and at least one of each", () => {
    let cast = newCast();

    for (let i = 0; i < 20; i += 1) {
      cast = apply(
        cast,
        { type: "addDistrict" },
        { district: 0, type: "addPlace" }
      );
    }

    expect(cast.districts).toHaveLength(MAX_DISTRICTS);
    expect(cast.districts[0]?.names).toHaveLength(MAX_PER_DISTRICT);

    const one = apply(
      newCast(),
      { district: 0, type: "removeDistrict" },
      { district: 0, type: "removeDistrict" },
      { district: 0, place: 0, type: "removePlace" },
      { district: 0, place: 0, type: "removePlace" }
    );

    expect(one.districts).toEqual([{ names: [""] }]);
  });

  it("fills the empty places with names not already taken", () => {
    const cast = apply(
      newCast(),
      { district: 1, name: SAMPLE_NAMES[0] ?? "", place: 0, type: "rename" },
      { names: SAMPLE_NAMES, type: "fill" }
    );

    const names = contestantsOf(cast).map((one) => one.name);

    expect(names).toHaveLength(4);
    expect(new Set(names).size).toBe(4);
  });

  it("remembers the cast, and falls back on a new one when what's kept is damaged", () => {
    const cast = apply(newCast(), {
      district: 0,
      name: "Ana",
      place: 0,
      type: "rename",
    });

    saveCast(cast);

    expect(loadCast()).toEqual(cast);

    window.localStorage.setItem("minigames:the-arena:v1", '{"districts":[]}');

    expect(loadCast()).toEqual(newCast());
  });
});
