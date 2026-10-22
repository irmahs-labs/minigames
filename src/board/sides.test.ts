import { describe, expect, it } from "vitest";

import {
  marginOf,
  sideLeftOf,
  sideSpotAt,
  sidesFit,
  sidesHeight,
  startingSideSpots,
} from "./sides";

// A 1920px page: the column is 1124 wide from 398 to 1522, so each margin
// runs 382px, 16 to 382 on the left and 1538 to 1904 on the right.
const WIDE = 1920;

describe("the margins", () => {
  it("lie either side of the hub's column", () => {
    expect(marginOf("left", WIDE)).toEqual({ end: 382, start: 16 });
    expect(marginOf("right", WIDE)).toEqual({ end: 1904, start: 1538 });
  });

  it("hold notes only on a wide enough page", () => {
    expect(sidesFit(WIDE)).toBe(true);
    expect(sidesFit(1600)).toBe(true);
    expect(sidesFit(1440)).toBe(false);
    expect(sidesFit(390)).toBe(false);
  });
});

describe("startingSideSpots", () => {
  it("hangs notes against the column, left then right, then down", () => {
    // One column a side at 1920 or less: 366px margins hold one note.
    expect(startingSideSpots([140, 140], WIDE).map((spot) => spot.y)).toEqual([
      0, 0,
    ]);

    const spots = startingSideSpots([140, 140, 140], 1600);

    expect(spots.map((spot) => spot.side)).toEqual(["left", "right", "left"]);
    expect(spots.map((spot) => spot.y)).toEqual([0, 0, 158]);
    // Against the column: the left margin's inner edge, the right's start.
    expect(sideLeftOf(spots[0] ?? { x: 0, y: 0, z: 0 }, 1600)).toBe(
      marginOf("left", 1600).end - 190
    );
    expect(sideLeftOf(spots[1] ?? { x: 0, y: 0, z: 0 }, 1600)).toBe(
      marginOf("right", 1600).start
    );
  });

  it("uses a second column in each margin when there is room", () => {
    // 2200px: each margin runs 506px, room for two notes side by side.
    const spots = startingSideSpots([140, 140, 140, 140], 2200);
    const lefts = spots.map((spot) => Math.round(sideLeftOf(spot, 2200)));

    expect(spots.map((spot) => spot.y)).toEqual([0, 0, 0, 0]);
    expect(lefts).toEqual([332, 1678, 124, 1886]);
  });
});

describe("sideSpotAt", () => {
  it("drops a note in the nearer margin, never over the column", () => {
    expect(sideSpotAt({ left: 700, top: 50 }, WIDE, 500, 3)).toEqual({
      side: "left",
      x: 1,
      y: 50,
      z: 3,
    });
    expect(sideSpotAt({ left: 1300, top: 50 }, WIDE, 500, 3)).toMatchObject({
      side: "right",
      x: 0,
    });
  });

  it("keeps a note on the page", () => {
    expect(sideSpotAt({ left: 5000, top: -20 }, WIDE, 500, 1)).toEqual({
      side: "right",
      x: 1,
      y: 0,
      z: 1,
    });
    expect(sideSpotAt({ left: 0, top: 9000 }, WIDE, 500, 1)).toMatchObject({
      side: "left",
      x: 0,
      y: 500,
    });
  });

  it("puts a note back where it was dropped", () => {
    const spot = sideSpotAt({ left: 100, top: 10 }, WIDE, 500, 1);

    expect(sideLeftOf(spot, WIDE)).toBeCloseTo(100);
  });
});

describe("sidesHeight", () => {
  it("reaches below the lowest note", () => {
    expect(sidesHeight([])).toBe(140);
    expect(sidesHeight([300, 800])).toBe(940);
  });
});
