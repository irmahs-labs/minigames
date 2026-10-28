// @vitest-environment node
import { once } from "node:events";
import type { AddressInfo } from "node:net";

import { serve } from "@hono/node-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WebSocket } from "ws";

import type { Note, NoteRequest } from "../src/board/api";
import { NOTES_PER_DAY } from "../src/board/rules";
import type { Vote } from "../src/board/rules";
import type { Brewers } from "../src/games/booster-potion/brewing";
import type { ServerMessage } from "../src/games/super-tic-tac-toe/online/protocol";
import { createApp } from "./app";
import { createLobby } from "./lobby";
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

const lobby = createLobby({ onFinish: () => null, random: () => 0 });

/** Stands in for the booster_potion_brews table: who brewed what, in order. */
const brewLog: { potion: string; id: string; name: string }[] = [];
let latest: { name: string; potion: string; at: string } | null = null;

/** Stands in for booster_potion_solo_brews: each player's own finds. */
const soloLog = new Map<string, Map<string, string>>();

const soloFindsOf = (userId: string) => {
  const finds = soloLog.get(userId) ?? new Map<string, string>();

  soloLog.set(userId, finds);

  return finds;
};

const brewersOf = (potion: string, userId: string | null): Brewers => {
  const rows = brewLog.filter((row) => row.potion === potion);

  return {
    by: rows[0]?.name ?? "",
    count: rows.length,
    yours: rows.some((row) => row.id === userId),
  };
};

const potions = {
  readBrewers: (potion: string) =>
    Promise.resolve(
      brewLog.flatMap((row) =>
        row.potion === potion
          ? [{ at: "2026-10-22T10:00:00.000Z", name: row.name }]
          : []
      )
    ),
  readBrews: (userId: string | null) =>
    Promise.resolve(
      new Map(
        [...new Set(brewLog.map((row) => row.potion))].map((potion) => [
          potion,
          brewersOf(potion, userId),
        ])
      )
    ),
  readLatest: () => Promise.resolve(latest),
  readSoloFinds: (userId: string) =>
    Promise.resolve(new Map(soloFindsOf(userId))),
  recordBrew: (potion: string, account: { id: string; name: string }) => {
    const isNew = !brewLog.some(
      (row) => row.potion === potion && row.id === account.id
    );

    if (isNew) {
      brewLog.push({ id: account.id, name: account.name, potion });
    }

    latest = { at: new Date().toISOString(), name: account.name, potion };

    const brewers = brewersOf(potion, account.id);

    return Promise.resolve({
      brewers,
      first: isNew && brewers.count === 1,
      isNew,
    });
  },
  recordSoloBrew: (userId: string, potion: string) => {
    const finds = soloFindsOf(userId);
    const isNew = !finds.has(potion);

    if (isNew) {
      finds.set(potion, "2026-10-22T12:00:00.000Z");
    }

    return Promise.resolve({ foundAt: finds.get(potion) ?? "", isNew });
  },
  resetSolo: (userId: string) => {
    soloLog.delete(userId);

    return Promise.resolve();
  },
};

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

const askedFor: (string | null)[] = [];

const { app, injectWebSocket } = createApp({
  appOrigin: ORIGIN,
  // Ana is on Alma Housila's list in the account service's APP_ACCESS.
  isAdmin: (cookie) => Promise.resolve(cookie === "session=ana"),
  lobby,
  notes,
  potions,
  readLeaderboard: (userId): Promise<Leaderboard> => {
    askedFor.push(userId);

    return Promise.resolve({ top: [], you: null });
  },
  whoIs,
});

const server = serve({ fetch: app.fetch, port: 0 });

injectWebSocket(server);

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
  server.close();
});

/** A socket as a browser would open it, and what it hears. */
const open = (cookie: string, origin = ORIGIN) => {
  const socket = new WebSocket(`ws://${base}/ws`, {
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

    expect(askedFor).toEqual([BEN.id, null]);
  });
});

/** The classic ginger shot: Ember's Embrace. */
const GINGER_SHOT = [
  { name: "Apple" },
  { name: "Lime" },
  { form: "fresh", name: "Ginger" },
  { name: "Cayenne" },
];

const MYSTERY = [{ name: "Kale" }, { name: "Mango" }];

/** What a page might send, sense or not: a test sends some of each. */
type Sent = readonly { name: string; form?: string }[] | string;

const brewAs = (cookie: string, ingredients: Sent, origin = ORIGIN) =>
  fetch(`http://${base}/api/potions/brew`, {
    body: JSON.stringify({ ingredients }),
    headers: { "content-type": "application/json", cookie, origin },
    method: "POST",
  });

const statusOf = async (response: Promise<Response>) => {
  const { status } = await response;

  return status;
};

const bodyOf = async (response: Promise<Response>) => {
  const answer = await response;

  return answer.json();
};

describe("/api/potions", () => {
  it("shows everyone the book, every page locked until someone brews it", async () => {
    const book = await bodyOf(fetch(`http://${base}/api/potions`));

    expect(book.latest).toBeNull();
    expect(book.pages).toHaveLength(115);
    expect(book.pages[0]).toEqual({
      clue: expect.any(String),
      state: "locked",
    });
  });

  it("takes brews only from the site itself, and only signed in", async () => {
    const elsewhere = "https://evil.irmahs.dev";

    expect(await statusOf(brewAs("session=ana", GINGER_SHOT, elsewhere))).toBe(
      403
    );
    expect(await statusOf(brewAs("", GINGER_SHOT))).toBe(401);
  });

  it("refuses a cauldron that cannot be", async () => {
    const powderedGinger = [
      { name: "Lemon" },
      { form: "powder", name: "Ginger" },
    ];

    const newt = [{ name: "Newt" }, { name: "Lemon" }];

    expect(await statusOf(brewAs("session=ana", powderedGinger))).toBe(400);
    expect(await statusOf(brewAs("session=ana", newt))).toBe(400);
    expect(await statusOf(brewAs("session=ana", "soup"))).toBe(400);
  });

  it("hints at a mystery and writes nothing down", async () => {
    const answer = await bodyOf(brewAs("session=ana", MYSTERY));

    expect(answer).toMatchObject({ size: 2, type: "mystery" });
    expect(brewLog).toEqual([]);
  });

  it("puts the first brewer's name on the page, and counts the rest", async () => {
    expect(await bodyOf(brewAs("session=ana", GINGER_SHOT))).toMatchObject({
      first: true,
      isNew: true,
      page: { by: "Ana L.", name: "Ember's Embrace", others: 0, yours: true },
      type: "potion",
    });

    expect(await bodyOf(brewAs("session=ben", GINGER_SHOT))).toMatchObject({
      first: false,
      isNew: true,
      page: { by: "Ana L.", others: 1, yours: true },
    });

    expect(await bodyOf(brewAs("session=ben", GINGER_SHOT))).toMatchObject({
      first: false,
      isNew: false,
    });

    const book = await bodyOf(
      fetch(`http://${base}/api/potions`, {
        headers: { cookie: "session=ben" },
      })
    );

    expect(book.pages[0]).toMatchObject({
      by: "Ana L.",
      // Fruit, then spices, each alphabetically.
      ingredients: ["Apple", "Lime", "Cayenne", "Fresh ginger"],
      state: "found",
      yours: true,
    });
    expect(book.latest).toMatchObject({
      name: "Ben",
      potion: "Ember's Embrace",
    });
  });

  it("names everyone who brewed a potion, first first", async () => {
    const query = new URLSearchParams({ potion: "Ember's Embrace" });

    const { brewers } = await bodyOf(
      fetch(`http://${base}/api/potions/brewers?${query}`)
    );

    expect(brewers.map((brewer: { name: string }) => brewer.name)).toEqual([
      "Ana L.",
      "Ben",
    ]);
    expect(
      await statusOf(fetch(`http://${base}/api/potions/brewers?potion=Soup`))
    ).toBe(404);
  });

  it("lets nobody try every mix in a hurry", async () => {
    const statuses: number[] = [];

    for (let i = 0; i < 31; i += 1) {
      // One after another, as a player would.
      // oxlint-disable-next-line no-await-in-loop
      statuses.push(await statusOf(brewAs("session=cy", MYSTERY)));
    }

    expect(statuses.slice(0, 30).every((status) => status === 200)).toBe(true);
    expect(statuses[30]).toBe(429);
  });
});

const soloBrewAs = (cookie: string, ingredients: Sent, origin = ORIGIN) =>
  fetch(`http://${base}/api/potions/solo/brew`, {
    body: JSON.stringify({ ingredients }),
    headers: { "content-type": "application/json", cookie, origin },
    method: "POST",
  });

const soloBookOf = (cookie: string) =>
  fetch(`http://${base}/api/potions/solo`, { headers: { cookie } });

const startOver = (cookie: string, origin = ORIGIN) =>
  fetch(`http://${base}/api/potions/solo`, {
    headers: { cookie, origin },
    method: "DELETE",
  });

/** Autumn Hearth, a jujube and dried ginger tea. */
const JUJUBE_TEA = [{ name: "Jujube" }, { form: "dried", name: "Ginger" }];

describe("/api/potions/solo", () => {
  it("keeps a book only for someone signed in", async () => {
    expect(await statusOf(soloBookOf(""))).toBe(401);
    expect(await statusOf(soloBrewAs("", JUJUBE_TEA))).toBe(401);
    expect(await statusOf(startOver(""))).toBe(401);
  });

  it("starts every player's own book empty", async () => {
    const { pages } = await bodyOf(soloBookOf("session=ana"));

    expect(pages).toHaveLength(115);
    expect(
      pages.every((page: { state: string }) => page.state === "locked")
    ).toBe(true);
  });

  it("puts a solo brew in the player's own book, and nowhere else", async () => {
    const before = brewLog.length;

    expect(await bodyOf(soloBrewAs("session=ana", JUJUBE_TEA))).toMatchObject({
      isNew: true,
      page: { foundAt: expect.any(String), name: "Autumn Hearth" },
      type: "potion",
    });
    expect(await bodyOf(soloBrewAs("session=ana", JUJUBE_TEA))).toMatchObject({
      isNew: false,
    });

    const own = await bodyOf(soloBookOf("session=ana"));
    const bens = await bodyOf(soloBookOf("session=ben"));

    expect(
      own.pages.filter((page: { state: string }) => page.state === "found")
    ).toHaveLength(1);
    expect(
      bens.pages.filter((page: { state: string }) => page.state === "found")
    ).toHaveLength(0);
    expect(brewLog).toHaveLength(before);
  });

  it("hints at the potions the player has still to find", async () => {
    // Ana found Ember's Embrace in the shared book, not in her own.
    const answer = await bodyOf(
      soloBrewAs("session=ana", [
        { name: "Apple" },
        { name: "Lime" },
        { form: "fresh", name: "Ginger" },
        { form: "fresh", name: "Mint" },
      ])
    );

    expect(answer).toMatchObject({
      closest: { name: "Ember's Embrace", shared: 3 },
      type: "mystery",
    });
  });

  it("starts over only from the site itself", async () => {
    expect(
      await statusOf(startOver("session=ana", "https://evil.irmahs.dev"))
    ).toBe(403);
    expect(await statusOf(startOver("session=ana"))).toBe(204);

    const { pages } = await bodyOf(soloBookOf("session=ana"));

    expect(
      pages.every((page: { state: string }) => page.state === "locked")
    ).toBe(true);
  });
});

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
