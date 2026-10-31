/**
 * The known potions. Every one is a real wellness shot, tea or tonic, cut
 * down to its two to four core ingredients, with the recipe it comes from;
 * the first potion names are from Irma's Wellness Witch
 * (irmahs/WellnessWitch).
 *
 * Only the server reads this file: it brews, so the page never carries the
 * answers. Never import it from the game's React code. A potion's name is
 * its key in the database, so renaming one forgets who brewed it.
 */
import type { Form } from "./pantry";

export interface Recipe {
  name: string;
  /** Two to four, bases first. */
  ingredients: readonly string[];
  /** The form of each ingredient that comes more than one way. */
  forms?: Readonly<Partial<Record<string, Form>>>;
  /** What the real drink is, and any caution; shown once it is found. */
  note: string;
  /** The same note in French. */
  noteFr: string;
  /** The real recipe it is cut down from. */
  source: string;
}

export const RECIPES: readonly Recipe[] = [
  // Ginger shots
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Apple", "Lime", "Ginger", "Cayenne"],
    name: "Ember's Embrace",
    note: "The classic ginger shot.",
    noteFr: "Le shot de gingembre classique.",
    source: "https://www.aspicyperspective.com/easy-ginger-shot-recipe/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Ginger", "Cayenne", "Honey"],
    name: "Spark of the Hearth",
    note: "A lemon and ginger shot, with a kick of cayenne.",
    noteFr: "Un shot citron et gingembre, relevé de piment de Cayenne.",
    source: "https://www.cleaneatingkitchen.com/?p=42511",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Ginger", "Cayenne"],
    name: "Firecracker",
    note: "A lemon and ginger shot with a cayenne kick.",
    noteFr: "Un shot citron et gingembre, avec une pointe de Cayenne.",
    source:
      "https://www.alphafoodie.com/lemon-ginger-and-cayenne-immunity-shots/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Ginger", "Honey"],
    name: "Bright Spark",
    note: "A lemon, honey and ginger shot.",
    noteFr: "Un shot citron, miel et gingembre.",
    source:
      "https://savannahbee.com/blogs/recipes/lemon-ginger-and-honey-shooter",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Orange", "Lemon", "Ginger", "Honey"],
    name: "Citrus Charm",
    note: "An orange, lemon and ginger shot.",
    noteFr: "Un shot orange, citron et gingembre.",
    source: "https://www.thecookierookie.com/?p=81035",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Orange", "Ginger"],
    name: "Orange Ember",
    note: "An orange and ginger shot.",
    noteFr: "Un shot orange et gingembre.",
    source: "https://wetrinifood.com/orange-ginger-shots/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Apple", "Lemon", "Ginger", "Honey"],
    name: "Orchard Ember",
    note: "A ginger shot softened with apple and honey.",
    noteFr: "Un shot de gingembre adouci à la pomme et au miel.",
    source: "https://www.occasionallyeggs.com/wprm_print/ginger-shots",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Apple", "Lemon", "Ginger"],
    name: "Root Awakening",
    note: "An apple, lemon and ginger shot.",
    noteFr: "Un shot pomme, citron et gingembre.",
    source:
      "https://www.goodnature.com/recipes/ginger-shot-recipe-benefits/print",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lime", "Ginger", "Honey"],
    name: "Lime Lightning",
    note: "A ginger and lime shot.",
    noteFr: "Un shot gingembre et citron vert.",
    source: "https://wetrinifood.com/ginger-lime-shots/",
  },
  {
    forms: { Ginger: "fresh", Mint: "fresh" },
    ingredients: ["Pineapple", "Coconut Water", "Ginger", "Mint"],
    name: "Tide of Tranquility",
    note: "A pineapple and ginger shot, for digestion.",
    noteFr: "Un shot ananas et gingembre, pour la digestion.",
    source: "https://www.alphafoodie.com/wellness-shot-recipes/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Garlic", "Ginger", "Honey"],
    name: "Hearthguard",
    note: "A garlic immunity shot.",
    noteFr: "Un shot immunité à l’ail.",
    source: "https://www.foodbymaria.com/immunity-shots/",
  },
  {
    ingredients: ["Lemon", "Maple syrup", "Cayenne"],
    name: "Desert Lemonade",
    note: "The lemon, maple and cayenne lemonade of the master cleanse: drink it with meals, not instead of them.",
    noteFr:
      "La limonade citron, érable et Cayenne de la « master cleanse » : à boire avec les repas, pas à leur place.",
    source:
      "https://www.downtoearth.org/recipes/beverages/lemon-cayenne-pepper-cleanse",
  },

  // Turmeric shots
  {
    forms: { Ginger: "fresh", Turmeric: "fresh" },
    ingredients: ["Orange", "Carrot", "Ginger", "Turmeric"],
    name: "Golden Harvest",
    note: "The orange, carrot, ginger and turmeric shot.",
    noteFr: "Le shot orange, carotte, gingembre et curcuma.",
    source:
      "https://hr.umich.edu/benefits-wellness/health/mhealthy/physical-well-being/nutrition/mhealthy-recipes/orange-carrot-ginger-turmeric-shots",
  },
  {
    forms: { Ginger: "fresh", Turmeric: "powder" },
    ingredients: ["Lemon", "Ginger", "Turmeric", "Black pepper"],
    name: "Elixir of Morning Renewal",
    note: "The lemon, ginger and turmeric shot. Black pepper helps the body take up turmeric.",
    noteFr:
      "Le shot citron, gingembre et curcuma. Le poivre noir aide le corps à absorber le curcuma.",
    source:
      "https://www.gohealthyeverafter.com/4-ingredient-turmeric-tea-recipe/",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Coconut Water", "Lemon", "Turmeric", "Black pepper"],
    name: "Liquid Gold",
    note: "A turmeric shot on coconut water.",
    noteFr: "Un shot de curcuma à l’eau de coco.",
    source: "https://drhyman.com/blogs/content/turmeric-super-shots",
  },
  {
    forms: { Ginger: "fresh", Turmeric: "fresh" },
    ingredients: ["Orange", "Lemon", "Ginger", "Turmeric"],
    name: "Amber Crown",
    note: "A citrus turmeric shot.",
    noteFr: "Un shot d’agrumes au curcuma.",
    source:
      "https://theflexitarian.co.uk/wprm_print/easy-ginger-turmeric-shot-recipe",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Orange", "Lemon", "Turmeric", "Cayenne"],
    name: "Sunfire Shield",
    note: "A flu-fighter shot, shaken in a jar.",
    noteFr: "Un shot anti-grippe, secoué dans un bocal.",
    source: "https://ellegourmet.ca/wprm_print/flu-fighter-wellness-shots",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Mango", "Orange", "Turmeric", "Cayenne"],
    name: "Sunset Elixir",
    note: "A mango and orange juice with turmeric and a pinch of cayenne.",
    noteFr: "Un jus mangue et orange au curcuma, avec une pincée de Cayenne.",
    source: "https://cookidoo.com.au/recipes/recipe/en-au/r120329",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Carrot", "Lemon", "Turmeric", "Black pepper"],
    name: "Amber Spell",
    note: "A carrot and turmeric shot.",
    noteFr: "Un shot carotte et curcuma.",
    source: "https://www.frontiercoop.com/recipes/carrot-ginger-turmeric-shot",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Carrot", "Lemon", "Ginger", "Cayenne"],
    name: "Ember Root",
    note: "A carrot and ginger cleanse shot.",
    noteFr: "Un shot détox carotte et gingembre.",
    source:
      "https://www.goodnature.com/recipes/juice-shot-fresh-ginger-cleanse-recipe/print",
  },
  {
    forms: { Ginger: "fresh", Turmeric: "fresh" },
    ingredients: ["Tamarind", "Turmeric", "Ginger", "Honey"],
    name: "Sun Temple",
    note: "Jamu kunyit asam, Indonesia's turmeric and tamarind tonic.",
    noteFr:
      "Le jamu kunyit asam, le tonique indonésien au curcuma et au tamarin.",
    source: "https://nomadette.com/turmeric-tamarind-jamu/",
  },
  {
    forms: { Cinnamon: "powder", Ginger: "fresh", Turmeric: "powder" },
    ingredients: ["Coconut milk", "Turmeric", "Cinnamon", "Ginger"],
    name: "Golden Lullaby",
    note: "Golden milk, haldi doodh: warm, before bed.",
    noteFr: "Le lait d’or, haldi doodh : chaud, avant de dormir.",
    source: "https://www.tastemade.com/recipes/golden-milk-turmeric-tea",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Turmeric", "Black pepper", "Honey"],
    name: "Liquid Sun",
    note: "Golden honey: a spoonful in warm water.",
    noteFr: "Le miel d’or : une cuillerée dans de l’eau chaude.",
    source: "https://www.alphafoodie.com/simple-turmeric-honey-paste-uses/",
  },

  // Vinegar shots and tonics
  {
    forms: { Ginger: "fresh", Turmeric: "fresh" },
    ingredients: ["Pineapple", "Apple cider vinegar", "Ginger", "Turmeric"],
    name: "Ancient Garden",
    note: "A pineapple vitamin C shot. Always dilute vinegar.",
    noteFr: "Un shot vitamine C à l’ananas. Toujours diluer le vinaigre.",
    source:
      "https://dole.com/en-ca/recipes/all-recipes/vitamin-c-immunity-shot",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Lemon", "Apple cider vinegar", "Turmeric", "Black pepper"],
    name: "Lantern Light",
    note: "A turmeric and vinegar shot. Always dilute vinegar.",
    noteFr: "Un shot curcuma et vinaigre. Toujours diluer le vinaigre.",
    source:
      "https://pressed.com/blogs/pressed-life/wellness-shots-recipe-easy-healthy-juice-shots",
  },
  {
    forms: { Ginger: "fresh", Turmeric: "powder" },
    ingredients: ["Orange", "Apple cider vinegar", "Ginger", "Turmeric"],
    name: "Sunrise Ward",
    note: "An orange immunity shot. Always dilute vinegar.",
    noteFr: "Un shot immunité à l’orange. Toujours diluer le vinaigre.",
    source:
      "https://southampton.stonybrookmedicine.edu/services/wellness-institute/recipes/immune-boosting-shot",
  },
  {
    forms: { Cinnamon: "powder", Ginger: "fresh" },
    ingredients: ["Apple cider vinegar", "Ginger", "Cinnamon", "Honey"],
    name: "Whispering Woods",
    note: "An apple cider vinegar shot. Always dilute vinegar.",
    noteFr: "Un shot de vinaigre de cidre. Toujours diluer le vinaigre.",
    source: "https://www.tasty.co/recipe/easy-as-pie-antioxidant-wellness-shot",
  },
  {
    forms: { Cinnamon: "powder" },
    ingredients: ["Apple cider vinegar", "Cinnamon", "Honey"],
    name: "Hollow Oak",
    note: "The vinegar, honey and cinnamon shot. Always dilute vinegar.",
    noteFr: "Le shot vinaigre, miel et cannelle. Toujours diluer le vinaigre.",
    source: "https://40aprons.com/apple-cider-vinegar-and-honey-shot/",
  },
  {
    ingredients: ["Apple cider vinegar", "Lemon", "Honey"],
    name: "Morning Tonic",
    note: "The vinegar, lemon and honey shot. Always dilute vinegar.",
    noteFr: "Le shot vinaigre, citron et miel. Toujours diluer le vinaigre.",
    source:
      "https://izzycooking.com/wprm_print/apple-cider-vinegar-shot-recipe",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Apple cider vinegar", "Ginger", "Maple syrup"],
    name: "Haymaker's Draught",
    note: "Switchel, once called haymaker's punch.",
    noteFr: "Le switchel, autrefois appelé « punch des faneurs ».",
    source: "https://www.tastemade.com/recipes/maple-ginger-switchel",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Apple cider vinegar", "Garlic", "Horseradish", "Ginger"],
    name: "Dragon's Breath",
    note: "Fire cider: steeped for a month, then sweetened with honey.",
    noteFr: "Le fire cider : infusé un mois, puis adouci au miel.",
    source: "https://www.alphafoodie.com/fire-cider-recipe/",
  },
  {
    ingredients: ["Berries", "Apple cider vinegar", "Honey"],
    name: "Bramble Vinegar",
    note: "A berry shrub, the drinking vinegar: a splash in sparkling water.",
    noteFr:
      "Un shrub aux baies, le vinaigre à boire : un trait dans de l’eau pétillante.",
    source:
      "https://marysnest.com/wprm_print/shrub-a-tasty-drinking-vinegar-recipe",
  },
  {
    ingredients: ["Apple cider vinegar", "Thyme", "Honey"],
    name: "Apothecary Draught",
    note: "A thyme oxymel, the old honey and vinegar remedy, by the spoonful.",
    noteFr:
      "Un oxymel au thym, le vieux remède au miel et au vinaigre, à la cuillère.",
    source: "https://theherbalacademy.com/thyme-oxymel/",
  },
  {
    ingredients: ["Apple cider vinegar", "Garlic", "Thyme", "Honey"],
    name: "Witch's Larder",
    note: "A garlic and thyme oxymel.",
    noteFr: "Un oxymel ail et thym.",
    source: "https://homesteadingfamily.com/how-to-make-an-oxymel-at-home/",
  },
  {
    ingredients: ["Elderberry", "Apple cider vinegar", "Honey"],
    name: "Elder Grove",
    note: "An elderberry oxymel. Elderberries are steeped dried; raw ones are toxic.",
    noteFr:
      "Un oxymel au sureau. Les baies de sureau s’infusent séchées ; crues, elles sont toxiques.",
    source:
      "https://chickadeeherbal.substack.com/p/mullein-and-elderberry-oxymel",
  },
  {
    ingredients: ["Garlic", "Honey"],
    name: "Vampire's Bane",
    note: "Fermented garlic honey, by the spoonful.",
    noteFr: "Du miel à l’ail fermenté, à la cuillère.",
    source: "https://coleycooks.com/wprm_print/fermented-garlic-honey-recipe",
  },

  // Beet shots
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Beetroot", "Orange", "Lemon", "Ginger"],
    name: "Crimson Dawn",
    note: "A beet shot.",
    noteFr: "Un shot de betterave.",
    source:
      "https://theeastcoastkitchen.com/beet-and-ginger-juice-a-delicious-immune-boosting-recipe/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Beetroot", "Carrot", "Apple", "Ginger"],
    name: "Ruby Root",
    note: "Beet, carrot and apple: ABC juice, as a shot.",
    noteFr: "Betterave, carotte et pomme : le jus ABC, en shot.",
    source:
      "https://theeastcoastkitchen.com/beet-and-ginger-juice-a-delicious-immune-boosting-recipe/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Beetroot", "Lemon", "Ginger"],
    name: "Heartbeet",
    note: "A beet, lemon and ginger shot, an hour before a workout.",
    noteFr: "Un shot betterave, citron et gingembre, une heure avant le sport.",
    source:
      "https://www.vitalproteins.com/blogs/recipes/beet-juice-shots-erin-oprea",
  },
  {
    ingredients: ["Beetroot", "Coconut Water", "Lemon"],
    name: "Racing Heart",
    note: "A pre-workout beet shot.",
    noteFr: "Un shot de betterave avant l’effort.",
    source: "https://myvega.ca/blogs/recipes/pre-workout-beet-shot",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Beetroot", "Cranberry", "Lemon", "Ginger"],
    name: "Cranberry Crown",
    note: "A beet and cranberry booster.",
    noteFr: "Un booster betterave et canneberge.",
    source: "https://namawell.com/blogs/recipes/beet-cranberry-booster",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Beetroot", "Apple cider vinegar", "Hibiscus", "Turmeric"],
    name: "Crimson Twilight",
    note: "A beet and hibiscus shot. Always dilute vinegar.",
    noteFr: "Un shot betterave et hibiscus. Toujours diluer le vinaigre.",
    source:
      "https://mccormick.com/articles/mccormick/6-easy-wellness-shot-recipes-for-winter",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Cranberry", "Apple", "Orange", "Ginger"],
    name: "Harvest Moon",
    note: "A cranberry and ginger shot.",
    noteFr: "Un shot canneberge et gingembre.",
    source: "https://namawell.com/blogs/recipes/ginger-wellness-shots",
  },

  // Green shots
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Kale", "Cucumber", "Spirulina", "Ginger"],
    name: "Verdant Whisper",
    note: "A green shot.",
    noteFr: "Un shot vert.",
    source: "https://www.goodnature.com/recipes/clean-green-juice-shot/print",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Spinach", "Apple", "Celery", "Ginger"],
    name: "Meadow Dew",
    note: "A green juice shot.",
    noteFr: "Un shot de jus vert.",
    source: "https://wilfa.com/blogs/recipes/2-juice-shots",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Celery", "Apple", "Lemon", "Ginger"],
    name: "Whirlwind Tonic",
    note: "A celery and ginger shot.",
    noteFr: "Un shot céleri et gingembre.",
    source:
      "https://goodnature.com/recipes/juice-shot-ginger-lemon-celery-apple/print",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Celery", "Lemon", "Ginger", "Honey"],
    name: "Thornbrook",
    note: "A celery, ginger and hot honey shooter.",
    noteFr: "Un shot céleri, gingembre et miel pimenté.",
    source:
      "https://savannahbee.com/blogs/recipes/celery-ginger-and-hot-honey-shooter",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Pineapple", "Lemon", "Ginger", "Honey"],
    name: "Sunlit Grove",
    note: "A pineapple, lemon and ginger shot.",
    noteFr: "Un shot ananas, citron et gingembre.",
    source: "https://wetrinifood.com/ginger-pineapple-lemon-shot/",
  },
  {
    forms: { Ginger: "fresh", Wheatgrass: "fresh" },
    ingredients: ["Wheatgrass", "Apple", "Ginger"],
    name: "Grassblade",
    note: "Applegrass: wheatgrass and apple, with ginger.",
    noteFr: "L’applegrass : herbe de blé et pomme, au gingembre.",
    source: "https://www.yuppiechef.com/spatula/applegrass-juice/",
  },
  {
    forms: { Wheatgrass: "powder" },
    ingredients: ["Wheatgrass", "Orange"],
    name: "Meadow Sun",
    note: "Wheatgrass powder, its grassiness hidden in orange juice.",
    noteFr:
      "De l’herbe de blé en poudre, son goût d’herbe caché dans du jus d’orange.",
    source: "https://www.masalaherb.com/wheatgrass-juice-power-punch/",
  },
  {
    forms: { Wheatgrass: "fresh" },
    ingredients: ["Wheatgrass", "Apple"],
    name: "Green Orchard",
    note: "Wheatgrass blended into apple juice, then strained.",
    noteFr: "De l’herbe de blé mixée dans du jus de pomme, puis filtrée.",
    source: "https://www.masalaherb.com/wheatgrass-juice-power-punch/",
  },
  {
    ingredients: ["Lemon", "Spirulina", "Cayenne"],
    name: "Deep Pond",
    note: "A spirulina shot.",
    noteFr: "Un shot de spiruline.",
    source: "https://cleancuisine.com/benefits-of-spirulina/print/62771/",
  },
  {
    ingredients: ["Lemon", "Matcha", "Honey"],
    name: "Sylvan Glow",
    note: "A honey, lemon and matcha energy shot.",
    noteFr: "Un shot énergie miel, citron et matcha.",
    source: "https://honey.com/recipe/honey-lemon-matcha-energy-shot",
  },
  {
    forms: { Ginger: "fresh", Mint: "fresh" },
    ingredients: ["Lime", "Matcha", "Ginger", "Mint"],
    name: "Jade Lightning",
    note: "A matcha, ginger and mint tonic, the alcohol-free way.",
    noteFr: "Un tonique matcha, gingembre et menthe, version sans alcool.",
    source:
      "https://navitasorganics.com/blogs/recipes/ginger-mint-matcha-cocktail",
  },
  {
    ingredients: ["Lemon", "Moringa", "Honey"],
    name: "Drumstick Grove",
    note: "Moringa tea, from the leaves of the drumstick tree.",
    noteFr: "Un thé de moringa, fait des feuilles de l’arbre à baguettes.",
    source: "https://www.cleaneatingkitchen.com/moringa-tea-recipe",
  },

  // Berry shots
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Elderberry", "Ginger", "Cinnamon", "Honey"],
    name: "Forest's Whisper",
    note: "Elderberry syrup. Elderberries must be cooked; raw ones are toxic.",
    noteFr:
      "Un sirop de sureau. Les baies de sureau doivent être cuites ; crues, elles sont toxiques.",
    source: "https://www.groundwork.org.uk/?p=135277",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Pomegranate", "Elderberry", "Ginger", "Honey"],
    name: "Velvet Night",
    note: "A pomegranate and elderberry wellness shot.",
    noteFr: "Un shot bien-être grenade et sureau.",
    source: "https://www.pomwonderful.com/drink/pom-wellness-shot",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Berries", "Pomegranate", "Elderberry", "Ginger"],
    name: "Midnight Bramble",
    note: "A blueberry and elderberry immunity shot.",
    noteFr: "Un shot immunité myrtille et sureau.",
    source: "https://naturallieplantbased.com/elderberry-immunity-shots/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Pomegranate", "Watermelon", "Apple", "Ginger"],
    name: "Ethereal Bloom",
    note: "An antioxidant kick shot.",
    noteFr: "Un shot coup de fouet antioxydant.",
    source:
      "https://www.pomwonderful.com/dishes/pom-antioxidant-kick-wellness-shot",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Berries", "Ginger", "Honey"],
    name: "Mystic Dawn",
    note: "A blueberry and ginger shot, with no citrus.",
    noteFr: "Un shot myrtille et gingembre, sans agrumes.",
    source: "https://thedizzycook.com/homemade-immunity-shot",
  },
  {
    ingredients: ["Tart cherry", "Apple cider vinegar"],
    name: "Night Orchard",
    note: "A tart cherry mocktail for sleep, topped up with sparkling water.",
    noteFr:
      "Un mocktail à la griotte pour le sommeil, allongé d’eau pétillante.",
    source:
      "https://www.dashofjazz.com/wprm_print/tart-cherry-juice-mocktail-for-sleep",
  },
  {
    ingredients: ["Tart cherry", "Lime"],
    name: "Cherry Moon",
    note: "A tart cherry and lime spritzer.",
    noteFr: "Un spritz griotte et citron vert.",
    source: "https://evidation.com/blog/tart-cherry-juice-sleep-cocktail",
  },

  // Coolers
  {
    ingredients: ["Lemon", "Blue Pea", "Honey"],
    name: "Dawn's Caress",
    note: "Butterfly pea lemonade: blue tea that turns purple with the lemon.",
    noteFr:
      "La limonade au pois papillon : un thé bleu qui vire au violet avec le citron.",
    source:
      "https://beeinspiredgoods.com/blogs/honey-recipes/butterfly-pea-tea-lemonade-soda",
  },
  {
    ingredients: ["Lemon", "Lavender", "Honey"],
    name: "Lavender Haze",
    note: "Honey lavender lemonade.",
    noteFr: "Une limonade miel et lavande.",
    source: "https://www.oprah.com/food/lavender-honey-lemonade-recipe",
  },
  {
    ingredients: ["Hibiscus", "Lime"],
    name: "Scarlet Fountain",
    note: "Agua de jamaica, Mexico's hibiscus cooler.",
    noteFr: "L’agua de jamaica, la boisson fraîche mexicaine à l’hibiscus.",
    source:
      "https://www.tastingtable.com/1172126/agua-de-jamaica-hibiscus-tea-recipe/",
  },
  {
    ingredients: ["Grapefruit", "Rosemary", "Honey"],
    name: "Crystal Grove",
    note: "Grapefruit with rosemary honey. Grapefruit interferes with some medicines.",
    noteFr:
      "Pamplemousse au miel de romarin. Le pamplemousse interagit avec certains médicaments.",
    source:
      "https://thetomato.ca/recipes/rosemary-honey-and-grapefruit-spritzer",
  },
  {
    forms: { Ginger: "fresh", Mint: "fresh" },
    ingredients: ["Watermelon", "Lime", "Ginger", "Mint"],
    name: "Celestial Mist",
    note: "A watermelon agua fresca.",
    noteFr: "Une agua fresca à la pastèque.",
    source: "https://meatified.com/watermelon-agua-fresca-aip/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Watermelon", "Celery", "Lemon", "Ginger"],
    name: "Summer Spark",
    note: "A watermelon wellness shot.",
    noteFr: "Un shot bien-être à la pastèque.",
    source: "https://namawell.com/blogs/recipes/watermelon-wellness-shots",
  },
  {
    forms: { Mint: "fresh" },
    ingredients: ["Cucumber", "Lime", "Mint", "Maple syrup"],
    name: "Veil of Serenity",
    note: "A cucumber and lime agua fresca.",
    noteFr: "Une agua fresca concombre et citron vert.",
    source: "https://minimalistbaker.com/cucumber-lime-agua-fresca/",
  },
  {
    ingredients: ["Cucumber", "Coconut Water", "Lemon"],
    name: "Cool Current",
    note: "A cucumber coconut water lemonade, for electrolytes.",
    noteFr: "Une limonade concombre à l’eau de coco, pour les électrolytes.",
    source:
      "https://orgain.com/blogs/recipes/cucumber-coconut-water-lemonade-electrolyte",
  },
  {
    ingredients: ["Celery", "Lime", "Coconut Water"],
    name: "Green Tide",
    note: "A celery and lime agua fresca.",
    noteFr: "Une agua fresca céleri et citron vert.",
    source: "https://nutritionbymia.com/celery-lime-agua-fresca",
  },
  {
    ingredients: ["Celery", "Cucumber", "Coconut Water", "Jalapeño"],
    name: "Earthbound Vitality",
    note: "A hangover helper shot.",
    noteFr: "Un shot anti-gueule de bois.",
    source: "https://tasty.co/recipe/hangover-helper-wellness-shot",
  },
  {
    ingredients: ["Aloe Vera", "Lime", "Coconut Water"],
    name: "Spirit's Bloom",
    note: "An aloe shot. Use inner-leaf or decolorized aloe juice.",
    noteFr:
      "Un shot d’aloe. Utilisez du jus d’aloe de pulpe intérieure ou décoloré.",
    source: "https://www.bellevueclub.com/?p=2738",
  },

  // Teas
  {
    forms: { Ginger: "dried" },
    ingredients: ["Lemon", "Ginger", "Honey"],
    name: "Fireside Tea",
    note: "Honey, lemon and ginger tea.",
    noteFr: "Un thé miel, citron et gingembre.",
    source: "https://ingenium.ca/agriculture/en/recipes/honey-lemon-ginger-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Ginger", "Honey"],
    name: "Ember Tea",
    note: "Ginger honey tea.",
    noteFr: "Un thé gingembre et miel.",
    source: "https://www.rachaelray.com/blogs/recipes/ginger-honey-tea",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Ginger", "Cinnamon", "Honey"],
    name: "Hearthstone",
    note: "Ginger and cinnamon tea.",
    noteFr: "Un thé gingembre et cannelle.",
    source: "https://www.tarladalal.com/ginger-cinnamon-tea-41753r",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Cinnamon", "Ginger"],
    name: "Winter Palace",
    note: "Sujeonggwa, Korea's cinnamon and ginger punch, served cold.",
    noteFr:
      "Le sujeonggwa, le punch coréen à la cannelle et au gingembre, servi froid.",
    source:
      "https://www.beyondkimchee.com/korean-cinnamon-ginger-punch-sujeonggwa/",
  },
  {
    forms: { Ginger: "dried", Mint: "dried" },
    ingredients: ["Ginger", "Mint"],
    name: "Pantry Breeze",
    note: "A dried ginger and mint tea, for a settled stomach.",
    noteFr: "Un thé gingembre séché et menthe, pour apaiser l’estomac.",
    source:
      "https://www.wholefoodsmarket.com/recipes/homemade-dried-fruit-and-herb-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Lemongrass", "Ginger"],
    name: "Paddy Breeze",
    note: "Lemongrass and ginger tea.",
    noteFr: "Un thé citronnelle et gingembre.",
    source: "https://delightfulplate.com/wprm_print/lemongrass-ginger-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Jujube", "Ginger"],
    name: "Autumn Hearth",
    note: "Daechu saenggang-cha, Korea's jujube and ginger tea.",
    noteFr:
      "Le daechu saenggang-cha, le thé coréen aux jujubes et au gingembre.",
    source:
      "https://www.uclahealth.org/simms-mann-center/recipes/jujube-ginger-tea",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Jujube", "Ginger", "Cinnamon"],
    name: "Red Date Reverie",
    note: "Jujube tea with ginger and a cinnamon stick, thick and sweet.",
    noteFr:
      "Un thé de jujubes au gingembre et au bâton de cannelle, épais et sucré.",
    source: "https://www.maangchi.com/recipe/daechu-saenggangcha",
  },
  {
    ingredients: ["Goji", "Jujube"],
    name: "Red Lantern",
    note: "Red date and goji tea, hot or over ice.",
    noteFr: "Un thé dattes rouges et goji, chaud ou glacé.",
    source: "https://omnivorescookbook.com/jujube-tea/",
  },
  {
    ingredients: ["Goji", "Chrysanthemum"],
    name: "Golden Petal",
    note: "Chrysanthemum and goji tea, a cooling Chinese tea.",
    noteFr: "Un thé chrysanthème et goji, un thé chinois rafraîchissant.",
    source: "https://onolicioushawaii.com/chrysanthemum-goji-berry-tea/",
  },
  {
    ingredients: ["Yuzu", "Honey"],
    name: "Citron Lantern",
    note: "Yuja-cha: yuzu cured in honey, by the spoonful in hot water.",
    noteFr:
      "Le yuja-cha : du yuzu confit dans le miel, à la cuillère dans de l’eau chaude.",
    source: "https://www.greedygirlgourmet.com/yuzu-tea-homemade-yuja-cheong/",
  },
  {
    forms: { Cinnamon: "powder", Ginger: "dried" },
    ingredients: ["Tulsi", "Ginger", "Black pepper", "Cinnamon"],
    name: "Monsoon Remedy",
    note: "Kadha, the Ayurvedic spiced tea.",
    noteFr: "Le kadha, le thé épicé ayurvédique.",
    source: "https://www.rnz.co.nz/life/food/recipes/basic-kadha-recipe",
  },
  {
    ingredients: ["Tulsi", "Lemon", "Honey"],
    name: "Temple Leaf",
    note: "Holy basil tea.",
    noteFr: "Un thé au basilic sacré.",
    source: "https://hungryinthailand.com/holy-basil-tea-recipe/",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Tulsi", "Ginger", "Lemon", "Honey"],
    name: "Sacred Ember",
    note: "Adrak tulsi chai, ginger and holy basil tea.",
    noteFr: "L’adrak tulsi chai, thé au gingembre et au basilic sacré.",
    source:
      "https://archanaskitchen.com/ginger-holy-basil-tisane-adrak-tulsi-chai-recipe",
  },
  {
    ingredients: ["Thyme", "Lemon", "Honey"],
    name: "Thyme Keeper",
    note: "Thyme tea with honey and lemon, for a cough.",
    noteFr: "Un thé au thym, miel et citron, contre la toux.",
    source:
      "https://pushdoctor.co.uk/what-we-treat/cold-flu-rtis/articles/homemade-cough-relieving-tea",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Red tea", "Ginger", "Cardamom", "Cinnamon"],
    name: "Spice Road",
    note: "Masala chai.",
    noteFr: "Le masala chai.",
    source: "https://lovefood.com/recipes/88287/dishoom-masala-chai-recipe",
  },
  {
    forms: { Cinnamon: "dried" },
    ingredients: ["Red tea", "Apple", "Cinnamon"],
    name: "Orchard Steam",
    note: "Apple cinnamon tea.",
    noteFr: "Un thé pomme et cannelle.",
    source: "https://www.whiskaffair.com/apple-cinnamon-tea/",
  },
  {
    forms: { Cinnamon: "dried" },
    ingredients: ["Green tea", "Cardamom", "Cinnamon"],
    name: "Kashmir Mist",
    note: "Kahwa, Kashmir's spiced green tea.",
    noteFr: "Le kahwa, le thé vert épicé du Cachemire.",
    source: "https://vegrecipesofindia.com/kahwa-tea",
  },
  {
    forms: { Mint: "fresh" },
    ingredients: ["Green tea", "Mint"],
    name: "Atlas Breeze",
    note: "Moroccan mint tea, poured from a height.",
    noteFr: "Le thé à la menthe marocain, versé de haut.",
    source:
      "https://www.americastestkitchen.com/recipes/15572-moroccan-mint-tea",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["White tea", "Cucumber", "Lemon", "Ginger"],
    name: "Pale Dawn",
    note: "An iced white tea cooler with cucumber, lemon and ginger.",
    noteFr: "Un thé blanc glacé au concombre, citron et gingembre.",
    source:
      "https://foodisgood.com/recipe/white-tea-cucumber-cooler/paleo/?tag=summer",
  },
  {
    ingredients: ["Black tea", "Chrysanthemum"],
    name: "Teahouse Dusk",
    note: "Guk po, pu-erh with chrysanthemum: the dim sum tea of Cantonese teahouses.",
    noteFr:
      "Le guk po, pu-erh au chrysanthème : le thé des dim sum des maisons de thé cantonaises.",
    source: "https://gocantonese.com/dimsum/dishes/chrysanthemum-pu-er-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Hibiscus", "Ginger", "Honey"],
    name: "Scarlet Veil",
    note: "A hibiscus and ginger tea.",
    noteFr: "Un thé hibiscus et gingembre.",
    source: "https://askdrnandi.com/recipe/ginger-and-hibiscus-drink/",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Hibiscus", "Ginger", "Cinnamon", "Clove"],
    name: "Yuletide Ruby",
    note: "Sorrel, the Caribbean's spiced hibiscus drink for Christmas.",
    noteFr: "Le sorrel, la boisson caribéenne épicée à l’hibiscus de Noël.",
    source: "https://grocery.coop/recipes/spiced-sorrel-drink",
  },
  {
    ingredients: ["Rosehip", "Hibiscus"],
    name: "Rose Garden",
    note: "Rosehip and hibiscus tea, tart and red.",
    noteFr: "Un thé cynorrhodon et hibiscus, acidulé et rouge.",
    source: "https://www.thenourishinggourmet.com/easyrecipe-print/8896-0",
  },
  {
    ingredients: ["Rosehip", "Honey"],
    name: "Briar Rose",
    note: "Rosehip tea.",
    noteFr: "Un thé de cynorrhodon.",
    source: "https://www.plumdeluxe.com/blogs/blog/how-to-make-rosehip-tea",
  },
  {
    ingredients: ["Chamomile", "Honey"],
    name: "Quiet Hours",
    note: "Chamomile tea with honey.",
    noteFr: "Une camomille au miel.",
    source: "https://www.bbcgoodfoodme.com/recipes/camomile-tea-honey/",
  },
  {
    ingredients: ["Chamomile", "Lavender", "Honey"],
    name: "Lullaby Meadow",
    note: "Chamomile and lavender tea, for sleep.",
    noteFr: "Une tisane camomille et lavande, pour le sommeil.",
    source:
      "https://www.canyonranch.com/well-stated/recipe/chamomile-lavender-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Tart cherry", "Chamomile", "Ginger", "Honey"],
    name: "Moonlit Garden",
    note: "A sleepy-time tart cherry tea.",
    noteFr: "Un thé à la griotte pour bien dormir.",
    source: "https://glutenfreeandmore.com/?p=45520",
  },
  {
    forms: { Cinnamon: "dried" },
    ingredients: ["Apple", "Orange", "Cinnamon", "Clove"],
    name: "Ember Cider",
    note: "Mulled apple cider, without the alcohol.",
    noteFr: "Un cidre de pomme chaud épicé, sans l’alcool.",
    source: "https://www.keep-calm-and-eat-ice-cream.com/mulled-apple-cider",
  },
  // A second potion for every ingredient
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Blue Pea", "Lemongrass", "Ginger", "Lime"],
    name: "Indigo Dusk",
    note: "Butterfly pea flower tea with lemongrass: blue, until the lime turns it purple.",
    noteFr:
      "Un thé de fleurs de pois papillon à la citronnelle : bleu, jusqu’à ce que le citron vert le fasse virer au violet.",
    source:
      "https://www.americastestkitchen.com/recipes/15573-butterfly-pea-flower-tea",
  },
  {
    forms: { Mint: "fresh" },
    ingredients: ["Grapefruit", "Mint", "Rosemary", "Honey"],
    name: "Coral Tide",
    note: "A grapefruit, mint and rosemary tonic. Grapefruit interferes with some medicines.",
    noteFr:
      "Un tonique pamplemousse, menthe et romarin. Le pamplemousse interagit avec certains médicaments.",
    source: "https://soilborn.org/recipe/grapefruit-mint-rosemary-tonic",
  },
  {
    ingredients: ["Berries", "Spinach", "Moringa"],
    name: "Verdant Bloom",
    note: "A moringa smoothie with spinach and strawberries.",
    noteFr: "Un smoothie au moringa avec épinards et fraises.",
    source: "https://tasty.co/recipe/moringa-smoothie",
  },
  {
    ingredients: ["Black tea", "Orange"],
    name: "Mandarin Hollow",
    note: "Xiao qing gan: a little mandarin hollowed out, filled with ripe pu-erh, and brewed whole.",
    noteFr:
      "Le xiao qing gan : une petite mandarine évidée, garnie de pu-erh mûr, infusée entière.",
    source:
      "https://teasenz.eu/blogs/tea-magazine/how-to-make-xiao-qing-gan-tea",
  },
  {
    ingredients: ["Coconut milk", "Matcha", "Honey"],
    name: "Coconut Grove",
    note: "A coconut milk matcha latte.",
    noteFr: "Un matcha latte au lait de coco.",
    source:
      "https://navitasorganics.com/blogs/recipes/coconut-matcha-latte-recipe",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Tamarind", "Lime", "Ginger", "Honey"],
    name: "Tamarind Sundown",
    note: "Jamaica's tamarind drink, with ginger and lime, over plenty of ice.",
    noteFr:
      "La boisson jamaïcaine au tamarin, avec gingembre et citron vert, sur beaucoup de glace.",
    source: "https://jamaicanfoodsandrecipes.com/tamarind-drink/",
  },
  {
    ingredients: ["Yuzu", "Matcha", "Honey"],
    name: "Yuzu Spark",
    note: "Sparkling yuzu matcha, topped with soda water.",
    noteFr: "Un matcha pétillant au yuzu, allongé d’eau gazeuse.",
    source: "https://www.rishi-tea.com/blogs/journal/sparkling-yuzu-matcha",
  },
  {
    forms: { Mint: "fresh" },
    ingredients: ["Aloe Vera", "Cucumber", "Lemon", "Mint"],
    name: "Desert Mirror",
    note: "A minty aloe and cucumber lemonade. Only the clear inner gel of the leaf.",
    noteFr:
      "Une limonade aloe et concombre à la menthe. Seulement le gel clair de l’intérieur de la feuille.",
    source: "https://golubkakitchen.com/minty-aloe-and-cucumber-lemonade/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Kale", "Pineapple", "Orange", "Ginger"],
    name: "Emerald Canopy",
    note: "A pineapple, orange and kale green juice with ginger.",
    noteFr: "Un jus vert ananas, orange et chou kale au gingembre.",
    source: "https://www.kuvings.com/blogs/recipes/pineapple-green-juice",
  },
  {
    forms: { Mint: "fresh" },
    ingredients: ["White tea", "Apple", "Coconut Water", "Mint"],
    name: "White Garden",
    note: "An iced white tea with apple, coconut water and mint.",
    noteFr: "Un thé blanc glacé à la pomme, à l’eau de coco et à la menthe.",
    source:
      "https://biggestmorningtea.com.au/tools/recipes/apple-coconut-and-mint-iced-tea",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Mango", "Coconut milk", "Lime", "Turmeric"],
    name: "Golden Lagoon",
    note: "A mango and coconut smoothie with turmeric and lime.",
    noteFr: "Un smoothie mangue et coco au curcuma et citron vert.",
    source:
      "https://nyssaskitchen.com/mango-coconut-smoothie-with-turmeric-and-lime/",
  },
  {
    ingredients: ["Watermelon", "Jalapeño", "Lime"],
    name: "Ember Melon",
    note: "A watermelon and jalapeño agua fresca. Seed the jalapeño for less heat.",
    noteFr:
      "Une agua fresca pastèque et jalapeño. Épépinez le jalapeño pour moins de piquant.",
    source: "https://watermelon.org/recipes/watermelon-jalapeno-agua-fresca",
  },
  {
    ingredients: ["Apple cider vinegar", "Horseradish", "Lemon", "Honey"],
    name: "Root Fire Honey",
    note: "Fire cider made an oxymel: steeped in vinegar, then sweetened with honey. Taken by the spoonful.",
    noteFr:
      "Le fire cider en oxymel : infusé dans le vinaigre, puis adouci au miel. À la cuillère.",
    source:
      "https://ohiomagazine.com/Food-Drink/Recipes/Details/rosemary-s-fire-cider-oxymel",
  },
];
