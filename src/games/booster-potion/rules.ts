import { FORMS, PANTRY, RECIPES } from "./pantry";
import type { Form, Kind, Recipe } from "./pantry";

/** An ingredient in the cauldron or a recipe, with its form if it has one. */
export interface Part {
  name: string;
  form?: Form;
}

/** The ingredients in the cauldron, in the order they went in. */
export type Selection = readonly Part[];

export type Brewed =
  | { type: "potion"; recipe: Recipe; isNew: boolean }
  | {
      type: "mystery";
      /** How many ingredients went in. */
      size: number;
      /** A potion with exactly these ingredients, some in another form. */
      wrongForm: { recipe: Recipe; wanted: readonly Part[] } | null;
      /** The unfound potion sharing the most of these ingredients, if any. */
      closest: { recipe: Recipe; shared: number } | null;
    };

/** A brew takes two to four ingredients, as the real recipes do. */
export const MIN_INGREDIENTS = 2;
export const MAX_INGREDIENTS = 4;

export const EMPTY: Selection = [];

const KIND_OF = new Map<string, Kind>(
  Object.entries(PANTRY).flatMap(([kind, names]) =>
    // SAFETY: PANTRY's keys are exactly the kinds; Object.entries widens them.
    names.map((name) => [name, kind as Kind] as const)
  )
);

export const kindOf = (name: string): Kind | undefined => KIND_OF.get(name);

/** The forms an ingredient comes in; none for most. */
export const formsOf = (name: string): readonly Form[] => FORMS.get(name) ?? [];

/** A recipe's ingredients with their forms. */
export const partsOf = (recipe: Recipe): readonly Part[] =>
  recipe.ingredients.map((name) => {
    const form = recipe.forms?.[name];

    return form ? { form, name } : { name };
  });

/** "Fresh ginger", "Turmeric powder", "Lemon". */
export const labelOf = ({ form, name }: Part) => {
  if (form === "powder") {
    return `${name} powder`;
  }

  return form
    ? `${form[0]?.toUpperCase()}${form.slice(1)} ${name.toLowerCase()}`
    : name;
};

/**
 * Pressing an ingredient: takes it out if it is in, and otherwise adds it in
 * its first form, pushing out the oldest when the cauldron holds four.
 */
export const choose = (selection: Selection, name: string): Selection => {
  if (!kindOf(name)) {
    return selection;
  }

  if (selection.some((part) => part.name === name)) {
    return selection.filter((part) => part.name !== name);
  }

  const [form] = formsOf(name);
  const part: Part = form ? { form, name } : { name };

  return [...selection, part].slice(-MAX_INGREDIENTS);
};

/** Changes the form of an ingredient already in the cauldron. */
export const setForm = (
  selection: Selection,
  name: string,
  form: Form
): Selection =>
  formsOf(name).includes(form)
    ? selection.map((part) => (part.name === name ? { form, name } : part))
    : selection;

export const isReady = (selection: Selection) =>
  selection.length >= MIN_INGREDIENTS;

const sameNames = (recipe: Recipe, selection: Selection) =>
  recipe.ingredients.length === selection.length &&
  selection.every((part) => recipe.ingredients.includes(part.name));

const sharedWith = (recipe: Recipe, selection: Selection) =>
  selection.filter((part) => recipe.ingredients.includes(part.name)).length;

/**
 * Brews what is in the cauldron: a known potion when it is exactly one of
 * the recipes, forms and all, in any order. Otherwise a mystery, with a
 * hint: the form to change when only forms are wrong, or else the closest
 * potion not yet found.
 */
export const brew = (
  selection: Selection,
  found: readonly string[]
): Brewed => {
  const matching = RECIPES.filter((r) => sameNames(r, selection));

  const recipe = matching.find((r) =>
    selection.every((part) => r.forms?.[part.name] === part.form)
  );

  if (recipe) {
    return { isNew: !found.includes(recipe.name), recipe, type: "potion" };
  }

  const [nearly] = matching;

  const wrongForm = nearly
    ? {
        recipe: nearly,
        wanted: partsOf(nearly).filter(
          (part) =>
            selection.find((chosen) => chosen.name === part.name)?.form !==
            part.form
        ),
      }
    : null;

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

  return { closest, size: selection.length, type: "mystery", wrongForm };
};
