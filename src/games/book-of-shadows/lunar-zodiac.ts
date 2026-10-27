import { SearchMoonPhase, SearchSunLongitude, Seasons } from "astronomy-engine";

import { dayKey } from "./time";

/**
 * The Lunar zodiac, Shēngxiào (生肖), the Chinese zodiac: twelve animals in
 * turn, one for each lunar year, with the five elements going round every
 * two years. A year starts at the Lunar New Year, on the new moon that
 * opens the first month of the Chinese calendar, so a birthday in January
 * or early February belongs to the year before.
 */
export type AnimalId =
  | "rat"
  | "ox"
  | "tiger"
  | "rabbit"
  | "dragon"
  | "snake"
  | "horse"
  | "goat"
  | "monkey"
  | "rooster"
  | "dog"
  | "pig";

export interface Animal {
  id: AnimalId;
  name: string;
  /** Its character, traditional. */
  hanzi: string;
  emoji: string;
  keywords: string;
  about: string;
  strengths: string;
  challenges: string;
}

/** In the order they run, from the Rat (1984, 1996, 2008, 2020…). */
export const ANIMALS: readonly Animal[] = [
  {
    about:
      "First to the Jade Emperor's race, by riding on the Ox. Quick, resourceful and charming, the Rat always finds a way and always has something put by.",
    challenges: "restless, a little calculating, quick to worry",
    emoji: "🐀",
    hanzi: "鼠",
    id: "rat",
    keywords: "clever, resourceful, quick",
    name: "Rat",
    strengths: "sharp wits, thrift, adaptability",
  },
  {
    about:
      "Strong, patient and dependable, the Ox carries what others cannot and finishes what it starts, one steady step at a time.",
    challenges: "stubborn, slow to change, keeps feelings in",
    emoji: "🐂",
    hanzi: "牛",
    id: "ox",
    keywords: "patient, diligent, dependable",
    name: "Ox",
    strengths: "hard work, honesty, endurance",
  },
  {
    about:
      "Brave and magnetic, the Tiger leaps at life, protects the underdog and trusts its own instincts above any rule.",
    challenges: "impulsive, rebellious, quick-tempered",
    emoji: "🐅",
    hanzi: "虎",
    id: "tiger",
    keywords: "brave, confident, passionate",
    name: "Tiger",
    strengths: "courage, generosity, leadership",
  },
  {
    about:
      "Gentle, elegant and lucky, the Rabbit keeps the peace and makes a beautiful home. In Vietnam this year belongs to the Cat.",
    challenges: "avoids conflict, overly cautious, sensitive",
    emoji: "🐇",
    hanzi: "兔",
    id: "rabbit",
    keywords: "gentle, graceful, kind",
    name: "Rabbit",
    strengths: "tact, taste, compassion",
  },
  {
    about:
      "The only legendary animal of the twelve, the Dragon brings power, luck and ambition, and thinks big from the start.",
    challenges: "proud, demanding, impatient",
    emoji: "🐉",
    hanzi: "龍",
    id: "dragon",
    keywords: "powerful, ambitious, lucky",
    name: "Dragon",
    strengths: "vision, energy, charisma",
  },
  {
    about:
      "Wise and mysterious, the Snake thinks before it moves, reads people well and keeps its own counsel.",
    challenges: "secretive, suspicious, possessive",
    emoji: "🐍",
    hanzi: "蛇",
    id: "snake",
    keywords: "wise, intuitive, elegant",
    name: "Snake",
    strengths: "insight, calm, determination",
  },
  {
    about:
      "Free-spirited and full of energy, the Horse loves to roam, to talk and to be among people, and hates to be tied down.",
    challenges: "restless, impatient, scattered",
    emoji: "🐎",
    hanzi: "馬",
    id: "horse",
    keywords: "free, energetic, warm",
    name: "Horse",
    strengths: "enthusiasm, independence, cheer",
  },
  {
    about:
      "Gentle and artistic, the Goat (or Sheep) has a soft heart, a good eye and a need for peace and beautiful things.",
    challenges: "anxious, indecisive, too dependent",
    emoji: "🐐",
    hanzi: "羊",
    id: "goat",
    keywords: "creative, gentle, caring",
    name: "Goat",
    strengths: "kindness, artistry, empathy",
  },
  {
    about:
      "Clever, curious and mischievous, the Monkey solves any puzzle, tries everything once, and makes everyone laugh.",
    challenges: "restless, a trickster, easily bored",
    emoji: "🐒",
    hanzi: "猴",
    id: "monkey",
    keywords: "clever, playful, inventive",
    name: "Monkey",
    strengths: "wit, versatility, humour",
  },
  {
    about:
      "Proud, punctual and observant, the Rooster says what it thinks, works hard, and always looks its best.",
    challenges: "blunt, critical, a perfectionist",
    emoji: "🐓",
    hanzi: "雞",
    id: "rooster",
    keywords: "honest, hardworking, confident",
    name: "Rooster",
    strengths: "courage, precision, loyalty",
  },
  {
    about:
      "Loyal and honest to the bone, the Dog stands by its people, fights for what is fair and can smell a lie a mile off.",
    challenges: "anxious, stubborn, judgemental",
    emoji: "🐕",
    hanzi: "狗",
    id: "dog",
    keywords: "loyal, honest, just",
    name: "Dog",
    strengths: "faithfulness, a sense of justice, sincerity",
  },
  {
    about:
      "Generous and good-hearted, the Pig enjoys life's pleasures, trusts others and gives without counting.",
    challenges: "naive, indulgent, easily taken in",
    emoji: "🐖",
    hanzi: "豬",
    id: "pig",
    keywords: "generous, warm, easygoing",
    name: "Pig",
    strengths: "kindness, honesty, a big heart",
  },
];

export type ZodiacElement = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

/** What each element gives the animal it rides with. */
export const ELEMENT_LORE: Readonly<Record<ZodiacElement, string>> = {
  Earth: "steady, practical and nurturing",
  Fire: "passionate, bold and dynamic",
  Metal: "determined, disciplined and strong-willed",
  Water: "intuitive, flexible and wise",
  Wood: "generous, growing and cooperative",
};

/** Years ending in 4 and 5 are Wood, 6 and 7 Fire, then Earth, Metal, Water. */
const ELEMENTS: readonly ZodiacElement[] = [
  "Metal",
  "Metal",
  "Water",
  "Water",
  "Wood",
  "Wood",
  "Fire",
  "Fire",
  "Earth",
  "Earth",
];

const mod = (n: number, m: number) => ((n % m) + m) % m;

export interface LunarYear {
  /** The Gregorian year it starts in. */
  year: number;
  animal: Animal;
  element: ZodiacElement;
  /** Even years are yang, odd ones yin. */
  polarity: "Yang" | "Yin";
}

export const lunarYear = (year: number): LunarYear => {
  const animal = ANIMALS[mod(year - 4, 12)] ?? ANIMALS[0];

  if (!animal) {
    throw new Error("No animals");
  }

  return {
    animal,
    element: ELEMENTS[mod(year, 10)] ?? "Wood",
    polarity: mod(year, 2) === 0 ? "Yang" : "Yin",
    year,
  };
};

/** "Metal Horse": a year's element and animal together. */
export const yearName = (year: LunarYear): string =>
  `${year.element} ${year.animal.name}`;

/**
 * The Chinese calendar is kept at a steady UTC+8, never on summer time:
 * not Asia/Shanghai, whose clocks went forward in the 1940s and 1986–91.
 * (Etc/GMT-8 is UTC+8: the Etc signs run backwards.)
 */
const BEIJING = "Etc/GMT-8";

const DAY = 86_400_000;

/** The days, in Beijing, of the new moons from `from` to `until`. */
const newMoonDays = (from: Date, until: Date): string[] => {
  const days: string[] = [];
  let moon = SearchMoonPhase(0, from, 40);

  while (moon && moon.date <= until) {
    days.push(dayKey(moon.date, BEIJING));
    moon = SearchMoonPhase(0, new Date(moon.date.getTime() + DAY), 40);
  }

  return days;
};

/**
 * The first day of the eleventh month, the one that holds the winter
 * solstice: the last new moon on or before the solstice's day in Beijing.
 */
const eleventhMonth = (year: number): string => {
  const solstice = Seasons(year).dec_solstice.date;
  const solsticeDay = dayKey(solstice, BEIJING);

  // Up to a day on: a new moon later on the solstice's own day still counts.
  const moons = newMoonDays(
    new Date(solstice.getTime() - 31 * DAY),
    new Date(solstice.getTime() + DAY)
  );

  return moons.findLast((day) => day <= solsticeDay) ?? solsticeDay;
};

/** Whether a month, from one new moon's day to the next's, holds a major solar term. */
const hasMajorTerm = (start: string, end: string): boolean => {
  const [startYear] = start.split("-").map(Number);

  for (let longitude = 0; longitude < 360; longitude += 30) {
    for (const year of [startYear ?? 2000, (startYear ?? 2000) + 1]) {
      const term = SearchSunLongitude(
        longitude,
        new Date(Date.UTC(year - 1, 11, 1)),
        400
      );

      if (term) {
        const day = dayKey(term.date, BEIJING);

        if (day >= start && day < end) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * The Lunar New Year of a Gregorian year, as the day it falls on in
 * Beijing: the second new moon after the start of the eleventh month, or
 * the third when a leap month comes between (as in 2033–34).
 */
export const lunarNewYear = (year: number): string => {
  const from = eleventhMonth(year - 1);
  const to = eleventhMonth(year);
  const fromDate = new Date(`${from}T00:00:00+08:00`);
  const toDate = new Date(`${to}T00:00:00+08:00`);

  const months = newMoonDays(fromDate, new Date(toDate.getTime() - DAY)).filter(
    (day) => day >= from && day < to
  );

  const ends = [...months.slice(1), to];

  // Thirteen months between two winter solstices: the first without a major
  // solar term is the leap month, and if it comes before the New Year the
  // New Year moves a month on.
  const leap =
    months.length === 13
      ? months.findIndex((start, i) => !hasMajorTerm(start, ends[i] ?? to))
      : -1;

  const first = leap === 1 || leap === 2 ? 3 : 2;

  return months[first] ?? months[2] ?? from;
};

/** The lunar year a day falls in: the year before, until the New Year. */
export const lunarYearOf = (day: string): LunarYear => {
  const year = Number(day.slice(0, 4));

  return lunarYear(day < lunarNewYear(year) ? year - 1 : year);
};

/** The double-hours of the day: the Rat from 23:00, the Ox from 01:00… */
export const hourAnimal = (hour: number): Animal => {
  const animal = ANIMALS[Math.floor(mod(hour + 1, 24) / 2)] ?? ANIMALS[0];

  if (!animal) {
    throw new Error("No animals");
  }

  return animal;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** "23:00–00:59" for the Rat. */
export const hoursOf = (animal: Animal): string => {
  const start = mod(ANIMALS.indexOf(animal) * 2 - 1, 24);

  return `${pad(start)}:00–${pad(mod(start + 1, 24))}:59`;
};

/** The animals four apart get on best: the Rat, the Dragon and the Monkey. */
export const allies = (animal: Animal): Animal[] =>
  [4, 8].flatMap(
    (step) => ANIMALS[mod(ANIMALS.indexOf(animal) + step, 12)] ?? []
  );

/** Each animal's one secret friend: Rat and Ox, Tiger and Pig… */
export const secretFriend = (animal: Animal): Animal => {
  const friend = ANIMALS[mod(1 - ANIMALS.indexOf(animal), 12)];

  if (!friend) {
    throw new Error("No animals");
  }

  return friend;
};

/** The animal opposite on the wheel clashes with it: the Rat and the Horse. */
export const clash = (animal: Animal): Animal => {
  const opposite = ANIMALS[mod(ANIMALS.indexOf(animal) + 6, 12)];

  if (!opposite) {
    throw new Error("No animals");
  }

  return opposite;
};

/** The lunar year `now` falls in, where the visitor is. */
export const currentLunarYear = (now: Date, timeZone: string): LunarYear =>
  lunarYearOf(dayKey(now, timeZone));

/** An animal's recent years: the six up to and around `around`. */
export const yearsOf = (animal: Animal, around: number): number[] => {
  const latest = around - mod(around - 4 - ANIMALS.indexOf(animal), 12);

  return [-48, -36, -24, -12, 0, 12].map((step) => latest + step);
};
