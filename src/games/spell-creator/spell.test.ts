import packed from "virtual:pronunciations";
import { describe, expect, it } from "vitest";

import { EXAMPLES } from "./examples";
import { unpackPronunciations } from "./pronunciations";
import { TIERS, readSpell } from "./spell";

const say = unpackPronunciations(packed);
const tierOf = (spell: string) => readSpell(say, spell).tier;

describe("a spell's tier", () => {
  it.each(TIERS)("is %s for the tier's example", (tier) => {
    expect(tierOf(EXAMPLES[tier])).toBe(tier);
  });

  it("is S for rhymes spelled differently in a long, even spell", () => {
    const reading = readSpell(say, EXAMPLES.S);

    expect(reading.long).toBe(true);
    expect(reading.couplets.map((couplet) => couplet.first.last)).toEqual([
      "trouble",
      "none",
    ]);
    expect(reading.couplets.every((couplet) => couplet.even)).toBe(true);
  });

  it("reads a verse a line the same as a couplet a line", () => {
    expect(
      tierOf(
        "Double, double, toil and trouble,\nCauldron burst with brilliant bubbles.\nThe strength of evil is good as none,\nWhen stands before four hearts of one."
      )
    ).toBe("S");
    expect(
      tierOf("Silver candle, shining bright,\nguide me on my midnight ride.")
    ).toBe("D");
  });

  it("is A, not S, for the same spell cut short", () => {
    expect(
      tierOf(
        "Double, double, toil and trouble, cauldron burst with brilliant bubbles."
      )
    ).toBe("A");
  });

  it("is D for good rhymes with uneven syllables", () => {
    expect(
      tierOf(
        "Silver candle, shining bright, guide me home through the long and dark and stormy night."
      )
    ).toBe("D");
  });

  it("is E for a word rhyming with itself, unevenly", () => {
    expect(
      tierOf(
        "I believe that I can fly, I believe that pigs can really, truly fly."
      )
    ).toBe("E");
  });
});

describe("a failed spell", () => {
  it("fails without a second verse", () => {
    expect(readSpell(say, "Abracadabra")).toMatchObject({
      failure: "one-verse",
      tier: "F",
    });
  });

  it("fails when a verse is too short", () => {
    expect(readSpell(say, "Hocus pocus, fly away")).toMatchObject({
      failure: "too-short",
      tier: "F",
    });
  });

  it("fails when a couplet doesn't rhyme", () => {
    expect(readSpell(say, EXAMPLES.F)).toMatchObject({
      failure: "no-rhyme",
      tier: "F",
    });
  });

  it("fails for no words at all", () => {
    expect(readSpell(say, " \n ,.").tier).toBe("F");
  });
});
