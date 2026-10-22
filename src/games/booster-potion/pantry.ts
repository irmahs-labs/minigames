/**
 * The ingredients and the twenty known potions, from Irma's Wellness Witch
 * (irmahs/WellnessWitch). A potion takes two bases and two toppings, each of
 * a different kind.
 */
export const BASE_KINDS = ["fruit", "vegetable", "liquid"] as const;

export const TOPPING_KINDS = [
  "herb",
  "powder",
  "seed",
  "spice",
  "flower",
] as const;

export type BaseKind = (typeof BASE_KINDS)[number];

export type ToppingKind = (typeof TOPPING_KINDS)[number];

export type Kind = BaseKind | ToppingKind;

export const KIND_EMOJI: Record<Kind, string> = {
  flower: "🌼",
  fruit: "🍓",
  herb: "🌿",
  liquid: "💧",
  powder: "✨",
  seed: "🌱",
  spice: "🌶️",
  vegetable: "🥕",
};

export const PANTRY: Record<Kind, readonly string[]> = {
  flower: ["Blue Pea", "Chrysanthemum", "Hibiscus", "Lavender", "Rose"],
  fruit: [
    "Apple",
    "Berries",
    "Cucumber",
    "Grapefruit",
    "Lemon",
    "Orange",
    "Pineapple",
    "Stone fruit",
    "Tomato",
    "Watermelon",
  ],
  herb: ["Basil", "Mint", "Rosemary", "Sage", "Thyme"],
  liquid: ["Aloe Vera", "Coconut Water", "Elderberry juice", "Kombucha", "Tea"],
  powder: ["Ashwagandha", "Collagen", "Maca", "Matcha", "Spirulina"],
  seed: ["Chia", "Flax", "Hemp", "Pumpkin", "Sunflower"],
  // Cardamom is in Tide of Tranquility but was missing from the original list.
  spice: ["Cardamom", "Cinnamon", "Fennel", "Ginger", "Nutmeg", "Turmeric"],
  vegetable: ["Beetroot", "Carrot", "Celery", "Kale", "Spinach"],
};

export interface Recipe {
  name: string;
  bases: readonly [string, string];
  toppings: readonly [string, string];
}

// Matched by ingredient name: the original's ids for some toppings pointed at
// the wrong ingredient, which left a few potions impossible to brew.
export const RECIPES: readonly Recipe[] = [
  {
    bases: ["Apple", "Celery"],
    name: "Whispering Woods",
    toppings: ["Cinnamon", "Flax"],
  },
  {
    bases: ["Berries", "Coconut Water"],
    name: "Ethereal Bloom",
    toppings: ["Mint", "Hemp"],
  },
  {
    bases: ["Cucumber", "Spinach"],
    name: "Veil of Serenity",
    toppings: ["Fennel", "Collagen"],
  },
  {
    bases: ["Grapefruit", "Tea"],
    name: "Celestial Mist",
    toppings: ["Hibiscus", "Mint"],
  },
  {
    bases: ["Lemon", "Elderberry juice"],
    name: "Moonlit Garden",
    toppings: ["Rosemary", "Chrysanthemum"],
  },
  {
    bases: ["Aloe Vera", "Stone fruit"],
    name: "Ancient Garden",
    toppings: ["Nutmeg", "Sage"],
  },
  {
    bases: ["Orange", "Carrot"],
    name: "Golden Harvest",
    toppings: ["Ginger", "Sunflower"],
  },
  {
    bases: ["Pineapple", "Aloe Vera"],
    name: "Spirit's Bloom",
    toppings: ["Lavender", "Collagen"],
  },
  {
    bases: ["Stone fruit", "Kombucha"],
    name: "Mystic Dawn",
    toppings: ["Rose", "Chia"],
  },
  {
    bases: ["Watermelon", "Kale"],
    name: "Sylvan Glow",
    toppings: ["Thyme", "Lavender"],
  },
  {
    bases: ["Coconut Water", "Pineapple"],
    name: "Tide of Tranquility",
    toppings: ["Chrysanthemum", "Cardamom"],
  },
  {
    bases: ["Elderberry juice", "Berries"],
    name: "Forest's Whisper",
    toppings: ["Sage", "Pumpkin"],
  },
  {
    bases: ["Kombucha", "Grapefruit"],
    name: "Elixir of Morning Renewal",
    toppings: ["Chia", "Basil"],
  },
  {
    bases: ["Tea", "Lemon"],
    name: "Dawn's Caress",
    toppings: ["Blue Pea", "Ginger"],
  },
  {
    bases: ["Beetroot", "Apple"],
    name: "Crimson Dawn",
    toppings: ["Matcha", "Thyme"],
  },
  {
    bases: ["Carrot", "Watermelon"],
    name: "Sunset Elixir",
    toppings: ["Turmeric", "Rose"],
  },
  {
    bases: ["Celery", "Orange"],
    name: "Ember's Embrace",
    toppings: ["Ashwagandha", "Cinnamon"],
  },
  {
    bases: ["Kale", "Cucumber"],
    name: "Verdant Whisper",
    toppings: ["Spirulina", "Blue Pea"],
  },
  {
    bases: ["Spinach", "Tomato"],
    name: "Earthbound Vitality",
    toppings: ["Maca", "Rosemary"],
  },
  {
    bases: ["Tomato", "Beetroot"],
    name: "Crimson Twilight",
    toppings: ["Basil", "Fennel"],
  },
];
