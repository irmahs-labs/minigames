import { afterEach, describe, expect, it, vi } from "vitest";

import { answerSchema, placesIn, searchPlaces } from "./place-search";
import { localMatches, plain } from "./places";

/** Open-Meteo's answer for "Phnom Penh", cut down to what is read. */
const PHNOM_PENH = {
  results: [
    {
      admin1: "Phnom Penh",
      country: "Cambodia",
      latitude: 11.56245,
      longitude: 104.91601,
      name: "Phnom Penh",
      timezone: "Asia/Phnom_Penh",
    },
    {
      admin1: "Phnom Penh",
      country: "Cambodia",
      latitude: 11.58963,
      longitude: 104.8692,
      name: "Phnom Penh Thmei",
      timezone: "Asia/Phnom_Penh",
    },
    { latitude: 0, longitude: 0, name: "Nowhere", timezone: "Mars/Olympus" },
  ],
};

describe("placesIn", () => {
  it("names the place by town, region and country, without saying it twice", () => {
    expect(placesIn(answerSchema.parse(PHNOM_PENH))).toEqual([
      {
        lat: 11.56,
        lon: 104.92,
        name: "Phnom Penh, Cambodia",
        timeZone: "Asia/Phnom_Penh",
      },
      {
        lat: 11.59,
        lon: 104.87,
        name: "Phnom Penh Thmei, Phnom Penh, Cambodia",
        timeZone: "Asia/Phnom_Penh",
      },
    ]);
  });

  it("finds nothing in an answer with no results", () => {
    expect(placesIn(answerSchema.parse({}))).toEqual([]);
  });
});

describe("searchPlaces", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks Open-Meteo for the town, and reads its answer", async () => {
    const fetch = vi.fn((_url: string) =>
      Promise.resolve(Response.json(PHNOM_PENH))
    );

    vi.stubGlobal("fetch", fetch);

    const places = await searchPlaces(
      " Phnom Penh ",
      new AbortController().signal
    );

    expect(places?.[0]?.name).toBe("Phnom Penh, Cambodia");
    expect(String(fetch.mock.calls[0]?.at(0))).toContain("name=Phnom%20Penh&");
  });

  it("gives null when the search cannot be had", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("offline")))
    );

    expect(
      await searchPlaces("Kampot", new AbortController().signal)
    ).toBeNull();

    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({}, { status: 500 })))
    );

    expect(
      await searchPlaces("Kampot", new AbortController().signal)
    ).toBeNull();
  });
});

describe("localMatches", () => {
  it("finds listed places as they are typed, accents or not", () => {
    expect(localMatches("phnom").map((place) => place.name)).toEqual([
      "Phnom Penh, Cambodia",
    ]);
    expect(localMatches("sao p")[0]?.name).toBe("São Paulo, Brazil");
    expect(plain("  Liège ")).toBe("liege");
  });

  it("puts the names that start with it first, and waits for two letters", () => {
    expect(localMatches("par")[0]?.name).toBe("Paris, France");
    expect(localMatches("p")).toEqual([]);
  });
});
