import type { Language } from "../../lib/language";

/**
 * What can happen in the arena: a line with places for one, two or three
 * contestants, {1} to {3}, and who dies in it and at whose hand. The lines
 * fit anyone: no "he" or "she", and no French word that agrees with one.
 */

export type Words = Record<Language, string>;

export interface Template {
  text: Words;
  /** How many contestants it takes: one, two or three. */
  size: 1 | 2 | 3;
  /** Who dies by accident: places, from 0. */
  dies: readonly number[];
  /** Who kills whom: [killer, victim], places from 0. */
  kills: readonly (readonly [number, number])[];
}

const calm = (size: 1 | 2 | 3, en: string, fr: string): Template => ({
  dies: [],
  kills: [],
  size,
  text: { en, fr },
});

const accident = (en: string, fr: string): Template => ({
  dies: [0],
  kills: [],
  size: 1,
  text: { en, fr },
});

const kill = (en: string, fr: string): Template => ({
  dies: [],
  kills: [[0, 1]],
  size: 2,
  text: { en, fr },
});

const ambush = (en: string, fr: string): Template => ({
  dies: [],
  kills: [
    [0, 2],
    [1, 2],
  ],
  size: 3,
  text: { en, fr },
});

/** The first day, when everyone scrambles for the supplies at the start. */
export const OPENING: readonly Template[] = [
  calm(
    1,
    "{1} grabs a backpack and runs into the woods.",
    "{1} attrape un sac à dos et file dans les bois."
  ),
  calm(
    1,
    "{1} runs from the supplies without looking back.",
    "{1} s’éloigne des provisions sans se retourner."
  ),
  calm(
    1,
    "{1} finds a bow and a handful of arrows.",
    "{1} trouve un arc et une poignée de flèches."
  ),
  calm(
    1,
    "{1} takes a box of matches and a water bottle.",
    "{1} prend une boîte d’allumettes et une gourde."
  ),
  calm(
    1,
    "{1} climbs the nearest tree to watch the chaos.",
    "{1} grimpe à l’arbre le plus proche pour observer le chaos."
  ),
  calm(
    1,
    "{1} trips over a crate but gets away.",
    "{1} trébuche sur une caisse mais s’en sort."
  ),
  calm(
    1,
    "{1} finds nothing but a rope, and keeps it anyway.",
    "{1} ne trouve qu’une corde, et la garde quand même."
  ),
  calm(
    1,
    "{1} grabs a sleeping bag and hides in the tall grass.",
    "{1} attrape un sac de couchage et se cache dans les hautes herbes."
  ),
  calm(
    2,
    "{1} and {2} fight over a bag of food, then both run off.",
    "{1} et {2} se disputent un sac de nourriture, puis s’enfuient chacun de son côté."
  ),
  calm(
    2,
    "{1} and {2} agree to team up.",
    "{1} et {2} décident de faire équipe."
  ),
  calm(
    2,
    "{1} snatches a knife from right under {2}’s nose.",
    "{1} chipe un couteau sous le nez de {2}."
  ),
  calm(
    3,
    "{1}, {2} and {3} form an alliance.",
    "{1}, {2} et {3} forment une alliance."
  ),
  accident(
    "{1} steps on a hidden trap and dies.",
    "{1} marche sur un piège caché et meurt."
  ),
  kill("{1} kills {2} with a thrown spear.", "{1} tue {2} d’un coup de lance."),
  kill(
    "{1} wins the fight with {2} over a sword.",
    "{1} remporte le combat contre {2} pour une épée."
  ),
  kill(
    "{1} catches {2} with an axe before {2} can run.",
    "{1} rattrape {2} d’un coup de hache avant sa fuite."
  ),
  ambush(
    "{1} and {2} gang up on {3}.",
    "{1} et {2} s’allient contre {3} et l’éliminent."
  ),
];

/** Any day after the first. */
export const DAY: readonly Template[] = [
  calm(
    1,
    "{1} finds a clear stream and drinks.",
    "{1} trouve un ruisseau limpide et se désaltère."
  ),
  calm(
    1,
    "{1} picks blackberries and saves some for later.",
    "{1} cueille des mûres et en garde pour plus tard."
  ),
  calm(1, "{1} hunts a rabbit.", "{1} chasse un lapin."),
  calm(1, "{1} practises with a slingshot.", "{1} s’entraîne au lance-pierre."),
  calm(
    1,
    "{1} hides under mud and leaves.",
    "{1} se camoufle sous la boue et les feuilles."
  ),
  calm(1, "{1} explores the arena.", "{1} explore l’arène."),
  calm(
    1,
    "{1} finds a basket of fresh bread left by the organisers.",
    "{1} trouve un panier de pain frais laissé par les organisateurs."
  ),
  calm(
    1,
    "{1} builds a shelter out of branches.",
    "{1} construit un abri de branches."
  ),
  calm(1, "{1} thinks about home.", "{1} pense à sa famille."),
  calm(
    1,
    "{1} sharpens a stick into a spear.",
    "{1} taille un bâton en lance."
  ),
  calm(
    1,
    "{1} sprains an ankle but keeps going.",
    "{1} se tord la cheville mais continue."
  ),
  calm(
    1,
    "{1} catches a fish with bare hands.",
    "{1} attrape un poisson à mains nues."
  ),
  calm(2, "{1} and {2} hunt together.", "{1} et {2} chassent ensemble."),
  calm(
    2,
    "{1} spies on {2} from the bushes.",
    "{1} espionne {2} depuis les buissons."
  ),
  calm(
    2,
    "{1} steals {2}’s supplies while {2} isn’t looking.",
    "{1} vole les provisions de {2} pendant un moment d’inattention."
  ),
  calm(
    2,
    "{1} chases {2} through the forest, but {2} gets away.",
    "{1} poursuit {2} dans la forêt, mais {2} s’échappe."
  ),
  calm(
    2,
    "{1} and {2} share a fish they caught.",
    "{1} et {2} partagent un poisson pêché ensemble."
  ),
  calm(2, "{1} patches up {2}’s wounds.", "{1} soigne les blessures de {2}."),
  calm(
    3,
    "{1}, {2} and {3} raid an abandoned camp.",
    "{1}, {2} et {3} pillent un campement abandonné."
  ),
  calm(
    3,
    "{1} and {2} argue about whether to trust {3}.",
    "{1} et {2} se disputent : faut-il faire confiance à {3} ?"
  ),
  accident(
    "{1} accidentally eats poisonous berries and dies.",
    "{1} mange par erreur des baies empoisonnées et meurt."
  ),
  accident(
    "{1} falls off a cliff while gathering eggs.",
    "{1} tombe d’une falaise en cherchant des œufs."
  ),
  accident(
    "{1} is swept away by the river.",
    "{1} se fait emporter par la rivière."
  ),
  accident(
    "{1} disturbs a wasp nest and doesn’t survive the stings.",
    "{1} dérange un nid de guêpes et ne survit pas aux piqûres."
  ),
  accident(
    "{1} drinks from a poisoned pond.",
    "{1} boit l’eau d’une mare empoisonnée, et n’y survit pas."
  ),
  accident(
    "{1} sinks into quicksand.",
    "{1} s’enfonce dans des sables mouvants."
  ),
  kill("{1} shoots {2} with an arrow.", "{1} abat {2} d’une flèche."),
  kill(
    "{1}’s snare catches {2} for good.",
    "Le piège de {1} attrape {2}, pour de bon."
  ),
  kill("{1} pushes {2} off a cliff.", "{1} pousse {2} du haut d’une falaise."),
  kill(
    "{1} wins a knife fight against {2}.",
    "{1} gagne un duel au couteau contre {2}."
  ),
  kill("{1} poisons {2}’s water.", "{1} empoisonne l’eau de {2}."),
  kill(
    "{1} and {2} fight; only {1} walks away.",
    "{1} et {2} se battent ; {1} repart, {2} non."
  ),
  ambush(
    "{1} and {2} ambush {3}.",
    "{1} et {2} tendent une embuscade fatale à {3}."
  ),
  {
    dies: [],
    kills: [
      [0, 1],
      [2, 0],
    ],
    size: 3,
    text: {
      en: "{1} kills {2}, then {3} kills {1}.",
      fr: "{1} élimine {2}, puis {3} élimine {1}.",
    },
  },
];

/** Every night. */
export const NIGHT: readonly Template[] = [
  calm(1, "{1} sleeps in a hollow tree.", "{1} dort dans un arbre creux."),
  calm(
    1,
    "{1} can’t sleep and counts the stars.",
    "{1} n’arrive pas à dormir et compte les étoiles."
  ),
  calm(
    1,
    "{1} lights a small fire, then puts it out to stay hidden.",
    "{1} allume un petit feu, puis l’éteint pour ne pas se faire repérer."
  ),
  calm(1, "{1} cries quietly.", "{1} pleure en silence."),
  calm(
    1,
    "{1} hears footsteps and stays very still.",
    "{1} entend des pas et ne bouge plus."
  ),
  calm(1, "{1} keeps watch all night.", "{1} monte la garde toute la nuit."),
  calm(1, "{1} sleeps in a cave.", "{1} dort dans une grotte."),
  calm(
    1,
    "{1} hums a song from home to stay calm.",
    "{1} fredonne une chanson de chez soi pour garder son calme."
  ),
  calm(
    2,
    "{1} and {2} tell each other stories by the fire.",
    "{1} et {2} se racontent des histoires au coin du feu."
  ),
  calm(
    2,
    "{1} and {2} take turns keeping watch.",
    "{1} et {2} montent la garde à tour de rôle."
  ),
  calm(
    2,
    "{1} sneaks into {2}’s camp and steals a blanket.",
    "{1} se faufile dans le camp de {2} et vole une couverture."
  ),
  calm(
    2,
    "{1} and {2} huddle together for warmth.",
    "{1} et {2} se blottissent ensemble pour se réchauffer."
  ),
  calm(
    3,
    "{1}, {2} and {3} sleep in shifts.",
    "{1}, {2} et {3} dorment à tour de rôle."
  ),
  accident(
    "{1} freezes in the cold night.",
    "{1} meurt de froid dans la nuit glaciale."
  ),
  accident(
    "{1} sleepwalks off a ledge.",
    "{1} est somnambule et tombe d’une corniche."
  ),
  accident(
    "{1} crosses paths with a wild boar and doesn’t survive.",
    "{1} croise la route d’un sanglier, et n’y survit pas."
  ),
  kill("{1} attacks {2} in their sleep.", "{1} attaque {2} dans son sommeil."),
  kill(
    "{1} follows the smoke of {2}’s fire and finishes {2} off.",
    "{1} suit la fumée du feu de {2} et l’élimine."
  ),
  kill(
    "{1} betrays {2} in the middle of the night.",
    "{1} trahit {2} en pleine nuit, fatalement."
  ),
  ambush(
    "{1} and {2} sneak up on {3} in the dark.",
    "{1} et {2} surprennent {3} dans le noir, sans pitié."
  ),
];

/** Whether a template kills anyone. */
export const isDeadly = (template: Template) =>
  template.dies.length > 0 || template.kills.length > 0;

/** The places that die in a template. */
export const victimsOf = (template: Template): number[] => [
  ...new Set([...template.dies, ...template.kills.map(([, victim]) => victim)]),
];
