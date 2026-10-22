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
    source: "https://www.aspicyperspective.com/easy-ginger-shot-recipe/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Ginger", "Cayenne", "Honey"],
    name: "Spark of the Hearth",
    note: "A lemon and ginger shot, with a kick of cayenne.",
    source: "https://www.cleaneatingkitchen.com/?p=42511",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Ginger", "Cayenne"],
    name: "Firecracker",
    note: "A lemony ginger shot with a cayenne kick, as the juice bars sell it.",
    source: "https://cookunity.com/meals/winter-wellness-juice-bundle",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Ginger", "Honey"],
    name: "Bright Spark",
    note: "A lemon, honey and ginger shot.",
    source: "https://voelkel.bio/en/produkt/ginger-shot-lemon-honey-0-5l-3/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Orange", "Lemon", "Ginger", "Honey"],
    name: "Citrus Charm",
    note: "An orange, lemon and ginger shot.",
    source: "https://www.thecookierookie.com/?p=81035",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Orange", "Ginger"],
    name: "Orange Ember",
    note: "An orange and ginger shot.",
    source:
      "https://www.onlineapo.at/en/Biotta-Immune-SHOT-Ingwer-Orange-Bio-10-x-50-ml/RA5761844",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Apple", "Lemon", "Ginger", "Honey"],
    name: "Orchard Ember",
    note: "A ginger shot softened with apple and honey.",
    source: "https://www.occasionallyeggs.com/wprm_print/ginger-shots",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Apple", "Lemon", "Ginger"],
    name: "Root Awakening",
    note: "An apple, lemon and ginger shot.",
    source:
      "https://groceries.morrisons.com/products/moju-ginger-shots/115561158",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lime", "Ginger", "Honey"],
    name: "Lime Lightning",
    note: "A ginger and lime shot.",
    source: "https://wetrinifood.com/ginger-lime-shots/",
  },
  {
    forms: { Ginger: "fresh", Mint: "fresh" },
    ingredients: ["Pineapple", "Coconut Water", "Ginger", "Mint"],
    name: "Tide of Tranquility",
    note: "A pineapple and ginger shot, for digestion.",
    source: "https://www.alphafoodie.com/wellness-shot-recipes/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Garlic", "Ginger", "Honey"],
    name: "Hearthguard",
    note: "A garlic immunity shot.",
    source: "https://www.foodbymaria.com/immunity-shots/",
  },
  {
    ingredients: ["Lemon", "Maple syrup", "Cayenne"],
    name: "Desert Lemonade",
    note: "The lemon, maple and cayenne lemonade of the master cleanse: drink it with meals, not instead of them.",
    source:
      "https://www.downtoearth.org/recipes/beverages/lemon-cayenne-pepper-cleanse",
  },

  // Turmeric shots
  {
    forms: { Ginger: "fresh", Turmeric: "fresh" },
    ingredients: ["Orange", "Carrot", "Ginger", "Turmeric"],
    name: "Golden Harvest",
    note: "The orange, carrot, ginger and turmeric shot.",
    source:
      "https://hr.umich.edu/benefits-wellness/health/mhealthy/physical-well-being/nutrition/mhealthy-recipes/orange-carrot-ginger-turmeric-shots",
  },
  {
    forms: { Ginger: "fresh", Turmeric: "powder" },
    ingredients: ["Lemon", "Ginger", "Turmeric", "Black pepper"],
    name: "Elixir of Morning Renewal",
    note: "The lemon, ginger and turmeric shot. Black pepper helps the body take up turmeric.",
    source:
      "https://www.gohealthyeverafter.com/4-ingredient-turmeric-tea-recipe/",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Coconut Water", "Lemon", "Turmeric", "Black pepper"],
    name: "Liquid Gold",
    note: "A turmeric shot on coconut water.",
    source: "https://drhyman.com/blogs/content/turmeric-super-shots",
  },
  {
    forms: { Ginger: "fresh", Turmeric: "fresh" },
    ingredients: ["Orange", "Lemon", "Ginger", "Turmeric"],
    name: "Amber Crown",
    note: "A citrus turmeric shot.",
    source: "https://voelkel.bio/en/produkt/ginger-shot-turmeric-0-5l-2/",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Orange", "Lemon", "Turmeric", "Cayenne"],
    name: "Sunfire Shield",
    note: "A flu-fighter shot, shaken in a jar.",
    source: "https://ellegourmet.ca/wprm_print/flu-fighter-wellness-shots",
  },
  {
    forms: { Turmeric: "fresh" },
    ingredients: ["Mango", "Orange", "Turmeric", "Cayenne"],
    name: "Sunset Elixir",
    note: "A hot mango shot.",
    source:
      "https://www.brake.co.uk/drinks-snacks/cold-beverages/pure-juice-smoothies/juice-shots/moju-hot-mango-juice-shot-60ml/p/187106",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Carrot", "Lemon", "Turmeric", "Black pepper"],
    name: "Amber Spell",
    note: "A carrot and turmeric shot.",
    source: "https://www.frontiercoop.com/recipes/carrot-ginger-turmeric-shot",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Carrot", "Lemon", "Ginger", "Cayenne"],
    name: "Ember Root",
    note: "A carrot and ginger cleanse shot.",
    source:
      "https://www.goodnature.com/recipes/juice-shot-fresh-ginger-cleanse-recipe/print",
  },
  {
    forms: { Ginger: "fresh", Turmeric: "fresh" },
    ingredients: ["Tamarind", "Turmeric", "Ginger", "Honey"],
    name: "Sun Temple",
    note: "Jamu kunyit asam, Indonesia's turmeric and tamarind tonic.",
    source: "https://nomadette.com/turmeric-tamarind-jamu/",
  },
  {
    forms: { Cinnamon: "powder", Ginger: "fresh", Turmeric: "powder" },
    ingredients: ["Coconut milk", "Turmeric", "Cinnamon", "Ginger"],
    name: "Golden Lullaby",
    note: "Golden milk, haldi doodh: warm, before bed.",
    source: "https://www.tastemade.com/recipes/golden-milk-turmeric-tea",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Turmeric", "Black pepper", "Honey"],
    name: "Liquid Sun",
    note: "Golden honey: a spoonful in warm water.",
    source: "https://www.alphafoodie.com/simple-turmeric-honey-paste-uses/",
  },

  // Vinegar shots and tonics
  {
    forms: { Ginger: "fresh", Turmeric: "fresh" },
    ingredients: ["Pineapple", "Apple cider vinegar", "Ginger", "Turmeric"],
    name: "Ancient Garden",
    note: "A pineapple vitamin C shot. Always dilute vinegar.",
    source:
      "https://dole.com/en-ca/recipes/all-recipes/vitamin-c-immunity-shot",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Lemon", "Apple cider vinegar", "Turmeric", "Black pepper"],
    name: "Lantern Light",
    note: "A turmeric and vinegar shot. Always dilute vinegar.",
    source:
      "https://pressed.com/blogs/pressed-life/wellness-shots-recipe-easy-healthy-juice-shots",
  },
  {
    forms: { Ginger: "fresh", Turmeric: "powder" },
    ingredients: ["Orange", "Apple cider vinegar", "Ginger", "Turmeric"],
    name: "Sunrise Ward",
    note: "An orange immunity shot. Always dilute vinegar.",
    source:
      "https://southampton.stonybrookmedicine.edu/services/wellness-institute/recipes/immune-boosting-shot",
  },
  {
    forms: { Cinnamon: "powder", Ginger: "fresh" },
    ingredients: ["Apple cider vinegar", "Ginger", "Cinnamon", "Honey"],
    name: "Whispering Woods",
    note: "An apple cider vinegar shot. Always dilute vinegar.",
    source: "https://www.tasty.co/recipe/easy-as-pie-antioxidant-wellness-shot",
  },
  {
    forms: { Cinnamon: "powder" },
    ingredients: ["Apple cider vinegar", "Cinnamon", "Honey"],
    name: "Hollow Oak",
    note: "The vinegar, honey and cinnamon shot. Always dilute vinegar.",
    source: "https://40aprons.com/apple-cider-vinegar-and-honey-shot/",
  },
  {
    ingredients: ["Apple cider vinegar", "Lemon", "Honey"],
    name: "Morning Tonic",
    note: "The vinegar, lemon and honey shot. Always dilute vinegar.",
    source:
      "https://izzycooking.com/wprm_print/apple-cider-vinegar-shot-recipe",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Lemon", "Apple cider vinegar", "Ginger", "Maple syrup"],
    name: "Haymaker's Draught",
    note: "Switchel, once called haymaker's punch.",
    source: "https://www.tastemade.com/recipes/maple-ginger-switchel",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Apple cider vinegar", "Garlic", "Horseradish", "Ginger"],
    name: "Dragon's Breath",
    note: "Fire cider: steeped for a month, then sweetened with honey.",
    source: "https://www.alphafoodie.com/fire-cider-recipe/",
  },
  {
    ingredients: ["Berries", "Apple cider vinegar", "Honey"],
    name: "Bramble Vinegar",
    note: "A berry shrub, the drinking vinegar: a splash in sparkling water.",
    source:
      "https://marysnest.com/wprm_print/shrub-a-tasty-drinking-vinegar-recipe",
  },
  {
    ingredients: ["Apple cider vinegar", "Thyme", "Honey"],
    name: "Apothecary Draught",
    note: "A thyme oxymel, the old honey and vinegar remedy, by the spoonful.",
    source: "https://theherbalacademy.com/thyme-oxymel/",
  },
  {
    ingredients: ["Apple cider vinegar", "Garlic", "Thyme", "Honey"],
    name: "Witch's Larder",
    note: "A garlic and thyme oxymel.",
    source: "https://homesteadingfamily.com/how-to-make-an-oxymel-at-home/",
  },
  {
    ingredients: ["Elderberry", "Apple cider vinegar", "Honey"],
    name: "Elder Grove",
    note: "An elderberry oxymel. Elderberries are steeped dried; raw ones are toxic.",
    source:
      "https://chickadeeherbal.substack.com/p/mullein-and-elderberry-oxymel",
  },
  {
    ingredients: ["Garlic", "Honey"],
    name: "Vampire's Bane",
    note: "Fermented garlic honey, by the spoonful.",
    source: "https://coleycooks.com/wprm_print/fermented-garlic-honey-recipe",
  },

  // Beet shots
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Beetroot", "Orange", "Lemon", "Ginger"],
    name: "Crimson Dawn",
    note: "A beet shot.",
    source:
      "https://theeastcoastkitchen.com/beet-and-ginger-juice-a-delicious-immune-boosting-recipe/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Beetroot", "Carrot", "Apple", "Ginger"],
    name: "Ruby Root",
    note: "Beet, carrot and apple: ABC juice, as a shot.",
    source:
      "https://theeastcoastkitchen.com/beet-and-ginger-juice-a-delicious-immune-boosting-recipe/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Beetroot", "Lemon", "Ginger"],
    name: "Heartbeet",
    note: "A beet, lemon and ginger shot, an hour before a workout.",
    source:
      "https://www.vitalproteins.com/blogs/recipes/beet-juice-shots-erin-oprea",
  },
  {
    ingredients: ["Beetroot", "Coconut Water", "Lemon"],
    name: "Racing Heart",
    note: "A pre-workout beet shot.",
    source: "https://myvega.ca/blogs/recipes/pre-workout-beet-shot",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Beetroot", "Cranberry", "Lemon", "Ginger"],
    name: "Cranberry Crown",
    note: "A beet and cranberry booster.",
    source: "https://namawell.com/blogs/recipes/beet-cranberry-booster",
  },
  {
    forms: { Turmeric: "powder" },
    ingredients: ["Beetroot", "Apple cider vinegar", "Hibiscus", "Turmeric"],
    name: "Crimson Twilight",
    note: "A beet and hibiscus shot. Always dilute vinegar.",
    source:
      "https://mccormick.com/articles/mccormick/6-easy-wellness-shot-recipes-for-winter",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Cranberry", "Apple", "Orange", "Ginger"],
    name: "Harvest Moon",
    note: "A cranberry and ginger shot.",
    source: "https://namawell.com/blogs/recipes/ginger-wellness-shots",
  },

  // Green shots
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Kale", "Cucumber", "Spirulina", "Ginger"],
    name: "Verdant Whisper",
    note: "A green shot.",
    source: "https://www.goodnature.com/recipes/clean-green-juice-shot/print",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Spinach", "Apple", "Celery", "Ginger"],
    name: "Meadow Dew",
    note: "A green juice shot.",
    source: "https://wilfa.com/blogs/recipes/2-juice-shots",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Celery", "Apple", "Lemon", "Ginger"],
    name: "Whirlwind Tonic",
    note: "A celery and ginger shot.",
    source:
      "https://goodnature.com/recipes/juice-shot-ginger-lemon-celery-apple/print",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Celery", "Lemon", "Ginger", "Honey"],
    name: "Thornbrook",
    note: "A celery, ginger and hot honey shooter.",
    source:
      "https://savannahbee.com/blogs/recipes/celery-ginger-and-hot-honey-shooter",
  },
  {
    forms: { Ginger: "fresh", Wheatgrass: "fresh" },
    ingredients: ["Wheatgrass", "Pineapple", "Lemon", "Ginger"],
    name: "Emerald Field",
    note: "A wheatgrass shot.",
    source: "https://www.costco.com/.product.4000177379.html",
  },
  {
    forms: { Ginger: "fresh", Wheatgrass: "fresh" },
    ingredients: ["Wheatgrass", "Apple", "Ginger"],
    name: "Grassblade",
    note: "Applegrass: wheatgrass and apple, with ginger.",
    source: "https://www.yuppiechef.com/spatula/applegrass-juice/",
  },
  {
    forms: { Wheatgrass: "powder" },
    ingredients: ["Wheatgrass", "Orange"],
    name: "Meadow Sun",
    note: "Wheatgrass powder, its grassiness hidden in orange juice.",
    source: "https://www.masalaherb.com/wheatgrass-juice-power-punch/",
  },
  {
    ingredients: ["Apple", "Spirulina"],
    name: "Pond Apple",
    note: "An apple and spirulina shot.",
    source:
      "https://www.ocado.com/products/plenish-apple-spirulina-detox-shot/639162011",
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
  {
    forms: { Ginger: "fresh", Mint: "fresh" },
    ingredients: ["Lime", "Matcha", "Ginger", "Mint"],
    name: "Jade Lightning",
    note: "A matcha, ginger and mint tonic, the alcohol-free way.",
    source:
      "https://navitasorganics.com/blogs/recipes/ginger-mint-matcha-cocktail",
  },
  {
    ingredients: ["Lemon", "Moringa", "Honey"],
    name: "Drumstick Grove",
    note: "Moringa tea, from the leaves of the drumstick tree.",
    source: "https://www.cleaneatingkitchen.com/moringa-tea-recipe",
  },

  // Berry shots
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Elderberry", "Ginger", "Cinnamon", "Honey"],
    name: "Forest's Whisper",
    note: "Elderberry syrup. Elderberries must be cooked; raw ones are toxic.",
    source: "https://www.groundwork.org.uk/?p=135277",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Pomegranate", "Elderberry", "Ginger", "Honey"],
    name: "Velvet Night",
    note: "A pomegranate and elderberry wellness shot.",
    source: "https://www.pomwonderful.com/drink/pom-wellness-shot",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Berries", "Pomegranate", "Elderberry", "Ginger"],
    name: "Midnight Bramble",
    note: "A blueberry and elderberry immunity shot.",
    source: "https://naturallieplantbased.com/elderberry-immunity-shots/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Pomegranate", "Watermelon", "Apple", "Ginger"],
    name: "Ethereal Bloom",
    note: "An antioxidant kick shot.",
    source:
      "https://www.pomwonderful.com/dishes/pom-antioxidant-kick-wellness-shot",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Berries", "Ginger", "Honey"],
    name: "Mystic Dawn",
    note: "A blueberry and ginger shot, with no citrus.",
    source: "https://thedizzycook.com/homemade-immunity-shot",
  },
  {
    ingredients: ["Tart cherry", "Apple cider vinegar"],
    name: "Night Orchard",
    note: "A tart cherry mocktail for sleep, topped up with sparkling water.",
    source:
      "https://www.dashofjazz.com/wprm_print/tart-cherry-juice-mocktail-for-sleep",
  },
  {
    ingredients: ["Tart cherry", "Lime"],
    name: "Cherry Moon",
    note: "A tart cherry and lime spritzer.",
    source: "https://evidation.com/blog/tart-cherry-juice-sleep-cocktail",
  },

  // Coolers
  {
    ingredients: ["Lemon", "Blue Pea", "Honey"],
    name: "Dawn's Caress",
    note: "Butterfly pea lemonade: blue tea that turns purple with the lemon.",
    source:
      "https://beeinspiredgoods.com/blogs/honey-recipes/butterfly-pea-tea-lemonade-soda",
  },
  {
    ingredients: ["Lemon", "Lavender", "Honey"],
    name: "Lavender Haze",
    note: "Honey lavender lemonade.",
    source: "https://www.oprah.com/food/lavender-honey-lemonade-recipe",
  },
  {
    ingredients: ["Hibiscus", "Lime"],
    name: "Scarlet Fountain",
    note: "Agua de jamaica, Mexico's hibiscus cooler.",
    source:
      "https://www.tastingtable.com/1172126/agua-de-jamaica-hibiscus-tea-recipe/",
  },
  {
    ingredients: ["Grapefruit", "Rosemary", "Honey"],
    name: "Crystal Grove",
    note: "Grapefruit with rosemary honey. Grapefruit interferes with some medicines.",
    source:
      "https://thetomato.ca/recipes/rosemary-honey-and-grapefruit-spritzer",
  },
  {
    forms: { Ginger: "fresh", Mint: "fresh" },
    ingredients: ["Watermelon", "Lime", "Ginger", "Mint"],
    name: "Celestial Mist",
    note: "A watermelon agua fresca.",
    source: "https://meatified.com/watermelon-agua-fresca-aip/",
  },
  {
    forms: { Ginger: "fresh" },
    ingredients: ["Watermelon", "Celery", "Lemon", "Ginger"],
    name: "Summer Spark",
    note: "A watermelon wellness shot.",
    source: "https://namawell.com/blogs/recipes/watermelon-wellness-shots",
  },
  {
    forms: { Mint: "fresh" },
    ingredients: ["Cucumber", "Lime", "Mint", "Maple syrup"],
    name: "Veil of Serenity",
    note: "A cucumber and lime agua fresca.",
    source: "https://minimalistbaker.com/cucumber-lime-agua-fresca/",
  },
  {
    ingredients: ["Cucumber", "Coconut Water", "Lemon"],
    name: "Cool Current",
    note: "A cucumber coconut water lemonade, for electrolytes.",
    source:
      "https://orgain.com/blogs/recipes/cucumber-coconut-water-lemonade-electrolyte",
  },
  {
    ingredients: ["Celery", "Lime", "Coconut Water"],
    name: "Green Tide",
    note: "A celery and lime agua fresca.",
    source: "https://nutritionbymia.com/celery-lime-agua-fresca",
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

  // Teas
  {
    forms: { Ginger: "dried" },
    ingredients: ["Lemon", "Ginger", "Honey"],
    name: "Fireside Tea",
    note: "Honey, lemon and ginger tea.",
    source: "https://ingenium.ca/agriculture/en/recipes/honey-lemon-ginger-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Ginger", "Honey"],
    name: "Ember Tea",
    note: "Ginger honey tea.",
    source: "https://www.rachaelray.com/blogs/recipes/ginger-honey-tea",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Ginger", "Cinnamon", "Honey"],
    name: "Hearthstone",
    note: "Ginger and cinnamon tea.",
    source: "https://www.tarladalal.com/ginger-cinnamon-tea-41753r",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Cinnamon", "Ginger"],
    name: "Winter Palace",
    note: "Sujeonggwa, Korea's cinnamon and ginger punch, served cold.",
    source:
      "https://www.beyondkimchee.com/korean-cinnamon-ginger-punch-sujeonggwa/",
  },
  {
    forms: { Ginger: "dried", Mint: "dried" },
    ingredients: ["Ginger", "Mint"],
    name: "Pantry Breeze",
    note: "A dried ginger and mint tea, for a settled stomach.",
    source:
      "https://www.wholefoodsmarket.com/recipes/homemade-dried-fruit-and-herb-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Lemongrass", "Ginger"],
    name: "Paddy Breeze",
    note: "Lemongrass and ginger tea.",
    source: "https://delightfulplate.com/wprm_print/lemongrass-ginger-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Jujube", "Ginger"],
    name: "Autumn Hearth",
    note: "Daechu saenggang-cha, Korea's jujube and ginger tea.",
    source:
      "https://www.uclahealth.org/simms-mann-center/recipes/jujube-ginger-tea",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Jujube", "Ginger", "Cinnamon"],
    name: "Red Date Reverie",
    note: "Jujube tea with ginger and a cinnamon stick, thick and sweet.",
    source: "https://www.maangchi.com/recipe/daechu-saenggangcha",
  },
  {
    ingredients: ["Goji", "Jujube"],
    name: "Red Lantern",
    note: "Red date and goji tea, hot or over ice.",
    source: "https://omnivorescookbook.com/jujube-tea/",
  },
  {
    ingredients: ["Goji", "Chrysanthemum"],
    name: "Golden Petal",
    note: "Chrysanthemum and goji tea, a cooling Chinese tea.",
    source: "https://onolicioushawaii.com/chrysanthemum-goji-berry-tea/",
  },
  {
    ingredients: ["Yuzu", "Honey"],
    name: "Citron Lantern",
    note: "Yuja-cha: yuzu cured in honey, by the spoonful in hot water.",
    source: "https://www.greedygirlgourmet.com/yuzu-tea-homemade-yuja-cheong/",
  },
  {
    forms: { Cinnamon: "powder", Ginger: "dried" },
    ingredients: ["Tulsi", "Ginger", "Black pepper", "Cinnamon"],
    name: "Monsoon Remedy",
    note: "Kadha, the Ayurvedic spiced tea.",
    source: "https://www.rnz.co.nz/life/food/recipes/basic-kadha-recipe",
  },
  {
    ingredients: ["Tulsi", "Lemon", "Honey"],
    name: "Temple Leaf",
    note: "Holy basil tea.",
    source: "https://hungryinthailand.com/holy-basil-tea-recipe/",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Tulsi", "Ginger", "Lemon", "Honey"],
    name: "Sacred Ember",
    note: "Adrak tulsi chai, ginger and holy basil tea.",
    source:
      "https://archanaskitchen.com/ginger-holy-basil-tisane-adrak-tulsi-chai-recipe",
  },
  {
    ingredients: ["Thyme", "Lemon", "Honey"],
    name: "Thyme Keeper",
    note: "Thyme tea with honey and lemon, for a cough.",
    source:
      "https://pushdoctor.co.uk/what-we-treat/cold-flu-rtis/articles/homemade-cough-relieving-tea",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Black tea", "Ginger", "Cardamom", "Cinnamon"],
    name: "Spice Road",
    note: "Masala chai.",
    source: "https://lovefood.com/recipes/88287/dishoom-masala-chai-recipe",
  },
  {
    forms: { Cinnamon: "dried" },
    ingredients: ["Black tea", "Apple", "Cinnamon"],
    name: "Orchard Steam",
    note: "Apple cinnamon tea.",
    source: "https://www.whiskaffair.com/apple-cinnamon-tea/",
  },
  {
    forms: { Cinnamon: "dried" },
    ingredients: ["Green tea", "Cardamom", "Cinnamon"],
    name: "Kashmir Mist",
    note: "Kahwa, Kashmir's spiced green tea.",
    source: "https://vegrecipesofindia.com/kahwa-tea",
  },
  {
    forms: { Mint: "fresh" },
    ingredients: ["Green tea", "Mint"],
    name: "Atlas Breeze",
    note: "Moroccan mint tea, poured from a height.",
    source:
      "https://www.americastestkitchen.com/recipes/15572-moroccan-mint-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Hibiscus", "Ginger", "Honey"],
    name: "Scarlet Veil",
    note: "A hibiscus and ginger tea.",
    source: "https://askdrnandi.com/recipe/ginger-and-hibiscus-drink/",
  },
  {
    forms: { Cinnamon: "dried", Ginger: "dried" },
    ingredients: ["Hibiscus", "Ginger", "Cinnamon", "Clove"],
    name: "Yuletide Ruby",
    note: "Sorrel, the Caribbean's spiced hibiscus drink for Christmas.",
    source: "https://grocery.coop/recipes/spiced-sorrel-drink",
  },
  {
    ingredients: ["Rosehip", "Hibiscus"],
    name: "Rose Garden",
    note: "Rosehip and hibiscus tea, tart and red.",
    source: "https://www.thenourishinggourmet.com/easyrecipe-print/8896-0",
  },
  {
    ingredients: ["Rosehip", "Honey"],
    name: "Briar Rose",
    note: "Rosehip tea.",
    source: "https://www.plumdeluxe.com/blogs/blog/how-to-make-rosehip-tea",
  },
  {
    ingredients: ["Chamomile", "Honey"],
    name: "Quiet Hours",
    note: "Chamomile tea with honey.",
    source: "https://www.bbcgoodfoodme.com/recipes/camomile-tea-honey/",
  },
  {
    ingredients: ["Chamomile", "Lavender", "Honey"],
    name: "Lullaby Meadow",
    note: "Chamomile and lavender tea, for sleep.",
    source:
      "https://www.canyonranch.com/well-stated/recipe/chamomile-lavender-tea",
  },
  {
    forms: { Ginger: "dried" },
    ingredients: ["Tart cherry", "Chamomile", "Ginger", "Honey"],
    name: "Moonlit Garden",
    note: "A sleepy-time tart cherry tea.",
    source: "https://glutenfreeandmore.com/?p=45520",
  },
  {
    forms: { Cinnamon: "dried" },
    ingredients: ["Apple", "Orange", "Cinnamon", "Clove"],
    name: "Ember Cider",
    note: "Mulled apple cider, without the alcohol.",
    source: "https://www.keep-calm-and-eat-ice-cream.com/mulled-apple-cider",
  },
];
