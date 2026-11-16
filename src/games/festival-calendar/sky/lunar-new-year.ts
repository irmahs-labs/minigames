import { SearchMoonPhase, SearchSunLongitude, Seasons } from "astronomy-engine";

import { DAY, dayKey } from "./time";

/**
 * The Chinese calendar is kept at a steady UTC+8, never on summer time:
 * not Asia/Shanghai, whose clocks went forward in the 1940s and 1986–91.
 * (Etc/GMT-8 is UTC+8: the Etc signs run backwards.)
 */
const BEIJING = "Etc/GMT-8";

/** The days, in Beijing, of the new moons from `from` to `until`. */
const newMoonDays = (from: Date, until: Date): string[] => {
  const days: string[] = [];
  let moon = SearchMoonPhase(0, from, 40);

  while (moon && moon.date <= until) {
    days.push(dayKey(moon.date, BEIJING));
    moon = SearchMoonPhase(0, new Date(moon.date.getTime() + DAY), 40);
  }

  return days;
};

/**
 * The first day of the eleventh month, the one that holds the winter
 * solstice: the last new moon on or before the solstice's day in Beijing.
 */
const eleventhMonth = (year: number): string => {
  const solstice = Seasons(year).dec_solstice.date;
  const solsticeDay = dayKey(solstice, BEIJING);

  // Up to a day on: a new moon later on the solstice's own day still counts.
  const moons = newMoonDays(
    new Date(solstice.getTime() - 31 * DAY),
    new Date(solstice.getTime() + DAY)
  );

  return moons.findLast((day) => day <= solsticeDay) ?? solsticeDay;
};

/** Whether a month, from one new moon's day to the next's, holds a major solar term. */
const hasMajorTerm = (start: string, end: string): boolean => {
  const [startYear] = start.split("-").map(Number);

  for (let longitude = 0; longitude < 360; longitude += 30) {
    for (const year of [startYear ?? 2000, (startYear ?? 2000) + 1]) {
      const term = SearchSunLongitude(
        longitude,
        new Date(Date.UTC(year - 1, 11, 1)),
        400
      );

      if (term) {
        const day = dayKey(term.date, BEIJING);

        if (day >= start && day < end) {
          return true;
        }
      }
    }
  }

  return false;
};

const newYears = new Map<number, string>();

const workOutNewYear = (year: number): string => {
  const from = eleventhMonth(year - 1);
  const to = eleventhMonth(year);
  const fromDate = new Date(`${from}T00:00:00+08:00`);
  const toDate = new Date(`${to}T00:00:00+08:00`);

  const months = newMoonDays(fromDate, new Date(toDate.getTime() - DAY)).filter(
    (day) => day >= from && day < to
  );

  const ends = [...months.slice(1), to];

  // Thirteen months between two winter solstices: the first without a major
  // solar term is the leap month, and if it comes before the New Year the
  // New Year moves a month on.
  const leap =
    months.length === 13
      ? months.findIndex((start, i) => !hasMajorTerm(start, ends[i] ?? to))
      : -1;

  const first = leap === 1 || leap === 2 ? 3 : 2;

  return months[first] ?? months[2] ?? from;
};

/**
 * The Lunar New Year of a Gregorian year, as the day it falls on in
 * Beijing: the second new moon after the start of the eleventh month, or
 * the third when a leap month comes between (as in 2033–34).
 * Worked out once a year: it takes a search of the new moons.
 */
export const lunarNewYear = (year: number): string => {
  const known = newYears.get(year);

  if (known) {
    return known;
  }

  const day = workOutNewYear(year);

  newYears.set(year, day);

  return day;
};
