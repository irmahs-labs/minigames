import * as z from "zod/mini";
import { catch as withFallback } from "zod/mini";

import { readStored, writeStored } from "../../lib/storage";
import type { Contestant } from "./simulation";

/**
 * Who goes into the arena: up to 12 districts, each with its contestants,
 * and whether district-mates may win together. Kept in this browser's
 * localStorage, so the cast is there next time; nothing leaves the browser.
 */

export const MAX_DISTRICTS = 12;
export const MAX_PER_DISTRICT = 4;
export const MIN_CONTESTANTS = 2;
export const MAX_NAME = 24;

const STORAGE_KEY = "minigames:the-arena:v1";

const nameSchema = z.pipe(
  z.string(),
  z.transform((name: string) => name.slice(0, MAX_NAME))
);

/** A district: the names in its places, empty for a place not yet filled. */
const districtSchema = z.object({
  names: z
    .array(nameSchema)
    .check(z.minLength(1), z.maxLength(MAX_PER_DISTRICT)),
});

const castSchema = z.object({
  districts: z
    .array(districtSchema)
    .check(z.minLength(1), z.maxLength(MAX_DISTRICTS)),
  together: withFallback(z.boolean(), false),
});

export type Cast = z.infer<typeof castSchema>;

/** A new cast: two districts of two places each, waiting for names. */
export const newCast = (): Cast => ({
  districts: [{ names: ["", ""] }, { names: ["", ""] }],
  together: false,
});

export const loadCast = (): Cast =>
  readStored(STORAGE_KEY, castSchema, newCast);

export const saveCast = (cast: Cast) => writeStored(STORAGE_KEY, cast);

/** The contestants with a name, each with their district (from 1) and a place id. */
export const contestantsOf = (cast: Cast): Contestant[] =>
  cast.districts.flatMap(({ names }, d) =>
    names.flatMap((name, i) =>
      name.trim()
        ? [{ district: d + 1, id: `${d + 1}-${i + 1}`, name: name.trim() }]
        : []
    )
  );

/** Why the games can't start yet, or null when they can. */
export type NotReady = "too-few" | "one-district";

export const notReady = (cast: Cast): NotReady | null => {
  const contestants = contestantsOf(cast);

  if (contestants.length < MIN_CONTESTANTS) {
    return "too-few";
  }

  // District-mates winning together needs more than one district to beat.
  if (
    cast.together &&
    new Set(contestants.map((one) => one.district)).size < 2
  ) {
    return "one-district";
  }

  return null;
};

export type CastAction =
  | { type: "rename"; district: number; place: number; name: string }
  | { type: "addPlace"; district: number }
  | { type: "removePlace"; district: number; place: number }
  | { type: "addDistrict" }
  | { type: "removeDistrict"; district: number }
  | { type: "together"; together: boolean }
  | { type: "fill"; names: readonly string[] }
  | { type: "clear" };

const withDistrict = (
  cast: Cast,
  index: number,
  change: (names: string[]) => string[]
): Cast => ({
  ...cast,
  districts: cast.districts.map((district, i) =>
    i === index ? { names: change([...district.names]) } : district
  ),
});

/** The cast after a change on the setup screen. */
export const castReducer = (cast: Cast, action: CastAction): Cast => {
  switch (action.type) {
    case "rename": {
      return withDistrict(cast, action.district, (names) =>
        names.map((name, i) =>
          i === action.place ? action.name.slice(0, MAX_NAME) : name
        )
      );
    }

    case "addPlace": {
      return withDistrict(cast, action.district, (names) =>
        names.length < MAX_PER_DISTRICT ? [...names, ""] : names
      );
    }

    case "removePlace": {
      return withDistrict(cast, action.district, (names) =>
        names.length > 1 ? names.filter((_, i) => i !== action.place) : names
      );
    }

    case "addDistrict": {
      return cast.districts.length < MAX_DISTRICTS
        ? { ...cast, districts: [...cast.districts, { names: ["", ""] }] }
        : cast;
    }

    case "removeDistrict": {
      return cast.districts.length > 1
        ? {
            ...cast,
            districts: cast.districts.filter((_, i) => i !== action.district),
          }
        : cast;
    }

    case "together": {
      return { ...cast, together: action.together };
    }

    case "fill": {
      // Each empty place takes the next name not already in the cast.
      const taken = new Set(contestantsOf(cast).map((one) => one.name));
      const free = action.names.filter((name) => !taken.has(name));
      let next = 0;

      return {
        ...cast,
        districts: cast.districts.map(({ names }) => ({
          names: names.map((name) => {
            if (name.trim()) {
              return name;
            }

            const filled = free[next] ?? name;

            next += 1;

            return filled;
          }),
        })),
      };
    }

    case "clear": {
      return newCast();
    }

    default: {
      return cast;
    }
  }
};

/** Names for filling empty places, from many places and languages. */
export const SAMPLE_NAMES: readonly string[] = [
  "Amara",
  "Bao",
  "Camille",
  "Dario",
  "Elif",
  "Farah",
  "Gabriel",
  "Hana",
  "Ines",
  "Jonah",
  "Kenji",
  "Leila",
  "Mateo",
  "Nia",
  "Oskar",
  "Priya",
  "Quinn",
  "Rosa",
  "Sami",
  "Tala",
  "Uma",
  "Vikram",
  "Wren",
  "Ximena",
  "Yusuf",
  "Zoé",
  "Anouk",
  "Bilal",
  "Chloé",
  "Dmitri",
  "Esme",
  "Femi",
  "Greta",
  "Haruto",
  "Ivy",
  "Jasper",
  "Kalani",
  "Lucas",
  "Mei",
  "Noor",
  "Olu",
  "Paz",
  "Rafael",
  "Sora",
];
