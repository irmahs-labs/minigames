import { describe, expect, it } from "vitest";

import { RETROGRADE_LORE, loreFor, retrogradeLore } from "./retrograde-lore";
import { WANDERERS, retrogradesBetween } from "./sky";

describe("RETROGRADE_LORE", () => {
  it("has a line for every planet in every sign, and no line twice", () => {
    const lines = WANDERERS.flatMap((planet) => RETROGRADE_LORE[planet]);

    expect(lines).toHaveLength(8 * 12);
    expect(lines.every((line) => line.length > 20)).toBe(true);
    expect(new Set(lines).size).toBe(lines.length);
  });

  it("reads the sign from the longitude", () => {
    // 230° is 20° Scorpio, the eighth sign.
    expect(retrogradeLore("Mercury", 230)).toBe(RETROGRADE_LORE.Mercury[7]);
    expect(retrogradeLore("Mercury", 359.9)).toBe(RETROGRADE_LORE.Mercury[11]);
  });
});

describe("loreFor", () => {
  const year = retrogradesBetween(
    new Date("2026-01-01T00:00:00Z"),
    new Date("2027-01-01T00:00:00Z")
  );

  it("gives each of 2026's Mercury retrogrades its own words", () => {
    const mercury = year
      .filter((period) => period.planet === "Mercury")
      .map((period) => loreFor(period).join(" "));

    expect(mercury).toHaveLength(3);
    expect(new Set(mercury).size).toBe(3);
  });

  it("adds the sign a planet backs into", () => {
    // Venus turns back in Scorpio on 3 October 2026 and direct in Libra.
    const venus = year.find((period) => period.planet === "Venus");

    expect(venus && loreFor(venus)).toEqual([
      RETROGRADE_LORE.Venus[7],
      RETROGRADE_LORE.Venus[6],
    ]);
  });
});
