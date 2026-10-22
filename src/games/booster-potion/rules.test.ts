import { describe, expect, it } from "vitest";

import { BASE_KINDS, PANTRY, RECIPES, TOPPING_KINDS } from "./pantry";
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

  it.each(RECIPES)(
    "$name takes two bases and two toppings of different kinds",
    (recipe) => {
      const bases = recipe.bases.map(kindOf);
      const toppings = recipe.toppings.map(kindOf);

      expect(bases.every((kind) => BASE_KINDS.some((k) => k === kind))).toBe(
        true
      );
      expect(
        toppings.every((kind) => TOPPING_KINDS.some((k) => k === kind))
      ).toBe(true);
      expect(bases[0]).not.toBe(bases[1]);
      expect(toppings[0]).not.toBe(toppings[1]);
    }
  );

  it("makes every potion from a different four", () => {
    const sets = RECIPES.map((recipe) =>
      [...recipe.bases, ...recipe.toppings].toSorted().join("|")
    );

    expect(new Set(sets).size).toBe(sets.length);
  });
});

describe("choose", () => {
  it("puts bases and toppings in their own groups", () => {
    expect(pick("Apple", "Mint", "Tea", "Chia")).toEqual({
      bases: ["Apple", "Tea"],
      toppings: ["Mint", "Chia"],
    });
  });

  it("takes an ingredient out when it is pressed again", () => {
    expect(pick("Apple", "Tea", "Apple")).toEqual({
      bases: ["Tea"],
      toppings: [],
    });
  });

  it("swaps an ingredient for another of the same kind, in its place", () => {
    expect(pick("Apple", "Tea", "Lemon").bases).toEqual(["Lemon", "Tea"]);
  });

  it("pushes out the oldest when a full group gets a third kind", () => {
    expect(pick("Apple", "Tea", "Kale").bases).toEqual(["Tea", "Kale"]);
  });

  it("ignores names that are not in the pantry", () => {
    expect(choose(EMPTY, "Eye of newt")).toBe(EMPTY);
  });
});

describe("isReady", () => {
  it("wants exactly two bases and two toppings", () => {
    expect(isReady(pick("Apple", "Tea", "Mint"))).toBe(false);
    expect(isReady(pick("Apple", "Tea", "Mint", "Chia"))).toBe(true);
  });
});

describe("brew", () => {
  it("makes the potion whose four ingredients are in, in any order", () => {
    const brewed = brew(pick("Flax", "Celery", "Cinnamon", "Apple"), []);

    expect(brewed).toMatchObject({
      isNew: true,
      recipe: { name: "Whispering Woods" },
      type: "potion",
    });
  });

  it("can brew the potion with Cardamom in it", () => {
    const brewed = brew(
      pick("Coconut Water", "Pineapple", "Chrysanthemum", "Cardamom"),
      []
    );

    expect(brewed).toMatchObject({
      recipe: { name: "Tide of Tranquility" },
      type: "potion",
    });
  });

  it("knows a potion that was found before", () => {
    const brewed = brew(pick("Apple", "Celery", "Cinnamon", "Flax"), [
      "Whispering Woods",
    ]);

    expect(brewed).toMatchObject({ isNew: false, type: "potion" });
  });

  it("hints at the unfound potion sharing the most ingredients", () => {
    // Apple, Celery and Cinnamon are in Whispering Woods; Mint is not.
    const brewed = brew(pick("Apple", "Celery", "Cinnamon", "Mint"), []);

    expect(brewed).toEqual({
      closest: { recipe: RECIPES[0], shared: 3 },
      type: "mystery",
    });
  });

  it("leaves found potions out of the hint", () => {
    const brewed = brew(pick("Apple", "Celery", "Cinnamon", "Mint"), [
      "Whispering Woods",
    ]);

    expect(brewed).toMatchObject({
      closest: { shared: 2 },
      type: "mystery",
    });
    expect(brewed).not.toMatchObject({
      closest: { recipe: { name: "Whispering Woods" } },
    });
  });

  it("gives no hint when nothing matches a potion still to find", () => {
    const all = RECIPES.map((recipe) => recipe.name);

    const brewed = brew(
      pick("Watermelon", "Coconut Water", "Hemp", "Hibiscus"),
      all
    );

    expect(brewed).toEqual({ closest: null, type: "mystery" });
  });
});
