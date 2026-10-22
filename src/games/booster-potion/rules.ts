import { BASE_KINDS, PANTRY, RECIPES } from "./pantry";
import type { BaseKind, Kind, Recipe } from "./pantry";

/** The ingredients in the cauldron, by name: up to two of each group. */
export interface Selection {
  bases: readonly string[];
  toppings: readonly string[];
}

export type Brewed =
  | { type: "potion"; recipe: Recipe; isNew: boolean }
  | {
      type: "mystery";
      /** The unfound potion sharing the most of these ingredients, if any. */
      closest: { recipe: Recipe; shared: number } | null;
    };

export const EMPTY: Selection = { bases: [], toppings: [] };

const KIND_OF = new Map<string, Kind>(
  Object.entries(PANTRY).flatMap(([kind, names]) =>
    // SAFETY: PANTRY's keys are exactly the kinds; Object.entries widens them.
    names.map((name) => [name, kind as Kind] as const)
  )
);

export const kindOf = (name: string): Kind | undefined => KIND_OF.get(name);

const isBaseKind = (kind: Kind): kind is BaseKind =>
  BASE_KINDS.some((base) => base === kind);

/**
 * Pressing an ingredient: takes it out if it is in, and otherwise adds it,
 * pushing out the oldest of its group when that group already holds two.
 * Two of a kind are fine: lemon and apple, ginger and turmeric.
 */
export const choose = (selection: Selection, name: string): Selection => {
  const kind = kindOf(name);

  if (!kind) {
    return selection;
  }

  const group = isBaseKind(kind) ? "bases" : "toppings";
  const chosen = selection[group];

  if (chosen.includes(name)) {
    return { ...selection, [group]: chosen.filter((n) => n !== name) };
  }

  return { ...selection, [group]: [...chosen, name].slice(-2) };
};

export const isReady = (selection: Selection) =>
  selection.bases.length === 2 && selection.toppings.length === 2;

export const ingredientsOf = (recipe: Recipe): readonly string[] => [
  ...recipe.bases,
  ...recipe.toppings,
];

const sharedWith = (recipe: Recipe, names: readonly string[]) =>
  ingredientsOf(recipe).filter((name) => names.includes(name)).length;

/**
 * Brews the four ingredients in the cauldron: a known potion when they are
 * exactly one of the recipes, in any order, and otherwise a mystery, with the
 * closest potion not yet found as the hint.
 */
export const brew = (
  selection: Selection,
  found: readonly string[]
): Brewed => {
  const names = [...selection.bases, ...selection.toppings];
  const recipe = RECIPES.find((r) => sharedWith(r, names) === 4);

  if (recipe) {
    return { isNew: !found.includes(recipe.name), recipe, type: "potion" };
  }

  let closest: { recipe: Recipe; shared: number } | null = null;

  for (const candidate of RECIPES) {
    const shared = sharedWith(candidate, names);

    if (
      !found.includes(candidate.name) &&
      shared > 0 &&
      shared > (closest?.shared ?? 0)
    ) {
      closest = { recipe: candidate, shared };
    }
  }

  return { closest, type: "mystery" };
};
