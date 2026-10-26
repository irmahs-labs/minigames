import { describe, expect, it } from "vitest";

import { nextSabbat, sabbatsIn, seasonOf } from "./sabbats";

const dates = (southern: boolean) =>
  sabbatsIn(2026, southern, "UTC").map((date) => [
    date.sabbat.id,
    date.key,
    date.astronomical,
  ]);

describe("sabbatsIn", () => {
  it("keeps the fire festivals' days and finds the solstices and equinoxes", () => {
    expect(dates(false)).toEqual([
      ["imbolc", "2026-02-01", "2026-02-03"],
      ["ostara", "2026-03-20", null],
      ["beltane", "2026-05-01", "2026-05-05"],
      ["litha", "2026-06-21", null],
      ["lughnasadh", "2026-08-01", "2026-08-07"],
      ["mabon", "2026-09-23", null],
      ["samhain", "2026-10-31", "2026-11-07"],
      ["yule", "2026-12-21", null],
    ]);
  });

  it("turns the wheel the other way in the south", () => {
    expect(dates(true)).toEqual([
      ["lughnasadh", "2026-02-01", "2026-02-03"],
      ["mabon", "2026-03-20", null],
      ["samhain", "2026-05-01", "2026-05-05"],
      ["yule", "2026-06-21", null],
      ["imbolc", "2026-08-01", "2026-08-07"],
      ["ostara", "2026-09-23", null],
      ["beltane", "2026-10-31", "2026-11-07"],
      ["litha", "2026-12-21", null],
    ]);
  });

  it("dates a solstice by the calendar where you are", () => {
    // The December solstice is at 20:50 UTC on the 21st: the 22nd in Sydney.
    const yule = sabbatsIn(2026, false, "Australia/Sydney").find(
      (date) => date.sabbat.id === "yule"
    );

    expect(yule?.key).toBe("2026-12-22");
  });
});

describe("nextSabbat", () => {
  it("finds the next one, today's included", () => {
    expect(nextSabbat("2026-10-26", false, "UTC")?.key).toBe("2026-10-31");
    expect(nextSabbat("2026-10-31", false, "UTC")?.sabbat.id).toBe("samhain");
    expect(nextSabbat("2026-12-25", false, "UTC")?.key).toBe("2027-02-01");
  });
});

describe("seasonOf", () => {
  it("finds the sabbat a day falls after", () => {
    expect(seasonOf("1990-07-14", false, "UTC")?.sabbat.id).toBe("litha");
    expect(seasonOf("1990-01-14", false, "UTC")?.sabbat.id).toBe("yule");
    expect(seasonOf("1990-07-14", true, "UTC")?.sabbat.id).toBe("yule");
  });
});
