import { currentLanguage } from "../../lib/language";

/**
 * The wheels a first visit opens with, as tabs: one empty wheel for names,
 * and the Death wheel. Reset puts a wheel back to its starter's slices.
 */
export const STARTER_IDS = ["names", "death"] as const;

export type StarterId = (typeof STARTER_IDS)[number];

interface Starter {
  name: string;
  slices: readonly string[];
}

export const STARTERS: Record<StarterId, Starter> = {
  death: {
    name: "Death",
    slices: [
      "Asteroid impact",
      "Supervolcano",
      "Black smoke",
      "Megaquake",
      "Tsunami",
      "Ice age",
      "Solar flare",
      "Plague",
      "Drought",
      "Wildfire",
      "Flood",
    ],
  },
  names: {
    name: "Names",
    slices: ["", "", "", ""],
  },
};

/** The same starters in French, slice for slice. */
const FRENCH_STARTERS: Record<StarterId, Starter> = {
  death: {
    name: "Fin du monde",
    slices: [
      "Chute d’astéroïde",
      "Supervolcan",
      "Fumée noire",
      "Méga-séisme",
      "Tsunami",
      "Ère glaciaire",
      "Éruption solaire",
      "Peste",
      "Sécheresse",
      "Incendie",
      "Inondation",
    ],
  },
  names: {
    name: "Prénoms",
    slices: ["", "", "", ""],
  },
};

/** A starter as a new wheel takes it, in the page's language. */
export const starterFor = (id: StarterId): Starter =>
  currentLanguage() === "fr" ? FRENCH_STARTERS[id] : STARTERS[id];
