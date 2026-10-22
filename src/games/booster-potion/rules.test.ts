import { describe, expect, it } from "vitest";

import {
  EMPTY,
  choose,
  isReady,
  isValidSelection,
  labelOf,
  setForm,
} from "./rules";
import type { Selection } from "./rules";

const pick = (...names: string[]) => {
  let selection: Selection = EMPTY;

  for (const name of names) {
    selection = choose(selection, name);
  }

  return selection;
};

describe("labelOf", () => {
  it("names the form where there is one", () => {
    expect(labelOf({ form: "fresh", name: "Ginger" })).toBe("Fresh ginger");
    expect(labelOf({ form: "dried", name: "Ginger" })).toBe("Dried ginger");
    expect(labelOf({ form: "powder", name: "Turmeric" })).toBe(
      "Turmeric powder"
    );
    expect(labelOf({ name: "Lemon" })).toBe("Lemon");
  });
});

describe("choose", () => {
  it("adds ingredients from any shelves, in order", () => {
    expect(pick("Lemon", "Honey", "Black pepper").map((p) => p.name)).toEqual([
      "Lemon",
      "Honey",
      "Black pepper",
    ]);
  });

  it("puts an ingredient in its first form", () => {
    expect(pick("Ginger", "Turmeric", "Cinnamon", "Lemon")).toEqual([
      { form: "fresh", name: "Ginger" },
      { form: "fresh", name: "Turmeric" },
      { form: "dried", name: "Cinnamon" },
      { name: "Lemon" },
    ]);
  });

  it("takes an ingredient out when it is pressed again", () => {
    expect(pick("Lemon", "Ginger", "Lemon")).toEqual([
      { form: "fresh", name: "Ginger" },
    ]);
  });

  it("pushes out the oldest when a fifth goes in", () => {
    expect(
      pick("Lemon", "Ginger", "Honey", "Mint", "Lime").map((p) => p.name)
    ).toEqual(["Ginger", "Honey", "Mint", "Lime"]);
  });

  it("ignores names that are not in the pantry", () => {
    expect(choose(EMPTY, "Eye of newt")).toBe(EMPTY);
  });
});

describe("setForm", () => {
  it("changes how an ingredient goes in", () => {
    expect(setForm(pick("Lemon", "Ginger"), "Ginger", "dried")).toEqual([
      { name: "Lemon" },
      { form: "dried", name: "Ginger" },
    ]);
  });

  it("refuses a form the ingredient does not come in", () => {
    const selection = pick("Lemon", "Ginger");

    expect(setForm(selection, "Ginger", "powder")).toBe(selection);
    expect(setForm(selection, "Lemon", "dried")).toBe(selection);
  });
});

describe("isReady", () => {
  it("wants two to four ingredients", () => {
    expect(isReady(pick("Lemon"))).toBe(false);
    expect(isReady(pick("Lemon", "Honey"))).toBe(true);
    expect(isReady(pick("Lemon", "Ginger", "Honey", "Cayenne"))).toBe(true);
  });
});

describe("isValidSelection", () => {
  it("takes two to four different ingredients in forms they come in", () => {
    expect(isValidSelection(pick("Lemon", "Ginger", "Honey"))).toBe(true);
  });

  it("refuses too few, too many and repeats", () => {
    expect(isValidSelection([{ name: "Lemon" }])).toBe(false);
    expect(
      isValidSelection([
        { name: "Lemon" },
        { name: "Lime" },
        { name: "Honey" },
        { name: "Apple" },
        { name: "Orange" },
      ])
    ).toBe(false);
    expect(isValidSelection([{ name: "Lemon" }, { name: "Lemon" }])).toBe(
      false
    );
  });

  it("refuses what is not in the pantry, and forms that do not fit", () => {
    expect(isValidSelection([{ name: "Lemon" }, { name: "Newt" }])).toBe(false);
    expect(
      isValidSelection([{ name: "Lemon" }, { form: "powder", name: "Ginger" }])
    ).toBe(false);
    expect(isValidSelection([{ name: "Lemon" }, { name: "Ginger" }])).toBe(
      false
    );
    expect(
      isValidSelection([{ form: "dried", name: "Lemon" }, { name: "Honey" }])
    ).toBe(false);
  });
});
