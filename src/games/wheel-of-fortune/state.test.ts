import { beforeEach, describe, expect, it } from "vitest";

import { STARTERS } from "./starters";
import {
  MAX_SLOTS,
  MAX_WHEELS,
  STORAGE_KEY,
  currentWheel,
  defaultState,
  loadState,
  namedPositions,
  namedSlices,
  reducer,
  saveState,
  wheelStateSchema,
} from "./state";
import type { WheelAction, WheelState } from "./state";

const run = (state: WheelState, ...actions: WheelAction[]) => {
  let next = state;

  for (const action of actions) {
    next = reducer(next, action);
  }

  return next;
};

describe("defaultState", () => {
  it("opens on Names, with four empty slots, beside the Death wheel", () => {
    const state = defaultState();

    expect(state.wheels.map((wheel) => wheel.name)).toEqual(["Names", "Death"]);
    expect(currentWheel(state)).toMatchObject({
      name: "Names",
      slots: ["", "", "", ""],
    });
    expect(state.wheels[1]?.slots).toEqual([...STARTERS.death.slices]);
  });
});

describe("wheelStateSchema", () => {
  it("turns an empty object into the starting wheels", () => {
    const state = wheelStateSchema.parse({});

    expect(state.sound).toBe(true);
    expect(state.wheels.map((wheel) => wheel.name)).toEqual(["Names", "Death"]);
  });

  it("keeps the good wheels and repairs only the damaged parts", () => {
    const state = wheelStateSchema.parse({
      selected: "b",
      sound: false,
      wheels: [
        { id: "a", name: "Team", slots: ["Ana", "Ben"] },
        { id: "b", name: "Broken", slots: "oops" },
      ],
    });

    expect(state.sound).toBe(false);
    expect(state.wheels[0]?.slots).toEqual(["Ana", "Ben"]);
    expect(currentWheel(state)).toMatchObject({
      name: "Broken",
      slots: ["", "", "", ""],
    });
  });

  it("opens the first wheel when the selection is unknown", () => {
    const state = wheelStateSchema.parse({
      selected: "gone",
      wheels: [{ id: "a", name: "Team", slots: ["Ana", "Ben"] }],
    });

    expect(currentWheel(state).id).toBe("a");
  });
});

describe("loadState", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts fresh when nothing, or something unreadable, is stored", () => {
    expect(loadState().wheels).toHaveLength(2);

    for (const raw of ["not json", "null", "42", "[]"]) {
      window.localStorage.setItem(STORAGE_KEY, raw);
      expect(currentWheel(loadState()).name).toBe("Names");
    }
  });

  it("brings back what was saved", () => {
    const saved = run(defaultState(), { id: "two", type: "create" });

    saveState(saved);
    expect(loadState()).toEqual(saved);
  });
});

describe("reducer: wheels", () => {
  it("creates numbered wheels up to the maximum and opens each one", () => {
    let state = defaultState();

    for (let i = 0; i < MAX_WHEELS + 2; i += 1) {
      state = reducer(state, { id: `w${i}`, type: "create" });
    }

    expect(state.wheels).toHaveLength(MAX_WHEELS);
    expect(currentWheel(state)).toMatchObject({ id: "w5", name: "Wheel 8" });
  });

  it("renames and deletes the open wheel, never the last one", () => {
    let state = run(
      defaultState(),
      { id: "two", type: "create" },
      { name: "Raffle", type: "renameWheel" }
    );

    expect(currentWheel(state).name).toBe("Raffle");
    state = run(state, { type: "deleteWheel" });
    expect(state.wheels).toHaveLength(2);
    expect(currentWheel(state).name).toBe("Death");
    state = run(state, { type: "deleteWheel" }, { type: "deleteWheel" });
    expect(state.wheels.map((wheel) => wheel.name)).toEqual(["Names"]);
  });
});

describe("reducer: slots", () => {
  it("edits only the open wheel", () => {
    const state = run(
      defaultState(),
      { id: "two", type: "create" },
      { index: 1, label: "Ana", type: "rename" }
    );

    expect(state.wheels[0]?.slots).toEqual(["", "", "", ""]);
    expect(currentWheel(state)).toMatchObject({
      name: "Wheel 3",
      slots: ["", "Ana", "", ""],
    });
  });

  it("adds slots up to the maximum and no further", () => {
    const adds: WheelAction[] = Array.from({ length: 20 }, () => ({
      type: "add",
    }));

    expect(currentWheel(run(defaultState(), ...adds)).slots).toHaveLength(
      MAX_SLOTS
    );
  });

  it("empties a slot instead of going below two", () => {
    const state = run(
      defaultState(),
      { index: 0, type: "remove" },
      { index: 0, type: "remove" },
      { index: 0, label: "Ana", type: "rename" },
      { index: 0, type: "remove" }
    );

    expect(currentWheel(state).slots).toEqual(["", ""]);
  });

  it("clears a wheel to four blank slots, and resets it to its starter", () => {
    const start = defaultState();

    let state = run(
      start,
      { id: start.wheels[1]?.id ?? "", type: "select" },
      { type: "clear" }
    );

    expect(currentWheel(state).slots).toEqual(["", "", "", ""]);
    state = run(state, { type: "reset" });
    expect(currentWheel(state).slots).toContain("Drought");
  });

  it("resets a new wheel to four blank slots", () => {
    const state = run(
      defaultState(),
      { id: "two", type: "create" },
      { index: 0, label: "Ana", type: "rename" },
      { type: "reset" }
    );

    expect(currentWheel(state).slots).toEqual(["", "", "", ""]);
  });
});

describe("namedPositions", () => {
  it("numbers the named slots and marks the empty ones", () => {
    expect(namedPositions(["Ana", "", "Ana", " "])).toEqual([0, -1, 1, -1]);
  });
});

describe("namedSlices", () => {
  it("spins only the slots that have a name", () => {
    expect(namedSlices(["Ana", " ", "", " Ben "])).toEqual(["Ana", "Ben"]);
  });
});
