import { daysBetween, parseDay } from "../book-of-shadows/time";
import { shift } from "./dates";
import { FESTIVALS } from "./festivals";
import type { Occasion, Words } from "./festivals";

/**
 * A festival's days as an event for the visitor's own calendar: once, all
 * day, from its first day to its last, never repeating (a lunar festival
 * moves from year to year). On an iPhone the server sends it as an .ics,
 * which Safari opens in Calendar (it ignores an .ics made in the page), on
 * Android Google Calendar takes it from a link (its app can't read an .ics),
 * and elsewhere it downloads as an .ics made in the page.
 */

export interface CalendarEvent {
  /** The same each time it is added, so a calendar can tell it already has it. */
  uid: string;
  title: string;
  details: string;
  /** Its first day, "2026-11-08". */
  start: string;
  /** Its last day, included. */
  end: string;
}

/** The event for a festival on its days, in the page's language. */
export const eventOf = (
  { festival, start, end }: Occasion,
  language: keyof Words
): CalendarEvent => ({
  details: festival.about[language],
  end,
  start,
  title: festival.script
    ? `${festival.emoji} ${festival.name[language]} ${festival.script}`
    : `${festival.emoji} ${festival.name[language]}`,
  // Its old address on purpose: the id is in people's calendars already, and
  // a new one would add the festival twice.
  uid: `${festival.id}-${start}@minigames.irmahs.dev`,
});

/** The years a festival can be asked for, so a request can't make the server work out any year at all. */
const FIRST_YEAR = 2000;
const LAST_YEAR = 2100;

/** How far a device's date for a festival may be from the server's, in days. */
const LEEWAY = 2;

/**
 * A festival on the days that start on `start`, or null when it has none
 * then: for the server, which takes only these two and checks them against
 * the days it works out itself, so nobody can have it send a calendar event
 * of their own making. A start a day or two from the server's is still
 * taken, as the visitor saw it, with the festival's own length: a device
 * whose calendars differ by a day still adds what it showed.
 */
export const occasionOf = (id: string, start: string): Occasion | null => {
  const festival = FESTIVALS.find((entry) => entry.id === id);
  const day = parseDay(start);

  if (!festival || !day || day.year < FIRST_YEAR || day.year > LAST_YEAR) {
    return null;
  }

  const span = [day.year - 1, day.year, day.year + 1]
    .flatMap((year) => festival.spans(year))
    .find((entry) => Math.abs(daysBetween(entry.start, start)) <= LEEWAY);

  return span
    ? {
        end: shift(start, daysBetween(span.start, span.end)),
        festival,
        start,
      }
    : null;
};

/** Where the server sends a festival's .ics: "/api/festival-calendar/diwali/2026-11-08.ics?lang=en". */
export const icsPathOf = (
  { festival, start }: Occasion,
  language: keyof Words
) => `/api/festival-calendar/${festival.id}/${start}.ics?lang=${language}`;

/** The .ics file's name: "diwali-2026-11-08.ics". */
export const fileNameOf = ({ festival, start }: Occasion) =>
  `${festival.id}-${start}.ics`;

/** "2026-11-08" → "20261108", as calendars write an all-day date. */
const compact = (key: string) => key.replaceAll("-", "");

/** Escapes text for an .ics value: backslashes, commas, semicolons and new lines. */
const escaped = (text: string) =>
  text
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll(/\r?\n/gu, "\\n");

/** The longest an .ics line may be, in bytes; longer ones go on over a space. */
const LINE_BYTES = 75;

const encoder = new TextEncoder();

/** Folds an .ics line to 75 bytes, never inside a character (an emoji, a Khmer letter). */
export const folded = (line: string): string => {
  const lines: string[] = [];
  let current = "";
  let bytes = 0;

  for (const character of line) {
    const size = encoder.encode(character).length;
    // A folded line starts with a space, which counts.
    const room = lines.length === 0 ? LINE_BYTES : LINE_BYTES - 1;

    if (bytes + size > room) {
      lines.push(current);
      current = "";
      bytes = 0;
    }

    current += character;
    bytes += size;
  }

  lines.push(current);

  return lines.join("\r\n ");
};

/** "2026-11-10T09:30:00.000Z" → "20261110T093000Z". */
const stamp = (now: Date) =>
  now.toISOString().replaceAll(/[-:]/gu, "").replace(/\.\d+/u, "");

/** The event as an iCalendar file. An all-day event ends the day after its last. */
export const icsOf = (event: CalendarEvent, now: Date): string =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Irma HS//Irma’s Playground Festival Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART;VALUE=DATE:${compact(event.start)}`,
    `DTEND;VALUE=DATE:${compact(shift(event.end, 1))}`,
    `SUMMARY:${escaped(event.title)}`,
    `DESCRIPTION:${escaped(event.details)}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(folded)
    .join("\r\n")
    .concat("\r\n");

/** The event as a Google Calendar link, already filled in. */
export const googleCalendarUrl = (event: CalendarEvent): string => {
  const url = new URL("https://calendar.google.com/calendar/render");

  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", event.title);
  url.searchParams.set(
    "dates",
    `${compact(event.start)}/${compact(shift(event.end, 1))}`
  );
  url.searchParams.set("details", event.details);

  return url.toString();
};

/** How this device adds an event: straight into Apple's Calendar, Google's, or as a file. */
export type AddWay = "ios" | "android" | "file";

/** Which way suits a browser, from its user agent and touch points. */
export const addWayFor = (userAgent: string, touchPoints: number): AddWay => {
  if (/android/iu.test(userAgent)) {
    return "android";
  }

  // An iPad asks for the desktop site and says it is a Mac, but has a touch screen.
  if (
    /iphone|ipad|ipod/iu.test(userAgent) ||
    (/macintosh/iu.test(userAgent) && touchPoints > 1)
  ) {
    return "ios";
  }

  return "file";
};

/** Adds a festival's days to this device's calendar, the way that suits it. */
export const addToCalendar = (occasion: Occasion, language: keyof Words) => {
  const way = addWayFor(navigator.userAgent, navigator.maxTouchPoints);
  const event = eventOf(occasion, language);

  if (way === "android") {
    window.open(googleCalendarUrl(event), "_blank", "noopener");

    return;
  }

  if (way === "ios") {
    // Safari opens an .ics from a real address in Calendar, ready to add.
    window.location.assign(icsPathOf(occasion, language));

    return;
  }

  const link = document.createElement("a");

  const url = URL.createObjectURL(
    new Blob([icsOf(event, new Date())], { type: "text/calendar" })
  );

  link.href = url;
  link.download = fileNameOf(occasion);
  link.click();
  // Not at once: the download has to start first.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
