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
  dog: "Gate",
  dragon: "Palace",
  goat: "Highlands",
  horse: "Steppe",
  monkey: "Canopy",
  ox: "Valley",
  pig: "Hall",
  rabbit: "Orchard",
  rat: "Labyrinth",
  rooster: "Tower",
  snake: "Temple",
  tiger: "Bamboo Forest",
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
 * "Water-spirited Regent of the Submerged Palace". With no rising sign, the
 * title starts at the Sun's: "Regent of the Submerged Palace".
 */
export const witchTitle = ({ rising, sun, moon, animal }: TitleSigns): string =>
  [
    rising === null ? "" : wordFor(RISING_ADJECTIVES, rising),
    wordFor(SUN_TITLES, sun),
    "of the",
    wordFor(MOON_PLACES, moon),
    ANIMAL_REALMS[animal],
  ]
    .filter((word) => word !== "")
    .join(" ");
