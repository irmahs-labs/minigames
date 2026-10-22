import { PANTRY, RECIPES } from "./pantry";
import type { Kind, Recipe } from "./pantry";

/** The ingredients in the cauldron, by name, in the order they went in. */
export type Selection = readonly string[];

export type Brewed =
  | { type: "potion"; recipe: Recipe; isNew: boolean }
  | {
      type: "mystery";
      /** How many ingredients went in. */
      size: number;
      /** The unfound potion sharing the most of these ingredients, if any. */
      closest: { recipe: Recipe; shared: number } | null;
    };

/** A brew takes three or four ingredients, as the real recipes do. */
export const MIN_INGREDIENTS = 3;
export const MAX_INGREDIENTS = 4;

export const EMPTY: Selection = [];

const KIND_OF = new Map<string, Kind>(
  Object.entries(PANTRY).flatMap(([kind, names]) =>
    // SAFETY: PANTRY's keys are exactly the kinds; Object.entries widens them.
    names.map((name) => [name, kind as Kind] as const)
  )
);

export const kindOf = (name: string): Kind | undefined => KIND_OF.get(name);

/**
 * Pressing an ingredient: takes it out if it is in, and otherwise adds it,
 * pushing out the oldest when the cauldron already holds four.
 */
export const choose = (selection: Selection, name: string): Selection => {
  if (!kindOf(name)) {
    return selection;
  }

  if (selection.includes(name)) {
    return selection.filter((n) => n !== name);
  }

  return [...selection, name].slice(-MAX_INGREDIENTS);
};

export const isReady = (selection: Selection) =>
  selection.length >= MIN_INGREDIENTS;

const sharedWith = (recipe: Recipe, names: Selection) =>
  recipe.ingredients.filter((name) => names.includes(name)).length;

/**
 * Brews what is in the cauldron: a known potion when it is exactly one of
 * the recipes, in any order, and otherwise a mystery, with the closest
 * potion not yet found as the hint.
 */
export const brew = (
  selection: Selection,
  found: readonly string[]
): Brewed => {
  const recipe = RECIPES.find(
    (r) =>
      r.ingredients.length === selection.length &&
      sharedWith(r, selection) === selection.length
  );

  if (recipe) {
    return { isNew: !found.includes(recipe.name), recipe, type: "potion" };
  }

  let closest: { recipe: Recipe; shared: number } | null = null;

  for (const candidate of RECIPES) {
    const shared = sharedWith(candidate, selection);

    if (
      !found.includes(candidate.name) &&
      shared > 0 &&
      shared > (closest?.shared ?? 0)
    ) {
      closest = { recipe: candidate, shared };
    }
  }

  return { closest, size: selection.length, type: "mystery" };
};
