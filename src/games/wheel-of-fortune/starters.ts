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
