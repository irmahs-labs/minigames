/**
 * The CMU Pronouncing Dictionary, packed small enough to load with the game.
 *
 * `vite.config.ts` packs it at build time into the `virtual:pronunciations`
 * module: a first line listing every phoneme, then one word a line, sorted,
 * each starting with how many letters it shares with the word before (one
 * base-36 digit), then the rest of the word, a space, and its phonemes as one
 * character each. The game unpacks it when it opens.
 */

/** A word's phonemes in ARPAbet, vowels marked with their stress: ["K", "AE1", "T"]. */
export type Phonemes = readonly string[];

/** How a word sounds, or undefined for a word the dictionary doesn't know. */
export type Pronounce = (word: string) => Phonemes | undefined;

/** The first character a phoneme is written as; the rest follow in order. */
const FIRST_CODE = 0x21;

/** The most letters one word can say it shares with the word before. */
const MAX_SHARED = 35;

/** Plain words only: no "read(1)" variants, no numbers or punctuation. */
const PLAIN_WORD = /^[a-z][a-z']*$/u;

const alphabetical = (a: string, b: string) => a.localeCompare(b, "en");

/** Packs `dictionary` (word → "K AE1 T") into the text described above. */
export const packPronunciations = (
  dictionary: Readonly<Record<string, string>>
) => {
  const words = Object.keys(dictionary)
    .filter((word) => PLAIN_WORD.test(word))
    .toSorted(alphabetical);

  const phonemes = [
    ...new Set(words.flatMap((word) => dictionary[word]?.split(" ") ?? [])),
  ].toSorted(alphabetical);

  const codes = new Map(
    phonemes.map((phoneme, i) => [
      phoneme,
      String.fromCodePoint(FIRST_CODE + i),
    ])
  );

  const lines = [phonemes.join(" ")];
  let previous = "";

  for (const word of words) {
    let shared = 0;

    while (
      shared < MAX_SHARED &&
      shared < previous.length &&
      previous[shared] === word[shared]
    ) {
      shared += 1;
    }

    const sounds = (dictionary[word] ?? "")
      .split(" ")
      .map((phoneme) => codes.get(phoneme))
      .join("");

    lines.push(`${shared.toString(36)}${word.slice(shared)} ${sounds}`);
    previous = word;
  }

  return lines.join("\n");
};

/** Unpacks `packed` into a lookup: a word in, its phonemes out. */
export const unpackPronunciations = (packed: string): Pronounce => {
  const [header = "", ...lines] = packed.split("\n");
  const phonemes = header.split(" ");
  const words = new Map<string, string>();
  let previous = "";

  for (const line of lines) {
    const space = line.indexOf(" ");
    const shared = Number.parseInt(line.slice(0, 1), 36);
    const word = previous.slice(0, shared) + line.slice(1, space);

    words.set(word, line.slice(space + 1));
    previous = word;
  }

  return (word) => {
    const sounds = words.get(word);

    return sounds === undefined
      ? undefined
      : [...sounds].map(
          (code) => phonemes[(code.codePointAt(0) ?? 0) - FIRST_CODE] ?? ""
        );
  };
};
