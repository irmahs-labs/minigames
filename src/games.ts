import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

import type { Language } from "./lib/language";

/** What every game screen is given: its own entry's name, for its heading. */
export interface GameProps {
  name: string;
}

/**
 * Every game on the site. Adding one is an entry here and a folder under
 * src/games/: the hub lists it and the app routes /<slug> to it, titling the
 * tab with its name. Each game loads only when it is opened.
 */
interface Game {
  slug: string;
  /** Its name and the card's line, in each of the site's languages. */
  name: Record<Language, string>;
  blurb: Record<Language, string>;
  /** The card's filename, on its pill, with a real extension: "booster-potion.exe". */
  legend: string;
  /** Whether the pages under /<slug>/ are its own too, as each quiz is. */
  nested?: boolean;
  Screen: LazyExoticComponent<ComponentType<GameProps>>;
}

export const GAMES: readonly Game[] = [
  {
    Screen: lazy(() => import("./games/wheel-of-fortune/wheel-of-fortune")),
    blurb: {
      en: "Spin a wheel of names, a wheel of doom, or a wheel of your own.",
      fr: "Faites tourner une roue de prénoms, une roue du destin, ou la vôtre.",
    },
    legend: "wheel-of-fortune.exe",
    name: { en: "Wheel of Fortune", fr: "Roue de la fortune" },
    slug: "wheel-of-fortune",
  },
  {
    Screen: lazy(() => import("./games/super-tic-tac-toe/super-tic-tac-toe")),
    blurb: {
      en: "Nine games of tic-tac-toe, one on each planet. Conquer three planets in a row to win.",
      fr: "Neuf parties de morpion, une sur chaque planète. Conquérez trois planètes alignées pour gagner.",
    },
    legend: "super-tic-tac-toe.exe",
    name: { en: "Super Tic-Tac-Toe", fr: "Super Morpion" },
    slug: "super-tic-tac-toe",
  },
  {
    Screen: lazy(() => import("./games/booster-potion/booster-potion")),
    blurb: {
      en: "Brew real wellness shots and teas in the cauldron, from the ginger shot to masala chai. A hundred to discover.",
      fr: "Préparez dans le chaudron de vrais shots et thés bien-être, du shot de gingembre au masala chai. Une centaine à découvrir.",
    },
    legend: "booster-potion.exe",
    name: { en: "Booster Potion", fr: "Potion tonique" },
    slug: "booster-potion",
  },
  {
    Screen: lazy(() => import("./games/book-of-shadows/book-of-shadows")),
    blurb: {
      en: "Your witch profile: the moon tonight, the Wheel of the Year, retrogrades, your birth chart and your numbers.",
      fr: "Votre profil de sorcière : la lune ce soir, la Roue de l’année, les rétrogrades, votre thème astral et vos nombres.",
    },
    legend: "book-of-shadows.exe",
    name: { en: "Book of Shadows", fr: "Livre des ombres" },
    slug: "book-of-shadows",
  },
  {
    Screen: lazy(() => import("./games/calendar/calendar")),
    blurb: {
      en: "Add the calendars you want, from moon phases to Diwali, Día de los Muertos and Bon Om Touk, and see their days month by month.",
      fr: "Ajoutez les calendriers de votre choix, des phases de la lune à Divali, Día de los Muertos et Bon Om Touk, et voyez leurs jours mois par mois.",
    },
    legend: "calendar.exe",
    name: { en: "Calendar", fr: "Calendrier" },
    slug: "calendar",
  },
  {
    Screen: lazy(() => import("./games/spell-creator/spell-creator")),
    blurb: {
      en: "Write two rhyming lines and cast them as a spell: the better the rhyme, the more powerful the spell.",
      fr: "Écrivez deux vers qui riment et lancez-les comme un sort : plus la rime est belle, plus le sort est puissant. En anglais uniquement.",
    },
    legend: "spell-creator.exe",
    name: { en: "Spell Creator", fr: "Créateur de sorts" },
    slug: "spell-creator",
  },
  {
    Screen: lazy(() => import("./games/quizzes/quizzes")),
    blurb: {
      en: "Personality quizzes, starting with the big one: what type of witch are you?",
      fr: "Des quiz de personnalité, à commencer par le grand : quel type de sorcière êtes-vous ?",
    },
    legend: "quizzes.exe",
    name: { en: "Quizzes", fr: "Quiz" },
    nested: true,
    slug: "quizzes",
  },
];
