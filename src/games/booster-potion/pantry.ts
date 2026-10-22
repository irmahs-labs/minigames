/**
 * The ingredients and the known potions. Every potion is a real wellness
 * shot or drink, cut down to its three or four defining ingredients, with
 * the recipe it comes from; the first potion names are from Irma's Wellness
 * Witch (irmahs/WellnessWitch). Only ingredients some recipe uses are in the
 * pantry.
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
  flower: ["Blue Pea", "Chamomile", "Hibiscus"],
  fruit: [
    "Apple",
    "Berries",
    "Cranberry",
    "Grapefruit",
    "Lemon",
    "Lime",
    "Mango",
    "Orange",
    "Pineapple",
    "Pomegranate",
    "Tamarind",
    "Tart cherry",
    "Watermelon",
  ],
  herb: ["Mint", "Rosemary"],
  liquid: [
    "Aloe Vera",
    "Apple cider vinegar",
    "Coconut milk",
    "Coconut Water",
    "Elderberry juice",
  ],
  powder: ["Matcha", "Spirulina"],
  spice: [
    "Black pepper",
    "Cayenne",
    "Cinnamon",
    "Garlic",
    "Ginger",
    "Horseradish",
    "Jalapeño",
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
    "Wheatgrass",
  ],
};

export interface Recipe {
  name: string;
  /** Three or four, bases first. */
  ingredients: readonly string[];
  /** What the real drink is, and any caution; shown once it is found. */
  note: string;
  /** The real recipe it is cut down from. */
  source: string;
}

export const RECIPES: readonly Recipe[] = [
  // Ginger shots
  {
    ingredients: ["Apple", "Lime", "Ginger", "Cayenne"],
    name: "Ember's Embrace",
    note: "The classic ginger shot.",
    source: "https://www.aspicyperspective.com/easy-ginger-shot-recipe/",
  },
  {
    ingredients: ["Lemon", "Ginger", "Cayenne", "Honey"],
    name: "Spark of the Hearth",
    note: "A lemon and ginger shot, with a kick of cayenne.",
    source: "https://www.cleaneatingkitchen.com/?p=42511",
  },
  {
    ingredients: ["Orange", "Lemon", "Ginger", "Honey"],
    name: "Citrus Charm",
    note: "An orange, lemon and ginger shot.",
    source: "https://www.thecookierookie.com/?p=81035",
  },
  {
    ingredients: ["Apple", "Lemon", "Ginger", "Honey"],
    name: "Orchard Ember",
    note: "A ginger shot softened with apple.",
    source: "https://www.occasionallyeggs.com/wprm_print/ginger-shots",
  },
  {
    ingredients: ["Lime", "Ginger", "Honey"],
    name: "Lime Lightning",
    note: "A ginger and lime shot.",
    source: "https://wetrinifood.com/ginger-lime-shots/",
  },
  {
    ingredients: ["Pineapple", "Coconut Water", "Ginger", "Mint"],
    name: "Tide of Tranquility",
    note: "A pineapple and ginger shot, for digestion.",
    source: "https://www.alphafoodie.com/wellness-shot-recipes/",
  },
  {
    ingredients: ["Lemon", "Garlic", "Ginger", "Honey"],
    name: "Hearthguard",
    note: "A garlic immunity shot.",
    source: "https://www.foodbymaria.com/immunity-shots/",
  },

  // Turmeric shots
  {
    ingredients: ["Orange", "Carrot", "Ginger", "Turmeric"],
    name: "Golden Harvest",
    note: "The orange, carrot, ginger and turmeric shot.",
    source:
      "https://hr.umich.edu/benefits-wellness/health/mhealthy/physical-well-being/nutrition/mhealthy-recipes/orange-carrot-ginger-turmeric-shots",
  },
  {
    ingredients: ["Lemon", "Ginger", "Turmeric", "Black pepper"],
    name: "Elixir of Morning Renewal",
    note: "The lemon, ginger and turmeric shot. Black pepper helps the body take up turmeric.",
    source:
      "https://www.gohealthyeverafter.com/4-ingredient-turmeric-tea-recipe/",
  },
  {
    ingredients: ["Coconut Water", "Lemon", "Turmeric", "Black pepper"],
    name: "Liquid Gold",
    note: "A turmeric shot on coconut water.",
    source: "https://drhyman.com/blogs/content/turmeric-super-shots",
  },
  {
    ingredients: ["Orange", "Lemon", "Ginger", "Turmeric"],
    name: "Amber Crown",
    note: "A citrus turmeric shot.",
    source: "https://voelkel.bio/en/produkt/ginger-shot-turmeric-0-5l-2/",
  },
  {
    ingredients: ["Orange", "Lemon", "Turmeric", "Cayenne"],
    name: "Sunfire Shield",
    note: "A flu-fighter shot, shaken in a jar.",
    source: "https://ellegourmet.ca/wprm_print/flu-fighter-wellness-shots",
  },
  {
    ingredients: ["Mango", "Orange", "Turmeric", "Cayenne"],
    name: "Sunset Elixir",
    note: "A hot mango shot.",
    source:
      "https://www.brake.co.uk/drinks-snacks/cold-beverages/pure-juice-smoothies/juice-shots/moju-hot-mango-juice-shot-60ml/p/187106",
  },
  {
    ingredients: ["Carrot", "Lemon", "Turmeric", "Black pepper"],
    name: "Amber Spell",
    note: "A carrot and turmeric shot.",
    source: "https://www.frontiercoop.com/recipes/carrot-ginger-turmeric-shot",
  },
  {
    ingredients: ["Carrot", "Lemon", "Ginger", "Cayenne"],
    name: "Ember Root",
    note: "A carrot and ginger cleanse shot.",
    source:
      "https://www.goodnature.com/recipes/juice-shot-fresh-ginger-cleanse-recipe/print",
  },
  {
    ingredients: ["Tamarind", "Turmeric", "Ginger", "Honey"],
    name: "Sun Temple",
    note: "Jamu kunyit asam, Indonesia's turmeric and tamarind tonic.",
    source: "https://nomadette.com/turmeric-tamarind-jamu/",
  },
  {
    ingredients: ["Coconut milk", "Turmeric", "Cinnamon", "Ginger"],
    name: "Golden Lullaby",
    note: "Golden milk, haldi doodh: warm, before bed.",
    source: "https://www.tastemade.com/recipes/golden-milk-turmeric-tea",
  },

  // Vinegar shots
  {
    ingredients: ["Pineapple", "Apple cider vinegar", "Ginger", "Turmeric"],
    name: "Ancient Garden",
    note: "A pineapple vitamin C shot. Always dilute vinegar.",
    source:
      "https://dole.com/en-ca/recipes/all-recipes/vitamin-c-immunity-shot",
  },
  {
    ingredients: ["Lemon", "Apple cider vinegar", "Turmeric", "Black pepper"],
    name: "Lantern Light",
    note: "A turmeric and vinegar shot. Always dilute vinegar.",
    source:
      "https://pressed.com/blogs/pressed-life/wellness-shots-recipe-easy-healthy-juice-shots",
  },
  {
    ingredients: ["Orange", "Apple cider vinegar", "Ginger", "Turmeric"],
    name: "Sunrise Ward",
    note: "An orange immunity shot. Always dilute vinegar.",
    source:
      "https://southampton.stonybrookmedicine.edu/services/wellness-institute/recipes/immune-boosting-shot",
  },
  {
    ingredients: ["Apple cider vinegar", "Ginger", "Cinnamon", "Honey"],
    name: "Whispering Woods",
    note: "An apple cider vinegar shot. Always dilute vinegar.",
    source: "https://www.tasty.co/recipe/easy-as-pie-antioxidant-wellness-shot",
  },
  {
    ingredients: ["Apple cider vinegar", "Cinnamon", "Honey"],
    name: "Hollow Oak",
    note: "The vinegar, honey and cinnamon shot. Always dilute vinegar.",
    source: "https://40aprons.com/apple-cider-vinegar-and-honey-shot/",
  },
  {
    ingredients: ["Lemon", "Apple cider vinegar", "Ginger", "Maple syrup"],
    name: "Haymaker's Draught",
    note: "Switchel, once called haymaker's punch.",
    source: "https://www.tastemade.com/recipes/maple-ginger-switchel",
  },
  {
    ingredients: ["Apple cider vinegar", "Garlic", "Horseradish", "Ginger"],
    name: "Dragon's Breath",
    note: "Fire cider: steeped for a month, then sweetened with honey.",
    source: "https://www.alphafoodie.com/fire-cider-recipe/",
  },

  // Beet shots
  {
    ingredients: ["Beetroot", "Orange", "Lemon", "Ginger"],
    name: "Crimson Dawn",
    note: "A beet shot.",
    source:
      "https://theeastcoastkitchen.com/beet-and-ginger-juice-a-delicious-immune-boosting-recipe/",
  },
  {
    ingredients: ["Beetroot", "Carrot", "Apple", "Ginger"],
    name: "Ruby Root",
    note: "Beet, carrot and apple: ABC juice, as a shot.",
    source:
      "https://theeastcoastkitchen.com/beet-and-ginger-juice-a-delicious-immune-boosting-recipe/",
  },
  {
    ingredients: ["Beetroot", "Cranberry", "Lemon", "Ginger"],
    name: "Cranberry Crown",
    note: "A beet and cranberry booster.",
    source: "https://namawell.com/blogs/recipes/beet-cranberry-booster",
  },
  {
    ingredients: ["Beetroot", "Apple cider vinegar", "Hibiscus", "Turmeric"],
    name: "Crimson Twilight",
    note: "A beet and hibiscus shot. Always dilute vinegar.",
    source:
      "https://mccormick.com/articles/mccormick/6-easy-wellness-shot-recipes-for-winter",
  },
  {
    ingredients: ["Cranberry", "Apple", "Orange", "Ginger"],
    name: "Harvest Moon",
    note: "A cranberry and ginger shot.",
    source: "https://namawell.com/blogs/recipes/ginger-wellness-shots",
  },

  // Green shots
  {
    ingredients: ["Kale", "Cucumber", "Spirulina", "Ginger"],
    name: "Verdant Whisper",
    note: "A green shot.",
    source: "https://www.goodnature.com/recipes/clean-green-juice-shot/print",
  },
  {
    ingredients: ["Spinach", "Apple", "Celery", "Ginger"],
    name: "Meadow Dew",
    note: "A green juice shot.",
    source: "https://wilfa.com/blogs/recipes/2-juice-shots",
  },
  {
    ingredients: ["Celery", "Apple", "Lemon", "Ginger"],
    name: "Whirlwind Tonic",
    note: "A celery and ginger shot.",
    source:
      "https://goodnature.com/recipes/juice-shot-ginger-lemon-celery-apple/print",
  },
  {
    ingredients: ["Celery", "Lemon", "Ginger", "Honey"],
    name: "Thornbrook",
    note: "A celery, ginger and hot honey shooter.",
    source:
      "https://savannahbee.com/blogs/recipes/celery-ginger-and-hot-honey-shooter",
  },
  {
    ingredients: ["Wheatgrass", "Pineapple", "Lemon", "Ginger"],
    name: "Emerald Field",
    note: "A wheatgrass shot.",
    source: "https://www.costco.com/.product.4000177379.html",
  },
  {
    ingredients: ["Wheatgrass", "Apple", "Ginger"],
    name: "Grassblade",
    note: "Applegrass: wheatgrass and apple, with ginger.",
    source: "https://www.yuppiechef.com/spatula/applegrass-juice/",
  },
  {
    ingredients: ["Lemon", "Spirulina", "Cayenne"],
    name: "Deep Pond",
    note: "A spirulina shot.",
    source: "https://cleancuisine.com/benefits-of-spirulina/print/62771/",
  },
  {
    ingredients: ["Lemon", "Matcha", "Honey"],
    name: "Sylvan Glow",
    note: "A honey, lemon and matcha energy shot.",
    source: "https://honey.com/recipe/honey-lemon-matcha-energy-shot",
  },

  // Berry shots
  {
    ingredients: ["Elderberry juice", "Lemon", "Ginger", "Cinnamon"],
    name: "Forest's Whisper",
    note: "An elderberry shot. Bottled elderberry juice is cooked; raw elderberries are toxic.",
    source: "https://www.groundwork.org.uk/?p=135277",
  },
  {
    ingredients: ["Pomegranate", "Elderberry juice", "Ginger", "Honey"],
    name: "Velvet Night",
    note: "A pomegranate and elderberry wellness shot.",
    source: "https://www.pomwonderful.com/drink/pom-wellness-shot",
  },
  {
    ingredients: ["Berries", "Pomegranate", "Elderberry juice", "Ginger"],
    name: "Midnight Bramble",
    note: "A blueberry and elderberry immunity shot.",
    source: "https://naturallieplantbased.com/elderberry-immunity-shots/",
  },
  {
    ingredients: ["Pomegranate", "Watermelon", "Apple", "Ginger"],
    name: "Ethereal Bloom",
    note: "An antioxidant kick shot.",
    source:
      "https://www.pomwonderful.com/dishes/pom-antioxidant-kick-wellness-shot",
  },
  {
    ingredients: ["Berries", "Ginger", "Honey"],
    name: "Mystic Dawn",
    note: "A blueberry and ginger shot, with no citrus.",
    source: "https://thedizzycook.com/homemade-immunity-shot",
  },

  // Coolers and teas
  {
    ingredients: ["Lemon", "Blue Pea", "Honey"],
    name: "Dawn's Caress",
    note: "Butterfly pea lemonade: blue tea that turns purple with the lemon.",
    source:
      "https://beeinspiredgoods.com/blogs/honey-recipes/butterfly-pea-tea-lemonade-soda",
  },
  {
    ingredients: ["Hibiscus", "Ginger", "Honey"],
    name: "Scarlet Veil",
    note: "A hibiscus and ginger tea.",
    source: "https://askdrnandi.com/recipe/ginger-and-hibiscus-drink/",
  },
  {
    ingredients: ["Tart cherry", "Chamomile", "Ginger", "Honey"],
    name: "Moonlit Garden",
    note: "A sleepy-time tart cherry tea.",
    source: "https://glutenfreeandmore.com/?p=45520",
  },
  {
    ingredients: ["Grapefruit", "Rosemary", "Honey"],
    name: "Crystal Grove",
    note: "Grapefruit with rosemary honey. Grapefruit interferes with some medicines.",
    source:
      "https://thetomato.ca/recipes/rosemary-honey-and-grapefruit-spritzer",
  },
  {
    ingredients: ["Watermelon", "Lime", "Ginger", "Mint"],
    name: "Celestial Mist",
    note: "A watermelon agua fresca.",
    source: "https://meatified.com/watermelon-agua-fresca-aip/",
  },
  {
    ingredients: ["Cucumber", "Lime", "Mint", "Maple syrup"],
    name: "Veil of Serenity",
    note: "A cucumber and lime agua fresca.",
    source: "https://minimalistbaker.com/cucumber-lime-agua-fresca/",
  },
  {
    ingredients: ["Celery", "Cucumber", "Coconut Water", "Jalapeño"],
    name: "Earthbound Vitality",
    note: "A hangover helper shot.",
    source: "https://tasty.co/recipe/hangover-helper-wellness-shot",
  },
  {
    ingredients: ["Aloe Vera", "Lime", "Coconut Water"],
    name: "Spirit's Bloom",
    note: "An aloe shot. Use inner-leaf or decolorized aloe juice.",
    source: "https://www.bellevueclub.com/?p=2738",
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
  Beetroot: "Nitrates, which can help blood flow and exercise.",
  Berries: "Rich in antioxidants, the ones that colour them.",
  "Black pepper": "Piperine, which helps the body take up turmeric.",
  "Blue Pea": "Turns tea blue, and purple when lemon goes in.",
  Carrot: "Beta-carotene, which the body turns into vitamin A.",
  Cayenne: "Capsaicin: the heat that clears your sinuses.",
  Celery: "Mostly water, with potassium.",
  Chamomile: "A calming tea, long taken before bed.",
  Cinnamon: "A warm spice that may help steady blood sugar.",
  "Coconut Water": "Electrolytes, potassium above all.",
  "Coconut milk": "Its fat helps the body take up turmeric.",
  Cranberry: "Tart, and rich in antioxidants.",
  Cucumber: "Mostly water: cooling and hydrating.",
  "Elderberry juice": "Long taken for colds. Only ever cooked.",
  Garlic: "Allicin, made when it is cut: long used against colds.",
  Ginger: "Eases nausea, with anti-inflammatory compounds.",
  Grapefruit: "Vitamin C. Interferes with some medicines.",
  Hibiscus: "Tart and red; may help lower blood pressure.",
  Honey: "Soothes a sore throat. Not for babies under one.",
  Horseradish: "A sinus-clearing root: the fire in fire cider.",
  Jalapeño: "Capsaicin heat, milder than cayenne.",
  Kale: "Vitamins K and C.",
  Lemon: "Vitamin C, and the sour kick of most shots.",
  Lime: "Vitamin C, a little sharper than lemon.",
  Mango: "Vitamins A and C, and a sweetness that tames the heat.",
  "Maple syrup": "Sweetness, with a few minerals.",
  Matcha: "Powdered green tea: caffeine with L-theanine, for calm focus.",
  Mint: "Cooling, and long used for digestion.",
  Orange: "Vitamin C and natural sweetness.",
  Pineapple: "Bromelain, an enzyme that breaks down protein.",
  Pomegranate: "Rich in polyphenols, a kind of antioxidant.",
  Rosemary: "Aromatic, and rich in antioxidants.",
  Spinach: "Folate, iron and vitamin K.",
  Spirulina: "Blue-green algae, rich in protein and iron.",
  Tamarind: "Sour pulp from a pod: the tang in jamu.",
  "Tart cherry": "Has a little melatonin, and is studied for sleep.",
  Turmeric: "Curcumin, studied for inflammation. Best with black pepper.",
  Watermelon: "Mostly water: hydrating.",
  Wheatgrass: "Young wheat, juiced: vitamins and chlorophyll.",
} satisfies Record<string, string>;

export const TIPS = new Map(Object.entries(TIP_LIST));
