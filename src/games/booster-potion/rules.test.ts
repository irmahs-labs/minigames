import { describe, expect, it } from "vitest";

import { BASE_KINDS, PANTRY, RECIPES, TIPS, TOPPING_KINDS } from "./pantry";
import { EMPTY, brew, choose, isReady, kindOf } from "./rules";
import type { Selection } from "./rules";

const pick = (...names: string[]) => {
  let selection: Selection = EMPTY;

  for (const name of names) {
    selection = choose(selection, name);
  }

  return selection;
};

describe("the recipe book", () => {
  it("has twenty potions with different names", () => {
    expect(RECIPES).toHaveLength(20);
    expect(new Set(RECIPES.map((recipe) => recipe.name)).size).toBe(20);
  });

  it("lists each ingredient on one shelf only", () => {
    const names = Object.values(PANTRY).flat();

    expect(new Set(names).size).toBe(names.length);
  });

  it.each(RECIPES)("$name takes two bases and two toppings", (recipe) => {
    const bases = recipe.bases.map(kindOf);
    const toppings = recipe.toppings.map(kindOf);

    expect(bases.every((kind) => BASE_KINDS.some((k) => k === kind))).toBe(
      true
    );
    expect(
      toppings.every((kind) => TOPPING_KINDS.some((k) => k === kind))
    ).toBe(true);
    expect(recipe.bases[0]).not.toBe(recipe.bases[1]);
    expect(recipe.toppings[0]).not.toBe(recipe.toppings[1]);
  });

  it("has a tip for every ingredient, and none for anything else", () => {
    const names = Object.values(PANTRY).flat().toSorted();

    expect([...TIPS.keys()].toSorted()).toEqual(names);
  });

  it("makes every potion from a different four", () => {
    const sets = RECIPES.map((recipe) =>
      [...recipe.bases, ...recipe.toppings].toSorted().join("|")
    );

    expect(new Set(sets).size).toBe(sets.length);
  });
});

describe("choose", () => {
  it("puts bases and toppings in their own groups", () => {
    expect(pick("Apple", "Mint", "Tea", "Honey")).toEqual({
      bases: ["Apple", "Tea"],
      toppings: ["Mint", "Honey"],
    });
  });

  it("takes an ingredient out when it is pressed again", () => {
    expect(pick("Apple", "Tea", "Apple")).toEqual({
      bases: ["Tea"],
      toppings: [],
    });
  });

  it("takes two of a kind, like lemon and apple, ginger and turmeric", () => {
    expect(pick("Lemon", "Apple", "Ginger", "Turmeric")).toEqual({
      bases: ["Lemon", "Apple"],
      toppings: ["Ginger", "Turmeric"],
    });
  });

  it("pushes out the oldest when a full group gets a third", () => {
    expect(pick("Apple", "Tea", "Kale").bases).toEqual(["Tea", "Kale"]);
  });

  it("ignores names that are not in the pantry", () => {
    expect(choose(EMPTY, "Eye of newt")).toBe(EMPTY);
  });
});

describe("isReady", () => {
  it("wants exactly two bases and two toppings", () => {
    expect(isReady(pick("Apple", "Tea", "Mint"))).toBe(false);
    expect(isReady(pick("Apple", "Tea", "Mint", "Honey"))).toBe(true);
  });
});

describe("brew", () => {
  it("makes the potion whose four ingredients are in, in any order", () => {
    const brewed = brew(pick("Cayenne", "Apple", "Ginger", "Lemon"), []);

    expect(brewed).toMatchObject({
      isNew: true,
      recipe: { name: "Ember's Embrace" },
      type: "potion",
    });
  });

  it("makes the orange, carrot, ginger and turmeric shot", () => {
    const brewed = brew(pick("Orange", "Carrot", "Ginger", "Turmeric"), []);

    expect(brewed).toMatchObject({
      recipe: { name: "Golden Harvest" },
      type: "potion",
    });
  });

  it("knows a potion that was found before", () => {
    const brewed = brew(pick("Lemon", "Apple", "Ginger", "Cayenne"), [
      "Ember's Embrace",
    ]);

    expect(brewed).toMatchObject({ isNew: false, type: "potion" });
  });

  it("hints at the unfound potion sharing the most ingredients", () => {
    // Lemon, Apple and Ginger are in Ember's Embrace; Turmeric is not.
    const brewed = brew(pick("Lemon", "Apple", "Ginger", "Turmeric"), []);

    expect(brewed).toEqual({
      closest: { recipe: RECIPES[0], shared: 3 },
      type: "mystery",
    });
  });

  it("leaves found potions out of the hint", () => {
    const brewed = brew(pick("Lemon", "Apple", "Ginger", "Turmeric"), [
      "Ember's Embrace",
    ]);

    expect(brewed).toMatchObject({
      closest: { recipe: { name: "Golden Harvest" }, shared: 2 },
      type: "mystery",
    });
  });

  it("gives no hint when nothing matches a potion still to find", () => {
    const all = RECIPES.map((recipe) => recipe.name);

    const brewed = brew(pick("Watermelon", "Tea", "Sage", "Maca"), all);

    expect(brewed).toEqual({ closest: null, type: "mystery" });
  });
});
