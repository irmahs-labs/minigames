import { describe, expect, it } from "vitest";

import { witchTitle } from "./titles";

/** The middle of a sign, by its place in the zodiac: 0 for Aries. */
const sign = (index: number) => index * 30 + 15;

const SCORPIO = sign(7);
const CAPRICORN = sign(9);

describe("witchTitle", () => {
  it("joins the rising, the Sun, the Moon and the animal", () => {
    expect(
      witchTitle({
        animal: "dragon",
        moon: SCORPIO,
        rising: SCORPIO,
        sun: CAPRICORN,
      })
    ).toBe("Water-spirited Regent of the Submerged Palace");
  });

  it("starts at the Sun when there is no rising sign", () => {
    expect(
      witchTitle({ animal: "tiger", moon: sign(0), rising: null, sun: sign(4) })
    ).toBe("Sovereign of the Burning Mountains");
  });

  it("has a word for every sign", () => {
    for (let index = 0; index < 12; index += 1) {
      const title = witchTitle({
        animal: "horse",
        moon: sign(index),
        rising: sign(index),
        sun: sign(index),
      });

      expect(title.split(" ")).toHaveLength(6);
    }
  });
});
