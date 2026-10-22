import { describe, expect, it } from "vitest";

import {
  boardHeight,
  deepestFor,
  heightOf,
  keepUp,
  leftOf,
  spotAt,
  spotsSchema,
  startingSpots,
  topLayer,
} from "./layout";

describe("heightOf", () => {
  it("stands a short note at the smallest height", () => {
    expect(heightOf("hi")).toBe(140);
  });

  it("grows a line at a time, with every line break", () => {
    const tall = heightOf("x".repeat(200));

    expect(tall).toBeGreaterThan(heightOf("x".repeat(100)));
    expect(heightOf("a\nb\nc\nd\ne\nf\ng")).toBeGreaterThan(heightOf("a b c"));
  });

  it("makes room for buttons under it", () => {
    expect(heightOf("hi", 32)).toBe(172);
  });
});

describe("startingSpots", () => {
  it("puts notes side by side, as many as the board holds", () => {
    // 3 notes of 190 with 18 between fit in 620.
    const width = 620;
    const spots = startingSpots([140, 140, 140, 140], width);

    expect(spots.map((spot) => leftOf(spot, width))).toEqual([0, 208, 416, 0]);
    expect(spots[3]).toMatchObject({ y: 140 + 18 });
  });

  it("puts each next note under the shortest column", () => {
    const spots = startingSpots([300, 140, 140], 400);

    // Two columns: the third goes under the short second one.
    expect(leftOf(spots[2] ?? { x: 0, y: 0, z: 0 }, 400)).toBe(208);
    expect(spots[2]).toMatchObject({ y: 140 + 18 });
  });

  it("stacks notes on a board narrower than two", () => {
    expect(startingSpots([140, 200], 320)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 158, z: 0 },
    ]);
  });
});

describe("spotAt", () => {
  it("keeps a dropped note on the board", () => {
    const width = 600;

    expect(spotAt({ left: -40, top: -10 }, width, 500, 1)).toEqual({
      x: 0,
      y: 0,
      z: 1,
    });
    expect(spotAt({ left: 900, top: 9000 }, width, 500, 2)).toEqual({
      x: 1,
      y: 500,
      z: 2,
    });
  });

  it("keeps its place across the board when the window narrows", () => {
    const dropped = spotAt({ left: 205, top: 40 }, 600, 500, 1);

    expect(dropped.x).toBe(0.5);
    expect(leftOf(dropped, 600)).toBe(205);
    expect(leftOf(dropped, 400)).toBe(105);
  });
});

describe("the board's size and layers", () => {
  it("reaches below the lowest note, with room to drag into", () => {
    expect(boardHeight([])).toBe(320);
    expect(boardHeight([400, 900])).toBe(900 + 140);
  });

  it("lets a note go just below the lowest other", () => {
    expect(deepestFor([])).toBe(18);
    expect(deepestFor([300, 500])).toBe(518);
  });

  it("puts a moved note on top", () => {
    expect(
      topLayer([
        { x: 0, y: 0, z: 3 },
        { x: 0, y: 0, z: 1 },
      ])
    ).toBe(4);
  });
});

describe("remembered spots", () => {
  it("forgets notes that came down", () => {
    const spots = { "1": { x: 0, y: 0, z: 1 }, "2": { x: 1, y: 9, z: 2 } };

    expect(keepUp(spots, ["2", "3"])).toEqual({ "2": { x: 1, y: 9, z: 2 } });
  });

  it("refuses a spot off the board", () => {
    expect(spotsSchema.safeParse({ "1": { x: 2, y: 0, z: 0 } }).success).toBe(
      false
    );
  });
});
