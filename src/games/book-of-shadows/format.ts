import { parseDay } from "./time";

/**
 * Dates in English, whatever language the browser is set to: the book is
 * written in English, so "12 Dec", never "12 déc.". A day key is a calendar
 * day, so it is written as UTC to stay that day everywhere; a moment is
 * written on the clocks of the zone it is shown in.
 */
const LOCALE = "en-GB";

/** "31 October 2026". */
export const LONG_DAY = {
  day: "numeric",
  month: "long",
  year: "numeric",
} as const;

/** "Saturday 31 October". */
export const FULL_DAY = {
  day: "numeric",
  month: "long",
  weekday: "long",
} as const;

const SHORT_DAY: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

export const formatDay = (key: string, options = SHORT_DAY): string => {
  const day = parseDay(key);

  return day
    ? new Date(Date.UTC(day.year, day.month - 1, day.day)).toLocaleDateString(
        LOCALE,
        { ...options, timeZone: "UTC" }
      )
    : key;
};

export const formatMoment = (date: Date, timeZone: string): string =>
  date.toLocaleString(LOCALE, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone,
  });

export const formatClock = (date: Date, timeZone: string): string =>
  date.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });

export const formatMonth = (year: number, month: number): string =>
  new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(LOCALE, {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });

/** 0 → "today", 1 → "tomorrow", 5 → "in 5 days". */
export const inDays = (days: number): string => {
  if (days === 0) {
    return "today";
  }

  return days === 1 ? "tomorrow" : `in ${days} days`;
};
