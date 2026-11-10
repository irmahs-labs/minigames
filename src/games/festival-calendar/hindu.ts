import {
  MakeTime,
  SearchMoonPhase,
  SearchSunLongitude,
} from "astronomy-engine";
import type { AstroTime } from "astronomy-engine";

import { DAY, keyOf } from "../book-of-shadows/time";

/**
 * The Hindu lunisolar calendar, worked out from the Sun and the Moon, as
 * India keeps it (Indian Standard Time, the Lahiri ayanamsa).
 *
 * A lunar month runs from new moon to new moon (amanta), and is named after
 * the sidereal sign the Sun enters during it: the month holding the Sun's
 * entry into Mesha (Aries) is Chaitra, into Tula (Libra) is Ashvin. A month
 * the Sun enters no sign in is a leap month, and festivals skip it. Each
 * month has thirty tithis, lunar days: one for every 12° the Moon gains on
 * the Sun, 1 to 15 waxing (shukla), then 1 to 15 waning (krishna), the 15th
 * waning one ending at the new moon. A festival is kept on the day its tithi
 * holds at the time of day it is kept: most at sunrise, Diwali in the
 * evening, Maha Shivaratri at midnight.
 */

/** The lunar months in order, each named after the sign the Sun enters in it. */
export const HINDU_MONTHS = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashvin",
  "Kartika",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna",
] as const;

export type HinduMonth = (typeof HINDU_MONTHS)[number];

/** When in the day a festival is kept: its tithi must hold then. */
export type Observance =
  | "sunrise"
  | "midday"
  | "afternoon"
  | "evening"
  | "midnight";

/** Hours after midnight, Indian time, of each time of day; midnight is the one at the day's end. */
const HOURS: Readonly<Record<Observance, number>> = {
  afternoon: 14,
  evening: 18,
  midday: 12,
  midnight: 24,
  sunrise: 6,
};

/** India is 5½ hours ahead of UTC all year. */
const IST = 5.5 * 3_600_000;

/** The Lahiri ayanamsa: how far the sidereal zodiac is behind the tropical, in degrees. */
const ayanamsa = (date: Date) =>
  23.853 +
  ((date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * DAY)) * 0.013969;

/** The day in India at a moment: "2025-10-20". */
export const indianDay = (date: Date) => {
  const india = new Date(date.getTime() + IST);

  return keyOf(
    india.getUTCFullYear(),
    india.getUTCMonth() + 1,
    india.getUTCDate()
  );
};

/** A moment on a day in India, `hours` after its midnight. */
const indianTime = (key: string, hours: number) =>
  new Date(Date.parse(`${key}T00:00:00Z`) - IST + hours * 3_600_000);

const later = (time: Date, days: number) =>
  new Date(time.getTime() + days * DAY);

const moonPhase = (angle: number, from: Date, days: number): Date | null =>
  SearchMoonPhase(angle, MakeTime(from), days)?.date ?? null;

/**
 * When the Sun enters a sidereal sign (0 Mesha … 11 Meena), the first time
 * after `from`: a sankranti.
 */
export const sankranti = (sign: number, from: Date): Date | null => {
  const target = (sign * 30 + ayanamsa(from)) % 360;

  const found: AstroTime | null = SearchSunLongitude(
    target,
    MakeTime(from),
    370
  );

  return found?.date ?? null;
};

/** The new moon that begins the lunar month holding `moment`. */
const monthStart = (moment: Date): Date | null => {
  const first = moonPhase(0, later(moment, -30), 31);
  const second = first ? moonPhase(0, later(first, 1), 31) : null;

  return second && second <= moment ? second : first;
};

/** Where a lunar month starts and ends: from the new moon before its sankranti to the next. */
export const hinduMonth = (month: HinduMonth, year: number) => {
  const sign = HINDU_MONTHS.indexOf(month);
  const entry = sankranti(sign, new Date(Date.UTC(year, 0, 1)));
  const start = entry ? monthStart(entry) : null;
  const end = start ? moonPhase(0, later(start, 1), 31) : null;

  return start && end && entry ? { end, entry, start } : null;
};

/** A tithi: 1–15 waxing, 16–30 waning, 30 the new moon's own. */
export interface TithiSpan {
  start: Date;
  end: Date;
}

/** When tithi `n` (1–30) of the lunar month starting at `start` begins and ends. */
export const tithiIn = (start: Date, n: number): TithiSpan | null => {
  const from = n === 1 ? start : moonPhase((n - 1) * 12, start, 31);
  const to = from ? moonPhase((n * 12) % 360, later(from, 0.01), 31) : null;

  return from && to ? { end: to, start: from } : null;
};

/**
 * The day a tithi is kept: the first whose `at` falls inside it, or the day
 * it begins when it holds at no such time (a short tithi between two
 * sunrises).
 */
export const keptOn = ({ start, end }: TithiSpan, at: Observance): string => {
  const first = indianDay(later(start, -1));

  for (let i = 0; i < 4; i += 1) {
    const key = indianDay(later(indianTime(first, 12), i));
    const moment = indianTime(key, HOURS[at]);

    if (moment >= start && moment < end) {
      return key;
    }
  }

  return indianDay(start);
};

/** Which tithi: waxing (shukla) or waning (krishna), and its number from 1 to 15. */
export interface TithiOf {
  month: HinduMonth;
  waxing: boolean;
  tithi: number;
}

/** The tithi's span in the month of that name whose sankranti is in `year`. */
export const tithiSpan = (
  { month, waxing, tithi }: TithiOf,
  year: number
): TithiSpan | null => {
  const found = hinduMonth(month, year);

  return found ? tithiIn(found.start, waxing ? tithi : 15 + tithi) : null;
};

/**
 * Holika Dahan, the bonfire on the eve of Holi: kept on the night (6 pm to
 * 2 am) that meets the second half of the Phalguna full moon's tithi, once
 * the inauspicious Bhadra of its first half is over; when no night does, on
 * the day the tithi ends.
 */
export const holikaDahan = (year: number): string | null => {
  const span = tithiSpan({ month: "Phalguna", tithi: 15, waxing: true }, year);

  if (!span) {
    return null;
  }

  const half = new Date((span.start.getTime() + span.end.getTime()) / 2);

  for (let i = -1; i < 3; i += 1) {
    const key = indianDay(later(indianTime(indianDay(half), 12), i));
    const dusk = indianTime(key, 18);
    const late = indianTime(key, 26);

    if (dusk < span.end && late > half) {
      return key;
    }
  }

  return indianDay(span.end);
};
