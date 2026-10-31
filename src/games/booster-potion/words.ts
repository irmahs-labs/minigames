import type { Language } from "../../lib/language";
import type { Form, Kind } from "./pantry";
import { TIPS } from "./pantry";
import {
  FEMININE,
  FRENCH_FORMS,
  FRENCH_KINDS,
  FRENCH_NAMES,
  FRENCH_TIPS,
} from "./pantry-fr";

/**
 * The game's words in the page's language. The server writes ingredients
 * and clues in English ("Fresh ginger", "fruit + dried spice"); these read
 * them back in French, word for word from the pantry.
 */
const FORMS: readonly Form[] = ["fresh", "dried", "powder"];

const isForm = (word: string): word is Form =>
  FORMS.some((form) => form === word);

const isKind = (word: string): word is Kind =>
  Object.hasOwn(FRENCH_KINDS, word);

/** An ingredient's name: "Ginger", or "Gingembre" in French. */
export const ingredientName = (name: string, language: Language) =>
  language === "fr" ? (FRENCH_NAMES.get(name) ?? name) : name;

/** What an ingredient is known for, in a line. */
export const tipOf = (name: string, language: Language) =>
  language === "fr" ? FRENCH_TIPS.get(name) : TIPS.get(name);

const ENGLISH_NAMES = [...FRENCH_NAMES.keys()];

const nameFor = (lowered: string) =>
  ENGLISH_NAMES.find((name) => name.toLowerCase() === lowered);

/** An ingredient as the server labels it, "Fresh ginger", in the page's language. */
export const partLabel = (label: string, language: Language) => {
  if (language === "en") {
    return label;
  }

  if (label.endsWith(" powder")) {
    const name = label.slice(0, -" powder".length);

    return `${ingredientName(name, language)} ${FRENCH_FORMS.powder.m}`;
  }

  const [first = "", ...rest] = label.split(" ");
  const form = first.toLowerCase();
  const name = nameFor(rest.join(" ").toLowerCase());

  if (isForm(form) && name) {
    const adjective = FRENCH_FORMS[form][FEMININE.has(name) ? "f" : "m"];

    return `${ingredientName(name, language)} ${adjective}`;
  }

  return ingredientName(label, language);
};

/** A shelf, with its form if it has one: "dried spice" → "épice séchée". */
export const kindLabel = (label: string, language: Language) => {
  if (language === "en") {
    return label;
  }

  const words = label.split(" ");
  const kind = words.at(-1) ?? "";
  const form = words.length > 1 ? (words[0] ?? "") : "";

  if (!isKind(kind)) {
    return label;
  }

  const french = FRENCH_KINDS[kind];

  if (!isForm(form)) {
    return french.name;
  }

  return `${french.name} ${FRENCH_FORMS[form][french.feminine ? "f" : "m"]}`;
};

const UN = { f: "une", m: "un" };

const NUMBERS = ["", "", "deux", "trois", "quatre"];

/** A plural French word: "épice séchée" → "épices séchées", "fruit frais" → "fruits frais". */
const plural = (words: string) =>
  words
    .split(" ")
    .map((word, i, all) =>
      // "en poudre" stays as it is
      word === "en" ||
      all[i - 1] === "en" ||
      word.endsWith("s") ||
      word.endsWith("x")
        ? word
        : `${word}s`
    )
    .join(" ");

/**
 * A shelf counted, in French: "dried spice" once → "une épice séchée", twice
 * → "deux épices séchées".
 */
export const countedKind = (label: string, count: number) => {
  const words = kindLabel(label, "fr");
  const kind = label.split(" ").at(-1) ?? "";
  const feminine = isKind(kind) && FRENCH_KINDS[kind].feminine;

  if (count === 1) {
    return `${UN[feminine ? "f" : "m"]} ${words}`;
  }

  return `${NUMBERS[count] ?? count} ${plural(words)}`;
};

/** A locked page's clue, "fruit + dried spice", in the page's language. */
export const clueLabel = (clue: string, language: Language) =>
  clue
    .split(" + ")
    .map((part) => kindLabel(part, language))
    .join(" + ");
