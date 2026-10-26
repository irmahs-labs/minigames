import { describe, expect, it } from "vitest";

import {
  ANSWERS,
  EIGHT,
  IDENTITY,
  STILL,
  WINDOW,
  WINDOW_UP,
  dragTurn,
  feedShake,
  forceOf,
  fromAxisAngle,
  linesOf,
  multiply,
  pickAnswer,
  project,
  rotate,
  slerp,
} from "./eight-ball";
import type { MotionSample, ShakeState, Vec } from "./eight-ball";

const close = (a: Vec, b: Vec) => {
  for (const [i, value] of a.entries()) {
    expect(value).toBeCloseTo(b[i] ?? Number.NaN, 6);
  }
};

describe("answers", () => {
  it("has the classic twenty: ten yes, five maybe, five no", () => {
    expect(ANSWERS).toHaveLength(20);
    expect(ANSWERS.filter((answer) => answer.mood === "yes")).toHaveLength(10);
    expect(ANSWERS.filter((answer) => answer.mood === "maybe")).toHaveLength(5);
    expect(ANSWERS.filter((answer) => answer.mood === "no")).toHaveLength(5);
  });

  it("never gives the same answer twice running", () => {
    const first = pickAnswer(() => 0);

    expect(first.text).toBe("It is certain");
    expect(pickAnswer(() => 0, first).text).toBe("It is decidedly so");
  });

  it("breaks an answer into short lines for the die", () => {
    expect(linesOf("Better not tell you now")).toEqual([
      "Better not",
      "tell you",
      "now",
    ]);
    expect(linesOf("Yes")).toEqual(["Yes"]);
  });
});

describe("turning the ball", () => {
  it("turns a point about an axis", () => {
    close(rotate(fromAxisAngle([0, 1, 0], Math.PI / 2), [0, 0, 1]), [1, 0, 0]);
    close(rotate(IDENTITY, [1, 2, 3]), [1, 2, 3]);
  });

  it("applies the later turn last", () => {
    const quarterY = fromAxisAngle([0, 1, 0], Math.PI / 2);
    const quarterX = fromAxisAngle([1, 0, 0], Math.PI / 2);

    // z → x by the first turn; x stays put under a turn about x.
    close(rotate(multiply(quarterX, quarterY), [0, 0, 1]), [1, 0, 0]);
  });

  it("rolls the front of the ball the way the finger drags", () => {
    // Dragging right brings the front toward the right…
    expect(rotate(dragTurn(30, 0, 100), [0, 0, 1])[0]).toBeGreaterThan(0);
    // …and dragging down (screen y) brings it down.
    expect(rotate(dragTurn(0, 30, 100), [0, 0, 1])[1]).toBeLessThan(0);
  });

  it("goes the whole way, and only that, between two turns", () => {
    const end = fromAxisAngle([1, 1, 0], 2);

    close(rotate(slerp(IDENTITY, end, 0), [0, 0, 1]), [0, 0, 1]);
    close(rotate(slerp(IDENTITY, end, 1), [0, 0, 1]), rotate(end, [0, 0, 1]));
  });
});

describe("project", () => {
  it("shows the 8 head on at the start, and hides the window", () => {
    const eight = project(IDENTITY, EIGHT, 100);

    expect(eight.facing).toBeCloseTo(1);
    expect(eight.matrix[4]).toBeCloseTo(0);
    expect(eight.matrix[5]).toBeCloseTo(0);
    expect(project(IDENTITY, WINDOW, 100).facing).toBeCloseTo(-1);
  });

  it("brings the window round upright and the right way round", () => {
    const window = project(WINDOW_UP, WINDOW, 100);
    const [a, b, c, d] = window.matrix;

    expect(window.facing).toBeCloseTo(1);
    // Its right is screen right and its up is screen up: text reads true.
    expect(a).toBeGreaterThan(0);
    expect(b).toBeCloseTo(0);
    expect(c).toBeCloseTo(0);
    expect(d).toBeGreaterThan(0);
  });

  it("squashes a decal as it turns away", () => {
    const turned = project(fromAxisAngle([0, 1, 0], 1.2), EIGHT, 100);

    expect(turned.facing).toBeCloseTo(Math.cos(1.2));
    expect(Math.abs(turned.matrix[0])).toBeLessThan(turned.matrix[3]);
  });
});

/** What each sample in turn adds up to, fed to one detector. */
const feel = (samples: MotionSample[]) => {
  let state: ShakeState = STILL;

  return samples.map((sample) => {
    const next = feedShake(state, sample);

    ({ state } = next);

    return next.felt;
  });
};

describe("feedShake", () => {
  it("calls three hard jolts inside a second a shake", () => {
    expect(
      feel([
        { force: 20, time: 0 },
        { force: 22, time: 300 },
        { force: 25, time: 600 },
      ])
    ).toEqual(["jolt", "jolt", "shake"]);
  });

  it("ignores walking about, slow jolts and the rest after a shake", () => {
    expect(
      feel([
        { force: 4, time: 0 },
        { force: 20, time: 100 },
        { force: 20, time: 140 },
        { force: 20, time: 2000 },
        { force: 20, time: 4000 },
      ])
    ).toEqual([null, "jolt", null, "jolt", "jolt"]);
    expect(
      feel([
        { force: 20, time: 0 },
        { force: 20, time: 200 },
        { force: 20, time: 400 },
        { force: 20, time: 600 },
      ])
    ).toEqual(["jolt", "jolt", "shake", null]);
  });
});

describe("forceOf", () => {
  it("prefers the reading without gravity", () => {
    expect(forceOf({ x: 3, y: 4, z: 0 }, { x: 0, y: 0, z: 30 })).toBe(5);
  });

  it("takes gravity out of the other reading, or gives up", () => {
    expect(forceOf(null, { x: 0, y: 0, z: 9.81 })).toBeCloseTo(0);
    expect(forceOf({ x: null, y: null, z: null }, null)).toBeNull();
  });
});
