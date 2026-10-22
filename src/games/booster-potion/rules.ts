import { FORMS, PANTRY } from "./pantry";
import type { Form, Kind } from "./pantry";

/** An ingredient in the cauldron or a recipe, with its form if it has one. */
export interface Part {
  name: string;
  form?: Form;
}

/** The ingredients in the cauldron, in the order they went in. */
export type Selection = readonly Part[];

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

/**
 * What may go in a cauldron: two to four different ingredients from the
 * pantry, each in a form it comes in, or with none when it has none. The
 * server checks every brew sent to it with this.
 */
export const isValidSelection = (selection: Selection) =>
  selection.length >= MIN_INGREDIENTS &&
  selection.length <= MAX_INGREDIENTS &&
  new Set(selection.map((part) => part.name)).size === selection.length &&
  selection.every(({ form, name }) => {
    const forms = formsOf(name);

    return (
      kindOf(name) !== undefined &&
      (form === undefined ? forms.length === 0 : forms.includes(form))
    );
  });
