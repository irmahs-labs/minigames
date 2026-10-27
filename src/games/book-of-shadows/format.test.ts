import { describe, expect, it } from "vitest";

import {
  FULL_DAY,
  LONG_DAY,
  formatClock,
  formatDay,
  formatMonth,
} from "./format";

describe("formatDay", () => {
  it("writes dates in English, whatever the browser's language", () => {
    expect(formatDay("2026-12-12")).toBe("12 Dec");
    expect(formatDay("2026-10-31", LONG_DAY)).toBe("31 October 2026");
    expect(formatDay("2026-10-31", FULL_DAY)).toBe("Saturday 31 October");
    expect(formatMonth(2026, 12)).toBe("December 2026");
    expect(formatClock(new Date("2026-10-27T15:04:00Z"), "UTC")).toBe("15:04");
  });
});
