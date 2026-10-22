import { describe, expect, it } from "vitest";

import { FORMS, PANTRY, RECIPES, TIPS } from "./pantry";
import {
  EMPTY,
  brew,
  choose,
  formsOf,
  isReady,
  kindOf,
  labelOf,
  partsOf,
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

const ALL_FOUND = RECIPES.map((recipe) => recipe.name);

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

  it("makes every potion from a different mix", () => {
    const mixes = RECIPES.map((recipe) =>
      partsOf(recipe).map(labelOf).toSorted().join("|")
    );

    expect(new Set(mixes).size).toBe(mixes.length);
  });
});

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

describe("brew", () => {
  it("makes the potion whose ingredients are in, in any order", () => {
    const brewed = brew(pick("Cayenne", "Ginger", "Lime", "Apple"), []);

    expect(brewed).toMatchObject({
      isNew: true,
      recipe: { name: "Ember's Embrace" },
      type: "potion",
    });
  });

  it("makes a shot with fresh ginger and a tea with dried", () => {
    const shot = pick("Lemon", "Ginger", "Honey");
    const tea = setForm(shot, "Ginger", "dried");

    expect(brew(shot, [])).toMatchObject({ recipe: { name: "Bright Spark" } });
    expect(brew(tea, [])).toMatchObject({ recipe: { name: "Fireside Tea" } });
  });

  it("makes a two-ingredient potion", () => {
    const brewed = brew(
      setForm(pick("Jujube", "Ginger"), "Ginger", "dried"),
      []
    );

    expect(brewed).toMatchObject({ recipe: { name: "Autumn Hearth" } });
  });

  it("knows a potion that was found before", () => {
    const brewed = brew(pick("Apple", "Lime", "Ginger", "Cayenne"), [
      "Ember's Embrace",
    ]);

    expect(brewed).toMatchObject({ isNew: false, type: "potion" });
  });

  it("says which form to change when only the forms are wrong", () => {
    // Autumn Hearth takes dried ginger; this is fresh.
    const brewed = brew(pick("Jujube", "Ginger"), []);

    expect(brewed).toMatchObject({
      type: "mystery",
      wrongForm: {
        recipe: { name: "Autumn Hearth" },
        wanted: [{ form: "dried", name: "Ginger" }],
      },
    });
  });

  it("hints at the unfound potion sharing the most ingredients", () => {
    // Apple, Lime and Ginger are in Ember's Embrace; Mint is not.
    const brewed = brew(pick("Apple", "Lime", "Ginger", "Mint"), []);

    expect(brewed).toEqual({
      closest: { recipe: RECIPES[0], shared: 3 },
      size: 4,
      type: "mystery",
      wrongForm: null,
    });
  });

  it("leaves found potions out of the hint", () => {
    const brewed = brew(pick("Apple", "Lime", "Ginger", "Mint"), [
      "Ember's Embrace",
    ]);

    expect(brewed).not.toMatchObject({
      closest: { recipe: { name: "Ember's Embrace" } },
    });
  });

  it("gives no hint when every potion is found", () => {
    const brewed = brew(pick("Kale", "Mango", "Rosemary"), ALL_FOUND);

    expect(brewed).toEqual({
      closest: null,
      size: 3,
      type: "mystery",
      wrongForm: null,
    });
  });
});
