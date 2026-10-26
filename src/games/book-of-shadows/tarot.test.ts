import { describe, expect, it } from "vitest";

import {
  DECK,
  FIRST_CHOICE,
  MAJOR_ARCANA,
  SUITS,
  cardOf,
  choiceOf,
  drawCard,
} from "./tarot";

describe("DECK", () => {
  it("holds 78 cards: 22 major arcana and four suits of 14", () => {
    expect(DECK).toHaveLength(78);
    expect(DECK.filter((card) => card.suit === null)).toHaveLength(22);

    for (const suit of SUITS) {
      expect(DECK.filter((card) => card.suit === suit)).toHaveLength(14);
    }
  });

  it("names the cards in order, each once", () => {
    expect(DECK[0]?.name).toBe("The Fool");
    expect(DECK[21]?.name).toBe("The World");
    expect(DECK[21]?.label).toBe("XXI");
    expect(DECK[22]?.name).toBe("Ace of Wands");
    expect(DECK.at(-1)?.name).toBe("King of Pentacles");
    expect(new Set(DECK.map((card) => card.id)).size).toBe(78);
  });

  it("reads every card both ways, and no two the same", () => {
    const meanings = DECK.flatMap((card) => [
      card.upright.meaning,
      card.reversed.meaning,
    ]);

    expect(
      DECK.every(
        (card) => card.upright.keywords !== "" && card.reversed.keywords !== ""
      )
    ).toBe(true);
    expect(new Set(meanings).size).toBe(78 * 2);
  });
});

describe("cardOf", () => {
  it("finds a major card by its number", () => {
    expect(cardOf({ ...FIRST_CHOICE, major: 13 }).name).toBe("Death");
    expect(MAJOR_ARCANA).toHaveLength(22);
  });

  it("finds a minor card by its suit and rank", () => {
    expect(
      cardOf({ ...FIRST_CHOICE, arcana: "minor", rank: 2, suit: "swords" }).name
    ).toBe("Three of Swords");
    expect(
      cardOf({ ...FIRST_CHOICE, arcana: "minor", rank: 13, suit: "cups" }).name
    ).toBe("King of Cups");
  });
});

describe("choiceOf", () => {
  it("lands on a drawn card, keeping the other arcana's pick", () => {
    const before = { ...FIRST_CHOICE, major: 7 };
    const queen = DECK.find((card) => card.name === "Queen of Pentacles");

    if (!queen) {
      throw new Error("No Queen of Pentacles");
    }

    const choice = choiceOf({ card: queen, reversed: true }, before);

    expect(choice).toEqual({
      arcana: "minor",
      major: 7,
      rank: 12,
      reversed: true,
      suit: "pentacles",
    });
    expect(cardOf(choice)).toBe(queen);
  });

  it("goes back to every card it came from", () => {
    for (const card of DECK) {
      expect(cardOf(choiceOf({ card, reversed: false }, FIRST_CHOICE))).toBe(
        card
      );
    }
  });
});

describe("drawCard", () => {
  it("takes the card and the way up from the random numbers", () => {
    const rolls = [0, 0.9];
    const draw = drawCard(() => rolls.shift() ?? 0);

    expect(draw.card.name).toBe("The Fool");
    expect(draw.reversed).toBe(false);

    const last = [0.9999, 0.1];

    expect(drawCard(() => last.shift() ?? 0)).toMatchObject({
      card: { name: "King of Pentacles" },
      reversed: true,
    });
  });
});
