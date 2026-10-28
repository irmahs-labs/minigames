import { mod } from "./time";

/**
 * The tropical zodiac, as Western astrology reads it: twelve 30° signs along
 * the ecliptic from the March equinox. The glyphs carry U+FE0E so they stay
 * text, never emoji.
 */
export type Element = "fire" | "earth" | "air" | "water";

export type Modality = "cardinal" | "fixed" | "mutable";

export type SignName =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export interface Sign {
  name: SignName;
  glyph: string;
  element: Element;
  modality: Modality;
  ruler: string;
  /** Roughly when the Sun is in it; the exact day moves a little each year. */
  dates: string;
  keywords: string;
  /** As your Sun: who you are. */
  sun: string;
  /** As your Moon: what you need. */
  moon: string;
  /** As your Rising: how you come across. */
  rising: string;
}

export const SIGNS: readonly Sign[] = [
  {
    dates: "Mar 21 – Apr 19",
    element: "fire",
    glyph: "♈︎",
    keywords: "bold, eager, first in",
    modality: "cardinal",
    moon: "You need to act on a feeling the moment you have it, and space to cool off after.",
    name: "Aries",
    rising: "You come across direct, quick and a little fearless.",
    ruler: "Mars",
    sun: "A spark: you start things, lead the charge, and learn by doing.",
  },
  {
    dates: "Apr 20 – May 20",
    element: "earth",
    glyph: "♉︎",
    keywords: "steady, sensual, loyal",
    modality: "fixed",
    moon: "You need comfort you can touch: good food, soft things, a routine that holds.",
    name: "Taurus",
    rising: "You come across calm, grounded and easy to be around.",
    ruler: "Venus",
    sun: "A garden: you grow things slowly, and what you build lasts.",
  },
  {
    dates: "May 21 – Jun 20",
    element: "air",
    glyph: "♊︎",
    keywords: "curious, witty, restless",
    modality: "mutable",
    moon: "You need to talk a feeling through, and something new to think about.",
    name: "Gemini",
    rising: "You come across chatty, bright and quick on your feet.",
    ruler: "Mercury",
    sun: "A messenger: you collect ideas and people, and connect them.",
  },
  {
    dates: "Jun 21 – Jul 22",
    element: "water",
    glyph: "♋︎",
    keywords: "tender, protective, homey",
    modality: "cardinal",
    moon: "You need a safe nest and the people you call family close by.",
    name: "Cancer",
    rising: "You come across gentle, warm and a little guarded at first.",
    ruler: "the Moon",
    sun: "A hearth: you care for others and remember everything.",
  },
  {
    dates: "Jul 23 – Aug 22",
    element: "fire",
    glyph: "♌︎",
    keywords: "warm, proud, playful",
    modality: "fixed",
    moon: "You need to feel seen, appreciated, and free to play.",
    name: "Leo",
    rising: "You come across radiant, confident and generous.",
    ruler: "the Sun",
    sun: "A sun: you shine, create, and light up the room.",
  },
  {
    dates: "Aug 23 – Sep 22",
    element: "earth",
    glyph: "♍︎",
    keywords: "careful, helpful, precise",
    modality: "mutable",
    moon: "You need order around you, and to be useful to someone.",
    name: "Virgo",
    rising: "You come across neat, thoughtful and quietly observant.",
    ruler: "Mercury",
    sun: "An herbalist: you sort, mend and make things better.",
  },
  {
    dates: "Sep 23 – Oct 22",
    element: "air",
    glyph: "♎︎",
    keywords: "fair, charming, harmonious",
    modality: "cardinal",
    moon: "You need peace, beauty, and someone to share things with.",
    name: "Libra",
    rising: "You come across graceful, friendly and easy to like.",
    ruler: "Venus",
    sun: "A scale: you weigh both sides and bring people together.",
  },
  {
    dates: "Oct 23 – Nov 21",
    element: "water",
    glyph: "♏︎",
    keywords: "intense, magnetic, deep",
    modality: "fixed",
    moon: "You need trust, privacy, and feelings that run all the way down.",
    name: "Scorpio",
    rising: "You come across mysterious, intense and hard to read.",
    ruler: "Pluto and Mars",
    sun: "A phoenix: you go deep, transform, and rise again.",
  },
  {
    dates: "Nov 22 – Dec 21",
    element: "fire",
    glyph: "♐︎",
    keywords: "free, honest, adventurous",
    modality: "mutable",
    moon: "You need room to roam and something to believe in.",
    name: "Sagittarius",
    rising: "You come across open, funny and up for anything.",
    ruler: "Jupiter",
    sun: "An arrow: you aim far, seek meaning, and tell the truth.",
  },
  {
    dates: "Dec 22 – Jan 19",
    element: "earth",
    glyph: "♑︎",
    keywords: "ambitious, patient, wise",
    modality: "cardinal",
    moon: "You need a goal to work toward and to feel in control.",
    name: "Capricorn",
    rising: "You come across composed, capable and older than your years.",
    ruler: "Saturn",
    sun: "A mountain goat: you climb slowly and reach the top.",
  },
  {
    dates: "Jan 20 – Feb 18",
    element: "air",
    glyph: "♒︎",
    keywords: "original, idealistic, independent",
    modality: "fixed",
    moon: "You need freedom to be odd, and friends who get it.",
    name: "Aquarius",
    rising: "You come across friendly, unusual and a bit detached.",
    ruler: "Uranus and Saturn",
    sun: "A visionary: you think ahead and stand with the group.",
  },
  {
    dates: "Feb 19 – Mar 20",
    element: "water",
    glyph: "♓︎",
    keywords: "dreamy, intuitive, kind",
    modality: "mutable",
    moon: "You need quiet, music, and time to drift and dream.",
    name: "Pisces",
    rising: "You come across soft, dreamy and kind.",
    ruler: "Neptune and Jupiter",
    sun: "A tide: you feel everything, imagine, and forgive.",
  },
];

export const ELEMENTS: readonly Element[] = ["fire", "earth", "air", "water"];

export const ELEMENT_NAMES: Record<Element, string> = {
  air: "Air",
  earth: "Earth",
  fire: "Fire",
  water: "Water",
};

/** Any angle, in degrees, into 0 ≤ angle < 360. */
export const normalize = (degrees: number): number => mod(degrees, 360);

export interface Placement {
  sign: Sign;
  index: number;
  /** Degrees into the sign, 0 ≤ degree < 30. */
  degree: number;
}

export const placementOf = (longitude: number): Placement => {
  const lon = normalize(longitude);
  const index = Math.min(11, Math.floor(lon / 30));

  return {
    degree: lon - index * 30,
    index,
    // oxlint-disable-next-line no-non-null-assertion -- index is 0–11
    sign: SIGNS[index]!,
  };
};

/** 14.5° into a sign → "14°30′". */
export const formatDegree = (degree: number): string => {
  const total = Math.floor(degree * 60);

  return `${Math.floor(total / 60)}°${String(total % 60).padStart(2, "0")}′`;
};
