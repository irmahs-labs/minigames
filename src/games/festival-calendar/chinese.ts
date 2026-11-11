import { SearchMoonPhase, SunPosition } from "astronomy-engine";

import { lunarNewYear } from "../book-of-shadows/lunar-zodiac";
import { DAY, keyOf, parseDay } from "../book-of-shadows/time";
import { shift } from "./dates";

/**
 * The Chinese lunisolar calendar, worked out from the Sun and the Moon as
 * Beijing keeps it, rather than taken from the browser's Intl: its built-in
 * calendar puts some new years a day off (7 February 2027 instead of the
 * 6th, the new moon falling four minutes before midnight in Beijing), and
 * browsers don't all agree, so a festival would fall on different days on
 * different devices.
 *
 * A month starts on the day of a new moon in Beijing. A year runs from one
 * Lunar New Year to the next; in a year of thirteen months, the first month
 * the Sun reaches no major solar term in (a multiple of 30° of longitude)
 * is a leap month, numbered after the one before it.
 */

/** China is 8 hours ahead of UTC all year. */
const CHINA = 8 * 3_600_000;

/** The day in Beijing at a moment. */
const chinaDay = (date: Date) => {
  const china = new Date(date.getTime() + CHINA);

  return keyOf(
    china.getUTCFullYear(),
    china.getUTCMonth() + 1,
    china.getUTCDate()
  );
};

/** Midnight in Beijing at the start of a day. */
const chinaMidnight = (key: string) =>
  new Date(Date.parse(`${key}T00:00:00Z`) - CHINA);

/** The days in Beijing of the new moons from `from` up to `to`, `to` left out. */
const newMoonDays = (from: string, to: string): string[] => {
  const days: string[] = [];
  let after = new Date(chinaMidnight(from).getTime() - DAY);

  for (;;) {
    const moon = SearchMoonPhase(0, after, 40);

    if (!moon) {
      return days;
    }

    const day = chinaDay(moon.date);

    if (day >= to) {
      return days;
    }

    if (day >= from) {
      days.push(day);
    }

    after = new Date(moon.date.getTime() + DAY);
  }
};

/** Which twelfth of the ecliptic the Sun is in at a moment: a new one is a major term. */
const termOf = (date: Date) => Math.floor(SunPosition(date).elon / 30);

/** Whether the Sun reaches a major solar term between two days, `end` left out. */
const hasMajorTerm = (start: string, end: string) =>
  termOf(chinaMidnight(start)) !== termOf(chinaMidnight(end));

const years = new Map<number, readonly string[]>();

/**
 * The first day of each month of the Chinese year that begins in a
 * Gregorian year, the leap month left out: [first month, second, …, twelfth].
 */
export const chineseMonths = (year: number): readonly string[] => {
  const known = years.get(year);

  if (known) {
    return known;
  }

  const newYear = lunarNewYear(year);
  const next = lunarNewYear(year + 1);
  const starts = newMoonDays(newYear, next);
  const ends = [...starts.slice(1), next];

  const leap =
    starts.length === 13
      ? starts.findIndex(
          (start, i) => i > 0 && !hasMajorTerm(start, ends[i] ?? next)
        )
      : -1;

  const months = starts.filter((_, i) => i !== leap);

  years.set(year, months);

  return months;
};

/**
 * The Gregorian days of `year` that are `day` of `month` in the Chinese
 * calendar: from the Chinese year that begins in it, or the one before
 * (its last months fall in January and February).
 */
export const chineseDaysOf = (
  year: number,
  month: number,
  day: number
): string[] =>
  [year - 1, year]
    .flatMap((chineseYear) => {
      const start = chineseMonths(chineseYear)[month - 1];

      return start ? [shift(start, day - 1)] : [];
    })
    .filter((key) => parseDay(key)?.year === year);
