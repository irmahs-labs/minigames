import { LOCALES, currentLanguage } from "../../lib/language";
import { parseDay } from "./time";

/**
 * Dates in the page's language, whatever language the browser is set to:
 * "12 Dec" in English, "12 déc." in French. A day key is a calendar day, so
 * it is written as UTC to stay that day everywhere; a moment is written on
 * the clocks of the zone it is shown in.
 */
const locale = () => LOCALES[currentLanguage()];

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
        locale(),
        { ...options, timeZone: "UTC" }
      )
    : key;
};

export const formatMoment = (date: Date, timeZone: string): string =>
  date.toLocaleString(locale(), {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone,
  });

export const formatClock = (date: Date, timeZone: string): string =>
  date.toLocaleTimeString(locale(), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });

export const formatMonth = (year: number, month: number): string =>
  new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(locale(), {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });

/** 0 → "today", 1 → "tomorrow", 5 → "in 5 days" ("dans 5 jours"). */
export const inDays = (days: number): string => {
  const french = currentLanguage() === "fr";

  if (days === 0) {
    return french ? "aujourd’hui" : "today";
  }

  if (days === 1) {
    return french ? "demain" : "tomorrow";
  }

  return french ? `dans ${days} jours` : `in ${days} days`;
};
