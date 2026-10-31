import { inFrench, say } from "./french";
import { ANIMALS, allies, clash, secretFriend } from "./lunar-zodiac";
import type { LunarYear, ZodiacElement } from "./lunar-zodiac";
import { reduce } from "./numerology";
import type { Numbers } from "./numerology";
import { longitudeIn } from "./profile";
import type { Chart } from "./profile";
import type { Planet } from "./sky";
import { mod } from "./time";
import { normalize, placementOf } from "./zodiac";

/**
 * How well two people match, three ways: their birth charts side by side
 * (synastry), their numbers, and their Lunar zodiac animals. Each gives a
 * score out of 100, a one-line verdict, and the reasons, good and hard.
 */
export type Tone = "good" | "mixed" | "hard";

export interface Reason {
  title: string;
  text: string;
  tone: Tone;
}

/** How one pair of things (two numbers, two animals) gets on. */
export interface Pairing {
  /** 0–100. */
  score: number;
  text: string;
  tone: Tone;
}

export interface Match {
  /** 0–100. */
  score: number;
  verdict: string;
  reasons: Reason[];
}

/** "Sam" → "Sam's"; no name → "their". */
export const possessive = (name: string): string => {
  const trimmed = name.trim();

  if (trimmed === "") {
    return "their";
  }

  return trimmed.endsWith("s") ? `${trimmed}'` : `${trimmed}'s`;
};

/** A planet or a sign's element in French, for the lines built from parts. */
const FRENCH_ELEMENTS = new Map(
  Object.entries({
    air: "air",
    earth: "terre",
    fire: "feu",
    water: "eau",
  })
);

const FRENCH_ASPECTS = new Map(
  Object.entries({
    conjunction: "en conjonction avec",
    opposition: "en opposition à",
    sextile: "en sextile avec",
    square: "au carré de",
    trine: "en trigone avec",
  })
);

/** "de Sam", or "de l’autre" with no name. */
const ofName = (name: string) => {
  const trimmed = name.trim();

  return trimmed === "" ? "de l’autre" : `de ${trimmed}`;
};

const clamp = (score: number) => Math.round(Math.max(3, Math.min(98, score)));

const verdictOf = (score: number): string => {
  if (score >= 85) {
    return "A rare match: easy, warm and lasting.";
  }

  if (score >= 70) {
    return "A strong match, with plenty to share.";
  }

  if (score >= 55) {
    return "A good match that grows with care.";
  }

  if (score >= 40) {
    return "A mixed match: different, and learning from it.";
  }

  return "A challenging match: sparks, and work to do.";
};

// ── synastry ──

interface AspectKind {
  name: string;
  angle: number;
  orb: number;
  tone: Tone;
  /** What the two planets do to each other in it. */
  verb: string;
  points: number;
}

export const ASPECTS: readonly AspectKind[] = [
  {
    angle: 0,
    name: "conjunction",
    orb: 8,
    points: 7,
    tone: "good",
    verb: "meet and merge",
  },
  {
    angle: 60,
    name: "sextile",
    orb: 5,
    points: 6,
    tone: "good",
    verb: "spark easy chances",
  },
  {
    angle: 90,
    name: "square",
    orb: 6,
    points: -6,
    tone: "hard",
    verb: "rub and push each other to grow",
  },
  {
    angle: 120,
    name: "trine",
    orb: 7,
    points: 9,
    tone: "good",
    verb: "flow together easily",
  },
  {
    angle: 180,
    name: "opposition",
    orb: 7,
    points: -1,
    tone: "mixed",
    verb: "attract and mirror each other",
  },
];

/** The aspect two longitudes make, if they make one within its orb. */
export const aspectBetween = (a: number, b: number): AspectKind | null => {
  const gap = Math.abs(normalize(a - b + 180) - 180);

  return (
    ASPECTS.find((aspect) => Math.abs(gap - aspect.angle) <= aspect.orb) ?? null
  );
};

/** The pairs that matter most between two charts, and what each is about. */
const PAIRS: readonly [
  mine: Planet,
  theirs: Planet,
  about: string,
  weight: number,
][] = [
  ["Sun", "Sun", "who you each are", 1.5],
  ["Moon", "Moon", "what you each need to feel safe", 1.5],
  ["Sun", "Moon", "who you are and what they need", 1.5],
  ["Moon", "Sun", "what you need and who they are", 1.5],
  ["Venus", "Mars", "your love and their desire", 1.2],
  ["Mars", "Venus", "your desire and their love", 1.2],
  ["Venus", "Venus", "what you each find beautiful", 1],
  ["Mercury", "Mercury", "how you each think and talk", 1],
  ["Mars", "Mars", "how you each fight and act", 0.8],
];

type ElementPair = "kindred" | "complementary" | "different";

/** Fire and air feed each other, as do earth and water. */
const elementPair = (a: number, b: number): ElementPair => {
  const one = placementOf(a).sign.element;
  const two = placementOf(b).sign.element;

  if (one === two) {
    return "kindred";
  }

  const together = new Set([one, two]);

  return (together.has("fire") && together.has("air")) ||
    (together.has("earth") && together.has("water"))
    ? "complementary"
    : "different";
};

/** Two birth charts, side by side: the aspects between them and their Suns' elements. */
export const chartMatch = (
  mine: Chart,
  theirs: Chart,
  name: string,
  french = inFrench()
): Match => {
  const reasons: Reason[] = [];
  let score = 50;

  const mySun = longitudeIn(mine, "Sun");
  const theirSunAt = longitudeIn(theirs, "Sun");
  const suns = elementPair(mySun, theirSunAt);
  const sunSign = placementOf(mySun).sign;
  const theirSun = placementOf(theirSunAt).sign;

  score += { complementary: 6, different: -4, kindred: 8 }[suns];

  const myElement = FRENCH_ELEMENTS.get(sunSign.element) ?? sunSign.element;

  const theirElement =
    FRENCH_ELEMENTS.get(theirSun.element) ?? theirSun.element;

  reasons.push({
    text: french
      ? {
          complementary: `Votre ${myElement} et le ${theirElement} ${ofName(name)} se nourrissent.`,
          different: `Votre ${myElement} et le ${theirElement} ${ofName(name)} parlent des langues différentes : à apprendre.`,
          kindred: `Vous êtes tous deux des signes de ${myElement} : vous vous comprenez sans un mot.`,
        }[suns]
      : {
          complementary: `Your ${sunSign.element} and ${possessive(name)} ${theirSun.element} feed each other.`,
          different: `Your ${sunSign.element} and ${possessive(name)} ${theirSun.element} speak different languages: worth learning.`,
          kindred: `You are both ${sunSign.element} signs: you understand each other without words.`,
        }[suns],
    title: french
      ? `Soleil en ${say(sunSign.name)} et Soleil en ${say(theirSun.name)}`
      : `${sunSign.name} Sun and ${theirSun.name} Sun`,
    tone: suns === "different" ? "mixed" : "good",
  });

  for (const [planet, other, about, weight] of PAIRS) {
    const aspect = aspectBetween(
      longitudeIn(mine, planet),
      longitudeIn(theirs, other)
    );

    if (aspect) {
      score += aspect.points * weight;
      const aboutText = say(about);
      reasons.push({
        text: `${aboutText[0]?.toUpperCase()}${aboutText.slice(1)} ${say(aspect.verb)}.`,
        title: french
          ? `Votre ${say(planet)} ${FRENCH_ASPECTS.get(aspect.name) ?? aspect.name} ${say(other)} ${ofName(name)}`
          : `Your ${planet} ${aspect.name} ${possessive(name)} ${other}`,
        tone: aspect.tone,
      });
    }
  }

  const final = clamp(score);

  return { reasons, score: final, verdict: say(verdictOf(final)) };
};

// ── numerology ──

/** The three families of numbers that get on: 1-5-7, 2-4-8 and 3-6-9. */
const FAMILIES: readonly (readonly number[])[] = [
  [1, 5, 7],
  [2, 4, 8],
  [3, 6, 9],
];

/** A master number counts with its root: 11 with the 2s, 22 the 4s, 33 the 6s. */
const root = (n: number) => (n > 9 ? reduce(Math.floor(n / 10) + (n % 10)) : n);

const familyOf = (n: number) =>
  FAMILIES.findIndex((family) => family.includes(root(n)));

/** How two numbers get on, out of 100, and why. */
export const numberPair = (a: number, b: number): Pairing => {
  if (a === b) {
    return {
      score: 82,
      text: "The same number: you get each other, flaws and all.",
      tone: "good",
    };
  }

  const one = familyOf(a);
  const two = familyOf(b);

  if (one === two) {
    return {
      score: 90,
      text: "Natural partners: the same family of numbers.",
      tone: "good",
    };
  }

  // The 3-6-9s get on with everyone; 1-5-7 and 2-4-8 pull different ways.
  return one === 2 || two === 2
    ? {
        score: 68,
        text: "Compatible: different rhythms that fit together.",
        tone: "mixed",
      }
    : {
        score: 42,
        text: "Challenging: independence meets the need for security.",
        tone: "hard",
      };
};

/** Two people's numbers: life paths first, and their names' numbers when both have one. */
export const numbersMatch = (
  mine: Numbers,
  theirs: Numbers,
  name: string,
  french = inFrench()
): Match => {
  const life = numberPair(mine.lifePath, theirs.lifePath);

  const reasons: Reason[] = [
    {
      text: say(life.text),
      title: french
        ? `Chemin de vie ${mine.lifePath} et ${theirs.lifePath} ${ofName(name)}`
        : `Life path ${mine.lifePath} and ${possessive(name)} ${theirs.lifePath}`,
      tone: life.tone,
    },
  ];

  let total = life.score * 2;
  let weight = 2;

  const pairs: [label: string, a: number | null, b: number | null][] = [
    ["Expression", mine.expression, theirs.expression],
    ["Soul urge", mine.soulUrge, theirs.soulUrge],
  ];

  for (const [label, a, b] of pairs) {
    if (a !== null && b !== null) {
      const pair = numberPair(a, b);

      total += pair.score;
      weight += 1;
      reasons.push({
        text: say(pair.text),
        title: french ? `${say(label)} ${a} et ${b}` : `${label} ${a} and ${b}`,
        tone: pair.tone,
      });
    }
  }

  const final = clamp(total / weight);

  return { reasons, score: final, verdict: say(verdictOf(final)) };
};

// ── the Lunar zodiac ──

/** Wood feeds Fire, Fire makes Earth, Earth bears Metal, Metal holds Water, Water feeds Wood. */
const FEEDS: Readonly<Record<ZodiacElement, ZodiacElement>> = {
  Earth: "Metal",
  Fire: "Earth",
  Metal: "Water",
  Water: "Wood",
  Wood: "Fire",
};

/** Wood parts Earth, Earth dams Water, Water quenches Fire, Fire melts Metal, Metal cuts Wood. */
const CHECKS: Readonly<Record<ZodiacElement, ZodiacElement>> = {
  Earth: "Water",
  Fire: "Metal",
  Metal: "Wood",
  Water: "Fire",
  Wood: "Earth",
};

/** Two Lunar zodiac years: the animals first, then their elements. */
export const lunarMatch = (
  mine: LunarYear,
  theirs: LunarYear,
  french = inFrench()
): Match => {
  const a = mine.animal;
  const b = theirs.animal;
  const sum = mod(ANIMALS.indexOf(a) + ANIMALS.indexOf(b), 12);
  let animal: Pairing;

  if (a === b) {
    animal = {
      score: 70,
      text: "Two of a kind: you share your strengths and your blind spots.",
      tone: "good",
    };
  } else if (allies(a).includes(b)) {
    animal = {
      score: 95,
      text: "Best friends of the zodiac: you stand in the same trine.",
      tone: "good",
    };
  } else if (secretFriend(a) === b) {
    animal = {
      score: 90,
      text: "Secret friends: a quiet, loyal bond that lasts.",
      tone: "good",
    };
  } else if (clash(a) === b) {
    animal = {
      score: 30,
      text: "Opposites on the wheel: a clash, and big lessons in it.",
      tone: "hard",
    };
  } else if (sum === 7) {
    animal = {
      score: 45,
      text: "A harmful pair: small hurts add up, so speak plainly.",
      tone: "hard",
    };
  } else {
    animal = {
      score: 65,
      text: "Neither friends nor foes: what you make of it is up to you.",
      tone: "mixed",
    };
  }

  const reasons: Reason[] = [
    {
      text: say(animal.text),
      title: french
        ? `${a.emoji} ${say(a.name)} et ${b.emoji} ${say(b.name)}`
        : `${a.emoji} ${a.name} and ${b.emoji} ${b.name}`,
      tone: animal.tone,
    },
  ];

  let { score } = animal;
  const one = mine.element;
  const two = theirs.element;
  const frOne = say(one);
  const frTwo = say(two);
  const both = french ? `${frOne} et ${frTwo}` : `${one} and ${two}`;

  if (one === two) {
    score += 4;
    reasons.push({
      text: french
        ? `Vous êtes tous deux ${frOne} : stables, quoique semblables.`
        : `You are both ${one}: steady, if alike.`,
      title: both,
      tone: "good",
    });
  } else if (FEEDS[one] === two || FEEDS[two] === one) {
    score += 8;
    reasons.push({
      text: french
        ? `${frOne} et ${frTwo} se nourrissent : un flux naturel entre vous.`
        : `${one} and ${two} feed each other: a natural flow between you.`,
      title: both,
      tone: "good",
    });
  } else if (CHECKS[one] === two || CHECKS[two] === one) {
    score -= 8;
    reasons.push({
      text: french
        ? `${frOne} et ${frTwo} se tiennent en respect : respectez la manière de l’autre.`
        : `${one} and ${two} keep each other in check: respect the other's way.`,
      title: both,
      tone: "hard",
    });
  }

  const final = clamp(score);

  return { reasons, score: final, verdict: say(verdictOf(final)) };
};
