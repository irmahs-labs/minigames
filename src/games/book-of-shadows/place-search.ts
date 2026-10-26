import * as z from "zod/mini";

import type { Place } from "./places";
import { isTimeZone } from "./time";

/**
 * Any town on the Earth, from Open-Meteo's free geocoding (GeoNames' data,
 * no key, open to any site): its coordinates and its time zone, so nobody
 * has to type them in. Only what is typed in the birthplace field is sent,
 * never the birth date.
 */
const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

export const answerSchema = z.object({
  results: z.optional(
    z.array(
      z.object({
        admin1: z.optional(z.string()),
        country: z.optional(z.string()),
        latitude: z.number(),
        longitude: z.number(),
        name: z.string(),
        timezone: z.optional(z.string()),
      })
    )
  ),
});

export type GeocodingAnswer = z.infer<typeof answerSchema>;

/**
 * The places in an answer, named "Kampot, Kampot, Cambodia" → "Kampot,
 * Cambodia": the region only where it adds something. Any without a time
 * zone the browser knows are left out.
 */
export const placesIn = (answer: GeocodingAnswer): Place[] =>
  (answer.results ?? []).flatMap((result) => {
    const timeZone = result.timezone ?? "";

    if (!isTimeZone(timeZone)) {
      return [];
    }

    const parts = [
      result.name,
      result.admin1 === result.name ? undefined : result.admin1,
      result.country,
    ].filter((part) => part !== undefined && part !== "");

    return [
      {
        lat: Math.round(result.latitude * 100) / 100,
        lon: Math.round(result.longitude * 100) / 100,
        name: parts.join(", "),
        timeZone,
      },
    ];
  });

/** Towns matching `query`, or null when the search cannot be had. */
export const searchPlaces = async (
  query: string,
  signal: AbortSignal
): Promise<Place[] | null> => {
  const url = `${ENDPOINT}?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      return null;
    }

    const parsed = answerSchema.safeParse(await response.json());

    return parsed.success ? placesIn(parsed.data) : null;
  } catch {
    return null;
  }
};
