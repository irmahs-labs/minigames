import { SearchSunLongitude, Seasons } from "astronomy-engine";

import { dayKey, keyOf, startOfYear } from "./time";

/**
 * The Wheel of the Year: eight sabbats, the solstices and equinoxes and the
 * four fire festivals halfway between them. Below the equator the wheel turns
 * the other way round the calendar, so each sabbat falls six months on:
 * Samhain is at the start of May there.
 */
export type SabbatId =
  | "imbolc"
  | "ostara"
  | "beltane"
  | "litha"
  | "lughnasadh"
  | "mabon"
  | "samhain"
  | "yule";

export interface Sabbat {
  id: SabbatId;
  name: string;
  /** How to say it, where it is not as written. */
  say?: string;
  also: string;
  kind: "fire festival" | "solstice" | "equinox";
  about: string;
  rituals: string;
  colors: string;
  symbols: string;
}

/** In wheel order, from the start of the witch's year at Samhain. */
export const SABBATS: readonly Sabbat[] = [
  {
    about:
      "The witch's new year, when the veil between the worlds is thinnest. The last harvest is in, the dark half of the year begins, and the ancestors come close.",
    also: "Halloween, All Hallows' Eve",
    colors: "black, orange, deep purple",
    id: "samhain",
    kind: "fire festival",
    name: "Samhain",
    rituals:
      "Set a place at the table for those who have passed, light a candle in the window, scry in a black mirror, carve a turnip or a pumpkin.",
    say: "SOW-in",
    symbols: "pumpkins, apples, skulls, cauldrons",
  },
  {
    about:
      "The longest night, and the Sun's rebirth: from here the days grow longer. A feast of light and evergreens in the deep of winter.",
    also: "Midwinter, the winter solstice",
    colors: "red, green, gold, white",
    id: "yule",
    kind: "solstice",
    name: "Yule",
    rituals:
      "Burn a Yule log, deck the house with holly and pine, stay up to greet the sunrise, give small handmade gifts.",
    symbols: "evergreens, holly, mistletoe, candles",
  },
  {
    about:
      "The first stirring of spring under the snow, sacred to Brigid, goddess of the hearth, poetry and healing. The ewes give milk again.",
    also: "Candlemas, Brigid's Day",
    colors: "white, pale yellow, light green",
    id: "imbolc",
    kind: "fire festival",
    name: "Imbolc",
    rituals:
      "Spring-clean the house, light every candle, weave a Brigid's cross from rushes, bless the seeds you will plant.",
    say: "IM-bulk",
    symbols: "candles, snowdrops, milk, Brigid's cross",
  },
  {
    about:
      "The spring equinox: day and night in balance, and the light winning. Seeds go in the ground and everything wakes.",
    also: "the spring equinox, Eostre",
    colors: "pastel green, yellow, pink, lilac",
    id: "ostara",
    kind: "equinox",
    name: "Ostara",
    rituals:
      "Dye eggs with onion skins and beetroot, plant seeds with an intention each, take a long walk to look for the first flowers.",
    say: "oh-STAR-uh",
    symbols: "eggs, hares, seeds, spring flowers",
  },
  {
    about:
      "The height of spring and the start of summer: fertility, passion and joy. Bonfires burn and the fae are out.",
    also: "May Day, Walpurgis Night on its eve",
    colors: "red, white, green",
    id: "beltane",
    kind: "fire festival",
    name: "Beltane",
    rituals:
      "Jump a small fire, dance round a maypole, wash your face in the morning dew, leave milk and honey for the fae.",
    say: "BELL-tane",
    symbols: "maypoles, flower crowns, ribbons, bonfires",
  },
  {
    about:
      "The summer solstice: the longest day and the Sun at its strongest. From tomorrow the light starts to wane again.",
    also: "Midsummer, the summer solstice",
    colors: "gold, yellow, orange, sky blue",
    id: "litha",
    kind: "solstice",
    name: "Litha",
    rituals:
      "Watch the sunrise, gather herbs (they are at their strongest now), make sun water, stay out till the stars come.",
    say: "LEE-thuh",
    symbols: "sunflowers, St John's wort, oak, the Sun wheel",
  },
  {
    about:
      "The first harvest, of grain, named for the god Lugh. A thanksgiving for what has grown, and a first taste of the year turning.",
    also: "Lammas, Loaf Mass",
    colors: "gold, orange, brown, green",
    id: "lughnasadh",
    kind: "fire festival",
    name: "Lughnasadh",
    rituals:
      "Bake bread and share it, make a corn dolly, pick berries, give thanks for something you worked hard for.",
    say: "LOO-nuh-suh",
    symbols: "bread, wheat sheaves, corn dollies, sickles",
  },
  {
    about:
      "The autumn equinox: day and night in balance again, and the dark winning now. The second harvest, of fruit, and a time to rest.",
    also: "the autumn equinox, Harvest Home",
    colors: "burgundy, brown, gold, deep orange",
    id: "mabon",
    kind: "equinox",
    name: "Mabon",
    rituals:
      "Pick apples, make a gratitude list, decorate with leaves and gourds, balance something in your life that tipped.",
    say: "MAY-bon",
    symbols: "apples, grapes, gourds, cornucopias",
  },
];

/** The Sun's longitude at each sabbat's astronomical point, in the north. */
const SUN_POINT: Record<SabbatId, number> = {
  beltane: 45,
  imbolc: 315,
  litha: 90,
  lughnasadh: 135,
  mabon: 180,
  ostara: 0,
  samhain: 225,
  yule: 270,
};

/** The fire festivals' traditional days, as month and day, in the north. */
const FIXED: Partial<Record<SabbatId, [number, number]>> = {
  beltane: [5, 1],
  imbolc: [2, 1],
  lughnasadh: [8, 1],
  samhain: [10, 31],
};

/** The same sabbat on the other side of the wheel, for the south. */
const OPPOSITE: Record<SabbatId, SabbatId> = {
  beltane: "samhain",
  imbolc: "lughnasadh",
  litha: "yule",
  lughnasadh: "imbolc",
  mabon: "ostara",
  ostara: "mabon",
  samhain: "beltane",
  yule: "litha",
};

/** Where the Sun is along the zodiac at a sabbat, in degrees. */
export const sunPointOf = (id: SabbatId, southern: boolean): number =>
  SUN_POINT[southern ? OPPOSITE[id] : id];

export interface SabbatDate {
  sabbat: Sabbat;
  /** The day it is kept, "2026-10-31". */
  key: string;
  /** For a fire festival, the day the Sun reaches its halfway point. */
  astronomical: string | null;
}

const workOutSabbats = (
  year: number,
  southern: boolean,
  timeZone: string
): SabbatDate[] => {
  const seasons = Seasons(year);

  const solar: Partial<Record<SabbatId, Date>> = {
    litha: seasons.jun_solstice.date,
    mabon: seasons.sep_equinox.date,
    ostara: seasons.mar_equinox.date,
    yule: seasons.dec_solstice.date,
  };

  const yearStart = startOfYear(year, timeZone);

  return SABBATS.map((sabbat) => {
    // In the south a sabbat falls where its opposite does in the north.
    const at = southern ? OPPOSITE[sabbat.id] : sabbat.id;
    const fixed = FIXED[at];
    const season = solar[at];

    const sun = fixed
      ? SearchSunLongitude(SUN_POINT[at], yearStart, 366)
      : null;

    return {
      astronomical: sun ? dayKey(sun.date, timeZone) : null,
      key: fixed
        ? keyOf(year, fixed[0], fixed[1])
        : dayKey(season ?? yearStart, timeZone),
      sabbat,
    };
  }).toSorted((a, b) => a.key.localeCompare(b.key));
};

const years = new Map<string, readonly SabbatDate[]>();

/**
 * Every sabbat in a calendar year, by date. The solstices and equinoxes are
 * the days they fall on in `timeZone`; the fire festivals keep their
 * traditional days, with the day the Sun really is halfway alongside.
 * Worked out once a year, hemisphere and time zone: it takes a few searches.
 */
export const sabbatsIn = (
  year: number,
  southern: boolean,
  timeZone: string
): readonly SabbatDate[] => {
  const key = `${year}|${southern}|${timeZone}`;
  const known = years.get(key);

  if (known) {
    return known;
  }

  const dates = workOutSabbats(year, southern, timeZone);

  years.set(key, dates);

  return dates;
};

/** The sabbats of `year` and the years either side, in order. */
const around = (year: number, southern: boolean, timeZone: string) => [
  ...sabbatsIn(year - 1, southern, timeZone),
  ...sabbatsIn(year, southern, timeZone),
  ...sabbatsIn(year + 1, southern, timeZone),
];

/** The next sabbat from `today` on (today's own, if there is one). */
export const nextSabbat = (
  today: string,
  southern: boolean,
  timeZone: string
): SabbatDate | undefined =>
  around(Number(today.slice(0, 4)), southern, timeZone).find(
    (date) => date.key >= today
  );

/** The last sabbat on or before `day`: the season it falls in. */
export const seasonOf = (
  day: string,
  southern: boolean,
  timeZone: string
): SabbatDate | undefined =>
  around(Number(day.slice(0, 4)), southern, timeZone).findLast(
    (date) => date.key <= day
  );
