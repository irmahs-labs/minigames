/**
 * The ingredients: their shelves, the forms a few come in, and a tip for
 * each. The recipes are in recipes.ts, which only the server reads, so the
 * page never carries the answers.
 */
export const BASE_KINDS = ["fruit", "vegetable", "liquid", "tea"] as const;

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
  tea: "🍵",
  vegetable: "🥕",
};

export const PANTRY: Record<Kind, readonly string[]> = {
  flower: ["Blue Pea", "Chamomile", "Chrysanthemum", "Hibiscus", "Lavender"],
  fruit: [
    "Apple",
    "Berries",
    "Cranberry",
    "Elderberry",
    "Goji",
    "Grapefruit",
    "Jujube",
    "Lemon",
    "Lime",
    "Mango",
    "Orange",
    "Pineapple",
    "Pomegranate",
    "Rosehip",
    "Tamarind",
    "Tart cherry",
    "Watermelon",
    "Yuzu",
  ],
  herb: ["Lemongrass", "Mint", "Rosemary", "Thyme", "Tulsi"],
  liquid: ["Aloe Vera", "Apple cider vinegar", "Coconut milk", "Coconut Water"],
  powder: ["Matcha", "Moringa", "Spirulina"],
  spice: [
    "Black pepper",
    "Cardamom",
    "Cayenne",
    "Cinnamon",
    "Clove",
    "Garlic",
    "Ginger",
    "Horseradish",
    "Jalapeño",
    "Turmeric",
  ],
  sweetener: ["Honey", "Maple syrup"],
  tea: ["Black tea", "Green tea"],
  vegetable: [
    "Beetroot",
    "Carrot",
    "Celery",
    "Cucumber",
    "Kale",
    "Spinach",
    "Wheatgrass",
  ],
};

/** How an ingredient goes in, for the few that come more than one way. */
export type Form = "fresh" | "dried" | "powder";

const FORM_LIST = {
  // A ginger shot takes fresh ginger; a ginger tea, dried.
  Cinnamon: ["dried", "powder"],
  Ginger: ["fresh", "dried"],
  Mint: ["fresh", "dried"],
  Turmeric: ["fresh", "powder"],
  Wheatgrass: ["fresh", "powder"],
} satisfies Record<string, readonly Form[]>;

/** The forms an ingredient comes in, the one it starts as first. */
export const FORMS = new Map<string, readonly Form[]>(
  Object.entries(FORM_LIST)
);

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
  Beetroot: "Nitrates, which can help blood flow and exercise.",
  Berries: "Rich in antioxidants, the ones that colour them.",
  "Black pepper": "Piperine, which helps the body take up turmeric.",
  "Black tea": "Caffeine and antioxidants, the base of chai.",
  "Blue Pea": "Turns tea blue, and purple when lemon goes in.",
  Cardamom: "A warm spice long used for digestion.",
  Carrot: "Beta-carotene, which the body turns into vitamin A.",
  Cayenne: "Capsaicin: the heat that clears your sinuses.",
  Celery: "Mostly water, with potassium.",
  Chamomile: "A calming tea, long taken before bed.",
  Chrysanthemum: "A cooling tea in Chinese tradition.",
  Cinnamon: "A warm spice that may help steady blood sugar.",
  Clove: "Warm and numbing: long used for toothache.",
  "Coconut Water": "Electrolytes, potassium above all.",
  "Coconut milk": "Its fat helps the body take up turmeric.",
  Cranberry: "Tart, and rich in antioxidants.",
  Cucumber: "Mostly water: cooling and hydrating.",
  Elderberry: "Long taken for colds. Only ever cooked: raw ones are toxic.",
  Garlic: "Allicin, made when it is cut: long used against colds.",
  Ginger: "Eases nausea, with anti-inflammatory compounds.",
  Goji: "Dried berries, rich in vitamin A.",
  Grapefruit: "Vitamin C. Interferes with some medicines.",
  "Green tea": "Catechins, with a little caffeine and L-theanine.",
  Hibiscus: "Tart and red; may help lower blood pressure.",
  Honey: "Soothes a sore throat. Not for babies under one.",
  Horseradish: "A sinus-clearing root: the fire in fire cider.",
  Jalapeño: "Capsaicin heat, milder than cayenne.",
  Jujube: "Dried red dates, sweet, in Chinese and Korean teas.",
  Kale: "Vitamins K and C.",
  Lavender: "A calming scent. Culinary lavender, and only a little.",
  Lemon: "Vitamin C, and the sour kick of most shots.",
  Lemongrass: "Lemony and fragrant, long used for digestion.",
  Lime: "Vitamin C, a little sharper than lemon.",
  Mango: "Vitamins A and C, and a sweetness that tames the heat.",
  "Maple syrup": "Sweetness, with a few minerals.",
  Matcha: "Powdered green tea: caffeine with L-theanine, for calm focus.",
  Mint: "Cooling, and long used for digestion.",
  Moringa: "Powdered leaves, rich in vitamins and iron.",
  Orange: "Vitamin C and natural sweetness.",
  Pineapple: "Bromelain, an enzyme that breaks down protein.",
  Pomegranate: "Rich in polyphenols, a kind of antioxidant.",
  Rosehip: "The fruit of the rose, very rich in vitamin C.",
  Rosemary: "Aromatic, and rich in antioxidants.",
  Spinach: "Folate, iron and vitamin K.",
  Spirulina: "Blue-green algae, rich in protein and iron.",
  Tamarind: "Sour pulp from a pod: the tang in jamu.",
  "Tart cherry": "Has a little melatonin, and is studied for sleep.",
  Thyme: "Long used for coughs.",
  Tulsi: "Holy basil, an adaptogen in Ayurveda, studied for stress.",
  Turmeric: "Curcumin, studied for inflammation. Best with black pepper.",
  Watermelon: "Mostly water: hydrating.",
  Wheatgrass: "Young wheat, juiced or powdered: vitamins and chlorophyll.",
  Yuzu: "A fragrant East Asian citrus, rich in vitamin C.",
} satisfies Record<string, string>;

export const TIPS = new Map(Object.entries(TIP_LIST));
