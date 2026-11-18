// @vitest-environment node
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import { serve } from "@hono/node-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";

import type { Note, NoteRequest } from "../src/board/api";
import { NOTES_PER_DAY } from "../src/board/rules";
import type { Vote } from "../src/board/rules";
import type { ServerMessage } from "../src/games/super-tic-tac-toe/online/protocol";
import { createApp } from "./app";
import { oukChaktrang, superTicTacToe } from "./games";
import { createLobby } from "./lobby";
import type { KeptResult } from "./quiz-results";
import type { Leaderboard } from "./scores";
import type { WhoIs } from "./session";

const ORIGIN = "http://localhost:5173";
const ANA = { id: "00000000-0000-4000-8000-00000000000a", name: "Ana Lopez" };
const BEN = { id: "00000000-0000-4000-8000-00000000000b", name: "Ben" };
const CY = { id: "00000000-0000-4000-8000-00000000000c", name: "Cy" };

/** Stands in for the account service: a cookie per test account. */
const ACCOUNTS = new Map([
  ["session=ana", ANA],
  ["session=ben", BEN],
  ["session=cy", CY],
]);

const whoIs: WhoIs = (cookie) =>
  Promise.resolve({
    account: (cookie && ACCOUNTS.get(cookie)) || null,
    setCookies: [],
  });

const lobby = createLobby({
  onFinish: () => null,
  random: () => 0,
  rules: superTicTacToe,
});

const oukLobby = createLobby({
  onFinish: () => null,
  random: () => 0,
  rules: oukChaktrang,
});

/** Stands in for hub_sticky_notes, newest last. */
const noteLog: {
  body: string;
  colour: Note["colour"];
  id: string;
  postedAt: string;
  userId: string;
}[] = [];

/** Stands in for hub_sticky_note_votes: each note's votes, by voter. */
const voteLog = new Map<string, Map<string, Vote>>();

const votesOn = (id: string) => [
  ...(voteLog.get(id) ?? new Map<string, Vote>()).entries(),
];

const noteFor = (
  { body, colour, id, postedAt }: (typeof noteLog)[number],
  userId: string | null
): Note => ({
  body,
  colour,
  down: votesOn(id).filter(([, vote]) => vote === -1).length,
  id,
  mine: (userId && voteLog.get(id)?.get(userId)) || 0,
  postedAt,
  up: votesOn(id).filter(([, vote]) => vote === 1).length,
});

const notes = {
  countNotes: (userId: string) =>
    Promise.resolve(noteLog.filter((note) => note.userId === userId).length),
  postNote: (userId: string, note: NoteRequest, limit: number) => {
    if (noteLog.filter((row) => row.userId === userId).length >= limit) {
      return Promise.resolve(null);
    }

    const row = {
      ...note,
      id: String(noteLog.length + 1),
      postedAt: new Date().toISOString(),
      userId,
    };

    noteLog.push(row);

    return Promise.resolve(noteFor(row, userId));
  },
  readNotes: (userId: string | null) =>
    Promise.resolve(noteLog.toReversed().map((row) => noteFor(row, userId))),
  removeNote: (id: string) => {
    const index = noteLog.findIndex((note) => note.id === id);

    if (index === -1) {
      return Promise.resolve(false);
    }

    noteLog.splice(index, 1);
    voteLog.delete(id);

    return Promise.resolve(true);
  },
  voteNote: (userId: string, id: string, vote: Vote) => {
    if (!noteLog.some((note) => note.id === id)) {
      return Promise.resolve(false);
    }

    const votes = voteLog.get(id) ?? new Map<string, Vote>();

    if (vote === 0) {
      votes.delete(userId);
    } else {
      votes.set(userId, vote);
    }

    voteLog.set(id, votes);

    return Promise.resolve(true);
  },
};

const askedFor: [string, string | null][] = [];

/** Stands in for quizzes_results: each person's result, by quiz. */
const resultLog = new Map<string, KeptResult>();

const quizResults = {
  read: (userId: string, quiz: string) =>
    Promise.resolve(resultLog.get(`${userId}|${quiz}`) ?? null),
  remove: (userId: string, quiz: string) => {
    resultLog.delete(`${userId}|${quiz}`);

    return Promise.resolve();
  },
  save: (userId: string, quiz: string, result: KeptResult) => {
    resultLog.set(`${userId}|${quiz}`, result);

    return Promise.resolve();
  },
};

const { app } = createApp({
  appOrigin: ORIGIN,
  // Ana is on Alma Housila's list in the account service's APP_ACCESS.
  isAdmin: (cookie) => Promise.resolve(cookie === "session=ana"),
  lobbies: { oukChaktrang: oukLobby, superTicTacToe: lobby },
  notes,
  quizResults,
  readLeaderboard: (game, userId): Promise<Leaderboard> => {
    askedFor.push([game, userId]);

    return Promise.resolve({ top: [], you: null });
  },
  whoIs,
});

const server = serve({
  fetch: app.fetch,
  port: 0,
  websocket: { server: new WebSocketServer({ noServer: true }) },
});

let base = "";

beforeAll(async () => {
  if (!server.listening) {
    await once(server, "listening");
  }

  // SAFETY: a server listening on a TCP port reports an AddressInfo, never a
  // pipe name.
  const { port } = server.address() as AddressInfo;

  base = `127.0.0.1:${port}`;
});

afterAll(() => {
  lobby.close();
  oukLobby.close();
  server.close();
});

/** A socket as a browser would open it, and what it hears. */
const open = (cookie: string, origin = ORIGIN, path = "/ws") => {
  const socket = new WebSocket(`ws://${base}${path}`, {
    headers: { cookie },
    origin,
  });

  const heard: ServerMessage[] = [];

  socket.on("message", (data: Buffer) => {
    heard.push(JSON.parse(data.toString()));
  });

  /** The first message of this type not yet taken, waiting for it if need be. */
  const next = async (type: ServerMessage["type"]): Promise<ServerMessage> => {
    const found = heard.find((message) => message.type === type);

    if (found) {
      heard.splice(0, heard.indexOf(found) + 1);

      return found;
    }

    await once(socket, "message");

    return next(type);
  };

  return { next, socket };
};

/** The HTTP status a refused socket was answered with. */
const refusal = async (cookie: string, origin = ORIGIN) => {
  const { socket } = open(cookie, origin);
  const [request, response] = await once(socket, "unexpected-response");

  // With this event handled, ws leaves the refused request for us to end.
  request.destroy();

  return response.statusCode;
};

describe("/ws/ouk-chaktrang", () => {
  it("matches two players on a board of their own, White first", async () => {
    const ana = open("session=ana", ORIGIN, "/ws/ouk-chaktrang");
    const ben = open("session=ben", ORIGIN, "/ws/ouk-chaktrang");

    await ana.next("idle");
    await ben.next("idle");
    ana.socket.send(JSON.stringify({ type: "join" }));
    await ana.next("queued");
    ben.socket.send(JSON.stringify({ type: "join" }));

    expect(await ana.next("room")).toMatchObject({ you: "white" });
    expect(await ben.next("room")).toMatchObject({ you: "black" });

    // c3 to c4: a Trey one square ahead
    ana.socket.send(JSON.stringify({ from: 18, to: 26, type: "move" }));
    expect(await ben.next("room")).toMatchObject({
      moves: [{ from: 18, to: 26 }],
    });

    // b6 to b4: two squares ahead is not a Trey's move
    ben.socket.send(JSON.stringify({ from: 41, to: 25, type: "move" }));
    expect(await ben.next("error")).toEqual({
      message: "That move cannot be played.",
      type: "error",
    });

    ana.socket.close();
    ben.socket.close();
  });
});

describe("/ws", () => {
  it("refuses a socket from another site", async () => {
    expect(await refusal("session=ana", "https://evil.irmahs.dev")).toBe(403);
  });

  it("refuses a socket from someone signed out", async () => {
    expect(await refusal("session=nobody")).toBe(401);
  });

  it("matches two signed-in players and carries their moves", async () => {
    const ana = open("session=ana");
    const ben = open("session=ben");

    await ana.next("idle");
    await ben.next("idle");

    ana.socket.send(JSON.stringify({ type: "join" }));
    await ana.next("queued");
    ben.socket.send(JSON.stringify({ type: "join" }));

    expect(await ana.next("room")).toMatchObject({
      opponent: "Ben",
      you: "pink",
    });
    expect(await ben.next("room")).toMatchObject({
      opponent: "Ana L.",
      you: "purple",
    });

    ana.socket.send(JSON.stringify({ board: 4, cell: 4, type: "move" }));

    expect(await ben.next("room")).toMatchObject({
      moves: [{ board: 4, cell: 4 }],
    });

    ben.socket.send("not json");

    expect(await ben.next("error")).toEqual({
      message: "That message was not understood.",
      type: "error",
    });

    ana.socket.close();
    ben.socket.close();
  });
});

describe("/api", () => {
  it("names the signed-in player by first name and initial", async () => {
    const response = await fetch(`http://${base}/api/me`, {
      headers: { cookie: "session=ana" },
    });

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ account: { name: "Ana L." } });
  });

  it("reads the leaderboard for whoever asks, signed in or not", async () => {
    await fetch(`http://${base}/api/leaderboard`, {
      headers: { cookie: "session=ben" },
    });
    await fetch(`http://${base}/api/leaderboard`);
    await fetch(`http://${base}/api/ouk-chaktrang/leaderboard`, {
      headers: { cookie: "session=ana" },
    });

    expect(askedFor).toEqual([
      ["super-tic-tac-toe", BEN.id],
      ["super-tic-tac-toe", null],
      ["ouk-chaktrang", ANA.id],
    ]);
  });
});

const statusOf = async (response: Promise<Response>) => {
  const { status } = await response;

  return status;
};

const bodyOf = async (response: Promise<Response>) => {
  const answer = await response;

  return answer.json();
};

/** A note as the page would send it, sense or not: the request's body. */
const noteOf = (body: string, colour = "lemon") =>
  JSON.stringify({ body, colour });

const stick = (cookie: string, sent: string, origin = ORIGIN) =>
  fetch(`http://${base}/api/board/notes`, {
    body: sent,
    headers: { "content-type": "application/json", cookie, origin },
    method: "POST",
  });

const takeDown = (cookie: string, id: string, origin = ORIGIN) =>
  fetch(`http://${base}/api/board/notes/${id}`, {
    headers: { cookie, origin },
    method: "DELETE",
  });

const vote = (cookie: string, id: string, sent: string, origin = ORIGIN) =>
  fetch(`http://${base}/api/board/notes/${id}/vote`, {
    body: sent,
    headers: { "content-type": "application/json", cookie, origin },
    method: "PUT",
  });

const thumb = (value: Vote) => JSON.stringify({ vote: value });

const boardAs = (cookie = "") =>
  bodyOf(fetch(`http://${base}/api/board`, { headers: { cookie } }));

const notesUp = async (): Promise<Note[]> => {
  const board = await boardAs();

  return board.notes;
};

describe("/api/board", () => {
  it("shows everyone the board, and a signed-out reader no notes to stick", async () => {
    expect(await boardAs()).toEqual({
      admin: false,
      left: null,
      notes: [],
    });
    expect(await boardAs("session=ben")).toEqual({
      admin: false,
      left: NOTES_PER_DAY,
      notes: [],
    });
  });

  it("takes notes only from the site itself, and only signed in", async () => {
    const elsewhere = "https://evil.irmahs.dev";

    expect(await statusOf(stick("session=ben", noteOf("hi"), elsewhere))).toBe(
      403
    );
    expect(await statusOf(stick("", noteOf("hi")))).toBe(401);
  });

  it("refuses a note that cannot go up", async () => {
    expect(await statusOf(stick("session=ben", noteOf(" \n ")))).toBe(400);
    expect(await statusOf(stick("session=ben", noteOf("x".repeat(201))))).toBe(
      400
    );
    expect(await statusOf(stick("session=ben", noteOf("hi", "plaid")))).toBe(
      400
    );
    expect(await statusOf(stick("session=ben", "not json"))).toBe(400);
  });

  it("puts a note up tidied, with no name on it", async () => {
    const board = await bodyOf(
      stick("session=ben", noteOf("  good luck\r\n\r\n\r\ntoday!  ", "taro"))
    );

    expect(board.left).toBe(NOTES_PER_DAY - 1);
    expect(board.notes).toEqual([
      {
        body: "good luck\n\ntoday!",
        colour: "taro",
        down: 0,
        id: expect.any(String),
        mine: 0,
        postedAt: expect.any(String),
        up: 0,
      },
    ]);
    expect(JSON.stringify(await boardAs())).not.toMatch(/Ben|userId/u);
  });

  it("holds each person to their notes a day", async () => {
    for (let i = 1; i < NOTES_PER_DAY; i += 1) {
      // One after another, as a person would.
      // oxlint-disable-next-line no-await-in-loop
      await stick("session=ben", noteOf(`note ${i}`));
    }

    const one = await stick("session=ben", noteOf("one too many"));

    expect(one.status).toBe(429);
    expect(await one.text()).toContain(`${NOTES_PER_DAY} notes`);
    expect(await boardAs("session=ben")).toMatchObject({ left: 0 });
  });

  it("takes votes only from the site itself, signed in, and that make sense", async () => {
    const [newest] = await notesUp();
    const id = newest?.id ?? "";
    const up = JSON.stringify({ vote: 1 });

    expect(
      await statusOf(vote("session=cy", id, up, "https://evil.irmahs.dev"))
    ).toBe(403);
    expect(await statusOf(vote("", id, up))).toBe(401);
    expect(
      await statusOf(vote("session=cy", id, JSON.stringify({ vote: 2 })))
    ).toBe(400);
    expect(await statusOf(vote("session=cy", id, "yes"))).toBe(400);
    expect(await statusOf(vote("session=cy", "999", up))).toBe(404);
  });

  it("counts one thumbs up or down per person, and never says whose", async () => {
    const [newest] = await notesUp();
    const id = newest?.id ?? "";

    const newestAs = async (cookie = "") => {
      const board = await boardAs(cookie);

      return board.notes[0];
    };

    await vote("session=cy", id, thumb(1));
    await vote("session=cy", id, thumb(1));
    await vote("session=ana", id, thumb(-1));

    expect(await newestAs("session=ana")).toMatchObject({
      down: 1,
      id,
      mine: -1,
      up: 1,
    });
    expect(await newestAs("session=cy")).toMatchObject({ mine: 1 });
    expect(await newestAs()).toMatchObject({ down: 1, mine: 0, up: 1 });
    expect(JSON.stringify(await boardAs())).not.toMatch(/Cy|Ana|userId/u);

    // Changing a vote moves it; 0 takes it back.
    await vote("session=cy", id, thumb(-1));
    expect(await newestAs()).toMatchObject({ down: 2, up: 0 });
    await vote("session=cy", id, thumb(0));
    expect(await newestAs("session=cy")).toMatchObject({
      down: 1,
      mine: 0,
      up: 0,
    });
  });

  it("lets only an admin take a note down", async () => {
    const [newest] = await notesUp();
    const id = newest?.id ?? "";

    expect(await statusOf(takeDown("", id))).toBe(401);
    expect(await statusOf(takeDown("session=ben", id))).toBe(403);
    expect(await statusOf(takeDown("session=cy", id))).toBe(403);
    expect(
      await statusOf(takeDown("session=ana", id, "https://evil.irmahs.dev"))
    ).toBe(403);
    expect(await boardAs("session=ana")).toMatchObject({ admin: true });

    expect(await statusOf(takeDown("session=ana", id))).toBe(204);
    expect(await notesUp()).not.toContainEqual(newest);
    expect(await statusOf(takeDown("session=ana", id))).toBe(404);
    expect(await statusOf(takeDown("session=ana", "1; drop table"))).toBe(404);
  });
});

/** The status of Ana taking her witch result off, from `origin`. */
const takeWitchOff = async (origin: string) => {
  const { status } = await fetch(
    `http://${base}/api/quizzes/what-type-of-witch/result`,
    { headers: { cookie: "session=ana", origin }, method: "DELETE" }
  );

  return status;
};

describe("/api/quizzes/:slug/result", () => {
  const WITCH = "/api/quizzes/what-type-of-witch/result";
  const PARTNER = "/api/quizzes/are-they-your-life-partner/result";
  const takenAt = new Date().toISOString();

  /** A result as the page sends it; `takenAt` left out to check it's required. */
  interface SentResult {
    scores: Record<string, number>;
    takenAt?: string;
  }

  /** The status of keeping `sent` as `cookie`, from `origin`. */
  const keep = async (
    cookie: string,
    sent: SentResult,
    { origin = ORIGIN, path = WITCH } = {}
  ) => {
    const { status } = await fetch(`http://${base}${path}`, {
      body: JSON.stringify(sent),
      headers: { "content-type": "application/json", cookie, origin },
      method: "PUT",
    });

    return status;
  };

  /** What GET answers `cookie`, and with which status. */
  const resultAs = async (cookie = "", path = WITCH) => {
    const response = await fetch(`http://${base}${path}`, {
      headers: { cookie },
    });

    const { status } = response;
    const body: unknown = status === 200 ? await response.json() : null;

    return { body, status };
  };

  const bodyAs = async (cookie = "") => {
    const { body } = await resultAs(cookie);

    return body;
  };

  it("keeps a signed-in visitor's witch result, named, for their profile", async () => {
    expect(
      await keep("session=ben", { scores: { cosmic: 20, tech: 41 }, takenAt })
    ).toBe(200);

    expect(await bodyAs("session=ben")).toMatchObject({
      result: {
        ranked: [
          { id: "tech", name: { en: "Tech witch" }, points: 41 },
          { id: "cosmic", points: 20 },
        ],
        takenAt,
      },
      signedIn: true,
    });
    expect(await bodyAs("session=cy")).toEqual({
      result: null,
      signedIn: true,
    });
    expect(await bodyAs()).toEqual({ result: null, signedIn: false });
  });

  it("refuses results the quiz can't give, from elsewhere, or signed out", async () => {
    const tech = { scores: { tech: 4 }, takenAt };

    expect(await keep("", tech)).toBe(401);
    expect(
      await keep("session=cy", tech, { origin: "https://evil.irmahs.dev" })
    ).toBe(403);

    const refused: SentResult[] = [
      { scores: { necromancer: 4 }, takenAt },
      { scores: { tech: 0 }, takenAt },
      { scores: { tech: 9000 }, takenAt },
      { scores: { tech: 4 }, takenAt: "2019-01-01T00:00:00Z" },
      { scores: { tech: 4 }, takenAt: "2099-01-01T00:00:00Z" },
      { scores: { tech: 4 } },
    ];

    const statuses = await Promise.all(
      refused.map((sent) => keep("session=cy", sent))
    );

    expect(statuses).toEqual(refused.map(() => 400));
    expect(await bodyAs("session=cy")).toMatchObject({ result: null });
  });

  it("never keeps a quiz that shows on no profile", async () => {
    const { status } = await resultAs("session=cy", PARTNER);

    expect(
      await keep(
        "session=cy",
        { scores: { yes: 4 }, takenAt },
        { path: PARTNER }
      )
    ).toBe(404);
    expect(status).toBe(404);
  });

  it("takes a result off, from the site itself", async () => {
    await keep("session=ana", { scores: { moon: 12 }, takenAt });

    expect(await takeWitchOff("https://evil.irmahs.dev")).toBe(403);
    expect(await takeWitchOff(ORIGIN)).toBe(200);
    expect(await bodyAs("session=ana")).toMatchObject({ result: null });
  });
});
