import * as z from "zod/mini";

import { MAX_INGREDIENTS, MIN_INGREDIENTS } from "./rules";

/**
 * What the page and the server say to each other about the shared recipe
 * book. The server brews, so the page only ever learns a potion's recipe
 * once someone has found it.
 */
const form = z.enum(["fresh", "dried", "powder"]);

/** POST /api/potions/brew: what went in the cauldron. */
export const brewRequest = z.object({
  ingredients: z
    .array(z.object({ form: z.optional(form), name: z.string() }))
    .check(z.minLength(MIN_INGREDIENTS), z.maxLength(MAX_INGREDIENTS)),
});

/** A page someone has found: the whole recipe, and who brewed it first. */
/** A brew someone made: who, and when, as an ISO date. */
const brewOf = z.object({ at: z.string(), name: z.string() });

const foundPage = z.object({
  /** When it was first brewed, as an ISO date. */
  at: z.string(),
  /** The first to brew it, as everyone sees them: "Irma H.". */
  by: z.string(),
  /** "Lemon", "Fresh ginger", "Honey". */
  ingredients: z.array(z.string()),
  /** The latest brew after the first, by anyone; null while there is none. */
  last: z.nullable(brewOf),
  name: z.string(),
  note: z.string(),
  /** How many others have brewed it since. */
  others: z.int(),
  source: z.string(),
  state: z.literal("found"),
  /** The player asking has brewed it too. */
  yours: z.boolean(),
});

/** A page nobody has found: only the kinds it takes, "fruit + dried spice". */
const lockedPage = z.object({
  clue: z.string(),
  state: z.literal("locked"),
});

export const page = z.discriminatedUnion("state", [foundPage, lockedPage]);

/** The most recent brew by anyone, shown in the book's corner. */
const latestBrew = z.object({
  /** When, as an ISO date. */
  at: z.string(),
  name: z.string(),
  potion: z.string(),
});

/** GET /api/potions: every page of the book, in order, and the last brew. */
export const book = z.object({
  latest: z.nullable(latestBrew),
  pages: z.array(page),
});

const brewer = z.object({
  /** When they first brewed it, as an ISO date. */
  at: z.string(),
  name: z.string(),
});

/** GET /api/potions/brewers?potion=…: everyone who brewed it, first first. */
export const brewers = z.object({ brewers: z.array(brewer) });

/** A brew that made no potion: a hint at the one it nearly was. */
const mystery = z.object({
  /** The potion still to find that shares the most of these ingredients. */
  closest: z.nullable(
    z.object({ name: z.string(), needs: z.int(), shared: z.int() })
  ),
  /** How many ingredients went in. */
  size: z.int(),
  type: z.literal("mystery"),
  /** A potion with exactly these ingredients, wanting some in another form. */
  wrongForm: z.nullable(
    z.object({ name: z.string(), wanted: z.array(z.string()) })
  ),
});

/** The answer to a brew for the shared book. */
export const brewAnswer = z.discriminatedUnion("type", [
  z.object({
    /** Nobody had brewed it before: this player's name is on it now. */
    first: z.boolean(),
    /** This player had not brewed it before. */
    isNew: z.boolean(),
    page: foundPage,
    type: z.literal("potion"),
  }),
  mystery,
]);

/** A page of a player's own book that they have found, and when. */
const soloFoundPage = z.object({
  /** When they first brewed it, as an ISO date. */
  foundAt: z.string(),
  ingredients: z.array(z.string()),
  name: z.string(),
  note: z.string(),
  source: z.string(),
  state: z.literal("found"),
});

export const soloPage = z.discriminatedUnion("state", [
  soloFoundPage,
  lockedPage,
]);

/** GET /api/potions/solo: the player's own book, every page in order. */
export const soloBook = z.object({ pages: z.array(soloPage) });

/** The answer to a brew for the player's own book. */
export const soloBrewAnswer = z.discriminatedUnion("type", [
  z.object({
    /** It was not in their book before. */
    isNew: z.boolean(),
    page: soloFoundPage,
    type: z.literal("potion"),
  }),
  mystery,
]);

export type FoundPage = z.infer<typeof foundPage>;

export type Page = z.infer<typeof page>;

export type Book = z.infer<typeof book>;

export type LatestBrew = z.infer<typeof latestBrew>;

export type Brewer = z.infer<typeof brewer>;

export type BrewAnswer = z.infer<typeof brewAnswer>;

export type Mystery = z.infer<typeof mystery>;

export type SoloFoundPage = z.infer<typeof soloFoundPage>;

export type SoloPage = z.infer<typeof soloPage>;

export type SoloBook = z.infer<typeof soloBook>;

export type SoloBrewAnswer = z.infer<typeof soloBrewAnswer>;
