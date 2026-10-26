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
  /** The card's filename, on its pill, with a real extension: "booster-potion.exe". */
  legend: string;
  Screen: LazyExoticComponent<ComponentType<GameProps>>;
}

export const GAMES: readonly Game[] = [
  {
    Screen: lazy(() => import("./games/wheel-of-fortune/wheel-of-fortune")),
    blurb: "Spin a wheel of names, a wheel of doom, or a wheel of your own.",
    legend: "wheel-of-fortune.exe",
    name: "Wheel of Fortune",
    slug: "wheel-of-fortune",
  },
  {
    Screen: lazy(() => import("./games/super-tic-tac-toe/super-tic-tac-toe")),
    blurb:
      "Nine games of tic-tac-toe, one on each planet. Conquer three planets in a row to win.",
    legend: "super-tic-tac-toe.exe",
    name: "Super Tic-Tac-Toe",
    slug: "super-tic-tac-toe",
  },
  {
    Screen: lazy(() => import("./games/booster-potion/booster-potion")),
    blurb:
      "Brew real wellness shots and teas in the cauldron, from the ginger shot to masala chai. A hundred to discover.",
    legend: "booster-potion.exe",
    name: "Booster Potion",
    slug: "booster-potion",
  },
  {
    Screen: lazy(() => import("./games/book-of-shadows/book-of-shadows")),
    blurb:
      "Your witch profile: the moon tonight, the Wheel of the Year, retrogrades, your birth chart and your numbers.",
    legend: "book-of-shadows.exe",
    name: "Book of Shadows",
    slug: "book-of-shadows",
  },
];
