import { describe, expect, it } from "vitest";

import {
  dayKey,
  daysBetween,
  isTimeZone,
  parseClock,
  parseDay,
  weekdayOf,
  zonedToUtc,
} from "./time";

const at = (day: string, hour: number, minute: number, timeZone: string) => {
  const parsed = parseDay(day);

  if (!parsed) {
    throw new Error(`Not a day: ${day}`);
  }

  return zonedToUtc({ ...parsed, hour, minute }, timeZone).toISOString();
};

describe("zonedToUtc", () => {
  it("reads the clocks as they were, summer time and all", () => {
    expect(at("1990-07-14", 12, 0, "Europe/Paris")).toBe(
      "1990-07-14T10:00:00.000Z"
    );
    expect(at("1990-01-14", 12, 0, "Europe/Paris")).toBe(
      "1990-01-14T11:00:00.000Z"
    );
    expect(at("2026-10-26", 8, 30, "America/New_York")).toBe(
      "2026-10-26T12:30:00.000Z"
    );
    expect(at("2026-01-05", 23, 15, "Asia/Kolkata")).toBe(
      "2026-01-05T17:45:00.000Z"
    );
  });

  it("moves a time skipped by the clocks going forward an hour on", () => {
    // Paris skipped from 02:00 to 03:00 on 29 March 2026.
    expect(at("2026-03-29", 2, 30, "Europe/Paris")).toBe(
      "2026-03-29T01:30:00.000Z"
    );
  });

  it("takes the first of a time the clocks go back over", () => {
    // Paris read 02:30 twice on 25 October 2026, in summer time first.
    expect(at("2026-10-25", 2, 30, "Europe/Paris")).toBe(
      "2026-10-25T00:30:00.000Z"
    );
  });
});

describe("days", () => {
  it("dates a moment by the calendar of a time zone", () => {
    const moment = new Date("2026-10-26T04:12:00Z");

    expect(dayKey(moment, "UTC")).toBe("2026-10-26");
    expect(dayKey(moment, "America/Los_Angeles")).toBe("2026-10-25");
  });

  it("parses only real days and clock times", () => {
    expect(parseDay("2026-10-31")).toEqual({ day: 31, month: 10, year: 2026 });
    expect(parseDay("2026-02-30")).toBeNull();
    expect(parseDay("31/10/2026")).toBeNull();
    expect(parseClock("23:59")).toEqual({ hour: 23, minute: 59 });
    expect(parseClock("24:00")).toBeNull();
    expect(parseClock("")).toBeNull();
  });

  it("counts days and weekdays", () => {
    expect(daysBetween("2026-10-26", "2026-10-31")).toBe(5);
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    // 31 October 2026 is a Saturday.
    expect(weekdayOf("2026-10-31")).toBe(6);
  });

  it("knows a time zone from a typo", () => {
    expect(isTimeZone("Europe/Brussels")).toBe(true);
    expect(isTimeZone("Europe/Atlantis")).toBe(false);
    expect(isTimeZone("")).toBe(false);
  });
});
