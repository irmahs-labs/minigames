import type { Pronounce } from "./pronunciations";
import { rhymeOf, spelledAlike, syllablesIn } from "./rhyme";
import type { Rhyme, RhymeKind } from "./rhyme";

/**
 * How powerful a spell is. A spell is verses in rhyming pairs, couplets, and
 * its tier comes from how they rhyme, how even their syllables are, how the
 * rhymes are spelled and how long it is:
 *
 * - S: every couplet rhymes perfectly with an even count, one rhyme at least
 *   is spelled differently ("trouble" and "bubbles"), and it's long.
 * - A: the same, but short.
 * - B: perfect, even rhymes, all spelled alike ("deep" and "sleep").
 * - C: even, but a word rhymes with itself ("fly" and "fly").
 * - D: even, but a rhyme is a stretch ("night" and "ride"); or good rhymes
 *   with an uneven count.
 * - E: uneven and a stretch, or a word rhyming with itself.
 * - F: a couplet doesn't rhyme, or a verse is too short: the spell fails.
 */

export type Tier = "S" | "A" | "B" | "C" | "D" | "E" | "F";

/** Every tier, most powerful first. */
export const TIERS: readonly Tier[] = ["S", "A", "B", "C", "D", "E", "F"];

/** The fewest syllables a verse can have for the spell to work. */
export const MIN_SYLLABLES = 4;

/** A spell this many syllables long or more is long. */
export const LONG_SYLLABLES = 30;

/** Two verses are even when their syllables differ by this much at most. */
export const EVEN_WITHIN = 1;

export interface Verse {
  text: string;
  /** The word it ends on, which it rhymes with. */
  last: string;
  syllables: number;
}

export interface Couplet {
  first: Verse;
  second: Verse;
  rhyme: Rhyme;
  /** Whether both verses have about as many syllables. */
  even: boolean;
  /** Whether the two rhyming words spell their rhyme the same way. */
  spelledAlike: boolean;
}

/** Why a spell failed, when it did. */
export type Failure = "one-verse" | "no-rhyme" | "too-short";

export interface Reading {
  tier: Tier;
  failure: Failure | null;
  verses: Verse[];
  couplets: Couplet[];
  syllables: number;
  long: boolean;
}

const WORDS = /[a-z]+(?:['’][a-z]+)*/giu;

const wordsIn = (text: string) => text.match(WORDS) ?? [];

/** A verse, or null for text with no words in it. */
const verseOf = (pronounce: Pronounce, text: string): Verse | null => {
  const words = wordsIn(text);
  const last = words.at(-1);

  return last
    ? {
        last,
        syllables: words.reduce(
          (sum, word) => sum + syllablesIn(pronounce, word),
          0
        ),
        text: text.trim(),
      }
    : null;
};

/** Best first: how much each kind of rhyme is worth when choosing a reading. */
const RHYME_RANK: Readonly<Record<RhymeKind, number>> = {
  none: 0,
  perfect: 3,
  "same-word": 2,
  stretch: 1,
};

/** Where a line can break into two verses: after a comma, a full stop, a dash… */
const BREAKS = /[,.;:!?—–]+\s*/gu;

/**
 * A line as the two halves that rhyme best, at a break in it, with the most
 * even syllables between them. A line with breaks but no rhyming halves splits
 * at its most even break; one without breaks stays whole.
 */
const halves = (pronounce: Pronounce, line: string): Verse[] => {
  let best: { verses: Verse[]; rank: number; gap: number } | null = null;

  for (const match of line.matchAll(BREAKS)) {
    const cut = match.index + match[0].length;
    const first = verseOf(pronounce, line.slice(0, cut));
    const second = verseOf(pronounce, line.slice(cut));

    if (first && second) {
      const rank = RHYME_RANK[rhymeOf(pronounce, first.last, second.last).kind];
      const gap = Math.abs(first.syllables - second.syllables);

      if (!best || rank > best.rank || (rank === best.rank && gap < best.gap)) {
        best = { gap, rank, verses: [first, second] };
      }
    }
  }

  const whole = verseOf(pronounce, line);

  return best?.verses ?? (whole ? [whole] : []);
};

/** Verses in pairs, in order; an odd last verse rhymes with the one before it. */
const pairUp = (verses: readonly Verse[]) => {
  const pairs: [Verse, Verse][] = [];

  const pair = (i: number) => {
    const first = verses[i];
    const second = verses[i + 1];

    if (first && second) {
      pairs.push([first, second]);
    }
  };

  for (let i = 0; i + 1 < verses.length; i += 2) {
    pair(i);
  }

  if (verses.length > 2 && verses.length % 2 === 1) {
    pair(verses.length - 2);
  }

  return pairs;
};

const coupletOf = (
  pronounce: Pronounce,
  [first, second]: [Verse, Verse]
): Couplet => ({
  even: Math.abs(first.syllables - second.syllables) <= EVEN_WITHIN,
  first,
  rhyme: rhymeOf(pronounce, first.last, second.last),
  second,
  spelledAlike: spelledAlike(pronounce, first.last, second.last),
});

/** The tier of a spell whose couplets all rhyme and whose verses are long enough. */
const tierOf = (couplets: readonly Couplet[], long: boolean): Tier => {
  const kinds = new Set(couplets.map((couplet) => couplet.rhyme.kind));
  const even = couplets.every((couplet) => couplet.even);

  if (kinds.has("stretch")) {
    return even ? "D" : "E";
  }

  if (kinds.has("same-word")) {
    return even ? "C" : "E";
  }

  if (!even) {
    return "D";
  }

  if (couplets.every((couplet) => couplet.spelledAlike)) {
    return "B";
  }

  return long ? "S" : "A";
};

/** One way of reading a spell: these verses, paired in order. */
const readVerses = (pronounce: Pronounce, verses: Verse[]): Reading => {
  const couplets = pairUp(verses).map((pair) => coupletOf(pronounce, pair));
  const syllables = verses.reduce((sum, verse) => sum + verse.syllables, 0);
  const long = syllables >= LONG_SYLLABLES;
  let failure: Failure | null = null;

  if (couplets.length === 0) {
    failure = "one-verse";
  } else if (verses.some((verse) => verse.syllables < MIN_SYLLABLES)) {
    failure = "too-short";
  } else if (couplets.some((couplet) => couplet.rhyme.kind === "none")) {
    failure = "no-rhyme";
  }

  return {
    couplets,
    failure,
    long,
    syllables,
    tier: failure ? "F" : tierOf(couplets, long),
    verses,
  };
};

/**
 * What a spell is worth. It can be written a verse a line, or a couplet a line
 * with a break (a comma, a full stop) between its verses; both readings are
 * tried, and the spell is as powerful as the better one.
 */
export const readSpell = (pronounce: Pronounce, text: string): Reading => {
  const lines = text.split(/\r?\n/u).filter((line) => wordsIn(line).length > 0);

  const byLine = readVerses(
    pronounce,
    lines.flatMap((line) => verseOf(pronounce, line) ?? [])
  );

  const byHalf = readVerses(
    pronounce,
    lines.flatMap((line) => halves(pronounce, line))
  );

  const better = TIERS.indexOf(byHalf.tier) - TIERS.indexOf(byLine.tier);

  // A tie keeps the writer's own lines, unless they are a single verse.
  return better < 0 || (better === 0 && byLine.couplets.length === 0)
    ? byHalf
    : byLine;
};
