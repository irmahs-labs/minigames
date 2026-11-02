import type { Form, Kind } from "./pantry";

/**
 * The pantry in French: each ingredient's name and tip, its shelf, and the
 * labels the server writes for an ingredient in a form ("Fresh ginger") or
 * for a locked page's clue ("dried spice"). The ingredients keep their
 * English names as keys, in the recipes and on the server.
 */
const NAME_LIST = {
  "Aloe Vera": "Aloe vera",
  Apple: "Pomme",
  "Apple cider vinegar": "Vinaigre de cidre",
  Beetroot: "Betterave",
  Berries: "Baies",
  "Black pepper": "Poivre noir",
  "Black tea": "Thé sombre",
  "Blue Pea": "Pois papillon",
  Cardamom: "Cardamome",
  Carrot: "Carotte",
  Cayenne: "Piment de Cayenne",
  Celery: "Céleri",
  Chamomile: "Camomille",
  Chrysanthemum: "Chrysanthème",
  Cinnamon: "Cannelle",
  Clove: "Clou de girofle",
  "Coconut Water": "Eau de coco",
  "Coconut milk": "Lait de coco",
  Cranberry: "Canneberge",
  Cucumber: "Concombre",
  Elderberry: "Sureau",
  Garlic: "Ail",
  Ginger: "Gingembre",
  Goji: "Goji",
  Grapefruit: "Pamplemousse",
  "Green tea": "Thé vert",
  Hibiscus: "Hibiscus",
  Honey: "Miel",
  Horseradish: "Raifort",
  Jalapeño: "Jalapeño",
  Jujube: "Jujube",
  Kale: "Chou kale",
  Lavender: "Lavande",
  Lemon: "Citron",
  Lemongrass: "Citronnelle",
  Lime: "Citron vert",
  Mango: "Mangue",
  "Maple syrup": "Sirop d’érable",
  Matcha: "Matcha",
  Mint: "Menthe",
  Moringa: "Moringa",
  Orange: "Orange",
  Pineapple: "Ananas",
  Pomegranate: "Grenade",
  "Red tea": "Thé rouge",
  Rosehip: "Cynorrhodon",
  Rosemary: "Romarin",
  Spinach: "Épinards",
  Spirulina: "Spiruline",
  Tamarind: "Tamarin",
  "Tart cherry": "Griotte",
  Thyme: "Thym",
  Tulsi: "Tulsi",
  Turmeric: "Curcuma",
  Watermelon: "Pastèque",
  Wheatgrass: "Herbe de blé",
  "White tea": "Thé blanc",
  Yuzu: "Yuzu",
} satisfies Record<string, string>;

export const FRENCH_NAMES = new Map(Object.entries(NAME_LIST));

const TIP_LIST = {
  "Aloe Vera": "Apaisant. Prenez du jus de pulpe intérieure ou décoloré.",
  Apple: "Des fibres, et une douceur qui calme les shots les plus vifs.",
  "Apple cider vinegar":
    "Peut aider à stabiliser la glycémie après un repas. Toujours diluer.",
  Beetroot: "Des nitrates, qui peuvent aider la circulation et l’effort.",
  Berries: "Riches en antioxydants, ceux-là mêmes qui les colorent.",
  "Black pepper": "La pipérine, qui aide le corps à absorber le curcuma.",
  "Black tea":
    "Thé sombre, vieilli et fermenté : terreux et doux. Essayez un pu-erh mûr ou un Liu Bao.",
  "Blue Pea": "Rend le thé bleu, puis violet quand le citron arrive.",
  Cardamom: "Une épice chaude, utilisée depuis longtemps pour la digestion.",
  Carrot: "Du bêta-carotène, que le corps transforme en vitamine A.",
  Cayenne: "La capsaïcine : le feu qui débouche les sinus.",
  Celery: "Surtout de l’eau, avec du potassium.",
  Chamomile: "Une tisane apaisante, bue depuis longtemps avant de dormir.",
  Chrysanthemum: "Un thé rafraîchissant de la tradition chinoise.",
  Cinnamon: "Une épice chaude qui peut aider à stabiliser la glycémie.",
  Clove:
    "Chaude et anesthésiante : utilisée depuis longtemps contre le mal de dents.",
  "Coconut Water": "Des électrolytes, du potassium surtout.",
  "Coconut milk": "Sa matière grasse aide le corps à absorber le curcuma.",
  Cranberry: "Acidulée, et riche en antioxydants.",
  Cucumber: "Surtout de l’eau : rafraîchissant et hydratant.",
  Elderberry:
    "Pris depuis longtemps contre le rhume. Toujours cuit : cru, il est toxique.",
  Garlic:
    "L’allicine, formée à la découpe : utilisée depuis longtemps contre le rhume.",
  Ginger: "Apaise la nausée, avec des composés anti-inflammatoires.",
  Goji: "Des baies séchées, riches en vitamine A.",
  Grapefruit: "De la vitamine C. Interagit avec certains médicaments.",
  "Green tea":
    "Des catéchines, avec un peu de caféine et de L-théanine. Essayez un Sencha ou un Gunpowder.",
  Hibiscus: "Acidulé et rouge ; peut aider à faire baisser la tension.",
  Honey: "Adoucit la gorge. Pas avant un an.",
  Horseradish: "Une racine qui débouche les sinus : le feu du fire cider.",
  Jalapeño: "Le piquant de la capsaïcine, plus doux que le Cayenne.",
  Jujube:
    "Des dattes rouges séchées, sucrées, dans les thés chinois et coréens.",
  Kale: "Des vitamines K et C.",
  Lavender: "Un parfum apaisant. De la lavande culinaire, et juste un peu.",
  Lemon: "De la vitamine C, et le coup acide de la plupart des shots.",
  Lemongrass:
    "Citronnée et parfumée, utilisée depuis longtemps pour la digestion.",
  Lime: "De la vitamine C, un peu plus vive que le citron.",
  Mango: "Des vitamines A et C, et une douceur qui calme le piquant.",
  "Maple syrup": "Du sucré, avec quelques minéraux.",
  Matcha:
    "Du thé vert en poudre : de la caféine avec de la L-théanine, pour une concentration calme.",
  Mint: "Rafraîchissante, et utilisée depuis longtemps pour la digestion.",
  Moringa: "Des feuilles en poudre, riches en vitamines et en fer.",
  Orange: "De la vitamine C et une douceur naturelle.",
  Pineapple: "La bromélaïne, une enzyme qui décompose les protéines.",
  Pomegranate: "Riche en polyphénols, une famille d’antioxydants.",
  "Red tea":
    "Entièrement oxydé, ce que l’anglais appelle thé noir : la base du chai. Essayez un English Breakfast ou un Darjeeling.",
  Rosehip: "Le fruit de la rose, très riche en vitamine C.",
  Rosemary: "Aromatique, et riche en antioxydants.",
  Spinach: "Des folates, du fer et de la vitamine K.",
  Spirulina: "Une algue bleu-vert, riche en protéines et en fer.",
  Tamarind: "La pulpe acide d’une gousse : le piquant du jamu.",
  "Tart cherry":
    "Contient un peu de mélatonine, et est étudiée pour le sommeil.",
  Thyme: "Utilisé depuis longtemps contre la toux.",
  Tulsi:
    "Le basilic sacré, un adaptogène de l’Ayurveda, étudié pour le stress.",
  Turmeric:
    "La curcumine, étudiée pour l’inflammation. Idéal avec du poivre noir.",
  Watermelon: "Surtout de l’eau : hydratante.",
  Wheatgrass:
    "Du jeune blé, en jus ou en poudre : des vitamines et de la chlorophylle.",
  "White tea":
    "Les plus jeunes bourgeons, à peine travaillés : délicat, peu caféiné. Essayez un Pai Mu Tan ou un Silver Needle.",
  Yuzu: "Un agrume parfumé d’Asie de l’Est, riche en vitamine C.",
} satisfies Record<string, string>;

export const FRENCH_TIPS = new Map(Object.entries(TIP_LIST));

/** Each shelf as French names it, and whether the word is feminine. */
export const FRENCH_KINDS: Record<Kind, { name: string; feminine: boolean }> = {
  flower: { feminine: true, name: "fleur" },
  fruit: { feminine: false, name: "fruit" },
  herb: { feminine: true, name: "herbe" },
  liquid: { feminine: false, name: "liquide" },
  powder: { feminine: true, name: "poudre" },
  spice: { feminine: true, name: "épice" },
  sweetener: { feminine: false, name: "sucrant" },
  tea: { feminine: false, name: "thé" },
  vegetable: { feminine: false, name: "légume" },
};

/** A form as an adjective, for a masculine and a feminine noun. */
export const FRENCH_FORMS: Record<Form, { m: string; f: string }> = {
  dried: { f: "séchée", m: "séché" },
  fresh: { f: "fraîche", m: "frais" },
  powder: { f: "en poudre", m: "en poudre" },
};

/** Which of the ingredients that come in forms are feminine in French. */
export const FEMININE: ReadonlySet<string> = new Set([
  "Cinnamon",
  "Mint",
  "Wheatgrass",
]);
