import type { Phonemes, Pronounce } from "./pronunciations";

/**
 * How well two words rhyme, by how they sound. A rhyme runs from a word's last
 * stressed vowel to its end: "lin-GER" and "fin-GER" share "-inger". Two
 * endings that sound the same are a perfect rhyme. One that is close (the same
 * vowel with other consonants, or a near vowel) is a stretch. Words the
 * dictionary doesn't know are judged by their spelling instead.
 */

/** A rhyme from best to worst. */
export type RhymeKind = "perfect" | "same-word" | "stretch" | "none";

export interface Rhyme {
  kind: RhymeKind;
  /** How alike the endings sound, from 0 to 1. */
  score: number;
  /** Whether a word was missing from the dictionary, so its spelling was used. */
  guessed: boolean;
}

/** At least this alike is a perfect rhyme; it allows a plural "s" more. */
export const PERFECT = 0.95;

/** At least this alike is a stretch; less is no rhyme at all. */
export const STRETCH = 0.55;

/** How much the stressed vowel counts towards a rhyme; what follows it is the rest. */
const VOWEL_WEIGHT = 0.6;

const isVowel = (phoneme: string) => /\d$/u.test(phoneme);
const bare = (phoneme: string) => phoneme.replace(/\d$/u, "");

/** Where each vowel sits in the mouth: [how high, how far back]. */
const VOWELS = new Map(
  Object.entries({
    AA: [0, 2],
    AE: [0.5, 0],
    AH: [1, 1],
    AO: [1, 2],
    AW: [0.5, 1.5],
    AY: [0.5, 0.5],
    EH: [1.5, 0],
    ER: [1.5, 1],
    EY: [2, 0],
    IH: [2.5, 0],
    IY: [3, 0],
    OW: [2, 2],
    OY: [1, 1.5],
    UH: [2.5, 2],
    UW: [3, 2],
  } as const)
);

/** How two vowels sound alike: 1 for the same, down to 0 for far apart. */
const vowelLikeness = (a: string, b: string) => {
  if (a === b) {
    return 1;
  }

  const [ah = 0, ab = 0] = VOWELS.get(a) ?? [];
  const [bh = 9, bb = 9] = VOWELS.get(b) ?? [];

  return Math.max(0, 1 - Math.hypot(ah - bh, ab - bb) / 2) * 0.7;
};

type Manner = "stop" | "fricative" | "affricate" | "nasal" | "liquid" | "glide";

/** Each consonant: where it's made (lips 0 to throat 7), how, and whether voiced. */
const CONSONANTS = new Map<string, readonly [number, Manner, boolean]>(
  Object.entries({
    B: [0, "stop", true],
    CH: [4, "affricate", false],
    D: [3, "stop", true],
    DH: [2, "fricative", true],
    F: [1, "fricative", false],
    G: [6, "stop", true],
    HH: [7, "fricative", false],
    JH: [4, "affricate", true],
    K: [6, "stop", false],
    L: [3, "liquid", true],
    M: [0, "nasal", true],
    N: [3, "nasal", true],
    NG: [6, "nasal", true],
    P: [0, "stop", false],
    R: [4, "liquid", true],
    S: [3, "fricative", false],
    SH: [4, "fricative", false],
    T: [3, "stop", false],
    TH: [2, "fricative", false],
    V: [1, "fricative", true],
    W: [0, "glide", true],
    Y: [5, "glide", true],
    Z: [3, "fricative", true],
    ZH: [4, "fricative", true],
  })
);

/** Manners close enough to count half: a stop and an affricate, say. */
const NEAR_MANNERS = new Set([
  "affricate:fricative",
  "affricate:stop",
  "glide:liquid",
]);

/** How two consonants sound alike: "t" and "d" are close, "t" and "m" far. */
const consonantLikeness = (a: string, b: string) => {
  const first = CONSONANTS.get(a);
  const second = CONSONANTS.get(b);

  if (a === b) {
    return 1;
  }

  if (!first || !second) {
    return 0;
  }

  const [placeA, mannerA, voicedA] = first;
  const [placeB, mannerB, voicedB] = second;
  let manner = 0;

  if (mannerA !== mannerB) {
    manner = NEAR_MANNERS.has([mannerA, mannerB].toSorted().join(":"))
      ? 0.2
      : 0.4;
  }

  const voice = voicedA === voicedB ? 0 : 0.2;
  const place = Math.min(0.4, Math.abs(placeA - placeB) * 0.1);

  return Math.max(0, 1 - manner - voice - place);
};

const likeness = (a: string, b: string) => {
  if (isVowel(a) !== isVowel(b)) {
    return 0;
  }

  return isVowel(a) ? vowelLikeness(bare(a), bare(b)) : consonantLikeness(a, b);
};

/** How alike two runs of sounds are, 0 to 1: an edit distance where near sounds cost less. */
const runLikeness = (a: Phonemes, b: Phonemes) => {
  if (a.length === 0 && b.length === 0) {
    return 1;
  }

  let row = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (const [i, sound] of a.entries()) {
    const next = [i + 1];

    for (const [j, other] of b.entries()) {
      next.push(
        Math.min(
          (row[j + 1] ?? 0) + 1,
          (next[j] ?? 0) + 1,
          (row[j] ?? 0) + 1 - likeness(sound, other)
        )
      );
    }

    row = next;
  }

  return 1 - (row[b.length] ?? 0) / Math.max(a.length, b.length);
};

/** Where a word's rhyme starts: its last stressed vowel, or its last vowel. */
const rhymeStart = (phonemes: Phonemes) => {
  const stressed = phonemes.findLastIndex((phoneme) => /[12]$/u.test(phoneme));

  return stressed === -1 ? phonemes.findLastIndex(isVowel) : stressed;
};

/** The sounds a word rhymes on, without stress marks: "finger" → IH NG G ER. */
export const rhymeTail = (phonemes: Phonemes) =>
  phonemes.slice(Math.max(0, rhymeStart(phonemes))).map(bare);

const PLURAL = new Set(["S", "Z"]);

/** How alike two rhyme endings sound, 0 to 1. */
export const tailLikeness = (a: Phonemes, b: Phonemes) => {
  const [longer, shorter] = a.length >= b.length ? [a, b] : [b, a];

  if (longer.join(" ") === shorter.join(" ")) {
    return 1;
  }

  // "trouble" and "bubbles": the same but for a plural on a consonant.
  const last = shorter.at(-1) ?? "";

  if (
    longer.length === shorter.length + 1 &&
    PLURAL.has(longer.at(-1) ?? "") &&
    !VOWELS.has(last) &&
    longer.slice(0, -1).join(" ") === shorter.join(" ")
  ) {
    return PERFECT;
  }

  return (
    VOWEL_WEIGHT * likeness(`${a[0]}1`, `${b[0]}1`) +
    (1 - VOWEL_WEIGHT) * runLikeness(a.slice(1), b.slice(1))
  );
};

/** A word as the dictionary spells it: lower case, straight apostrophes. */
export const normalWord = (word: string) =>
  word.toLowerCase().replaceAll("’", "'");

/**
 * A word's phonemes, trying it without an apostrophe ("o'er") or a possessive
 * "'s" too.
 */
export const pronounceWord = (pronounce: Pronounce, word: string) => {
  const normal = normalWord(word);

  const found =
    pronounce(normal) ?? pronounce(normal.replaceAll("'", "")) ?? undefined;

  if (found || !normal.endsWith("'s")) {
    return found;
  }

  const owner = pronounce(normal.slice(0, -2));

  return owner ? [...owner, "Z"] : undefined;
};

interface VowelGroup {
  index: number;
  text: string;
}

const PLAIN_VOWELS = new Set(["a", "e", "i", "o", "u"]);

/** Whether the letter at `i` is a vowel: "u" after "q" isn't, "y" is between consonants. */
const isVowelLetter = (word: string, i: number) => {
  const letter = word[i] ?? "";

  if (letter === "u" && word[i - 1] === "q") {
    return false;
  }

  if (letter === "y") {
    return i > 0 && !PLAIN_VOWELS.has(word[i + 1] ?? "");
  }

  return PLAIN_VOWELS.has(letter);
};

/** The runs of vowel letters in a word: "trouble" → "ou", "e". */
const vowelGroups = (word: string) => {
  const groups: VowelGroup[] = [];

  for (let i = 0; i < word.length; i += 1) {
    if (isVowelLetter(word, i)) {
      const last = groups.at(-1);

      if (last && last.index + last.text.length === i) {
        last.text += word[i];
      } else {
        groups.push({ index: i, text: word[i] ?? "" });
      }
    }
  }

  return groups;
};

/** Whether a vowel group is a silent "e" at the end: "bite", "bites", "smiled". */
const isSilentE = (word: string, group: VowelGroup) =>
  group.text === "e" && /^e[sd]?$/u.test(word.slice(group.index));

/** The vowel groups a reader hears, without a silent "e" at the end. */
const soundedGroups = (word: string, vowels: number) => {
  const groups = vowelGroups(word);
  const last = groups.at(-1);

  return groups.length > Math.max(1, vowels) && last && isSilentE(word, last)
    ? groups.slice(0, -1)
    : groups;
};

/** A guess at the syllables in a word the dictionary doesn't know. */
export const guessSyllables = (word: string) =>
  Math.max(1, soundedGroups(normalWord(word), 0).length);

/** How many syllables a word has, from the dictionary or else a guess. */
export const syllablesIn = (pronounce: Pronounce, word: string) => {
  const phonemes = pronounceWord(pronounce, word);

  return phonemes ? phonemes.filter(isVowel).length : guessSyllables(word);
};

const lettersOnly = (word: string) =>
  normalWord(word).replaceAll(/[^a-z]/gu, "");

/**
 * How a word's rhyme is spelled, from the letters of its stressed vowel, without
 * a plural "s": "trouble" → "ouble", "bubbles" → "ubble", "bite" → "ite".
 */
export const spelledTail = (word: string, phonemes?: Phonemes) => {
  const letters = lettersOnly(word);
  const vowels = phonemes?.filter(isVowel).length ?? 0;
  const groups = soundedGroups(letters, vowels);

  const inTail = phonemes
    ? Math.max(1, rhymeTail(phonemes).filter((p) => VOWELS.has(p)).length)
    : 1;

  const from =
    groups.length === vowels
      ? groups[vowels - inTail]
      : groups.at(-Math.min(inTail, groups.length));

  return letters.slice(from?.index ?? 0).replace(/(?<=.)s$/u, "");
};

/** Whether two rhyming words spell their rhyme the same way: "deep" and "sleep". */
export const spelledAlike = (
  pronounce: Pronounce,
  first: string,
  second: string
) =>
  spelledTail(first, pronounceWord(pronounce, first)) ===
  spelledTail(second, pronounceWord(pronounce, second));

const kindOf = (score: number): RhymeKind => {
  if (score >= PERFECT) {
    return "perfect";
  }

  return score >= STRETCH ? "stretch" : "none";
};

/** Two words the dictionary lacks, by their spelling: the same ending, or the same vowel. */
const guessRhyme = (first: string, second: string): Rhyme => {
  const a = spelledTail(first);
  const b = spelledTail(second);
  const vowelA = vowelGroups(a)[0]?.text;
  const vowelB = vowelGroups(b)[0]?.text;
  let score = 0;

  if (a === b) {
    score = PERFECT;
  } else if (vowelA === vowelB) {
    score = STRETCH;
  }

  return { guessed: true, kind: kindOf(score), score };
};

/** How well `first` rhymes with `second`. */
export const rhymeOf = (
  pronounce: Pronounce,
  first: string,
  second: string
): Rhyme => {
  if (lettersOnly(first) === lettersOnly(second)) {
    return { guessed: false, kind: "same-word", score: 1 };
  }

  const a = pronounceWord(pronounce, first);
  const b = pronounceWord(pronounce, second);

  if (!a || !b) {
    return guessRhyme(first, second);
  }

  const score = tailLikeness(rhymeTail(a), rhymeTail(b));

  return { guessed: false, kind: kindOf(score), score };
};
