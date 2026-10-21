// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ServerMessage } from "../src/games/super-tic-tac-toe/online/protocol";
import {
  SIZE,
  canPlay,
  newGame,
  play,
} from "../src/games/super-tic-tac-toe/rules";
import type { Game, Move } from "../src/games/super-tic-tac-toe/rules";
import { POINTS } from "../src/games/super-tic-tac-toe/scoring";
import { QUEUE_MS, ROOM_IDLE_MS, createLobby } from "./lobby";
import type { Account, FinishedGame } from "./lobby";

const account = (name: string): Account => ({ id: `id-${name}`, name });

const ana = account("Ana");
const ben = account("Ben");
const cy = account("Cy");
const dee = account("Dee");

/** A socket that keeps what it was told. */
const socket = () => {
  const heard: ServerMessage[] = [];

  return {
    heard,
    last: () => heard.at(-1),
    send: (m: ServerMessage) => heard.push(m),
  };
};

let finished: FinishedGame[] = [];

/** A lobby where the first in the queue always plays Pink. */
const setup = () => {
  finished = [];

  return createLobby({
    onFinish: (game) => finished.push(game),
    random: () => 0,
  });
};

/** Each account connected with its own socket. */
const seat = (lobby: ReturnType<typeof setup>, ...accounts: Account[]) =>
  accounts.map((who) => {
    const client = socket();

    lobby.connect(who, client);

    return client;
  });

const firstLegalMove = (game: Game): Move => {
  for (let board = 0; board < SIZE; board += 1) {
    for (let cell = 0; cell < SIZE; cell += 1) {
      if (canPlay(game, { board, cell })) {
        return { board, cell };
      }
    }
  }

  throw new Error("No legal move left");
};

/** Ana (Pink) and Ben (Purple), matched into a room. */
const start = () => {
  const lobby = setup();
  const [pink, purple] = seat(lobby, ana, ben);

  lobby.join(ana);
  lobby.join(ben);

  return { lobby, pink, purple };
};

beforeEach(() => vi.useFakeTimers());

afterEach(() => vi.useRealTimers());

describe("the queue", () => {
  it("tells a new socket it is idle", () => {
    const [client] = seat(setup(), ana);

    expect(client?.last()).toEqual({ type: "idle" });
  });

  it("matches the first two people, then the next two in a room of their own", () => {
    const lobby = setup();
    const [a, b, c, d] = seat(lobby, ana, ben, cy, dee);

    lobby.join(ana);
    expect(a?.last()).toMatchObject({ type: "queued", waiting: 1 });

    lobby.join(ben);
    expect(a?.last()).toMatchObject({
      opponent: "Ben",
      type: "room",
      you: "pink",
    });
    expect(b?.last()).toMatchObject({
      opponent: "Ana",
      type: "room",
      you: "purple",
    });

    lobby.join(cy);
    expect(c?.last()).toMatchObject({ type: "queued", waiting: 1 });

    lobby.join(dee);
    expect(c?.last()).toMatchObject({ opponent: "Dee", type: "room" });
    expect(d?.last()).toMatchObject({ opponent: "Cy", type: "room" });

    // Room A's move reaches only room A.
    lobby.move(ana, { board: 4, cell: 4 });
    expect(b?.last()).toMatchObject({ moves: [{ board: 4, cell: 4 }] });
    expect(d?.last()).toMatchObject({ moves: [] });
    lobby.close();
  });

  it("keeps one place per account, so nobody plays themselves", () => {
    const lobby = setup();
    const [first, second] = seat(lobby, ana, ana);

    lobby.join(ana);
    lobby.join(ana);

    expect(first?.last()).toMatchObject({ type: "queued", waiting: 1 });
    expect(second?.last()).toMatchObject({ type: "queued", waiting: 1 });
    lobby.close();
  });

  it("stops looking after five minutes", () => {
    const lobby = setup();
    const [client] = seat(lobby, ana);

    lobby.join(ana);
    vi.advanceTimersByTime(QUEUE_MS);

    expect(client?.last()).toEqual({ type: "expired" });
  });

  it("drops someone who cancels, or whose last tab closes", () => {
    const lobby = setup();
    const [a, b, c] = seat(lobby, ana, ben, cy);

    lobby.join(ana);
    lobby.leave(ana);
    expect(a?.last()).toEqual({ type: "idle" });

    if (!b) {
      throw new Error("seat gives one socket per account");
    }

    lobby.join(ben);
    lobby.disconnect(ben, b);
    lobby.join(cy);

    // Ben left, so Cy waits alone instead of starting a game with nobody.
    expect(c?.last()).toMatchObject({ type: "queued", waiting: 1 });
    lobby.close();
  });
});

describe("a game", () => {
  it("refuses a move out of turn or against the rules", () => {
    const { lobby, purple } = start();

    lobby.move(ben, { board: 0, cell: 0 });
    expect(purple?.last()).toEqual({
      message: "It is not your turn.",
      type: "error",
    });

    lobby.move(ana, { board: 4, cell: 2 });
    lobby.move(ben, { board: 3, cell: 0 });
    expect(purple?.last()).toEqual({
      message: "That square cannot be played.",
      type: "error",
    });
    lobby.close();
  });

  it("restarts the clock on every move", () => {
    const { lobby, purple } = start();

    vi.advanceTimersByTime(ROOM_IDLE_MS - 1000);
    lobby.move(ana, { board: 4, cell: 4 });
    vi.advanceTimersByTime(ROOM_IDLE_MS - 1000);

    expect(purple?.last()).toMatchObject({ type: "room" });
    expect(finished).toEqual([]);
    lobby.close();
  });

  it("closes after five minutes with no move, and the player to move loses", () => {
    const { lobby, pink, purple } = start();

    lobby.move(ana, { board: 4, cell: 4 });
    vi.advanceTimersByTime(ROOM_IDLE_MS);

    expect(purple?.last()).toMatchObject({
      ending: "timeout",
      points: -POINTS.defeat,
      type: "over",
      winner: "pink",
    });
    expect(pink?.last()).toMatchObject({
      points: 1 + POINTS.victory,
      winner: "pink",
    });
    expect(finished).toHaveLength(1);
    expect(finished[0]).toMatchObject({
      ending: "timeout",
      players: { pink: ana, purple: ben },
      points: { pink: 1 + POINTS.victory, purple: -POINTS.defeat },
    });
  });

  it("plays out to the end and reports the game once", () => {
    const { lobby, pink } = start();
    let game = newGame();

    while (!game.over) {
      const move = firstLegalMove(game);

      lobby.move(game.turn === "pink" ? ana : ben, move);
      game = play(game, move);
    }

    expect(finished).toHaveLength(1);
    expect(finished[0]?.winner).toBe(game.winner);
    expect(pink?.last()).toMatchObject({ type: "over", winner: game.winner });
    lobby.close();
  });

  it("puts a returning player back in their game, or shows them how it ended", () => {
    const { lobby } = start();

    lobby.move(ana, { board: 4, cell: 4 });

    const [back] = seat(lobby, ben);

    expect(back?.last()).toMatchObject({
      moves: [{ board: 4, cell: 4 }],
      type: "room",
      you: "purple",
    });

    vi.advanceTimersByTime(ROOM_IDLE_MS);

    const [later] = seat(lobby, ben);

    expect(later?.last()).toMatchObject({ ending: "timeout", type: "over" });
    lobby.close();
  });
});
