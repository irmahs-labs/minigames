/**
 * The wheels a visitor can pick from. Each one starts with these slices, and
 * every slice can be edited, added or removed; "Reset" brings these back.
 */
export const WHEEL_IDS = ["blank", "promotion", "death", "luck"] as const;

export type WheelId = (typeof WHEEL_IDS)[number];

export interface Preset {
  id: WheelId;
  name: string;
  /** The panel's filename, on its pill. */
  legend: string;
  /** The line above the winner in the result popup. */
  kicker: string;
  slices: readonly string[];
}

export const PRESETS: Record<WheelId, Preset> = {
  blank: {
    id: "blank",
    kicker: "The wheel picks",
    legend: "blank.wheel",
    name: "Blank",
    slices: ["", "", "", ""],
  },
  death: {
    id: "death",
    kicker: "The end comes by",
    legend: "death.wheel",
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
      "Megadrought",
      "Wildfire",
      "Great flood",
    ],
  },
  // Good and bad omens alternate, so a spin is a fair test of luck.
  luck: {
    id: "luck",
    kicker: "Your omen is",
    legend: "luck.wheel",
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
    id: "promotion",
    kicker: "You won",
    legend: "promo.wheel",
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

export const DEFAULT_WHEEL: WheelId = "blank";
