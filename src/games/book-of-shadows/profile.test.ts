import { describe, expect, it } from "vitest";

import { PLACES, findPlace } from "./places";
import {
  EMPTY_PROFILE,
  STORAGE_KEY,
  birthMoonOf,
  chartFor,
  craftOf,
  elementBalance,
  houseOf,
  loadState,
  parseCoordinate,
  planetaryDayOf,
  readBirth,
} from "./profile";
import type { Profile } from "./profile";
import { isTimeZone } from "./time";
import { placementOf } from "./zodiac";

const profile = (fields: Partial<Profile>): Profile => ({
  ...EMPTY_PROFILE,
  ...fields,
});

/** The birth a profile describes, which these tests always give a date. */
const birthOf = (fields: Profile) => {
  const birth = readBirth(fields, "UTC");

  if (!birth) {
    throw new Error("No birth date");
  }

  return birth;
};

const paris = profile({
  birthDate: "1990-07-14",
  birthTime: "12:00",
  lat: "48.86",
  lon: "2.35",
  name: "Morgan le Fay",
  place: "Paris, France",
  timeZone: "Europe/Paris",
});

describe("readBirth", () => {
  it("reads the moment on the birthplace's clocks", () => {
    const birth = readBirth(paris, "UTC");

    expect(birth?.moment.toISOString()).toBe("1990-07-14T10:00:00.000Z");
    expect(birth?.timeKnown).toBe(true);
    expect(birth?.where).toEqual({ lat: 48.86, lon: 2.35 });
  });

  it("takes noon without a time, and the visitor's zone without a place", () => {
    const birth = readBirth(profile({ birthDate: "1990-07-14" }), "Asia/Tokyo");

    expect(birth?.moment.toISOString()).toBe("1990-07-14T03:00:00.000Z");
    expect(birth?.timeKnown).toBe(false);
    expect(birth?.where).toBeNull();
  });

  it("needs a real date", () => {
    expect(readBirth(profile({ birthDate: "" }), "UTC")).toBeNull();
    expect(readBirth(profile({ birthDate: "1990-02-31" }), "UTC")).toBeNull();
  });
});

describe("parseCoordinate", () => {
  it("takes a comma or a point, within range", () => {
    expect(parseCoordinate("-0,13", 180)).toBe(-0.13);
    expect(parseCoordinate("48.86", 90)).toBe(48.86);
    expect(parseCoordinate("91", 90)).toBeNull();
    expect(parseCoordinate("", 90)).toBeNull();
    expect(parseCoordinate("north", 90)).toBeNull();
  });
});

describe("chartFor", () => {
  it("draws the big three for a known time and place", () => {
    const chart = chartFor(birthOf(paris));
    const sun = chart.positions.find((position) => position.planet === "Sun");

    expect(placementOf(sun?.longitude ?? 0).sign.name).toBe("Cancer");
    expect(chart.angles).not.toBeNull();
    expect(chart.moonSpan).toBeNull();
    // At noon in July the Sun is high, so it sits in the 9th, 10th or 11th house.
    expect([9, 10, 11]).toContain(
      houseOf(sun?.longitude ?? 0, chart.angles?.ascendant ?? 0)
    );
  });

  it("gives the Moon's span over the day when the time is not known", () => {
    const chart = chartFor(
      birthOf(profile({ birthDate: "1990-07-14", timeZone: "Europe/Paris" }))
    );

    expect(chart.angles).toBeNull();
    expect(chart.moonSpan).toHaveLength(2);
  });
});

describe("the witch card", () => {
  const birth = birthOf(paris);
  const chart = chartFor(birth);

  it("weighs the elements, the big three twice", () => {
    const balance = elementBalance(chart);
    const total = balance.fire + balance.earth + balance.air + balance.water;

    // Sun, Moon and Rising at 2, Mercury to Saturn at 1.
    expect(total).toBe(11);
  });

  it("picks a craft from the strongest element", () => {
    expect([
      "Candle Witch",
      "Green Witch",
      "Storm Witch",
      "Sea Witch",
    ]).toContain(craftOf(chart).name);
  });

  it("knows the weekday's planet and the birth moon", () => {
    // 14 July 1990 was a Saturday.
    expect(planetaryDayOf(birth)?.planet).toBe("Saturn");
    expect(birthMoonOf(birth)).toBeTruthy();
  });
});

describe("houseOf", () => {
  it("counts whole signs from the rising sign", () => {
    expect(houseOf(5, 10)).toBe(1);
    expect(houseOf(35, 10)).toBe(2);
    expect(houseOf(340, 10)).toBe(12);
  });
});

describe("places", () => {
  it("has a real time zone for every place, and finds them by name", () => {
    for (const place of PLACES) {
      expect(isTimeZone(place.timeZone), place.name).toBe(true);
    }

    expect(findPlace("  paris, france ")?.timeZone).toBe("Europe/Paris");
  });
});

describe("loadState", () => {
  it("falls back to an empty book for a damaged value", () => {
    window.localStorage.setItem(STORAGE_KEY, '{"tab":"nowhere","profile":4}');

    expect(loadState()).toEqual({
      profile: EMPTY_PROFILE,
      southern: false,
      tab: "profile",
    });
    window.localStorage.removeItem(STORAGE_KEY);
  });
});
