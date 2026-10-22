import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

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
  name: string;
  blurb: string;
  /** The card's filename, on its pill. */
  legend: string;
  Screen: LazyExoticComponent<ComponentType<GameProps>>;
}

export const GAMES: readonly Game[] = [
  {
    Screen: lazy(() => import("./games/wheel-of-fortune/wheel-of-fortune")),
    blurb: "Spin a wheel of names, a wheel of doom, or a wheel of your own.",
    legend: "wheel-of-fortune.games",
    name: "Wheel of Fortune",
    slug: "wheel-of-fortune",
  },
  {
    Screen: lazy(() => import("./games/super-tic-tac-toe/super-tic-tac-toe")),
    blurb:
      "Nine games of tic-tac-toe, one on each planet. Conquer three planets in a row to win.",
    legend: "super-tic-tac-toe.games",
    name: "Super Tic-Tac-Toe",
    slug: "super-tic-tac-toe",
  },
  {
    Screen: lazy(() => import("./games/booster-potion/booster-potion")),
    blurb:
      "Mix two bases and two toppings in the cauldron. Twenty potions to discover.",
    legend: "booster-potion.games",
    name: "Booster Potion",
    slug: "booster-potion",
  },
];
