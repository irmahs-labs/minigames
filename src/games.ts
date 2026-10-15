import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

/**
 * Every game on the site. Adding one is an entry here and a folder under
 * src/games/: the hub lists it and the app routes /<slug> to it. Each game
 * loads only when it is opened.
 */
export interface Game {
  slug: string;
  name: string;
  blurb: string;
  /** The card's filename, on its pill. */
  legend: string;
  Screen: LazyExoticComponent<ComponentType>;
}

export const GAMES: readonly Game[] = [
  {
    Screen: lazy(() => import("./games/wheel-of-fortune/wheel-of-fortune")),
    blurb: "Spin for a promotion, a doom, an omen, or a wheel of your own.",
    legend: "wheel.fun",
    name: "Wheel of Fortune",
    slug: "wheel-of-fortune",
  },
];
