/**
 * Wall-clock time in a named time zone, from the browser's own zone data
 * (Intl), so a birth time is read as it was on the clocks where it happened,
 * summer time and all. A calendar day is a "YYYY-MM-DD" key.
 */
export interface WallTime {
  year: number;
  /** 1–12. */
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const DAY = 86_400_000;

const formats = new Map<string, Intl.DateTimeFormat>();

const formatFor = (timeZone: string) => {
  let format = formats.get(timeZone);

  if (!format) {
    format = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
      minute: "numeric",
      month: "numeric",
      second: "numeric",
      timeZone,
      year: "numeric",
    });
    formats.set(timeZone, format);
  }

  return format;
};

export const isTimeZone = (timeZone: string): boolean => {
  if (timeZone.trim() === "") {
    return false;
  }

  try {
    formatFor(timeZone);

    return true;
  } catch {
    return false;
  }
};

/** The browser's own time zone: where "today" is. */
export const localTimeZone = (): string =>
  new Intl.DateTimeFormat().resolvedOptions().timeZone;

/** What the clocks in `timeZone` read at `date`. */
export const wallTimeAt = (date: Date, timeZone: string): WallTime => {
  const parts = Object.fromEntries(
    formatFor(timeZone)
      .formatToParts(date)
      .map((part) => [part.type, Number(part.value)])
  );

  return {
    day: parts.day ?? 1,
    hour: parts.hour ?? 0,
    minute: parts.minute ?? 0,
    month: parts.month ?? 1,
    year: parts.year ?? 1970,
  };
};

/** How far `timeZone`'s clocks run ahead of UTC at `date`, in milliseconds. */
const offsetAt = (date: Date, timeZone: string): number => {
  const wall = wallTimeAt(date, timeZone);

  const asUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    date.getUTCSeconds()
  );

  return asUtc - (date.getTime() - date.getUTCMilliseconds());
};

/**
 * The moment the clocks in `timeZone` read `wall`. A time skipped by a
 * spring-forward lands an hour on; a repeated one takes its first reading.
 */
export const zonedToUtc = (wall: WallTime, timeZone: string): Date => {
  const guess = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute
  );

  // The offsets a day either side: the same, or the two a clock change joins.
  const before = guess - offsetAt(new Date(guess - DAY), timeZone);
  const after = guess - offsetAt(new Date(guess + DAY), timeZone);

  const reads = (moment: number) => {
    const seen = wallTimeAt(new Date(moment), timeZone);

    return (
      seen.year === wall.year &&
      seen.month === wall.month &&
      seen.day === wall.day &&
      seen.hour === wall.hour &&
      seen.minute === wall.minute
    );
  };

  if (reads(before)) {
    return new Date(Math.min(before, reads(after) ? after : before));
  }

  // Read with the old offset, a skipped time lands that far past the change.
  return new Date(reads(after) ? after : before);
};

/** Midnight on 1 January of `year`, on the clocks of `timeZone`. */
export const startOfYear = (year: number, timeZone: string): Date =>
  zonedToUtc({ day: 1, hour: 0, minute: 0, month: 1, year }, timeZone);

const pad = (n: number) => String(n).padStart(2, "0");

export const keyOf = (year: number, month: number, day: number): string =>
  `${String(year).padStart(4, "0")}-${pad(month)}-${pad(day)}`;

/** The calendar day `date` falls on in `timeZone`. */
export const dayKey = (date: Date, timeZone: string): string => {
  const { year, month, day } = wallTimeAt(date, timeZone);

  return keyOf(year, month, day);
};

/** "2026-10-31" → its year, month and day; null for anything else. */
export const parseDay = (
  key: string
): { year: number; month: number; day: number } | null => {
  const groups = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u.exec(
    key
  )?.groups;

  if (!groups) {
    return null;
  }

  const year = Number(groups.year);
  const month = Number(groups.month);
  const day = Number(groups.day);
  const check = new Date(Date.UTC(year, month - 1, day));

  return check.getUTCMonth() === month - 1 && check.getUTCDate() === day
    ? { day, month, year }
    : null;
};

/** "14:30" → hour and minute; null for anything else. */
export const parseClock = (
  text: string
): { hour: number; minute: number } | null => {
  const groups = /^(?<hour>\d{2}):(?<minute>\d{2})$/u.exec(text)?.groups;
  const hour = Number(groups?.hour);
  const minute = Number(groups?.minute);

  return groups && hour < 24 && minute < 60 ? { hour, minute } : null;
};

export const daysInMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

/** Whole days from one day key to another: 1 for tomorrow. */
export const daysBetween = (from: string, to: string): number => {
  const a = parseDay(from);
  const b = parseDay(to);

  if (!a || !b) {
    return 0;
  }

  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) -
      Date.UTC(a.year, a.month - 1, a.day)) /
      86_400_000
  );
};

/** Sunday is 0, as Date counts. */
export const weekdayOf = (key: string): number => {
  const day = parseDay(key);

  return day
    ? new Date(Date.UTC(day.year, day.month - 1, day.day)).getUTCDay()
    : 0;
};
