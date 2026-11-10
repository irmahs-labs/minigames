import * as z from "zod/mini";

import { readStored, writeStored } from "../../lib/storage";
import type { GroupId, Words } from "./festivals";

/** A calendar a visitor can add: the Moon's phases, or a group of festivals. */
export type CalendarId = "moon" | GroupId;

export interface CalendarKind {
  id: CalendarId;
  emoji: string;
  name: Words;
}

/** Every calendar, in the order they are offered. */
export const CALENDARS: readonly CalendarKind[] = [
  {
    emoji: "🌕",
    id: "moon",
    name: { en: "Moon phases", fr: "Phases de la lune" },
  },
  {
    emoji: "🧧",
    id: "east-asia",
    name: { en: "East Asian", fr: "Asie de l’Est" },
  },
  {
    emoji: "🛶",
    id: "southeast-asia",
    name: {
      en: "Southeast Asian & Buddhist",
      fr: "Asie du Sud-Est et bouddhisme",
    },
  },
  {
    emoji: "🪔",
    id: "south-asia",
    name: { en: "South Asian & Hindu", fr: "Asie du Sud et hindouisme" },
  },
  { emoji: "☪️", id: "islamic", name: { en: "Islamic", fr: "Islam" } },
  { emoji: "🕎", id: "jewish", name: { en: "Jewish", fr: "Judaïsme" } },
  {
    emoji: "✝️",
    id: "christian",
    name: { en: "Christian", fr: "Christianisme" },
  },
  {
    emoji: "💀",
    id: "latin-america",
    name: { en: "Latin American", fr: "Amérique latine" },
  },
  {
    emoji: "🌱",
    id: "nowruz",
    name: { en: "Persian & Nowruz", fr: "Perse et Norouz" },
  },
  { emoji: "🌍", id: "africa", name: { en: "African", fr: "Afrique" } },
  {
    emoji: "🌾",
    id: "wheel",
    name: { en: "Wheel of the Year", fr: "Roue de l’année" },
  },
];

const IDS = CALENDARS.map((calendar) => calendar.id);

const isCalendarId = (id: string): id is CalendarId =>
  IDS.some((known) => known === id);

/** What a new visitor starts with: just the Moon, and the rest to add. */
export const DEFAULT_CALENDARS: readonly CalendarId[] = ["moon"];

const KEY = "minigames:calendar:v1";

/** The calendars a visitor added, as saved: unknown ids from an older version are dropped. */
const savedSchema = z.object({ calendars: z.array(z.string()) });

export const loadCalendars = (): CalendarId[] =>
  readStored(KEY, savedSchema, () => ({
    calendars: [...DEFAULT_CALENDARS],
  })).calendars.filter(isCalendarId);

export const saveCalendars = (calendars: readonly CalendarId[]) =>
  writeStored(KEY, { calendars });

/** Adds a calendar, or takes it off; the order stays the offered one. */
export const toggleCalendar = (
  chosen: readonly CalendarId[],
  id: CalendarId
): CalendarId[] =>
  IDS.filter((known) =>
    known === id ? !chosen.includes(id) : chosen.includes(known)
  );

/** A country's flag, from its ISO code: "KH" → 🇰🇭. */
export const flagOf = (country: string) =>
  String.fromCodePoint(
    ...[...country].map(
      (letter) => 0x1_f1_e6 + (letter.codePointAt(0) ?? 65) - 65
    )
  );
