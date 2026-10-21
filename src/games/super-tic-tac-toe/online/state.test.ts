import { describe, expect, it } from "vitest";

import { IDLE, clock, receive } from "./state";
import type { Online } from "./state";

const NOW = 1_000_000;

const playing: Online = {
  deadline: NOW + 300_000,
  phase: "playing",
  seat: { moves: [], opponent: "Ben", you: "pink" },
};

describe("receive", () => {
  it("turns how long is left into a deadline on this browser's clock", () => {
    expect(
      receive(IDLE, { remainingMs: 60_000, type: "queued", waiting: 2 }, NOW)
    ).toEqual({ deadline: NOW + 60_000, phase: "queued", waiting: 2 });
  });

  it("seats the player when a room starts or a move lands", () => {
    expect(
      receive(
        IDLE,
        {
          moves: [{ board: 4, cell: 4 }],
          opponent: "Ben",
          remainingMs: 300_000,
          type: "room",
          you: "purple",
        },
        NOW
      )
    ).toEqual({
      deadline: NOW + 300_000,
      phase: "playing",
      seat: { moves: [{ board: 4, cell: 4 }], opponent: "Ben", you: "purple" },
    });
  });

  it("calls a game lost when the server no longer knows it", () => {
    expect(receive(playing, { type: "idle" }, NOW)).toEqual({ phase: "lost" });
  });

  it("keeps a result on screen until the player moves on", () => {
    const over = receive(
      playing,
      {
        ending: "timeout",
        moves: [],
        opponent: "Ben",
        points: -25,
        type: "over",
        winner: "purple",
        you: "pink",
      },
      NOW
    );

    expect(over).toMatchObject({
      ending: "timeout",
      phase: "over",
      points: -25,
    });
    expect(receive(over, { type: "idle" }, NOW)).toBe(over);
  });

  it("leaves the state alone on an error", () => {
    expect(
      receive(playing, { message: "It is not your turn.", type: "error" }, NOW)
    ).toBe(playing);
  });
});

describe("clock", () => {
  it("shows minutes and seconds left, rounding up, never below zero", () => {
    expect(clock(NOW + 245_000, NOW)).toBe("4:05");
    expect(clock(NOW + 400, NOW)).toBe("0:01");
    expect(clock(NOW - 5000, NOW)).toBe("0:00");
  });
});
