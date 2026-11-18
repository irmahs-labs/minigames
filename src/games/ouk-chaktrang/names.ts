import type { Language } from "../../lib/language";
import type { Theme } from "./pieces";
import type { Kind, Side } from "./rules";

/** Each piece by its Khmer name, with what it means, in each language */
const KINDS: Record<Language, Record<Kind, string>> = {
  en: {
    flipped: "flipped Trey (moves as a Neang)",
    khun: "Khun (king)",
    koul: "Koul (general)",
    neang: "Neang (lady)",
    seh: "Seh (horse)",
    trey: "Trey (fish)",
    tuk: "Tuk (boat)",
  },
  fr: {
    flipped: "Trey retourné (va comme une Neang)",
    khun: "Khun (roi)",
    koul: "Koul (général)",
    neang: "Neang (dame)",
    seh: "Seh (cheval)",
    trey: "Trey (poisson)",
    tuk: "Tuk (bateau)",
  },
};

export const kindName = (kind: Kind, language: Language = "en") =>
  KINDS[language][kind];

/** The two sides as each theme calls them */
const SIDES: Record<Language, Record<Theme, Record<Side, string>>> = {
  en: {
    matcha: { black: "Green", white: "Cream" },
    "yeak-tevada": { black: "Yeak", white: "Tevada" },
  },
  fr: {
    matcha: { black: "Vert", white: "Crème" },
    "yeak-tevada": { black: "Yeak", white: "Tevada" },
  },
};

export const sideName = (side: Side, theme: Theme, language: Language = "en") =>
  SIDES[language][theme][side];
