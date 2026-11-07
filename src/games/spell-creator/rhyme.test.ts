import packed from "virtual:pronunciations";
import { describe, expect, it } from "vitest";

import { packPronunciations, unpackPronunciations } from "./pronunciations";
import {
  guessSyllables,
  rhymeOf,
  spelledAlike,
  syllablesIn,
  tailLikeness,
} from "./rhyme";

const say = unpackPronunciations(packed);

describe("the packed dictionary", () => {
  it("unpacks every word it packs", () => {
    const lookup = unpackPronunciations(
      packPronunciations({
        cat: "K AE1 T",
        catalog: "K AE1 T AH0 L AO2 G",
        "read(1)": "R EH1 D",
        zebra: "Z IY1 B R AH0",
      })
    );

    expect(lookup("cat")).toEqual(["K", "AE1", "T"]);
    expect(lookup("catalog")).toEqual([
      "K",
      "AE1",
      "T",
      "AH0",
      "L",
      "AO2",
      "G",
    ]);
    expect(lookup("zebra")).toEqual(["Z", "IY1", "B", "R", "AH0"]);
    expect(lookup("read(1)")).toBeUndefined();
    expect(lookup("dog")).toBeUndefined();
  });

  it("knows English", () => {
    expect(say("cauldron")).toEqual(["K", "AA1", "L", "D", "R", "AH0", "N"]);
    expect(say("abracadabra")).toHaveLength(11);
  });
});

describe("syllables", () => {
  it.each([
    ["double", 2],
    ["brilliant", 2],
    ["enemy", 3],
    ["what’s", 1],
    ["abracadabra", 5],
    ["Spindle", 2],
  ])("counts %s as %i", (word, count) => {
    expect(syllablesIn(say, word)).toBe(count);
  });

  it("guesses a word it doesn't know by its vowels, without a silent e", () => {
    expect(guessSyllables("zorbex")).toBe(2);
    expect(guessSyllables("grimbole")).toBe(2);
    expect(guessSyllables("flarn")).toBe(1);
  });
});

describe("rhymes", () => {
  it.each([
    ["quick", "kick"],
    ["fright", "bite"],
    ["deep", "sleep"],
    ["linger", "finger"],
    ["none", "one"],
    ["trouble", "bubbles"],
    ["fly", "butterfly"],
    ["fire", "higher"],
  ])("%s and %s rhyme perfectly", (first, second) => {
    expect(rhymeOf(say, first, second).kind).toBe("perfect");
  });

  it("knows a word rhyming with itself", () => {
    expect(rhymeOf(say, "fly", "Fly").kind).toBe("same-word");
  });

  it.each([
    ["night", "ride"],
    ["home", "alone"],
    ["lake", "fate"],
    ["time", "mine"],
    ["bit", "beat"],
  ])("%s and %s are a stretch", (first, second) => {
    expect(rhymeOf(say, first, second).kind).toBe("stretch");
  });

  it.each([
    ["cat", "dog"],
    ["moon", "table"],
    ["moon", "ten"],
    ["bright", "bed"],
  ])("%s and %s don't rhyme", (first, second) => {
    expect(rhymeOf(say, first, second).kind).toBe("none");
  });

  it("scores the same ending 1, and near sounds closer than far ones", () => {
    expect(tailLikeness(["AY", "T"], ["AY", "T"])).toBe(1);
    expect(tailLikeness(["AY", "T"], ["AY", "D"])).toBeGreaterThan(
      tailLikeness(["AY", "T"], ["AY", "M"])
    );
  });

  it("judges words it doesn't know by their spelling", () => {
    expect(rhymeOf(say, "zorbex", "vortex")).toMatchObject({
      guessed: true,
      kind: "perfect",
    });
    expect(rhymeOf(say, "zorbex", "flarn").kind).toBe("none");
  });
});

describe("spelling", () => {
  it.each([
    ["deep", "sleep"],
    ["quick", "kick"],
    ["linger", "finger"],
    ["none", "one"],
  ])("%s and %s spell their rhyme alike", (first, second) => {
    expect(spelledAlike(say, first, second)).toBe(true);
  });

  it.each([
    ["fright", "bite"],
    ["trouble", "bubbles"],
    ["fire", "higher"],
  ])("%s and %s spell it differently", (first, second) => {
    expect(spelledAlike(say, first, second)).toBe(false);
  });
});
