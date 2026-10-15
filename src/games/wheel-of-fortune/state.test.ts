import { beforeEach, describe, expect, it } from "vitest";

import { PRESETS } from "./presets";
import {
  MAX_SLOTS,
  STORAGE_KEY,
  defaultState,
  loadState,
  namedSlices,
  wheelStateSchema,
  reducer,
  saveState,
} from "./state";

describe("defaultState", () => {
  it("opens on the blank wheel with four empty slots", () => {
    const state = defaultState();
    expect(state.selected).toBe("blank");
    expect(state.wheels.blank).toEqual(["", "", "", ""]);
    expect(state.wheels.death).not.toContain("Gamma-ray burst");
  });
});

describe("wheelStateSchema", () => {
  it("turns an empty object into the starting state", () => {
    expect(wheelStateSchema.parse({})).toEqual(defaultState());
  });

  it("keeps the good parts and repairs only the damaged ones", () => {
    const state = wheelStateSchema.parse({
      selected: "luck",
      sound: false,
      wheels: { blank: ["Ana", "Ben"], death: "oops", luck: [1, 2] },
    });

    expect(state.selected).toBe("luck");
    expect(state.sound).toBe(false);
    expect(state.wheels.blank).toEqual(["Ana", "Ben"]);
    expect(state.wheels.death).toEqual([...PRESETS.death.slices]);
    expect(state.wheels.luck).toEqual([...PRESETS.luck.slices]);
  });

  it("ignores a wheel it does not know", () => {
    expect(wheelStateSchema.parse({ selected: "encounters" }).selected).toBe(
      "blank"
    );
  });
});

describe("loadState", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts fresh when nothing, or something unreadable, is stored", () => {
    expect(loadState()).toEqual(defaultState());

    for (const raw of ["not json", "null", "42", "[]"]) {
      window.localStorage.setItem(STORAGE_KEY, raw);
      expect(loadState()).toEqual(defaultState());
    }
  });

  it("brings back what was saved", () => {
    const saved = reducer(defaultState(), { on: false, type: "sound" });

    saveState(saved);
    expect(loadState()).toEqual(saved);
  });
});

describe("reducer", () => {
  it("edits only the selected wheel", () => {
    const state = reducer(defaultState(), {
      index: 1,
      label: "Ana",
      type: "rename",
    });

    expect(state.wheels.blank).toEqual(["", "Ana", "", ""]);
    expect(state.wheels.promotion).toEqual([...PRESETS.promotion.slices]);
  });

  it("adds slots up to the maximum and no further", () => {
    let state = defaultState();

    for (let i = 0; i < 20; i += 1) {
      state = reducer(state, { type: "add" });
    }

    expect(state.wheels.blank).toHaveLength(MAX_SLOTS);
  });

  it("empties a slot instead of going below two", () => {
    let state = defaultState();

    state = reducer(state, { index: 0, type: "remove" });
    state = reducer(state, { index: 0, type: "remove" });
    state = reducer(state, { index: 0, label: "Ana", type: "rename" });
    state = reducer(state, { index: 0, type: "remove" });
    expect(state.wheels.blank).toEqual(["", ""]);
  });

  it("removes a winner by its name, and resets to the preset", () => {
    let state = reducer(defaultState(), { type: "select", wheel: "promotion" });
    state = reducer(state, { label: "50% off", type: "removeLabel" });
    expect(state.wheels.promotion).not.toContain("50% off");
    state = reducer(state, { type: "reset" });
    expect(state.wheels.promotion).toEqual([...PRESETS.promotion.slices]);
  });
});

describe("namedSlices", () => {
  it("spins only the slots that have a name", () => {
    expect(namedSlices(["Ana", " ", "", " Ben "])).toEqual(["Ana", "Ben"]);
  });
});
