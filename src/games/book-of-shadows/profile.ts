import * as z from "zod/mini";
// zod's catch(): a schema that falls back to a value, named so it does not read
// as a Promise.
import { catch as withFallback } from "zod/mini";

import { readStored, writeStored } from "../../lib/storage";
import { phaseOn } from "./moon";
import type { PhaseName } from "./moon";
import { numbersFor } from "./numerology";
import { seasonOf } from "./sabbats";
import { anglesAt, longitudeOf, positionsAt } from "./sky";
import type { Angles, Planet, Position } from "./sky";
import {
  dayKey,
  isTimeZone,
  parseClock,
  parseDay,
  weekdayOf,
  zonedToUtc,
} from "./time";
import { ELEMENTS, placementOf } from "./zodiac";
import type { Element, Placement } from "./zodiac";

export const STORAGE_KEY = "minigames:book-of-shadows:v1";

/** The book's pages, in order: yours first, then the sky's and the cards'. */
export const TABS = [
  "profile",
  "chart",
  "numbers",
  "lunar-zodiac",
  "moon",
  "sabbats",
  "sky",
  "tarot",
  "eight-ball",
] as const;

export type Tab = (typeof TABS)[number];

export const MAX_NAME = 80;
export const MAX_PLACE = 80;

const clip = (max: number) =>
  z.pipe(
    z.string(),
    z.transform((text: string) => text.slice(0, max))
  );

/**
 * The visitor's birth details, as typed: kept as text so a half-typed field
 * stays as it is, and read into numbers only to draw the chart.
 */
const profileSchema = z.object({
  birthDate: withFallback(clip(10), ""),
  birthTime: withFallback(clip(5), ""),
  lat: withFallback(clip(12), ""),
  lon: withFallback(clip(12), ""),
  name: withFallback(clip(MAX_NAME), ""),
  place: withFallback(clip(MAX_PLACE), ""),
  timeZone: withFallback(clip(64), ""),
});

export type Profile = z.infer<typeof profileSchema>;

export const EMPTY_PROFILE: Profile = {
  birthDate: "",
  birthTime: "",
  lat: "",
  lon: "",
  name: "",
  place: "",
  timeZone: "",
};

/** The day's tarot card, pulled once a day (see tarot.ts). */
const dailyPullSchema = z.object({
  day: z.string(),
  id: z.string(),
  reversed: z.boolean(),
});

/**
 * Everything the Book of Shadows remembers, in this browser's localStorage:
 * the open tab, which way the Wheel of the Year turns, your birth details
 * and those of someone to match them with, and today's card. Nothing leaves
 * the browser.
 */
export const bookStateSchema = z.object({
  dailyCard: withFallback(z.nullable(dailyPullSchema), null),
  partner: withFallback(profileSchema, () => ({ ...EMPTY_PROFILE })),
  profile: withFallback(profileSchema, () => ({ ...EMPTY_PROFILE })),
  southern: withFallback(z.boolean(), false),
  tab: withFallback(z.enum(TABS), "profile"),
});

export type BookState = z.infer<typeof bookStateSchema>;

export const defaultState = (): BookState => ({
  dailyCard: null,
  partner: { ...EMPTY_PROFILE },
  profile: { ...EMPTY_PROFILE },
  southern: false,
  tab: "profile",
});

export const loadState = (): BookState =>
  readStored(STORAGE_KEY, bookStateSchema, defaultState);

export const saveState = (state: BookState) => writeStored(STORAGE_KEY, state);

/** A latitude or longitude typed as "48.86" or "-0,13"; null if out of range. */
export const parseCoordinate = (text: string, limit: number): number | null => {
  const value = Number(text.trim().replace(",", "."));

  return text.trim() !== "" &&
    Number.isFinite(value) &&
    Math.abs(value) <= limit
    ? value
    : null;
};

export interface Birth {
  /** The birth day, "1990-07-14", as the calendar read where it happened. */
  day: string;
  year: number;
  month: number;
  date: number;
  /** The moment, in UTC: noon on the day when the time is not known. */
  moment: Date;
  timeKnown: boolean;
  /** Where, when the place has coordinates: needed for the rising sign. */
  where: { lat: number; lon: number } | null;
  timeZone: string;
}

/**
 * The birth the profile describes, or null without a valid date. Without a
 * time it is taken at noon; without a time zone, in the visitor's own.
 */
export const readBirth = (
  profile: Profile,
  fallbackZone: string
): Birth | null => {
  const day = parseDay(profile.birthDate);

  if (!day || day.year < 1800 || day.year > 2200) {
    return null;
  }

  const clock = parseClock(profile.birthTime);

  const timeZone = isTimeZone(profile.timeZone)
    ? profile.timeZone
    : fallbackZone;

  const lat = parseCoordinate(profile.lat, 90);
  const lon = parseCoordinate(profile.lon, 180);

  return {
    date: day.day,
    day: profile.birthDate,
    moment: zonedToUtc(
      { ...day, hour: clock?.hour ?? 12, minute: clock?.minute ?? 0 },
      timeZone
    ),
    month: day.month,
    timeKnown: clock !== null,
    timeZone,
    where: lat === null || lon === null ? null : { lat, lon },
    year: day.year,
  };
};

export interface Chart {
  positions: Position[];
  /** Only with a birth time and a place. */
  angles: Angles | null;
  /**
   * Without a birth time, the Moon's sign at the day's start and end: it
   * moves a sign every two and a half days, so the day may hold two.
   */
  moonSpan: [Placement, Placement] | null;
}

export const chartFor = (birth: Birth): Chart => {
  const positions = positionsAt(birth.moment);

  if (!birth.timeKnown) {
    const start = zonedToUtc(
      {
        day: birth.date,
        hour: 0,
        minute: 0,
        month: birth.month,
        year: birth.year,
      },
      birth.timeZone
    );

    const end = new Date(start.getTime() + 86_400_000 - 60_000);

    return {
      angles: null,
      moonSpan: [
        placementOf(longitudeOf("Moon", start)),
        placementOf(longitudeOf("Moon", end)),
      ],
      positions,
    };
  }

  return {
    angles: birth.where
      ? anglesAt(birth.moment, birth.where.lat, birth.where.lon)
      : null,
    moonSpan: null,
    positions,
  };
};

/** Whole-sign houses: the rising sign is the 1st house, the next sign the 2nd. */
export const houseOf = (longitude: number, ascendant: number): number =>
  ((placementOf(longitude).index - placementOf(ascendant).index + 12) % 12) + 1;

export const HOUSE_MEANINGS: readonly string[] = [
  "self, body and first impressions",
  "money, possessions and self-worth",
  "words, siblings and the neighbourhood",
  "home, family and roots",
  "joy, romance, play and creating",
  "daily work, health and habits",
  "partners, marriage and rivals",
  "intimacy, shared things and the occult",
  "travel, study and belief",
  "career, calling and reputation",
  "friends, groups and hopes",
  "dreams, secrets and the hidden",
];

/** How much each placement counts toward the element balance. */
const WEIGHTS: Partial<Record<Planet, number>> = {
  Jupiter: 1,
  Mars: 1,
  Mercury: 1,
  Moon: 2,
  Saturn: 1,
  Sun: 2,
  Venus: 1,
};

/**
 * The elements a chart leans on: the Sun, the Moon and the Rising count
 * twice, the personal planets and Jupiter and Saturn once. The outer planets
 * stay out; they sit in one sign for a whole generation.
 */
export const elementBalance = (chart: Chart): Record<Element, number> => {
  const balance: Record<Element, number> = {
    air: 0,
    earth: 0,
    fire: 0,
    water: 0,
  };

  for (const { planet, longitude } of chart.positions) {
    balance[placementOf(longitude).sign.element] += WEIGHTS[planet] ?? 0;
  }

  if (chart.angles) {
    balance[placementOf(chart.angles.ascendant).sign.element] += 2;
  }

  return balance;
};

export interface Craft {
  element: Element;
  name: string;
  about: string;
}

const CRAFTS: Record<Element, Omit<Craft, "element">> = {
  air: {
    about:
      "Your magic speaks: sigils, written spells, tarot, incense smoke, and the wind carrying your words where they need to go.",
    name: "Storm Witch",
  },
  earth: {
    about:
      "Your magic grows: herbs, gardens, stones, kitchen spells, and slow, patient work with the land and the seasons.",
    name: "Green Witch",
  },
  fire: {
    about:
      "Your magic burns: candles, bonfires, sun water, and quick spells cast with pure will. Fire changes what it touches, and so do you.",
    name: "Candle Witch",
  },
  water: {
    about:
      "Your magic flows: moon water, ritual baths, dreams, scrying, and the tides of feeling you read better than anyone.",
    name: "Sea Witch",
  },
};

/** The craft of the element the chart leans on most; the Sun's breaks a tie. */
export const craftOf = (chart: Chart): Craft => {
  const balance = elementBalance(chart);
  const sun = chart.positions.find((position) => position.planet === "Sun");
  const sunElement = placementOf(sun?.longitude ?? 0).sign.element;
  const most = Math.max(...ELEMENTS.map((element) => balance[element]));

  const element =
    balance[sunElement] === most
      ? sunElement
      : (ELEMENTS.find((candidate) => balance[candidate] === most) ??
        sunElement);

  return { element, ...CRAFTS[element] };
};

/** Each weekday's planet, Sunday first, as the old names still say. */
export const PLANETARY_DAYS: readonly {
  day: string;
  planet: Planet;
  gift: string;
}[] = [
  { day: "Sunday", gift: "success, vitality and joy", planet: "Sun" },
  { day: "Monday", gift: "intuition, dreams and the home", planet: "Moon" },
  { day: "Tuesday", gift: "courage, protection and drive", planet: "Mars" },
  {
    day: "Wednesday",
    gift: "wit, words and luck in travel",
    planet: "Mercury",
  },
  { day: "Thursday", gift: "abundance, growth and wisdom", planet: "Jupiter" },
  { day: "Friday", gift: "love, beauty and friendship", planet: "Venus" },
  {
    day: "Saturday",
    gift: "endurance, boundaries and banishing",
    planet: "Saturn",
  },
];

export const planetaryDayOf = (birth: Birth) =>
  PLANETARY_DAYS[weekdayOf(birth.day)] ?? PLANETARY_DAYS[0];

/** The Moon's phase on the birth day, where it happened. */
export const birthMoonOf = (birth: Birth): PhaseName =>
  phaseOn(birth.moment, birth.timeZone).phase;

/** Birthdays are kept on the birth day's calendar, wherever you are now. */
export const birthdayKey = (birth: Birth, year: number): string =>
  `${year}${birth.day.slice(4)}`;

/** Whether the visitor's today is their birthday. */
export const isBirthday = (
  birth: Birth,
  now: Date,
  timeZone: string
): boolean => dayKey(now, timeZone).slice(5) === birth.day.slice(5);

export const birthNumbers = (birth: Birth, name: string, thisYear: number) =>
  numbersFor(
    { day: birth.date, month: birth.month, year: birth.year },
    name,
    thisYear
  );

/** The sabbat season of the birth day, on the birthplace's side of the equator. */
export const birthSeasonOf = (birth: Birth) =>
  seasonOf(birth.day, (birth.where?.lat ?? 0) < 0, birth.timeZone);
