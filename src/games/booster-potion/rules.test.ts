import { describe, expect, it } from "vitest";

import { PANTRY, RECIPES, TIPS } from "./pantry";
import { EMPTY, brew, choose, isReady, kindOf } from "./rules";
import type { Selection } from "./rules";

const pick = (...names: string[]) => {
  let selection: Selection = EMPTY;

  for (const name of names) {
    selection = choose(selection, name);
  }

  return selection;
};

const ALL_FOUND = RECIPES.map((recipe) => recipe.name);

describe("the recipe book", () => {
  it("has fifty potions with different names", () => {
    expect(RECIPES).toHaveLength(50);
    expect(new Set(ALL_FOUND).size).toBe(50);
  });

  it("lists each ingredient on one shelf only", () => {
    const names = Object.values(PANTRY).flat();

    expect(new Set(names).size).toBe(names.length);
  });

  it.each(RECIPES)(
    "$name takes three or four different ingredients from the pantry",
    (recipe) => {
      expect(recipe.ingredients.length).toBeGreaterThanOrEqual(3);
      expect(recipe.ingredients.length).toBeLessThanOrEqual(4);
      expect(new Set(recipe.ingredients).size).toBe(recipe.ingredients.length);
      expect(recipe.ingredients.every((name) => kindOf(name))).toBe(true);
    }
  );

  it.each(RECIPES)("$name comes from a real recipe", (recipe) => {
    expect(recipe.source).toMatch(/^https:\/\/\S+$/u);
    expect(recipe.note).not.toBe("");
  });

  it("uses every ingredient in the pantry in some potion", () => {
    const used = new Set(RECIPES.flatMap((recipe) => recipe.ingredients));

    expect(Object.values(PANTRY).flat().toSorted()).toEqual(
      [...used].toSorted()
    );
  });

  it("has a tip for every ingredient, and none for anything else", () => {
    const names = Object.values(PANTRY).flat().toSorted();

    expect([...TIPS.keys()].toSorted()).toEqual(names);
  });

  it("makes every potion from a different mix", () => {
    const mixes = RECIPES.map((recipe) =>
      recipe.ingredients.toSorted().join("|")
    );

    expect(new Set(mixes).size).toBe(mixes.length);
  });
});

describe("choose", () => {
  it("adds ingredients from any shelves, in order", () => {
    expect(pick("Lemon", "Ginger", "Turmeric", "Black pepper")).toEqual([
      "Lemon",
      "Ginger",
      "Turmeric",
      "Black pepper",
    ]);
  });

  it("takes an ingredient out when it is pressed again", () => {
    expect(pick("Lemon", "Ginger", "Lemon")).toEqual(["Ginger"]);
  });

  it("pushes out the oldest when a fifth goes in", () => {
    expect(pick("Lemon", "Ginger", "Honey", "Mint", "Lime")).toEqual([
      "Ginger",
      "Honey",
      "Mint",
      "Lime",
    ]);
  });

  it("ignores names that are not in the pantry", () => {
    expect(choose(EMPTY, "Eye of newt")).toBe(EMPTY);
  });
});

describe("isReady", () => {
  it("wants three or four ingredients", () => {
    expect(isReady(pick("Lemon", "Ginger"))).toBe(false);
    expect(isReady(pick("Lemon", "Ginger", "Honey"))).toBe(true);
    expect(isReady(pick("Lemon", "Ginger", "Honey", "Cayenne"))).toBe(true);
  });
});

describe("brew", () => {
  it("makes the potion whose ingredients are in, in any order", () => {
    const brewed = brew(pick("Cayenne", "Ginger", "Lime", "Apple"), []);

    expect(brewed).toMatchObject({
      isNew: true,
      recipe: { name: "Ember's Embrace" },
      type: "potion",
    });
  });

  it("makes a three-ingredient potion from exactly those three", () => {
    const brewed = brew(pick("Honey", "Matcha", "Lemon"), []);

    expect(brewed).toMatchObject({
      recipe: { name: "Sylvan Glow" },
      type: "potion",
    });
  });

  it("knows a potion that was found before", () => {
    const brewed = brew(pick("Apple", "Lime", "Ginger", "Cayenne"), [
      "Ember's Embrace",
    ]);

    expect(brewed).toMatchObject({ isNew: false, type: "potion" });
  });

  it("hints at the unfound potion sharing the most ingredients", () => {
    // Apple, Lime and Ginger are in Ember's Embrace; Mint is not.
    const brewed = brew(pick("Apple", "Lime", "Ginger", "Mint"), []);

    expect(brewed).toEqual({
      closest: { recipe: RECIPES[0], shared: 3 },
      size: 4,
      type: "mystery",
    });
  });

  it("hints at a three-ingredient potion with one thing too many", () => {
    const others = ALL_FOUND.filter((name) => name !== "Sylvan Glow");
    const brewed = brew(pick("Lemon", "Matcha", "Honey", "Mint"), others);

    expect(brewed).toMatchObject({
      closest: { recipe: { name: "Sylvan Glow" }, shared: 3 },
      type: "mystery",
    });
  });

  it("leaves found potions out of the hint", () => {
    const brewed = brew(pick("Apple", "Lime", "Ginger", "Mint"), [
      "Ember's Embrace",
    ]);

    expect(brewed).toMatchObject({ closest: { shared: 3 }, type: "mystery" });
    expect(brewed).not.toMatchObject({
      closest: { recipe: { name: "Ember's Embrace" } },
    });
  });

  it("gives no hint when every potion is found", () => {
    const brewed = brew(pick("Kale", "Mango", "Rosemary"), ALL_FOUND);

    expect(brewed).toEqual({ closest: null, size: 3, type: "mystery" });
  });
});
