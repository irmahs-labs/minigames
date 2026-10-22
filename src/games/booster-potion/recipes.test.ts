import { describe, expect, it } from "vitest";

import { partsOf } from "./brewing";
import { FORMS, PANTRY, TIPS } from "./pantry";
import { RECIPES } from "./recipes";
import { formsOf, isValidSelection, kindOf, labelOf } from "./rules";

const ALL_FOUND = RECIPES.map((recipe) => recipe.name);

/** Shops and product pages a recipe once linked to, instead of a recipe. */
const SHOPS = [
  "brake.co.uk",
  "cookunity.com",
  "costco.com",
  "morrisons.com",
  "ocado.com",
  "onlineapo.at",
  "voelkel.bio",
];

describe("the recipe book", () => {
  it("has a hundred potions with different names", () => {
    expect(RECIPES).toHaveLength(100);
    expect(new Set(ALL_FOUND).size).toBe(100);
  });

  it("lists each ingredient on one shelf only", () => {
    const names = Object.values(PANTRY).flat();

    expect(new Set(names).size).toBe(names.length);
  });

  it.each(RECIPES)(
    "$name takes two to four different ingredients from the pantry",
    (recipe) => {
      expect(recipe.ingredients.length).toBeGreaterThanOrEqual(2);
      expect(recipe.ingredients.length).toBeLessThanOrEqual(4);
      expect(new Set(recipe.ingredients).size).toBe(recipe.ingredients.length);
      expect(recipe.ingredients.every((name) => kindOf(name))).toBe(true);
    }
  );

  it.each(RECIPES)(
    "$name gives a form exactly where one is needed",
    (recipe) => {
      for (const { form, name } of partsOf(recipe)) {
        const forms = formsOf(name);

        expect(form === undefined ? forms.length : forms.includes(form)).toBe(
          form === undefined ? 0 : true
        );
      }

      expect(
        Object.keys(recipe.forms ?? {}).every((name) =>
          recipe.ingredients.includes(name)
        )
      ).toBe(true);
    }
  );

  it.each(RECIPES)("$name comes from a real recipe", (recipe) => {
    expect(recipe.source).toMatch(/^https:\/\/\S+$/u);
    expect(recipe.note).not.toBe("");
  });

  it("uses every ingredient in the pantry, and every form", () => {
    const parts = RECIPES.flatMap((recipe) => partsOf(recipe));
    const used = new Set(parts.map((part) => part.name));

    expect(Object.values(PANTRY).flat().toSorted()).toEqual(
      [...used].toSorted()
    );

    for (const [name, forms] of FORMS) {
      for (const form of forms) {
        expect(parts).toContainEqual({ form, name });
      }
    }
  });

  it("has a tip for every ingredient, and none for anything else", () => {
    const names = Object.values(PANTRY).flat().toSorted();

    expect([...TIPS.keys()].toSorted()).toEqual(names);
  });

  it.each(RECIPES)("$name can be put in the cauldron", (recipe) => {
    expect(isValidSelection(partsOf(recipe))).toBe(true);
  });

  it.each(RECIPES)("$name links to a recipe, not a shop", (recipe) => {
    const { hostname } = new URL(recipe.source);

    expect(SHOPS.some((shop) => hostname.endsWith(shop))).toBe(false);
  });

  it("keeps every shelf in alphabetical order", () => {
    for (const names of Object.values(PANTRY)) {
      expect(names).toEqual(names.toSorted((a, b) => a.localeCompare(b)));
    }
  });

  it("makes every potion from a different mix", () => {
    const mixes = RECIPES.map((recipe) =>
      partsOf(recipe).map(labelOf).toSorted().join("|")
    );

    expect(new Set(mixes).size).toBe(mixes.length);
  });
});
