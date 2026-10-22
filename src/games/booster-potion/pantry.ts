/**
 * The ingredients and the twenty known potions. The potion names are from
 * Irma's Wellness Witch (irmahs/WellnessWitch); the recipes are real wellness
 * shots, the ginger shot, the turmeric shot, the beet shot and the like. A
 * potion takes two bases and two toppings, of any kind.
 */
export const BASE_KINDS = ["fruit", "vegetable", "liquid"] as const;

export const TOPPING_KINDS = [
  "spice",
  "herb",
  "powder",
  "flower",
  "sweetener",
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
  spice: "🌶️",
  sweetener: "🍯",
  vegetable: "🥕",
};

export const PANTRY: Record<Kind, readonly string[]> = {
  flower: ["Blue Pea", "Chrysanthemum", "Hibiscus", "Lavender", "Rose"],
  fruit: [
    "Apple",
    "Berries",
    "Grapefruit",
    "Lemon",
    "Lime",
    "Orange",
    "Pineapple",
    "Stone fruit",
    "Watermelon",
  ],
  herb: ["Basil", "Mint", "Rosemary", "Sage", "Thyme"],
  liquid: [
    "Aloe Vera",
    "Apple cider vinegar",
    "Coconut Water",
    "Elderberry juice",
    "Kombucha",
    "Tea",
  ],
  powder: ["Ashwagandha", "Collagen", "Maca", "Matcha", "Spirulina"],
  spice: [
    "Black pepper",
    "Cardamom",
    "Cayenne",
    "Cinnamon",
    "Fennel",
    "Ginger",
    "Nutmeg",
    "Turmeric",
  ],
  sweetener: ["Honey", "Maple syrup"],
  vegetable: [
    "Beetroot",
    "Carrot",
    "Celery",
    "Cucumber",
    "Kale",
    "Spinach",
    "Tomato",
  ],
};

export interface Recipe {
  name: string;
  bases: readonly [string, string];
  toppings: readonly [string, string];
  /** A fact or a caution, shown once the potion is found. */
  note?: string;
}

export const RECIPES: readonly Recipe[] = [
  {
    bases: ["Lemon", "Apple"],
    name: "Ember's Embrace",
    note: "The classic ginger shot.",
    toppings: ["Ginger", "Cayenne"],
  },
  {
    bases: ["Orange", "Carrot"],
    name: "Golden Harvest",
    note: "The orange, carrot, ginger and turmeric shot.",
    toppings: ["Ginger", "Turmeric"],
  },
  {
    bases: ["Pineapple", "Lemon"],
    name: "Sunset Elixir",
    note: "A turmeric shot. Black pepper helps the body take up turmeric.",
    toppings: ["Turmeric", "Black pepper"],
  },
  {
    bases: ["Beetroot", "Orange"],
    name: "Crimson Dawn",
    note: "A beet shot.",
    toppings: ["Ginger", "Cayenne"],
  },
  {
    bases: ["Kale", "Cucumber"],
    name: "Verdant Whisper",
    note: "A green shot.",
    toppings: ["Spirulina", "Ginger"],
  },
  {
    bases: ["Elderberry juice", "Lemon"],
    name: "Forest's Whisper",
    note: "An elderberry shot. Bottled elderberry juice is cooked; raw elderberries are toxic.",
    toppings: ["Ginger", "Cinnamon"],
  },
  {
    bases: ["Pineapple", "Coconut Water"],
    name: "Tide of Tranquility",
    note: "A pineapple and ginger shot.",
    toppings: ["Ginger", "Mint"],
  },
  {
    bases: ["Beetroot", "Apple cider vinegar"],
    name: "Crimson Twilight",
    note: "A beet and hibiscus shot. Always dilute vinegar.",
    toppings: ["Hibiscus", "Turmeric"],
  },
  {
    bases: ["Grapefruit", "Tea"],
    name: "Celestial Mist",
    note: "A hibiscus cooler. Grapefruit interferes with some medicines.",
    toppings: ["Hibiscus", "Mint"],
  },
  {
    bases: ["Tea", "Lemon"],
    name: "Dawn's Caress",
    note: "Butterfly pea tea, which turns from blue to purple with the lemon.",
    toppings: ["Blue Pea", "Ginger"],
  },
  {
    bases: ["Apple cider vinegar", "Lemon"],
    name: "Whispering Woods",
    note: "An apple cider vinegar shot. Always dilute vinegar.",
    toppings: ["Cayenne", "Honey"],
  },
  {
    bases: ["Coconut Water", "Lime"],
    name: "Sylvan Glow",
    note: "A matcha shot.",
    toppings: ["Matcha", "Mint"],
  },
  {
    bases: ["Kombucha", "Berries"],
    name: "Mystic Dawn",
    note: "A berry kombucha with ginger and hibiscus.",
    toppings: ["Ginger", "Hibiscus"],
  },
  {
    bases: ["Kombucha", "Grapefruit"],
    name: "Elixir of Morning Renewal",
    note: "Grapefruit and rosemary. Grapefruit interferes with some medicines.",
    toppings: ["Rosemary", "Honey"],
  },
  {
    bases: ["Tea", "Lemon"],
    name: "Moonlit Garden",
    note: "A lavender, honey and lemon tea, for the evening.",
    toppings: ["Lavender", "Honey"],
  },
  {
    bases: ["Berries", "Coconut Water"],
    name: "Ethereal Bloom",
    note: "A berry collagen shot.",
    toppings: ["Mint", "Collagen"],
  },
  {
    bases: ["Cucumber", "Spinach"],
    name: "Veil of Serenity",
    note: "A green juice with fennel, for digestion.",
    toppings: ["Fennel", "Mint"],
  },
  {
    bases: ["Tomato", "Celery"],
    name: "Earthbound Vitality",
    note: "A savoury tomato shot.",
    toppings: ["Black pepper", "Basil"],
  },
  {
    bases: ["Aloe Vera", "Cucumber"],
    name: "Spirit's Bloom",
    note: "An aloe cooler. Use inner-leaf or decolorized aloe juice.",
    toppings: ["Mint", "Honey"],
  },
  {
    bases: ["Carrot", "Apple"],
    name: "Ancient Garden",
    note: "An apple, carrot and ginger juice.",
    toppings: ["Ginger", "Cinnamon"],
  },
];
