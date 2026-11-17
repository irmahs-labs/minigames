import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

import {
  ArenaIcon,
  QuizzesIcon,
  SuperTicTacToeIcon,
  WheelIcon,
} from "./components/app-icons";
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
export interface Game {
  slug: string;
  /** Its name and the card's line, in each of the site's languages. */
  name: Record<Language, string>;
  blurb: Record<Language, string>;
  /** The card's filename, on its pill, with a real extension: "wheel-of-fortune.exe". */
  legend: string;
  /** Its 40-grid icon, on its hub card and in its header. */
  Icon: ComponentType;
  /** What the hub's card names inside it, as pills under its line. */
  inside: readonly Record<Language, string>[];
  /** Whether the pages under /<slug>/ are its own too, as each quiz is. */
  nested?: boolean;
  /**
   * A nested game's pages, for its tabs and the phone's menu: "" is the game
   * itself. Named here, so the header needn't load the pages to list them.
   */
  pages?: readonly { slug: string; name: Record<Language, string> }[];
  Screen: LazyExoticComponent<ComponentType<GameProps>>;
}

export const GAMES: readonly Game[] = [
  {
    Icon: WheelIcon,
    Screen: lazy(() => import("./games/wheel-of-fortune/wheel-of-fortune")),
    blurb: {
      en: "Spin a wheel of names, a wheel of doom, or a wheel of your own.",
      fr: "Faites tourner une roue de prénoms, une roue du destin, ou la vôtre.",
    },
    inside: [
      { en: "Names", fr: "Prénoms" },
      { en: "Death", fr: "Fin du monde" },
      { en: "Your own", fr: "La vôtre" },
    ],
    legend: "wheel-of-fortune.exe",
    name: { en: "Wheel of Fortune", fr: "Roue de la fortune" },
    slug: "wheel-of-fortune",
  },
  {
    Icon: SuperTicTacToeIcon,
    Screen: lazy(() => import("./games/super-tic-tac-toe/super-tic-tac-toe")),
    blurb: {
      en: "Nine games of tic-tac-toe, one on each planet. Conquer three planets in a row to win.",
      fr: "Neuf parties de morpion, une sur chaque planète. Conquérez trois planètes alignées pour gagner.",
    },
    inside: [
      { en: "Same screen", fr: "Même écran" },
      { en: "Online", fr: "En ligne" },
      { en: "Leaderboard", fr: "Classement" },
    ],
    legend: "super-tic-tac-toe.exe",
    name: { en: "Super Tic-Tac-Toe", fr: "Super Morpion" },
    slug: "super-tic-tac-toe",
  },
  {
    Icon: ArenaIcon,
    Screen: lazy(() => import("./games/the-arena/the-arena")),
    blurb: {
      en: "Put your friends in districts, send them into the arena, and follow them day by day until one is left standing.",
      fr: "Répartissez vos amis en districts, envoyez-les dans l’arène, et suivez-les jour après jour jusqu’au dernier debout.",
    },
    inside: [
      { en: "Up to 12 districts", fr: "Jusqu’à 12 districts" },
      { en: "Day by day", fr: "Jour après jour" },
    ],
    legend: "the-arena.exe",
    name: { en: "The Arena", fr: "L’Arène" },
    slug: "the-arena",
  },
  {
    Icon: QuizzesIcon,
    Screen: lazy(() => import("./games/quizzes/quizzes")),
    blurb: {
      en: "Personality quizzes, starting with the big one: what type of witch are you?",
      fr: "Des quiz de personnalité, à commencer par le grand : quel type de sorcière êtes-vous ?",
    },
    inside: [
      { en: "Witch", fr: "Sorcière" },
      { en: "Life partner", fr: "Partenaire de vie" },
    ],
    legend: "quizzes.exe",
    name: { en: "Quizzes", fr: "Quiz" },
    nested: true,
    pages: [
      { name: { en: "All quizzes", fr: "Tous les quiz" }, slug: "" },
      {
        name: { en: "What type of witch?", fr: "Quel type de sorcière ?" },
        slug: "what-type-of-witch",
      },
      {
        name: { en: "Life partner?", fr: "Partenaire de vie ?" },
        slug: "are-they-your-life-partner",
      },
    ],
    slug: "quizzes",
  },
];
