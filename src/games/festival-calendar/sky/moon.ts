import { NextMoonQuarter, Seasons, SearchMoonQuarter } from "astronomy-engine";

import { illuminationOf, longitudeOf, moonAngle } from "./sky";
import {
  dayKey,
  daysInMonth,
  keyOf,
  wallTimeAt,
  zonedToUtc,
  DAY,
} from "./time";

/**
 * The Moon's month as a witch keeps it: the four exact phases (new, first
 * quarter, full, last quarter) fall on one day each, and every other day is
 * a crescent or a gibbous, waxing or waning.
 */
export type PhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

/** SearchMoonQuarter's quarters, 0–3, by name. */
const QUARTERS: readonly PhaseName[] = [
  "New Moon",
  "First Quarter",
  "Full Moon",
  "Last Quarter",
];

/** The phase between the exact ones, from the Moon's angle (0–360). */
export const inBetweenPhase = (angle: number): PhaseName => {
  if (angle < 90) {
    return "Waxing Crescent";
  }

  if (angle < 180) {
    return "Waxing Gibbous";
  }

  return angle < 270 ? "Waning Gibbous" : "Waning Crescent";
};

export const PHASE_LORE: Record<PhaseName, string> = {
  "First Quarter":
    "A push. Act on your intention, solve what is in the way, keep going.",
  "Full Moon":
    "Power at its peak. Charge crystals and moon water, give thanks, celebrate.",
  "Last Quarter":
    "Clear out. Forgive, finish, and let go of what did not work.",
  "New Moon":
    "A blank page. Set intentions, plant seeds, start something quietly.",
  "Waning Crescent":
    "Rest. Sleep, banish, cleanse your space, and dream before it begins again.",
  "Waning Gibbous":
    "Share. Teach what you learned, journal, and start to unwind.",
  "Waxing Crescent":
    "Gather. Make plans, collect what you need, and take a first step.",
  "Waxing Gibbous": "Refine. Adjust, edit, be patient; it is almost ripe.",
};

export interface Quarter {
  phase: PhaseName;
  time: Date;
}

/** The exact phases from `from` to `to`, in order. */
export const quartersBetween = (from: Date, to: Date): Quarter[] => {
  const found: Quarter[] = [];

  for (
    let quarter = SearchMoonQuarter(from);
    quarter.time.date <= to;
    quarter = NextMoonQuarter(quarter)
  ) {
    found.push({
      phase: QUARTERS[quarter.quarter] ?? "New Moon",
      time: quarter.time.date,
    });
  }

  return found;
};

/** The traditional full moon names, by month, from the Old Farmer's Almanac. */
const MONTH_MOONS = [
  "Wolf Moon",
  "Snow Moon",
  "Worm Moon",
  "Pink Moon",
  "Flower Moon",
  "Strawberry Moon",
  "Buck Moon",
  "Sturgeon Moon",
  "Corn Moon",
  "Hunter's Moon",
  "Beaver Moon",
  "Cold Moon",
];

/**
 * A full moon's name: the Harvest Moon is the one nearest the September
 * equinox, and the Hunter's Moon the one after; a second full moon in one
 * calendar month is a Blue Moon; otherwise the month's own name.
 */
export const fullMoonName = (time: Date, timeZone: string): string => {
  const { year, month } = wallTimeAt(time, timeZone);
  const equinox = Seasons(year).sep_equinox.date.getTime();
  const gap = time.getTime() - equinox;
  const cycle = 29.53 * DAY;

  if (Math.abs(gap) <= cycle / 2) {
    return "Harvest Moon";
  }

  if (gap > cycle / 2 && gap <= cycle * 1.5) {
    return "Hunter's Moon";
  }

  const earlierThisMonth = quartersBetween(
    new Date(time.getTime() - 31 * DAY),
    new Date(time.getTime() - DAY)
  ).some(
    (quarter) =>
      quarter.phase === "Full Moon" &&
      dayKey(quarter.time, timeZone).slice(0, 7) ===
        dayKey(time, timeZone).slice(0, 7)
  );

  return earlierThisMonth
    ? "Blue Moon"
    : (MONTH_MOONS[month - 1] ?? "Full Moon");
};

export interface MoonDay {
  /** "2026-10-26". */
  key: string;
  day: number;
  phase: PhaseName;
  /** The Moon's angle at the day's noon, for drawing it. */
  angle: number;
  /** When the exact phase falls, on the days that have one. */
  exact: Date | null;
}

/**
 * A day and its moon: the exact phase, when one falls on it, or else the
 * crescent or gibbous of the Moon's angle at the day's noon.
 */
const moonDayOf = (
  year: number,
  month: number,
  day: number,
  quarter: Quarter | undefined,
  timeZone: string
): MoonDay => {
  const noon = zonedToUtc({ day, hour: 12, minute: 0, month, year }, timeZone);
  const angle = moonAngle(quarter?.time ?? noon);

  return {
    angle,
    day,
    exact: quarter?.time ?? null,
    key: keyOf(year, month, day),
    phase: quarter?.phase ?? inBetweenPhase(angle),
  };
};

/** Every day of a month, with its moon, in the visitor's time zone. */
export const moonMonth = (
  year: number,
  month: number,
  timeZone: string
): MoonDay[] => {
  const first = zonedToUtc(
    { day: 1, hour: 0, minute: 0, month, year },
    timeZone
  );

  const last = new Date(
    zonedToUtc(
      { day: daysInMonth(year, month), hour: 23, minute: 59, month, year },
      timeZone
    ).getTime() + 60_000
  );

  const exact = new Map(
    quartersBetween(first, last).map((quarter) => [
      dayKey(quarter.time, timeZone),
      quarter,
    ])
  );

  return Array.from({ length: daysInMonth(year, month) }, (_, i) =>
    moonDayOf(
      year,
      month,
      i + 1,
      exact.get(keyOf(year, month, i + 1)),
      timeZone
    )
  );
};

/** The phase of the Moon on the day `date` falls on, in `timeZone`. */
export const phaseOn = (date: Date, timeZone: string): MoonDay => {
  const { year, month, day } = wallTimeAt(date, timeZone);
  const start = zonedToUtc({ day, hour: 0, minute: 0, month, year }, timeZone);
  const key = keyOf(year, month, day);

  const quarter = quartersBetween(start, new Date(start.getTime() + DAY)).find(
    (found) => dayKey(found.time, timeZone) === key
  );

  return moonDayOf(year, month, day, quarter, timeZone);
};

export interface MoonNow {
  angle: number;
  /** 0–1. */
  illumination: number;
  /** Days since the last new moon. */
  age: number;
  longitude: number;
}

export const moonNow = (date: Date): MoonNow => {
  const angle = moonAngle(date);

  return {
    age: (angle / 360) * 29.530589,
    angle,
    illumination: illuminationOf(angle),
    longitude: longitudeOf("Moon", date),
  };
};
