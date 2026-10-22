/**
 * Brewing and the recipe book's pages, worked out on the server: this reads
 * the recipes, which the page never sees. Never import it from the game's
 * React code.
 */
import type { BrewAnswer, FoundPage, Page } from "./api";
import { RECIPES } from "./recipes";
import type { Recipe } from "./recipes";
import { kindOf, labelOf } from "./rules";
import type { Part, Selection } from "./rules";

/** Who has brewed a potion, as the database tells it. */
export interface Brewers {
  /** The first to brew it: "Irma H.". */
  by: string;
  /** How many people have brewed it, the first included. */
  count: number;
  /** The player asking is one of them. */
  yours: boolean;
}

/** A recipe's ingredients with their forms. */
export const partsOf = (recipe: Recipe): readonly Part[] =>
  recipe.ingredients.map((name) => {
    const form = recipe.forms?.[name];

    return form ? { form, name } : { name };
  });

/** A locked page's clue: "fruit + dried spice + sweetener". */
export const clueOf = (recipe: Recipe) =>
  partsOf(recipe)
    .map(({ form, name }) => {
      const kind = kindOf(name) ?? "fruit";

      return form ? `${form} ${kind}` : kind;
    })
    .join(" + ");

export const foundPageOf = (recipe: Recipe, brewers: Brewers): FoundPage => ({
  by: brewers.by,
  ingredients: partsOf(recipe).map(labelOf),
  name: recipe.name,
  note: recipe.note,
  others: brewers.count - 1,
  source: recipe.source,
  state: "found",
  yours: brewers.yours,
});

/** Every page of the shared book, found or still locked. */
export const bookOf = (brews: ReadonlyMap<string, Brewers>): Page[] =>
  RECIPES.map((recipe) => {
    const brewers = brews.get(recipe.name);

    return brewers
      ? foundPageOf(recipe, brewers)
      : { clue: clueOf(recipe), state: "locked" };
  });

const sameNames = (recipe: Recipe, selection: Selection) =>
  recipe.ingredients.length === selection.length &&
  selection.every((part) => recipe.ingredients.includes(part.name));

const sharedWith = (recipe: Recipe, selection: Selection) =>
  selection.filter((part) => recipe.ingredients.includes(part.name)).length;

export type Brewed =
  | { type: "potion"; recipe: Recipe }
  | Extract<BrewAnswer, { type: "mystery" }>;

/**
 * Brews what is in the cauldron: a known potion when it is exactly one of
 * the recipes, forms and all, in any order. Otherwise a mystery, with a
 * hint: the forms to change when only forms are wrong, or else the closest
 * potion nobody has found yet.
 */
export const brew = (
  selection: Selection,
  found: ReadonlySet<string>
): Brewed => {
  const matching = RECIPES.filter((r) => sameNames(r, selection));

  const recipe = matching.find((r) =>
    selection.every((part) => r.forms?.[part.name] === part.form)
  );

  if (recipe) {
    return { recipe, type: "potion" };
  }

  const [nearly] = matching;

  const wrongForm = nearly
    ? {
        name: nearly.name,
        wanted: partsOf(nearly)
          .filter(
            (part) =>
              selection.find((chosen) => chosen.name === part.name)?.form !==
              part.form
          )
          .map(labelOf),
      }
    : null;

  let closest: { name: string; needs: number; shared: number } | null = null;

  for (const candidate of RECIPES) {
    const shared = sharedWith(candidate, selection);

    if (
      !found.has(candidate.name) &&
      shared > 0 &&
      shared > (closest?.shared ?? 0)
    ) {
      closest = {
        name: candidate.name,
        needs: candidate.ingredients.length,
        shared,
      };
    }
  }

  return { closest, size: selection.length, type: "mystery", wrongForm };
};
