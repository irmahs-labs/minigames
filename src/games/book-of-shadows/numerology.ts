/**
 * Pythagorean numerology: every number is added digit by digit down to one
 * digit, except the master numbers 11, 22 and 33, which stay. Letters count
 * 1–9 round the alphabet (A 1, I 9, J 1 …), with accents dropped. Y counts as
 * a consonant.
 */
export const MASTER_NUMBERS: readonly number[] = [11, 22, 33];

const digitSum = (n: number) =>
  [...String(Math.abs(n))].reduce((sum, digit) => sum + Number(digit), 0);

/** 1987 → 25 → 7; 29 → 11 stays. */
export const reduce = (n: number): number => {
  let value = Math.abs(n);

  while (value > 9 && !MASTER_NUMBERS.includes(value)) {
    value = digitSum(value);
  }

  return value;
};

/** "Zoë-Anne" → "ZOEANNE": letters only, accents off. */
export const lettersOf = (name: string): string =>
  name
    .normalize("NFD")
    .replaceAll(/\p{M}/gu, "")
    .toUpperCase()
    .replaceAll(/[^A-Z]/gu, "");

/** A 1 … I 9, J 1 … R 9, S 1 … Z 8. */
export const letterValue = (letter: string): number =>
  (((letter.codePointAt(0) ?? 65) - 65) % 9) + 1;

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

const sumOf = (letters: string) =>
  reduce([...letters].reduce((sum, letter) => sum + letterValue(letter), 0));

export interface Numbers {
  /** From the full birth date: the path you walk. */
  lifePath: number;
  /** From the day of the month alone: a gift you were born with. */
  birthday: number;
  /** From every letter of the birth name: what you are here to do. */
  expression: number | null;
  /** From the vowels: what your heart wants. */
  soulUrge: number | null;
  /** From the consonants: how others see you. */
  personality: number | null;
  /** Life path and expression together: who you grow into. */
  maturity: number | null;
  /** This year's theme, from your birthday and the year. */
  personalYear: number;
}

/**
 * The core numbers for a birth date (year, month 1–12, day) and, when there
 * is one, a full birth name. The life path adds the month, the day and the
 * year each reduced first, so master numbers inside them count.
 */
export const numbersFor = (
  birth: { year: number; month: number; day: number },
  name: string,
  thisYear: number
): Numbers => {
  const letters = lettersOf(name);
  const vowels = [...letters].filter((letter) => VOWELS.has(letter)).join("");

  const consonants = [...letters]
    .filter((letter) => !VOWELS.has(letter))
    .join("");

  const lifePath = reduce(
    reduce(birth.month) + reduce(birth.day) + reduce(birth.year)
  );

  const expression = letters ? sumOf(letters) : null;

  return {
    birthday: reduce(birth.day),
    expression,
    lifePath,
    maturity: expression === null ? null : reduce(lifePath + expression),
    personalYear: reduce(
      reduce(birth.month) + reduce(birth.day) + reduce(thisYear)
    ),
    personality: consonants ? sumOf(consonants) : null,
    soulUrge: vowels ? sumOf(vowels) : null,
  };
};

/** What any number reduces to: one digit or a master number. */
export type CoreNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

const isCore = (n: number): n is CoreNumber =>
  (n >= 1 && n <= 9) || MASTER_NUMBERS.includes(n);

export interface NumberMeaning {
  title: string;
  keywords: string;
  about: string;
}

const MEANINGS: Readonly<Record<CoreNumber, NumberMeaning>> = {
  1: {
    about:
      "You start things. Independent and driven, you are happiest leading your own way.",
    keywords: "new starts, will, courage",
    title: "The Leader",
  },
  11: {
    about:
      "A master number: a 2 with the volume up. Sensitive, psychic, and here to inspire.",
    keywords: "intuition, vision, illumination",
    title: "The Intuitive",
  },
  2: {
    about:
      "You feel the room. Gentle and diplomatic, you make partnerships work.",
    keywords: "harmony, intuition, partnership",
    title: "The Peacemaker",
  },
  22: {
    about:
      "A master number: a 4 with the volume up. You can build dreams big enough for many.",
    keywords: "vision made real, legacy",
    title: "The Master Builder",
  },
  3: {
    about:
      "You light things up. Creative and expressive, you live to make and to share.",
    keywords: "joy, words, creativity",
    title: "The Creator",
  },
  33: {
    about:
      "A master number: a 6 with the volume up. Love as a calling, teaching by example.",
    keywords: "compassion, healing, guidance",
    title: "The Master Healer",
  },
  4: {
    about:
      "You build. Patient and reliable, you turn plans into something solid.",
    keywords: "foundations, order, hard work",
    title: "The Builder",
  },
  5: {
    about:
      "You roam. Curious and changeable, you need freedom and new experiences.",
    keywords: "change, adventure, the senses",
    title: "The Free Spirit",
  },
  6: {
    about:
      "You nurture. Warm and responsible, you take care of home and the people in it.",
    keywords: "love, home, care",
    title: "The Caretaker",
  },
  7: {
    about:
      "You seek. Inward and thoughtful, you look for the truth under things. The witch's number.",
    keywords: "mystery, study, the inner life",
    title: "The Mystic",
  },
  8: {
    about:
      "You command. Ambitious and capable, you know how to turn effort into power.",
    keywords: "power, success, abundance",
    title: "The Powerhouse",
  },
  9: {
    about:
      "You give. Wise and compassionate, you finish cycles and help others with theirs.",
    keywords: "endings, compassion, wisdom",
    title: "The Old Soul",
  },
};

const PERSONAL_YEARS: Readonly<Record<CoreNumber, string>> = {
  1: "A year of beginnings: plant the seeds of the next nine years.",
  11: "A master year of insight: trust the messages that come.",
  2: "A year of patience and partnership: let things grow.",
  22: "A master year of building something that lasts.",
  3: "A year of joy and making: say yes, create, be seen.",
  33: "A master year of service and healing.",
  4: "A year of work: build the foundations, steadily.",
  5: "A year of change: travel, move, try the new thing.",
  6: "A year of home and love: tend to family and the heart.",
  7: "A year of rest and study: go inward, read, reflect.",
  8: "A year of harvest: recognition, money, power.",
  9: "A year of endings: clear out to make room for the next cycle.",
};

export const meaningOf = (n: number): NumberMeaning | null =>
  isCore(n) ? MEANINGS[n] : null;

export const personalYearOf = (n: number): string | null =>
  isCore(n) ? PERSONAL_YEARS[n] : null;
