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
    blurb: "Make your own wheels and spin them, or start from an example.",
    legend: "wheel.fun",
    name: "Wheel of Fortune",
    slug: "wheel-of-fortune",
  },
];
