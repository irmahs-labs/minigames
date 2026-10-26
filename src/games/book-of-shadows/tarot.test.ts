import { describe, expect, it } from "vitest";

import { DECK, SUITS, cardsMatching, drawCard } from "./tarot";

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

describe("cardsMatching", () => {
  it("filters by arcana and suit", () => {
    expect(cardsMatching("major", "")).toHaveLength(22);
    expect(
      cardsMatching("cups", "").every((card) => card.suit === "cups")
    ).toBe(true);
  });

  it("searches names and keywords, either way up", () => {
    expect(cardsMatching("all", "tower").map((card) => card.name)).toEqual([
      "The Tower",
    ]);
    expect(cardsMatching("all", "HEARTBREAK").map((card) => card.name)).toEqual(
      ["Three of Swords"]
    );
    // "breaking free" is the Devil's reversed keyword.
    expect(
      cardsMatching("major", "breaking free").map((card) => card.name)
    ).toEqual(["The Devil"]);
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
