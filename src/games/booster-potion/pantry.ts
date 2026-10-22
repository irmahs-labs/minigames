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

/**
 * What each ingredient is known for, in a line: shown as its tooltip and
 * under it in the cauldron. Kept to what is well established, with the
 * cautions that matter; fun facts, not medical advice.
 */
const TIP_LIST = {
  "Aloe Vera": "Soothing. Use inner-leaf or decolorized juice.",
  Apple: "Fibre, and a sweetness that tames the sharp shots.",
  "Apple cider vinegar":
    "May help steady blood sugar after a meal. Always dilute.",
  Ashwagandha: "An adaptogen studied for stress. Not for pregnancy.",
  Basil: "Fresh and peppery, with antioxidants.",
  Beetroot: "Nitrates, which can help blood flow and exercise.",
  Berries: "Rich in antioxidants, the ones that colour them.",
  "Black pepper": "Piperine, which helps the body take up turmeric.",
  "Blue Pea": "Turns tea blue, and purple when lemon goes in.",
  Cardamom: "A warm spice long used for digestion.",
  Carrot: "Beta-carotene, which the body turns into vitamin A.",
  Cayenne: "Capsaicin: the heat that clears your sinuses.",
  Celery: "Mostly water, with potassium.",
  Chrysanthemum: "A cooling tea in Chinese tradition.",
  Cinnamon: "A warm spice that may help steady blood sugar.",
  "Coconut Water": "Electrolytes, potassium above all.",
  Collagen: "Protein, popular for skin and joints.",
  Cucumber: "Mostly water: cooling and hydrating.",
  "Elderberry juice": "Long taken for colds. Only ever cooked.",
  Fennel: "Long used to ease bloating.",
  Ginger: "Eases nausea, with anti-inflammatory compounds.",
  Grapefruit: "Vitamin C. Interferes with some medicines.",
  Hibiscus: "Tart and red; may help lower blood pressure.",
  Honey: "Soothes a sore throat. Not for babies under one.",
  Kale: "Vitamins K and C.",
  Kombucha: "Fermented tea, with live cultures.",
  Lavender: "A calming scent. Culinary lavender, and only a little.",
  Lemon: "Vitamin C, and the sour kick of most shots.",
  Lime: "Vitamin C, a little sharper than lemon.",
  Maca: "A Peruvian root, taken for energy.",
  "Maple syrup": "Sweetness, with a few minerals.",
  Matcha: "Powdered green tea: caffeine with L-theanine, for calm focus.",
  Mint: "Cooling, and long used for digestion.",
  Nutmeg: "Warm and sweet. A pinch only: a lot is toxic.",
  Orange: "Vitamin C and natural sweetness.",
  Pineapple: "Bromelain, an enzyme that breaks down protein.",
  Rose: "Fragrant, and soothing in tea.",
  Rosemary: "Aromatic, and rich in antioxidants.",
  Sage: "Earthy, long used for sore throats.",
  Spinach: "Folate, iron and vitamin K.",
  Spirulina: "Blue-green algae, rich in protein and iron.",
  "Stone fruit": "Peach, apricot or plum: vitamins A and C.",
  Tea: "Antioxidants, and a little caffeine.",
  Thyme: "Long used for coughs.",
  Tomato: "Lycopene, an antioxidant.",
  Turmeric: "Curcumin, studied for inflammation. Best with black pepper.",
  Watermelon: "Mostly water: hydrating.",
} satisfies Record<string, string>;

export const TIPS = new Map(Object.entries(TIP_LIST));
