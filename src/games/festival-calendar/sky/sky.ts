import { EclipticGeoMoon, MoonPhase } from "astronomy-engine";

/**
 * The Moon in the sky, from Astronomy Engine's ephemeris: all the Festival
 * Calendar takes from the Book of Shadows' sky (now in Realms).
 */

/** The Moon's geocentric tropical longitude at `date`, in degrees. */
export const moonLongitude = (date: Date): number => EclipticGeoMoon(date).lon;

/** Where the Moon is in its cycle: 0 new, 90 first quarter, 180 full. */
export const moonAngle = (date: Date): number => MoonPhase(date);

/** How much of the Moon's face is lit, 0–1. */
export const illuminationOf = (angle: number): number =>
  (1 - Math.cos((angle * Math.PI) / 180)) / 2;
