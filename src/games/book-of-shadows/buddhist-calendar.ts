import momentkh from "@thyrith/momentkh";

import { lunarNewYear } from "./lunar-zodiac";
import { DAY, daysBetween, keyOf, parseDay } from "./time";

/**
 * The Buddhist lunar calendar, as Cambodia keeps it (Chhankitek, worked
 * out by @thyrith/momentkh): each day's place in its lunar month, the holy
 * days, and the festivals, with the Lunar New Year of the Chinese calendar
 * alongside.
 */

/** The lunar months, from Migasir; a leap year doubles Asadh. */
export const LUNAR_MONTHS = [
  "Migasir",
  "Boss",
  "Meak",
  "Phalkun",
  "Cheit",
  "Pisakh",
  "Jesth",
  "Asadh",
  "Srap",
  "Phatrabot",
  "Assoch",
  "Kadeuk",
  "First Asadh",
  "Second Asadh",
] as const;

export interface LunarDate {
  key: string;
  /** Its month, an index into LUNAR_MONTHS. */
  month: number;
  /** Counting up from the new moon, or down from the full one. */
  waxing: boolean;
  day: number;
  /** A holy day, Thngai Sel: the 8th and the 15th, and the month's last. */
  holy: boolean;
  /** The year of the Buddhist Era: 2570 for most of 2026. */
  era: number;
  /** The year of the Khmer era, which turns at Khmer New Year. */
  khmerEra: number;
}

/** "15 waxing Assoch". */
export const lunarDateName = ({ day, waxing, month }: LunarDate): string =>
  `${day} ${waxing ? "waxing" : "waning"} ${LUNAR_MONTHS[month] ?? ""}`;

/** The Khmer date of a day, read at noon. */
const khmerDateOf = (date: Date) =>
  momentkh.fromGregorian(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    12
  ).khmer;

const workOutDates = (year: number): LunarDate[] => {
  const first = Date.UTC(year, 0, 1);
  const length = Math.round((Date.UTC(year + 1, 0, 1) - first) / DAY);

  // One day more than the year, to know whether its last day ends a month.
  const khmer = Array.from({ length: length + 1 }, (_, i) =>
    khmerDateOf(new Date(first + i * DAY))
  );

  return khmer.slice(0, length).map((date, i) => {
    const waxing = date.moonPhase === 0;
    const lastOfMonth = !waxing && khmer[i + 1]?.moonPhase === 0;
    const day = new Date(first + i * DAY);

    return {
      day: date.day,
      era: date.beYear,
      holy: date.day === 8 || (waxing && date.day === 15) || lastOfMonth,
      key: keyOf(year, day.getUTCMonth() + 1, day.getUTCDate()),
      khmerEra: date.jsYear,
      month: date.monthIndex,
      waxing,
    };
  });
};

const dateYears = new Map<number, readonly LunarDate[]>();

/** Every day of a Gregorian year in the lunar calendar, worked out once. */
export const lunarDatesIn = (year: number): readonly LunarDate[] => {
  const known = dateYears.get(year);

  if (known) {
    return known;
  }

  const dates = workOutDates(year);

  dateYears.set(year, dates);

  return dates;
};

/** A day key's lunar date. */
export const lunarDateOf = (key: string): LunarDate | null => {
  const day = parseDay(key);

  if (!day) {
    return null;
  }

  const index = daysBetween(keyOf(day.year, 1, 1), key);

  return lunarDatesIn(day.year)[index] ?? null;
};

export type FestivalId =
  | "lunar-new-year"
  | "meak-bochea"
  | "khmer-new-year"
  | "visak-bochea"
  | "royal-ploughing"
  | "pchum-ben"
  | "bon-om-touk";

export interface Festival {
  id: FestivalId;
  name: string;
  emoji: string;
}

export const FESTIVALS: readonly Festival[] = [
  { emoji: "🧧", id: "lunar-new-year", name: "Lunar New Year" },
  { emoji: "🕯️", id: "meak-bochea", name: "Meak Bochea" },
  { emoji: "💦", id: "khmer-new-year", name: "Khmer New Year" },
  { emoji: "☸️", id: "visak-bochea", name: "Visak Bochea" },
  { emoji: "🐂", id: "royal-ploughing", name: "Royal Ploughing" },
  { emoji: "🍙", id: "pchum-ben", name: "Pchum Ben" },
  { emoji: "🛶", id: "bon-om-touk", name: "Bon Om Touk" },
];

/** A festival in a given year: its days, `end` included. */
export interface FestivalDays {
  festival: Festival;
  start: string;
  end: string;
}

const festival = (id: FestivalId): Festival => {
  const found = FESTIVALS.find((entry) => entry.id === id);

  if (!found) {
    throw new Error(`No festival ${id}`);
  }

  return found;
};

/**
 * The lunar festivals, from their first day and how many there are:
 * 15 waxing Pisakh is [5, true, 15]. Months count from Migasir (0): Meak
 * 2, Pisakh 5, Phatrabot 9, Kadeuk 11.
 */
const LUNAR: readonly (readonly [
  FestivalId,
  readonly [month: number, waxing: boolean, day: number],
  number,
])[] = [
  ["meak-bochea", [2, true, 15], 1],
  ["visak-bochea", [5, true, 15], 1],
  ["royal-ploughing", [5, false, 4], 1],
  ["pchum-ben", [9, false, 14], 3],
  ["bon-om-touk", [11, true, 14], 3],
];

const later = (key: string, days: number): string => {
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

const workOutFestivals = (year: number): FestivalDays[] => {
  const dates = lunarDatesIn(year);
  const newYear = lunarNewYear(year);

  const found: FestivalDays[] = [
    { end: newYear, festival: festival("lunar-new-year"), start: newYear },
  ];

  // Khmer New Year runs from Moha Songkran to Virak Loeung Sak, the first
  // day of the new era: three days, or four with two days of Virak Wanabat.
  const songkran = momentkh.getNewYear(year);
  const start = keyOf(year, songkran.month, songkran.day);
  const before = lunarDateOf(start)?.khmerEra;

  const leungSak = dates.find(
    (date) => date.key > start && date.khmerEra !== before
  );

  found.push({
    end: leungSak?.key ?? later(start, 2),
    festival: festival("khmer-new-year"),
    start,
  });

  for (const [id, [month, waxing, day], length] of LUNAR) {
    const first = dates.find(
      (date) =>
        date.month === month && date.waxing === waxing && date.day === day
    );

    if (first) {
      found.push({
        end: later(first.key, length - 1),
        festival: festival(id),
        start: first.key,
      });
    }
  }

  return found.toSorted((a, b) => a.start.localeCompare(b.start));
};

const festivalYears = new Map<number, readonly FestivalDays[]>();

/** The festivals of a Gregorian year, in order, worked out once. */
export const festivalsIn = (year: number): readonly FestivalDays[] => {
  const known = festivalYears.get(year);

  if (known) {
    return known;
  }

  const found = workOutFestivals(year);

  festivalYears.set(year, found);

  return found;
};

/** The festival under way on a day, if any. */
export const festivalOn = (key: string): Festival | null =>
  festivalsIn(Number(key.slice(0, 4))).find(
    ({ start, end }) => start <= key && key <= end
  )?.festival ?? null;

/** The next festival from `today`, or the one under way. */
export const nextFestival = (today: string): FestivalDays | null => {
  const year = Number(today.slice(0, 4));

  return (
    [...festivalsIn(year), ...festivalsIn(year + 1)].find(
      ({ end }) => end >= today
    ) ?? null
  );
};

/** Days until a festival: 0 once it has begun, until its last day. */
export const daysUntil = ({ start }: FestivalDays, today: string): number =>
  Math.max(0, daysBetween(today, start));
