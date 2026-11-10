import { shift } from "./dates";
import type { Occasion, Words } from "./festivals";

/**
 * A festival's days as an event for the visitor's own calendar: once, all
 * day, from its first day to its last, never repeating (a lunar festival
 * moves from year to year). On an iPhone the event opens straight in
 * Calendar, on Android in Google Calendar, which can't read an .ics file,
 * and elsewhere it downloads as one.
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
  uid: `${festival.id}-${start}@minigames.irmahs.dev`,
});

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
    "PRODID:-//Irma HS//Mini Games Festival Calendar//EN",
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

/** Adds the event to this device's calendar, the way that suits it. */
export const addToCalendar = (event: CalendarEvent) => {
  const way = addWayFor(navigator.userAgent, navigator.maxTouchPoints);

  if (way === "android") {
    window.open(googleCalendarUrl(event), "_blank", "noopener");

    return;
  }

  const ics = icsOf(event, new Date());

  if (way === "ios") {
    // Safari on iOS opens an .ics it is sent to in Calendar, ready to add.
    window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

    return;
  }

  const link = document.createElement("a");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));

  link.href = url;
  link.download = `${event.uid.split("@")[0]}.ics`;
  link.click();
  // Not at once: the download has to start first.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
