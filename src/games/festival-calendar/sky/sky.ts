import type { EclipseKind } from "astronomy-engine";
import {
  Body,
  Ecliptic,
  EclipticGeoMoon,
  GeoVector,
  MakeTime,
  MoonPhase,
  NextGlobalSolarEclipse,
  NextLunarEclipse,
  SearchGlobalSolarEclipse,
  SearchLunarEclipse,
  SiderealTime,
  SunPosition,
  e_tilt,
} from "astronomy-engine";

import { DAY } from "./time";
import { normalize } from "./zodiac";

/**
 * Where the Sun, the Moon and the planets are along the zodiac, seen from the
 * Earth, from Astronomy Engine's ephemeris (good to well under a degree for
 * any date people are born on). Every longitude is tropical: ecliptic of date,
 * from the March equinox.
 */
export type Planet =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export const PLANETS: readonly Planet[] = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];

/** The planets that can turn retrograde: all but the lights. */
export type Wanderer = Exclude<Planet, "Sun" | "Moon">;

export const WANDERERS: readonly Wanderer[] = [
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];

export const PLANET_GLYPHS: Record<Planet, string> = {
  Jupiter: "♃",
  Mars: "♂︎",
  Mercury: "☿",
  Moon: "☽",
  Neptune: "♆",
  Pluto: "♇",
  Saturn: "♄",
  Sun: "☉",
  Uranus: "♅",
  Venus: "♀︎",
};

export const PLANET_MEANINGS: Record<Planet, string> = {
  Jupiter: "luck, growth and faith",
  Mars: "drive, anger and courage",
  Mercury: "thinking, talking and travel",
  Moon: "feelings, needs and home",
  Neptune: "dreams, intuition and illusion",
  Pluto: "power, endings and rebirth",
  Saturn: "rules, limits and hard-won lessons",
  Sun: "identity, will and vitality",
  Uranus: "change, freedom and surprises",
  Venus: "love, beauty and money",
};

const BODIES: Record<Wanderer, Body> = {
  Jupiter: Body.Jupiter,
  Mars: Body.Mars,
  Mercury: Body.Mercury,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Venus: Body.Venus,
};

/** The planet's geocentric tropical longitude at `date`, in degrees. */
export const longitudeOf = (planet: Planet, date: Date): number => {
  if (planet === "Sun") {
    return SunPosition(date).elon;
  }

  if (planet === "Moon") {
    return EclipticGeoMoon(date).lon;
  }

  return Ecliptic(GeoVector(BODIES[planet], date, true)).elon;
};

/** The shortest signed turn from one longitude to the next, in degrees. */
const turn = (from: number, to: number) => normalize(to - from + 180) - 180;

/** Degrees a day the planet moves along the zodiac; below 0 is retrograde. */
export const speedOf = (planet: Planet, date: Date): number =>
  turn(
    longitudeOf(planet, new Date(date.getTime() - DAY / 2)),
    longitudeOf(planet, new Date(date.getTime() + DAY / 2))
  );

export interface Position {
  planet: Planet;
  longitude: number;
  retrograde: boolean;
}

export const positionsAt = (date: Date): Position[] =>
  PLANETS.map((planet) => ({
    longitude: longitudeOf(planet, date),
    planet,
    retrograde: speedOf(planet, date) < 0,
  }));

/** Where the Moon is in its cycle: 0 new, 90 first quarter, 180 full. */
export const moonAngle = (date: Date): number => MoonPhase(date);

/** How much of the Moon's face is lit, 0–1. */
export const illuminationOf = (angle: number): number =>
  (1 - Math.cos((angle * Math.PI) / 180)) / 2;

const radians = (degrees: number) => (degrees * Math.PI) / 180;
const degrees = (rad: number) => (rad * 180) / Math.PI;

export interface Angles {
  /** The Ascendant, the rising sign's degree: the zodiac on the eastern horizon. */
  ascendant: number;
  /** The Midheaven: the zodiac at its highest. */
  midheaven: number;
}

/**
 * The Ascendant and Midheaven for a moment and a place: from the local
 * sidereal time (how far the sky has turned) and the tilt of the Earth's
 * axis. Latitude is north-positive, longitude east-positive.
 */
export const anglesAt = (date: Date, lat: number, lon: number): Angles => {
  const ramc = radians(normalize(SiderealTime(date) * 15 + lon));
  const tilt = radians(e_tilt(MakeTime(date)).tobl);
  const phi = radians(Math.max(-89.9, Math.min(89.9, lat)));

  const ascendant = degrees(
    Math.atan2(
      Math.cos(ramc),
      -(Math.sin(ramc) * Math.cos(tilt) + Math.tan(phi) * Math.sin(tilt))
    )
  );

  const midheaven = degrees(
    Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(tilt))
  );

  return { ascendant: normalize(ascendant), midheaven: normalize(midheaven) };
};

export interface Station {
  time: Date;
  longitude: number;
}

export interface Retrograde {
  planet: Wanderer;
  /** When it stations retrograde, and where. */
  start: Station;
  /** When it stations direct again. */
  end: Station;
}

/** Narrows a change of direction between two moments down to the hour. */
const findStation = (planet: Planet, from: number, to: number): Date => {
  const goingBack = speedOf(planet, new Date(from)) < 0;
  let low = from;
  let high = to;

  while (high - low > DAY / 24) {
    const mid = (low + high) / 2;

    if (speedOf(planet, new Date(mid)) < 0 === goingBack) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return new Date((low + high) / 2);
};

/**
 * How each planet is walked: how far back to start, so a retrograde already
 * under way is caught (a little longer than its longest), and the step, as
 * long as can be without stepping over a whole retrograde. The slow outer
 * planets turn rarely and take the longest to compute (Pluto most of all).
 */
const WALKS: Record<Wanderer, { lookBack: number; step: number }> = {
  Jupiter: { lookBack: 130, step: 5 },
  Mars: { lookBack: 90, step: 2 },
  Mercury: { lookBack: 30, step: 1 },
  Neptune: { lookBack: 170, step: 5 },
  Pluto: { lookBack: 170, step: 5 },
  Saturn: { lookBack: 150, step: 5 },
  Uranus: { lookBack: 165, step: 5 },
  Venus: { lookBack: 50, step: 1 },
};

/**
 * Every retrograde that overlaps the time from `from` to `to`, earliest
 * first: a walk of each planet's motion, step by step, with the turns
 * narrowed down to the hour.
 */
export const retrogradesBetween = (from: Date, to: Date): Retrograde[] => {
  const found: Retrograde[] = [];

  for (const planet of WANDERERS) {
    const step = WALKS[planet].step * DAY;
    const reach = WALKS[planet].lookBack * DAY;
    const start = from.getTime() - reach;
    const end = to.getTime() + reach;
    let previous = longitudeOf(planet, new Date(start));
    let wasBack: boolean | null = null;
    let opened: Station | null = null;

    for (let t = start + step; t <= end; t += step) {
      const longitude = longitudeOf(planet, new Date(t));
      const back = turn(previous, longitude) < 0;

      if (wasBack !== null && back !== wasBack) {
        // The turn lies somewhere in the last two steps; one more for margin.
        const time = findStation(planet, t - 3 * step, t);
        const station = { longitude: longitudeOf(planet, time), time };

        if (back) {
          opened = station;
        } else if (opened) {
          found.push({ end: station, planet, start: opened });
          opened = null;
        }
      }

      previous = longitude;
      wasBack = back;
    }
  }

  return found
    .filter(
      (period) =>
        period.end.time.getTime() >= from.getTime() &&
        period.start.time.getTime() <= to.getTime()
    )
    .toSorted((a, b) => a.start.time.getTime() - b.start.time.getTime());
};

export interface Eclipse {
  body: "Sun" | "Moon";
  kind: EclipseKind;
  peak: Date;
  /** Where along the zodiac it falls: the Moon's place for a lunar one. */
  longitude: number;
}

/** The solar and lunar eclipses from `from` to `to`, in order. */
export const eclipsesBetween = (from: Date, to: Date): Eclipse[] => {
  const found: Eclipse[] = [];

  for (
    let lunar = SearchLunarEclipse(from);
    lunar.peak.date <= to;
    lunar = NextLunarEclipse(lunar.peak)
  ) {
    found.push({
      body: "Moon",
      kind: lunar.kind,
      longitude: longitudeOf("Moon", lunar.peak.date),
      peak: lunar.peak.date,
    });
  }

  for (
    let solar = SearchGlobalSolarEclipse(from);
    solar.peak.date <= to;
    solar = NextGlobalSolarEclipse(solar.peak)
  ) {
    found.push({
      body: "Sun",
      kind: solar.kind,
      longitude: longitudeOf("Sun", solar.peak.date),
      peak: solar.peak.date,
    });
  }

  return found.toSorted((a, b) => a.peak.getTime() - b.peak.getTime());
};
