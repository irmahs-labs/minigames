import { describe, expect, it } from "vitest";

import {
  addWayFor,
  eventOf,
  folded,
  googleCalendarUrl,
  icsOf,
} from "./add-to-calendar";
import { FESTIVALS } from "./festivals";
import type { Festival } from "./festivals";

const festival = (id: string): Festival => {
  const found = FESTIVALS.find((entry) => entry.id === id);

  if (!found) {
    throw new Error(`No festival ${id}`);
  }

  return found;
};

const diwali = eventOf(
  { end: "2026-11-08", festival: festival("diwali"), start: "2026-11-08" },
  "en"
);

const hanukkah = eventOf(
  { end: "2026-12-12", festival: festival("hanukkah"), start: "2026-12-05" },
  "fr"
);

const NOW = new Date("2026-11-10T09:30:15.123Z");

describe("eventOf", () => {
  it("names the event with its emoji, its name and its own script", () => {
    expect(diwali.title).toBe("🪔 Dīwālī दिवाली");
    expect(hanukkah.title).toBe("🕎 Hanoucca חנוכה");
    expect(hanukkah.details).toContain("bougie");
    expect(diwali.uid).toBe("diwali-2026-11-08@minigames.irmahs.dev");
  });
});

describe("icsOf", () => {
  const ics = icsOf(hanukkah, NOW);
  const lines = ics.split("\r\n");

  it("writes one all-day event, ending the day after its last", () => {
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("DTSTART;VALUE=DATE:20261205");
    expect(lines).toContain("DTEND;VALUE=DATE:20261213");
    expect(lines).toContain("DTSTAMP:20261110T093015Z");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("never repeats", () => {
    expect(ics).not.toContain("RRULE");
  });

  it("escapes commas and semicolons, and folds long lines under 76 bytes", () => {
    const unfolded = ics.replaceAll("\r\n ", "");

    expect(unfolded).toContain(
      "DESCRIPTION:La fête des Lumières : une bougie de plus chaque soir pendant huit soirs\\, et des beignets frits."
    );

    for (const line of lines) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it("folds without cutting a character in two", () => {
    const line = `SUMMARY:${"🪔".repeat(40)}`;

    expect(folded(line).replaceAll("\r\n ", "")).toBe(line);
  });
});

describe("googleCalendarUrl", () => {
  it("fills in the event, its end the day after its last", () => {
    const url = new URL(googleCalendarUrl(hanukkah));

    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("dates")).toBe("20261205/20261213");
    expect(url.searchParams.get("text")).toBe("🕎 Hanoucca חנוכה");
  });
});

describe("addWayFor", () => {
  it.each([
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15",
      5,
      "ios",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
      5,
      "ios",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
      0,
      "file",
    ],
    [
      "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36",
      5,
      "android",
    ],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", 0, "file"],
  ] as const)("sends %s (%i touch points) the %s way", (agent, touch, way) => {
    expect(addWayFor(agent, touch)).toBe(way);
  });
});
