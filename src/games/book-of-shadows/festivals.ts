import momentkh from "@thyrith/momentkh";

import { lunarNewYear } from "./lunar-zodiac";
import { DAY, daysBetween, keyOf, parseDay } from "./time";

/**
 * The lunar festivals: the Lunar New Year of the Chinese calendar, and the
 * Khmer year's festivals. The Khmer ones keep the Buddhist lunar calendar
 * Cambodia shares with Thailand, Laos, Myanmar and Sri Lanka, so each has
 * sisters there under other names, and each goes here by the name the
 * region knows it by, as the Lunar zodiac does for the animals.
 */
export type FestivalId =
  | "lunar-new-year"
  | "magha-puja"
  | "songkran"
  | "vesak"
  | "royal-ploughing"
  | "ancestors"
  | "water-and-lights";

export interface Festival {
  id: FestivalId;
  /** The name it goes by across the region. */
  name: string;
  /** What it is called in Cambodia. */
  khmer: string;
  emoji: string;
  about: string;
  /** The same festival elsewhere. */
  sisters: string;
}

export const FESTIVALS: readonly Festival[] = [
  {
    about:
      "The first new moon of the Chinese calendar: the house swept clean of last year’s luck, a reunion dinner, red envelopes and lion dances. Chinese-Khmer families keep it too.",
    emoji: "🧧",
    id: "lunar-new-year",
    khmer: "Chaul Chnam Chen",
    name: "Lunar New Year",
    sisters:
      "the Spring Festival, Chūnjié (China), Tết (Vietnam), Seollal (Korea), and on or near the same new moon Tsagaan Sar (Mongolia) and Losar (Tibet)",
  },
  {
    about:
      "The full moon of Meak, when 1,250 monks came unbidden to hear the Buddha. Gifts to the monks, and at night a candlelit walk three times round the temple.",
    emoji: "🕯️",
    id: "magha-puja",
    khmer: "Meak Bochea",
    name: "Magha Puja",
    sisters:
      "Makha Bucha (Thailand), Boun Makha Bousa (Laos), Navam Poya (Sri Lanka)",
  },
  {
    about:
      "The Sun enters Aries by the old Indian reckoning, and the year turns at the hour the astrologers set. Moha Songkran welcomes the new year’s angel, Virak Wanabat gives to the monks and the elders, and Virak Loeung Sak washes the Buddhas and the elders’ hands. Water everywhere, sand stupas and street games. The animal of the year changes now.",
    emoji: "💦",
    id: "songkran",
    khmer: "Khmer New Year, Moha Songkran",
    name: "Songkran, the solar New Year",
    sisters:
      "Songkran (Thailand), Pi Mai (Laos), Thingyan (Myanmar), Aluth Avurudda (Sri Lanka), and in India and Bangladesh Vishu, Puthandu, Baisakhi and Pohela Boishakh",
  },
  {
    about:
      "The full moon of Pisakh, when the Buddha was born, awoke and passed away, all three on the same full moon. Temple visits, lanterns, and birds set free.",
    emoji: "☸️",
    id: "vesak",
    khmer: "Visak Bochea",
    name: "Vesak",
    sisters:
      "Visakha Bucha (Thailand), Boun Visakha Bousa (Laos), the full moon of Kasone (Myanmar), Phật Đản (Vietnam), Vesak (Sri Lanka, Malaysia, Singapore, Indonesia). Korea keeps the Buddha’s birthday on the 8th of the 4th lunar month, Japan on 8 April",
  },
  {
    about:
      "The rains are coming. The king’s oxen plough a sacred furrow, then choose from seven trays (rice, corn, beans, sesame, grass, water and wine), and what they eat foretells the harvest.",
    emoji: "🐂",
    id: "royal-ploughing",
    khmer: "Preah Reach Pithi Chrot Preah Neangkoal",
    name: "Royal Ploughing",
    sisters:
      "Raek Na Khwan (Thailand), Vap Magul (Sri Lanka); the emperors of China and Japan once ploughed or planted the first rice too",
  },
  {
    about:
      "Fifteen days of Kan Ben, when the gates of hell open and the dead come looking for their families, end on Pchum Ben. Before dawn, balls of rice thrown in the temple grounds feed the hungry ghosts, and food taken to the monks reaches seven generations of ancestors.",
    emoji: "🍙",
    id: "ancestors",
    khmer: "Pchum Ben",
    name: "Festival of the Ancestors",
    sisters:
      "Boun Khao Padap Din and Boun Khao Salak (Laos), Sat Thai (Thailand), and from the Ullambana sutra, the Ghost Festival, Zhongyuan (China), Vu Lan (Vietnam), Baekjung (Korea) and Obon (Japan), all late in the summer rains",
  },
  {
    about:
      "At the full moon of Kadeuk the rains end and the Tonlé Sap turns, flowing back to the Mekong. Three days of boat races in Phnom Penh; at midnight Sampeah Preah Khe salutes the Moon with ak ambok, pounded rice, and Loy Pratip sends lit floats down the river.",
    emoji: "🛶",
    id: "water-and-lights",
    khmer: "Bon Om Touk",
    name: "Water and Lights Festival",
    sisters:
      "Loy Krathong (Thailand), Tazaungdaing (Myanmar), and the lamps of Kartik Purnima (India) on the same full moon; in Laos, the boat races of Boun Ok Phansa a moon before",
  },
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

/** A day of the Khmer lunar calendar: 15 waxing Pisakh is [5, "waxing", 15]. */
type KhmerDay = readonly [
  month: number,
  phase: "waxing" | "waning",
  day: number,
];

/**
 * The Khmer lunar festivals, from the first of their days and how many
 * there are. Months count from Migasir (0): Meak 2, Pisakh 5, Phatrabot
 * 9, Kadeuk 11.
 */
const LUNAR: readonly (readonly [FestivalId, KhmerDay, number])[] = [
  ["magha-puja", [2, "waxing", 15], 1],
  ["vesak", [5, "waxing", 15], 1],
  ["royal-ploughing", [5, "waning", 4], 1],
  ["ancestors", [9, "waning", 14], 3],
  ["water-and-lights", [11, "waxing", 14], 3],
];

const PHASES = ["waxing", "waning"] as const;

/** Each day of a year, as its key and its Khmer date, at noon. */
const khmerYear = (year: number) => {
  const first = Date.UTC(year, 0, 1);
  const length = Math.round((Date.UTC(year + 1, 0, 1) - first) / DAY);

  return Array.from({ length }, (_, i) => {
    const date = new Date(first + i * DAY);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const { khmer } = momentkh.fromGregorian(year, month, day, 12);

    return {
      era: khmer.jsYear,
      key: keyOf(year, month, day),
      lunar: [khmer.monthIndex, PHASES[khmer.moonPhase], khmer.day] as const,
    };
  });
};

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

const workOutYear = (year: number): FestivalDays[] => {
  const days = khmerYear(year);
  const found: FestivalDays[] = [];

  const newYear = lunarNewYear(year);

  found.push({
    end: newYear,
    festival: festival("lunar-new-year"),
    start: newYear,
  });

  // Khmer New Year runs from Moha Songkran to Virak Loeung Sak, the first
  // day of the new era: three days, or four with two days of Virak Wanabat.
  const songkran = momentkh.getNewYear(year);
  const start = keyOf(year, songkran.month, songkran.day);
  const before = days.find((entry) => entry.key === start)?.era;

  const leungSak = days.find(
    (entry) => entry.key > start && entry.era !== before
  );

  found.push({
    end: leungSak?.key ?? later(start, 2),
    festival: festival("songkran"),
    start,
  });

  for (const [id, [month, phase, day], length] of LUNAR) {
    const first = days.find(
      ({ lunar }) =>
        lunar[0] === month && lunar[1] === phase && lunar[2] === day
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

const years = new Map<number, readonly FestivalDays[]>();

/**
 * The festivals of a Gregorian year, in order, on Cambodia's dates from the
 * Khmer calendar (Chhankitek). Worked out once a year: it reads the whole
 * year's Khmer dates.
 */
export const festivalsIn = (year: number): readonly FestivalDays[] => {
  const known = years.get(year);

  if (known) {
    return known;
  }

  const found = workOutYear(year);

  years.set(year, found);

  return found;
};

/** Each festival once, the next time it comes (or under way) from `today`. */
export const festivalsFrom = (today: string): FestivalDays[] => {
  const year = Number(today.slice(0, 4));
  const seen = new Set<FestivalId>();

  return [...festivalsIn(year), ...festivalsIn(year + 1)].filter((entry) => {
    if (entry.end < today || seen.has(entry.festival.id)) {
      return false;
    }

    seen.add(entry.festival.id);

    return true;
  });
};

/** Days until a festival: 0 once it has begun, until its last day. */
export const daysUntil = ({ start }: FestivalDays, today: string): number =>
  Math.max(0, daysBetween(today, start));
