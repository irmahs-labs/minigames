import { currentLanguage } from "../../lib/language";
import type { AnimalId } from "./lunar-zodiac";
import { placementOf } from "./zodiac";
import type { SignName } from "./zodiac";

/**
 * A witch's title, from four lists: how the rising sign comes across, what
 * the Sun sign is known for, the mood of the Moon sign, and where the Lunar
 * zodiac animal would reign. A Scorpio rising, Capricorn Sun and Scorpio
 * Moon born in a Dragon year is the Water-spirited Regent of the Submerged
 * Palace.
 */

/** The rising sign: the outward persona, as an adjective. */
export const RISING_ADJECTIVES: Readonly<Record<SignName, string>> = {
  Aquarius: "Star-minded",
  Aries: "Fire-blooded",
  Cancer: "Moon-eyed",
  Capricorn: "Stone-browed",
  Gemini: "Silver-tongued",
  Leo: "Golden-maned",
  Libra: "Grace-born",
  Pisces: "Dream-veiled",
  Sagittarius: "Wild-hearted",
  Scorpio: "Water-spirited",
  Taurus: "Velvet-voiced",
  Virgo: "Clear-eyed",
};

/** The Sun sign: the title the sign is best known for. */
export const SUN_TITLES: Readonly<Record<SignName, string>> = {
  Aquarius: "Visionary",
  Aries: "Warrior",
  Cancer: "Guardian",
  Capricorn: "Regent",
  Gemini: "Messenger",
  Leo: "Sovereign",
  Libra: "Arbiter",
  Pisces: "Oracle",
  Sagittarius: "Wanderer",
  Scorpio: "Alchemist",
  Taurus: "Steward",
  Virgo: "Healer",
};

/** The Moon sign: the mood of the heart, as an adjective for a place. */
export const MOON_PLACES: Readonly<Record<SignName, string>> = {
  Aquarius: "Starlit",
  Aries: "Burning",
  Cancer: "Moonlit",
  Capricorn: "Ancient",
  Gemini: "Whispering",
  Leo: "Golden",
  Libra: "Mirrored",
  Pisces: "Drowned",
  Sagittarius: "Endless",
  Scorpio: "Submerged",
  Taurus: "Blooming",
  Virgo: "Quiet",
};

/** The Lunar zodiac animal: where it would reign. */
export const ANIMAL_REALMS: Readonly<Record<AnimalId, string>> = {
  dog: "Fortress",
  dragon: "Palace",
  goat: "Cliffs",
  horse: "Steppe",
  monkey: "Canopy",
  ox: "Valley",
  pig: "Woods",
  rabbit: "Orchard",
  rat: "Labyrinth",
  rooster: "Tower",
  snake: "Temple",
  tiger: "Mountains",
};

export interface TitleSigns {
  /** The rising sign's longitude, or null with no birth time to place it. */
  rising: number | null;
  sun: number;
  moon: number;
  animal: AnimalId;
}

const wordFor = (list: Readonly<Record<SignName, string>>, longitude: number) =>
  list[placementOf(longitude).sign.name];

/**
 * The same four lists in French. French puts the title first, then the rising
 * sign's mark as a phrase that never agrees ("à l’âme d’eau"), then the realm
 * with the Moon's word after it, agreeing with the realm's gender.
 */
const FRENCH_RISING: Readonly<Record<SignName, string>> = {
  Aquarius: "à l’esprit d’étoiles",
  Aries: "au sang de feu",
  Cancer: "aux yeux de lune",
  Capricorn: "au front de pierre",
  Gemini: "à la langue d’argent",
  Leo: "à la crinière d’or",
  Libra: "née de la grâce",
  Pisces: "voilée de rêves",
  Sagittarius: "au cœur sauvage",
  Scorpio: "à l’âme d’eau",
  Taurus: "à la voix de velours",
  Virgo: "au regard clair",
};

const FRENCH_TITLES: Readonly<Record<SignName, string>> = {
  Aquarius: "Visionnaire",
  Aries: "Guerrière",
  Cancer: "Gardienne",
  Capricorn: "Régente",
  Gemini: "Messagère",
  Leo: "Souveraine",
  Libra: "Arbitre",
  Pisces: "Oracle",
  Sagittarius: "Vagabonde",
  Scorpio: "Alchimiste",
  Taurus: "Intendante",
  Virgo: "Guérisseuse",
};

const FRENCH_MOODS: Readonly<Record<SignName, { m: string; f: string }>> = {
  Aquarius: { f: "étoilée", m: "étoilé" },
  Aries: { f: "ardente", m: "ardent" },
  Cancer: { f: "lunaire", m: "lunaire" },
  Capricorn: { f: "ancienne", m: "ancien" },
  Gemini: { f: "murmurante", m: "murmurant" },
  Leo: { f: "dorée", m: "doré" },
  Libra: { f: "miroitante", m: "miroitant" },
  Pisces: { f: "noyée", m: "noyé" },
  Sagittarius: { f: "infinie", m: "infini" },
  Scorpio: { f: "engloutie", m: "englouti" },
  Taurus: { f: "fleurie", m: "fleuri" },
  Virgo: { f: "tranquille", m: "tranquille" },
};

/** Each realm with its article, and whether it is feminine. */
const FRENCH_REALMS: Readonly<
  Record<AnimalId, { of: string; feminine: boolean }>
> = {
  dog: { feminine: true, of: "de la Forteresse" },
  dragon: { feminine: false, of: "du Palais" },
  goat: { feminine: true, of: "des Falaises" },
  horse: { feminine: true, of: "de la Steppe" },
  monkey: { feminine: true, of: "de la Canopée" },
  ox: { feminine: true, of: "de la Vallée" },
  pig: { feminine: false, of: "du Bois" },
  rabbit: { feminine: false, of: "du Verger" },
  rat: { feminine: false, of: "du Labyrinthe" },
  rooster: { feminine: true, of: "de la Tour" },
  snake: { feminine: false, of: "du Temple" },
  tiger: { feminine: true, of: "des Montagnes" },
};

/** The Cliffs and the Mountains are plural, so their word takes an s. */
const PLURAL_REALMS: ReadonlySet<AnimalId> = new Set(["goat", "tiger"]);

const signAt = (longitude: number) => placementOf(longitude).sign.name;

/** "Régente à l’âme d’eau du Palais englouti". */
const frenchTitle = ({ rising, sun, moon, animal }: TitleSigns): string => {
  const realm = FRENCH_REALMS[animal];
  const mood = FRENCH_MOODS[signAt(moon)][realm.feminine ? "f" : "m"];
  const plural = PLURAL_REALMS.has(animal) && !mood.endsWith("s");

  return [
    FRENCH_TITLES[signAt(sun)],
    rising === null ? "" : FRENCH_RISING[signAt(rising)],
    realm.of,
    plural ? `${mood}s` : mood,
  ]
    .filter((word) => word !== "")
    .join(" ");
};

const englishTitle = ({ rising, sun, moon, animal }: TitleSigns): string =>
  [
    rising === null ? "" : wordFor(RISING_ADJECTIVES, rising),
    wordFor(SUN_TITLES, sun),
    "of the",
    wordFor(MOON_PLACES, moon),
    ANIMAL_REALMS[animal],
  ]
    .filter((word) => word !== "")
    .join(" ");

/**
 * "Water-spirited Regent of the Submerged Palace". With no rising sign, the
 * title starts at the Sun's: "Regent of the Submerged Palace". In French,
 * "Régente à l’âme d’eau du Palais englouti".
 */
export const witchTitle = (signs: TitleSigns): string =>
  currentLanguage() === "fr" ? frenchTitle(signs) : englishTitle(signs);
