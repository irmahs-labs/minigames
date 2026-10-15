/**
 * Ready-made slice lists a visitor can fill a wheel with, as a starting point
 * to spin as they are or edit.
 */
export const EXAMPLE_IDS = ["promotion", "death", "luck"] as const;

export type ExampleId = (typeof EXAMPLE_IDS)[number];

interface Example {
  name: string;
  slices: readonly string[];
}

export const EXAMPLES: Record<ExampleId, Example> = {
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
  // Good and bad omens alternate, so a spin is a fair test of luck.
  luck: {
    name: "Luck",
    slices: [
      "Four-leaf clover",
      "Black cat",
      "Horseshoe",
      "Broken mirror",
      "Shooting star",
      "Under a ladder",
      "Lucky penny",
      "Friday the 13th",
    ],
  },
  promotion: {
    name: "Promotion",
    slices: [
      "Free",
      "10% off",
      "20% off",
      "50% off",
      "Free shipping",
      "Buy one get one",
      "Mystery gift",
      "Try again",
    ],
  },
};
