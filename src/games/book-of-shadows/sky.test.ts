import { Body, Observer, SearchAltitude } from "astronomy-engine";
import { describe, expect, it } from "vitest";

import {
  anglesAt,
  eclipsesBetween,
  longitudeOf,
  positionsAt,
  retrogradesBetween,
} from "./sky";
import { normalize, placementOf } from "./zodiac";

const signOf = (longitude: number) => placementOf(longitude).sign.name;

/** The shortest gap between two longitudes, in degrees. */
const gap = (a: number, b: number) => Math.abs(normalize(a - b + 180) - 180);

describe("positionsAt", () => {
  it("puts the planets where the almanac does on 26 October 2026", () => {
    const sky = new Map(
      positionsAt(new Date("2026-10-26T12:00:00Z")).map((position) => [
        position.planet,
        position,
      ])
    );

    expect(signOf(sky.get("Sun")?.longitude ?? 0)).toBe("Scorpio");
    expect(signOf(sky.get("Saturn")?.longitude ?? 0)).toBe("Aries");
    expect(sky.get("Mercury")?.retrograde).toBe(true);
    expect(sky.get("Venus")?.retrograde).toBe(true);
    expect(sky.get("Mars")?.retrograde).toBe(false);
    expect(sky.get("Sun")?.retrograde).toBe(false);
  });
});

describe("retrogradesBetween", () => {
  const year = retrogradesBetween(
    new Date("2026-01-01T00:00:00Z"),
    new Date("2027-01-01T00:00:00Z")
  );

  it("finds 2026's three Mercury retrogrades, to the day", () => {
    expect(
      year
        .filter((period) => period.planet === "Mercury")
        .map((period) => [
          period.start.time.toISOString().slice(0, 10),
          period.end.time.toISOString().slice(0, 10),
        ])
    ).toEqual([
      ["2026-02-26", "2026-03-20"],
      ["2026-06-29", "2026-07-23"],
      ["2026-10-24", "2026-11-13"],
    ]);
  });

  it("keeps the ones that started the year before or end the year after", () => {
    const jupiter = year.filter((period) => period.planet === "Jupiter");

    expect(jupiter.map((period) => period.start.time.getUTCFullYear())).toEqual(
      [2025, 2026]
    );
    expect(jupiter.at(-1)?.end.time.getUTCFullYear()).toBe(2027);
  });

  it("names the sign it turns in", () => {
    const venus = year.find((period) => period.planet === "Venus");

    expect(signOf(venus?.start.longitude ?? 0)).toBe("Scorpio");
    expect(signOf(venus?.end.longitude ?? 0)).toBe("Libra");
  });
});

describe("eclipsesBetween", () => {
  it("lists 2026's four eclipses in order", () => {
    expect(
      eclipsesBetween(
        new Date("2026-01-01T00:00:00Z"),
        new Date("2027-01-01T00:00:00Z")
      ).map((eclipse) => [
        eclipse.body,
        eclipse.kind,
        eclipse.peak.toISOString().slice(0, 10),
      ])
    ).toEqual([
      ["Sun", "annular", "2026-02-17"],
      ["Moon", "total", "2026-03-03"],
      ["Sun", "total", "2026-08-12"],
      ["Moon", "partial", "2026-08-28"],
    ]);
  });
});

describe("anglesAt", () => {
  it.each([
    ["Paris in June", 48.86, 2.35, "2026-06-21"],
    ["Sydney in January", -33.87, 151.21, "2026-01-10"],
    ["the equator in September", 0, 0, "2026-09-01"],
    ["Reykjavík in March", 64.15, -21.94, "2026-03-01"],
  ])("rises with the Sun at sunrise in %s", (_, lat, lon, day) => {
    const sunrise = SearchAltitude(
      Body.Sun,
      new Observer(lat, lon, 0),
      +1,
      new Date(`${day}T00:00:00Z`),
      1,
      0
    );

    expect(sunrise).not.toBeNull();

    const at = sunrise?.date ?? new Date(day);

    expect(
      gap(anglesAt(at, lat, lon).ascendant, longitudeOf("Sun", at))
    ).toBeLessThan(0.5);
  });

  it("puts the Midheaven 90° or so from the Ascendant", () => {
    const { ascendant, midheaven } = anglesAt(
      new Date("1990-07-14T10:00:00Z"),
      48.86,
      2.35
    );

    expect(gap(ascendant, midheaven)).toBeGreaterThan(60);
    expect(gap(ascendant, midheaven)).toBeLessThan(120);
  });
});
