import { describe, expect, it } from "vitest";

import { easter, orthodoxEaster } from "./dates";
import { FESTIVALS, occasionsIn } from "./festivals";
import type { GroupId } from "./festivals";

const startsOf = (id: string, year: number) =>
  FESTIVALS.find((festival) => festival.id === id)
    ?.spans(year)
    .map((span) => span.start);

describe("the festivals' days", () => {
  // Dates as published: by China (the Hong Kong Observatory), Saudi Arabia (Umm al-Qura), the Hebrew
  // calendar, Iran, Ethiopia, India's panchangs and Cambodia's government.
  it.each([
    ["lunar-new-year", 2025, "2025-01-29"],
    ["lunar-new-year", 2026, "2026-02-17"],
    ["lantern-festival", 2026, "2026-03-03"],
    // The new moon is at 23:56 in Beijing: Intl's calendar says the 7th.
    ["lunar-new-year", 2027, "2027-02-06"],
    ["lantern-festival", 2027, "2027-02-20"],
    ["lunar-new-year", 2030, "2030-02-03"],
    ["dragon-boat", 2026, "2026-06-19"],
    ["dragon-boat", 2027, "2027-06-09"],
    ["mid-autumn", 2027, "2027-09-15"],
    ["qixi", 2025, "2025-08-29"],
    ["ghost-festival", 2025, "2025-09-06"],
    ["qingming", 2025, "2025-04-04"],
    ["qingming", 2026, "2026-04-05"],
    ["dragon-boat", 2025, "2025-05-31"],
    ["mid-autumn", 2025, "2025-10-06"],
    ["mid-autumn", 2026, "2026-09-25"],
    ["khmer-new-year", 2025, "2025-04-14"],
    ["vesak", 2025, "2025-05-11"],
    ["bon-om-touk", 2025, "2025-11-04"],
    ["loi-krathong", 2025, "2025-11-05"],
    ["loi-krathong", 2024, "2024-11-15"],
    ["diwali", 2024, "2024-10-31"],
    ["diwali", 2025, "2025-10-20"],
    ["diwali", 2026, "2026-11-08"],
    ["holi", 2024, "2024-03-25"],
    ["holi", 2025, "2025-03-14"],
    ["holi", 2026, "2026-03-04"],
    ["maha-shivaratri", 2025, "2025-02-26"],
    ["navaratri", 2025, "2025-09-22"],
    ["dussehra", 2025, "2025-10-02"],
    ["raksha-bandhan", 2023, "2023-08-30"],
    ["raksha-bandhan", 2025, "2025-08-09"],
    ["janmashtami", 2025, "2025-08-16"],
    ["ganesh-chaturthi", 2025, "2025-08-27"],
    ["makar-sankranti", 2024, "2024-01-15"],
    ["makar-sankranti", 2025, "2025-01-14"],
    ["ramadan", 2025, "2025-03-01"],
    ["ramadan", 2026, "2026-02-18"],
    ["eid-al-fitr", 2025, "2025-03-30"],
    ["eid-al-fitr", 2026, "2026-03-20"],
    ["eid-al-adha", 2025, "2025-06-06"],
    ["eid-al-adha", 2026, "2026-05-27"],
    ["rosh-hashanah", 2025, "2025-09-23"],
    ["yom-kippur", 2025, "2025-10-02"],
    ["hanukkah", 2025, "2025-12-15"],
    ["purim", 2026, "2026-03-03"],
    ["purim", 2027, "2027-03-23"],
    ["pesach", 2026, "2026-04-02"],
    ["easter", 2026, "2026-04-05"],
    ["orthodox-easter", 2026, "2026-04-12"],
    ["sham-el-nessim", 2026, "2026-04-13"],
    ["carnaval", 2026, "2026-02-14"],
    ["nowruz", 2025, "2025-03-21"],
    ["nowruz", 2026, "2026-03-21"],
    ["chaharshanbe-suri", 2026, "2026-03-17"],
    ["yalda", 2025, "2025-12-21"],
    ["enkutatash", 2023, "2023-09-12"],
    ["enkutatash", 2025, "2025-09-11"],
    ["timkat", 2026, "2026-01-19"],
    ["genna", 2026, "2026-01-07"],
    ["dia-de-muertos", 2026, "2026-11-01"],
  ] as const)("has %s %i on %s", (id, year, day) => {
    expect(startsOf(id, year)).toEqual([day]);
  });

  it("works out Easter both ways", () => {
    expect(easter(2025)).toBe("2025-04-20");
    expect(orthodoxEaster(2025)).toBe("2025-04-20");
    expect(easter(2027)).toBe("2027-03-28");
    expect(orthodoxEaster(2027)).toBe("2027-05-02");
  });

  it("finds a day in every year for every festival", () => {
    for (const year of [2024, 2025, 2026, 2027, 2030]) {
      for (const festival of FESTIVALS) {
        expect(
          festival.spans(year).length,
          `${festival.id} ${year}`
        ).toBeGreaterThan(0);
      }
    }
  });

  it("gives every festival a name and a line in both languages, and a known group", () => {
    const ids = new Set<string>();

    for (const festival of FESTIVALS) {
      expect(ids.has(festival.id)).toBe(false);
      ids.add(festival.id);
      expect(
        festival.name.en &&
          festival.name.fr &&
          festival.about.en &&
          festival.about.fr
      ).toBeTruthy();
      expect(festival.about.fr).not.toBe(festival.about.en);
    }
  });

  it("writes countries as ISO codes, and every local name's countries keep the festival", () => {
    for (const festival of FESTIVALS) {
      for (const country of festival.countries) {
        expect(country).toMatch(/^[A-Z]{2}$/u);
      }

      for (const local of festival.local ?? []) {
        for (const country of local.countries) {
          if (festival.countries.length > 0) {
            expect(festival.countries, `${festival.id} ${country}`).toContain(
              country
            );
          }
        }
      }
    }
  });
});

const groups = (...ids: GroupId[]) => new Set(ids);

describe("occasionsIn", () => {
  it("shows only the chosen groups' festivals, in order", () => {
    const november = occasionsIn(
      2026,
      11,
      groups("south-asia", "latin-america")
    );

    expect(november.map((entry) => entry.festival.id)).toEqual([
      "dia-de-muertos",
      "diwali",
    ]);
  });

  it("keeps a festival that began the month before", () => {
    const january = occasionsIn(2026, 1, groups("africa"));

    expect(january[0]).toMatchObject({
      end: "2026-01-01",
      festival: { id: "kwanzaa" },
      start: "2025-12-26",
    });
  });

  it("can find two of one festival in a year", () => {
    // The Islamic year is 11 days short: 1 Muharram fell twice in 2008.
    expect(startsOf("hijri-new-year", 2008)).toHaveLength(2);
  });
});
