import { SearchSunLongitude } from "astronomy-engine";

import { DAY, keyOf, parseDay } from "../book-of-shadows/time";

/**
 * The days festivals fall on, in the Gregorian calendar. The Islamic,
 * Hebrew, Persian and Ethiopian calendars come from the browser's own
 * (Intl, the ICU calendars); Easter from the computus. The Chinese calendar
 * is worked out from the Sun and the Moon instead (chinese.ts).
 */

/** A festival's days in a year, `end` included: "2026-02-17". */
export interface Span {
  start: string;
  end: string;
}

/** The calendars Intl converts to. */
export type CalendarSystem =
  | "islamic-umalqura"
  | "hebrew"
  | "persian"
  | "ethiopic";

/** A day in another calendar: its month as Intl writes it ("8", "6bis", "Tishri"), and day. */
interface OtherDay {
  key: string;
  month: string;
  day: number;
}

/** Hebrew months go by name: their numbers shift in a leap year. */
const byName = (system: CalendarSystem) => system === "hebrew";

const formatters = new Map<CalendarSystem, Intl.DateTimeFormat>();

const formatterFor = (system: CalendarSystem) => {
  const known = formatters.get(system);

  if (known) {
    return known;
  }

  const made = new Intl.DateTimeFormat(`en-u-ca-${system}`, {
    day: "numeric",
    month: byName(system) ? "long" : "numeric",
    timeZone: "UTC",
  });

  formatters.set(system, made);

  return made;
};

const yearsIn = new Map<string, readonly OtherDay[]>();

/** Every day of a Gregorian year, in another calendar; worked out once. */
const otherDaysIn = (system: CalendarSystem, year: number) => {
  const id = `${system}|${year}`;
  const known = yearsIn.get(id);

  if (known) {
    return known;
  }

  const format = formatterFor(system);
  const first = Date.UTC(year, 0, 1, 12);

  const length = Math.round(
    (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY
  );

  const days = Array.from({ length }, (_, i) => {
    const date = new Date(first + i * DAY);
    const parts = format.formatToParts(date);

    return {
      day: Number(parts.find((part) => part.type === "day")?.value),
      key: keyOf(year, date.getUTCMonth() + 1, date.getUTCDate()),
      month: parts.find((part) => part.type === "month")?.value ?? "",
    };
  });

  yearsIn.set(id, days);

  return days;
};

/**
 * The Gregorian days of `year` that are `day` of `month` in another calendar.
 * Usually one, but none or two for a calendar whose year is shorter: the
 * Islamic year is eleven days shorter than ours.
 */
export const daysOf = (
  system: CalendarSystem,
  year: number,
  months: readonly string[],
  day: number
): string[] =>
  otherDaysIn(system, year)
    .filter((entry) => entry.day === day && months.includes(entry.month))
    .map((entry) => entry.key);

/** A day key `days` later (or earlier). */
export const shift = (key: string, days: number): string => {
  const day = parseDay(key);

  if (!day) {
    return key;
  }

  const date = new Date(Date.UTC(day.year, day.month - 1, day.day + days));

  return keyOf(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  );
};

/** A span from its first day and how many days it lasts. */
export const spanOf = (start: string, days = 1): Span => ({
  end: shift(start, days - 1),
  start,
});

/** Western Easter Sunday: the anonymous Gregorian computus. */
export const easter = (year: number): string => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return keyOf(year, month, day);
};

/** Orthodox Easter: the Julian computus, moved onto the Gregorian calendar. */
export const orthodoxEaster = (year: number): string => {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  // The Julian calendar is 13 days behind from 1900 to 2099.
  const julianGap = 13;

  return shift(keyOf(year, month, day), julianGap);
};

/** China is 8 hours ahead of UTC. */
const CHINA = 8 * 3_600_000;

/** Qingming: the day the Sun reaches 15° of longitude, in China. */
export const qingming = (year: number): string | null => {
  const found = SearchSunLongitude(15, new Date(Date.UTC(year, 2, 1)), 60);

  if (!found) {
    return null;
  }

  const china = new Date(found.date.getTime() + CHINA);

  return keyOf(
    china.getUTCFullYear(),
    china.getUTCMonth() + 1,
    china.getUTCDate()
  );
};

/** The last Tuesday before a day: Chaharshanbe Suri is that Tuesday's night. */
export const lastTuesdayBefore = (key: string): string => {
  const day = parseDay(key);

  if (!day) {
    return key;
  }

  const weekday = new Date(
    Date.UTC(day.year, day.month - 1, day.day)
  ).getUTCDay();

  // Sunday is 0 and Tuesday 2; a Tuesday goes back a whole week.
  const back = (weekday - 2 + 7) % 7 || 7;

  return shift(key, -back);
};
