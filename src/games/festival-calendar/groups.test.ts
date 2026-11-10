import { beforeEach, describe, expect, it } from "vitest";

import { FESTIVALS } from "./festivals";
import {
  CALENDARS,
  DEFAULT_CALENDARS,
  flagOf,
  loadCalendars,
  saveCalendars,
  toggleCalendar,
} from "./groups";

describe("the calendars", () => {
  beforeEach(() => window.localStorage.clear());

  it("offers every festival group, and the Moon", () => {
    const ids = new Set(CALENDARS.map((calendar) => calendar.id));

    expect(ids.has("moon")).toBe(true);

    for (const festival of FESTIVALS) {
      expect(ids.has(festival.group)).toBe(true);
    }
  });

  it("starts with the Moon, and remembers what was added", () => {
    expect(loadCalendars()).toEqual(DEFAULT_CALENDARS);

    saveCalendars(["moon", "islamic"]);

    expect(loadCalendars()).toEqual(["moon", "islamic"]);
  });

  it("drops what it doesn't know, and falls back on anything unreadable", () => {
    window.localStorage.setItem(
      "minigames:festival-calendar:v1",
      JSON.stringify({ calendars: ["jewish", "atlantis"] })
    );

    expect(loadCalendars()).toEqual(["jewish"]);

    window.localStorage.setItem("minigames:festival-calendar:v1", "{not json");

    expect(loadCalendars()).toEqual(DEFAULT_CALENDARS);
  });

  it("adds and removes, keeping the offered order", () => {
    expect(toggleCalendar(["moon"], "africa")).toEqual(["moon", "africa"]);
    expect(toggleCalendar(["africa"], "moon")).toEqual(["moon", "africa"]);
    expect(toggleCalendar(["moon", "africa"], "moon")).toEqual(["africa"]);
  });

  it("draws a flag from a country code", () => {
    expect(flagOf("KH")).toBe("🇰🇭");
    expect(flagOf("MX")).toBe("🇲🇽");
  });
});
