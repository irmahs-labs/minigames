import { describe, expect, it } from "vitest";

import { MAX_LENGTH, goneIn, isValidBody, lengthOf, tidy } from "./rules";

describe("tidy", () => {
  it("trims a note and keeps its lines", () => {
    expect(tidy("  hello\nthere  \n")).toBe("hello\nthere");
  });

  it("keeps at most one blank line in a row", () => {
    expect(tidy("a\r\n\r\n\r\n\r\nb")).toBe("a\n\nb");
  });

  it("drops control characters", () => {
    expect(tidy("bell\u0007 and\u0000 null")).toBe("bell and null");
  });
});

describe("isValidBody", () => {
  it("refuses an empty note", () => {
    expect(isValidBody(tidy("   \n "))).toBe(false);
  });

  it("takes a note up to the longest a note can be", () => {
    expect(isValidBody("a".repeat(MAX_LENGTH))).toBe(true);
    expect(isValidBody("a".repeat(MAX_LENGTH + 1))).toBe(false);
  });

  it("counts an emoji as one character", () => {
    expect(lengthOf("🍵🍵")).toBe(2);
    expect(isValidBody("🍵".repeat(MAX_LENGTH))).toBe(true);
  });
});

const at = (iso: string) => Date.parse(iso);

describe("goneIn", () => {
  const posted = "2026-10-22T12:00:00.000Z";

  it("counts down the day in hours", () => {
    expect(goneIn(posted, at("2026-10-22T12:00:00.000Z"))).toBe("gone in 24h");
    expect(goneIn(posted, at("2026-10-23T06:30:00.000Z"))).toBe("gone in 5h");
  });

  it("counts the last hour in minutes", () => {
    expect(goneIn(posted, at("2026-10-23T11:20:00.000Z"))).toBe(
      "gone in 40 min"
    );
  });

  it("says a note past its day is about to go", () => {
    expect(goneIn(posted, at("2026-10-23T12:00:30.000Z"))).toBe(
      "gone in a moment"
    );
  });
});
